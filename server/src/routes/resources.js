const router = require('express').Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── GET /api/resources ───────────────────────────────────────────────────────
// Query params: type, semester, subject_code, unit, exam_year, q (keyword)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { type, semester, subject_code, unit, exam_year, q } = req.query;

    const where = {};
    if (type) where.type = type;
    if (semester) where.semester = parseInt(semester);
    if (subject_code) where.subjectCode = subject_code;
    if (unit) where.unit = parseInt(unit);
    if (exam_year) where.examYear = parseInt(exam_year);
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { subjectName: { contains: q, mode: 'insensitive' } },
        { subjectCode: { contains: q, mode: 'insensitive' } },
      ];
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: [{ isVerified: 'desc' }, { upvotesCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        uploader: { select: { id: true, name: true, role: true } },
        _count: { select: { flags: true } },
      },
    });

    // Attach per-user state if authenticated
    let upvotedIds = new Set();
    let bookmarkedIds = new Set();
    if (req.user) {
      const [upvotes, bookmarks] = await Promise.all([
        prisma.upvote.findMany({
          where: { userId: req.user.id },
          select: { resourceId: true },
        }),
        prisma.bookmark.findMany({
          where: { userId: req.user.id },
          select: { resourceId: true },
        }),
      ]);
      upvotedIds = new Set(upvotes.map((u) => u.resourceId));
      bookmarkedIds = new Set(bookmarks.map((b) => b.resourceId));
    }

    const data = resources.map((r) => ({
      ...r,
      userUpvoted: upvotedIds.has(r.id),
      userBookmarked: bookmarkedIds.has(r.id),
    }));

    res.json({ data, total: data.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/resources/:id ───────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
      include: {
        uploader: { select: { id: true, name: true, role: true } },
        flags: {
          select: { id: true, reason: true, createdAt: true, user: { select: { name: true } } },
        },
      },
    });

    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    let userUpvoted = false;
    let userBookmarked = false;
    if (req.user) {
      const [uv, bm] = await Promise.all([
        prisma.upvote.findUnique({
          where: { userId_resourceId: { userId: req.user.id, resourceId: resource.id } },
        }),
        prisma.bookmark.findUnique({
          where: { userId_resourceId: { userId: req.user.id, resourceId: resource.id } },
        }),
      ]);
      userUpvoted = !!uv;
      userBookmarked = !!bm;
    }

    res.json({ ...resource, userUpvoted, userBookmarked });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/resources ──────────────────────────────────────────────────────
router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(422).json({ error: 'PDF file is required' });
    }

    const { title, type, semester, subject_code, subject_name, unit, exam_year } = req.body;

    // Validate required fields
    const missing = [];
    if (!title) missing.push('title');
    if (!type || !['notes', 'pyq'].includes(type)) missing.push('type (notes|pyq)');
    if (!semester) missing.push('semester');
    if (!subject_code) missing.push('subject_code');
    if (!subject_name) missing.push('subject_name');
    if (type === 'notes' && !unit) missing.push('unit');
    if (type === 'pyq' && !exam_year) missing.push('exam_year');
    if (missing.length > 0) {
      return res.status(422).json({ error: 'Validation failed', fields: missing });
    }

    const semNum = parseInt(semester);
    if (semNum < 1 || semNum > 8) {
      return res.status(422).json({ error: 'semester must be between 1 and 8' });
    }

    // SHA-256 hash of the file buffer
    const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    // Duplicate detection
    const existing = await prisma.resource.findUnique({ where: { fileHash } });
    if (existing) {
      return res.status(409).json({
        error: 'duplicate',
        message: 'An identical file already exists.',
        existingId: existing.id,
        existingTitle: existing.title,
      });
    }

    // Write file to disk
    const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, req.file.buffer);

    const fileUrl = `/uploads/${filename}`;

    const resource = await prisma.resource.create({
      data: {
        title,
        type,
        semester: semNum,
        subjectCode: subject_code,
        subjectName: subject_name,
        unit: unit ? parseInt(unit) : null,
        examYear: exam_year ? parseInt(exam_year) : null,
        fileUrl,
        fileHash,
        uploadedBy: req.user.id,
      },
      include: {
        uploader: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/resources/:id/verify ─────────────────────────────────────────
router.patch('/:id/verify', authenticate, requireRole('faculty', 'admin'), async (req, res, next) => {
  try {
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: { isVerified: true },
    });
    res.json(resource);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/resources/:id/upvote ───────────────────────────────────────────
router.post('/:id/upvote', authenticate, async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    if (resource.uploadedBy === req.user.id) {
      return res.status(403).json({ error: 'Cannot upvote your own resource' });
    }

    const existing = await prisma.upvote.findUnique({
      where: { userId_resourceId: { userId: req.user.id, resourceId: resource.id } },
    });

    let upvoted;
    if (existing) {
      // Toggle off
      await prisma.upvote.delete({ where: { id: existing.id } });
      await prisma.resource.update({
        where: { id: resource.id },
        data: { upvotesCount: { decrement: 1 } },
      });
      upvoted = false;
    } else {
      // Toggle on
      await prisma.upvote.create({
        data: { userId: req.user.id, resourceId: resource.id },
      });
      await prisma.resource.update({
        where: { id: resource.id },
        data: { upvotesCount: { increment: 1 } },
      });
      upvoted = true;
    }

    const updated = await prisma.resource.findUnique({ where: { id: resource.id } });
    res.json({ upvoted, upvotesCount: updated.upvotesCount });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/resources/:id/bookmark ─────────────────────────────────────────
router.post('/:id/bookmark', authenticate, async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    const existing = await prisma.bookmark.findUnique({
      where: { userId_resourceId: { userId: req.user.id, resourceId: resource.id } },
    });

    let bookmarked;
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      bookmarked = false;
    } else {
      await prisma.bookmark.create({
        data: { userId: req.user.id, resourceId: resource.id },
      });
      bookmarked = true;
    }

    res.json({ bookmarked });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/resources/:id/flag ──────────────────────────────────────────────
router.post('/:id/flag', authenticate, async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 5) {
      return res.status(422).json({ error: 'Please provide a reason (at least 5 characters)' });
    }

    const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    const flag = await prisma.flag.create({
      data: { userId: req.user.id, resourceId: resource.id, reason: reason.trim() },
    });

    res.status(201).json({ message: 'Resource flagged for review', flagId: flag.id });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/resources/:id ─────────────────────────────────────────────────
router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    // Remove file from disk
    const filePath = path.join(UPLOAD_DIR, path.basename(resource.fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.resource.delete({ where: { id: req.params.id } });
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

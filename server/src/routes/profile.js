const router  = require('express').Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
const AVATARS_DIR = path.join(UPLOAD_DIR, 'avatars');
if (!fs.existsSync(AVATARS_DIR)) fs.mkdirSync(AVATARS_DIR, { recursive: true });

// Separate multer instance for avatar images
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg','image/jpg','image/png','image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      const e = new Error('Only JPEG, PNG, or WebP images are accepted');
      e.status = 422;
      cb(e, false);
    }
  },
});

// Helper — upsert profile and return full user+profile
async function getFullProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      profile: true,
      _count: { select: { resources: true, bookmarks: true } },
    },
  });
}

// ── GET /api/profile/me ──────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await getFullProfile(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
});

// ── PUT /api/profile/me ──────────────────────────────────────
// Updates name on User + all profile fields
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const {
      name, bio, phone, department, designation,
      employeeId, rollNumber, semester, batch,
      subjects, qualifications,
      githubUrl, linkedinUrl, websiteUrl,
    } = req.body;

    // Update user name if provided
    if (name && name.trim()) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: name.trim() },
      });
    }

    // Upsert profile
    await prisma.profile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        bio, phone, department, designation,
        employeeId, rollNumber,
        semester: semester ? parseInt(semester) : null,
        batch,
        subjects:       Array.isArray(subjects)       ? subjects       : subjects       ? [subjects]       : [],
        qualifications: Array.isArray(qualifications) ? qualifications : qualifications ? [qualifications] : [],
        githubUrl, linkedinUrl, websiteUrl,
      },
      update: {
        bio, phone, department, designation,
        employeeId, rollNumber,
        semester: semester ? parseInt(semester) : null,
        batch,
        subjects:       Array.isArray(subjects)       ? subjects       : subjects       ? [subjects]       : [],
        qualifications: Array.isArray(qualifications) ? qualifications : qualifications ? [qualifications] : [],
        githubUrl, linkedinUrl, websiteUrl,
      },
    });

    const data = await getFullProfile(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
});

// ── POST /api/profile/me/avatar ──────────────────────────────
router.post('/me/avatar', authenticate, avatarUpload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(422).json({ error: 'Image file is required' });

    // Remove old avatar if exists
    const existing = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    if (existing?.avatarUrl) {
      const oldPath = path.join(UPLOAD_DIR, existing.avatarUrl.replace('/uploads/', ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const ext      = req.file.mimetype.split('/')[1].replace('jpeg','jpg');
    const filename = `avatars/avatar-${req.user.id}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, req.file.buffer);

    const avatarUrl = `/uploads/${filename}`;

    await prisma.profile.upsert({
      where:  { userId: req.user.id },
      create: { userId: req.user.id, avatarUrl },
      update: { avatarUrl },
    });

    res.json({ avatarUrl });
  } catch (err) { next(err); }
});

// ── DELETE /api/profile/me/avatar ────────────────────────────
router.delete('/me/avatar', authenticate, async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    if (profile?.avatarUrl) {
      const p = path.join(UPLOAD_DIR, profile.avatarUrl.replace('/uploads/', ''));
      if (fs.existsSync(p)) fs.unlinkSync(p);
      await prisma.profile.update({ where: { userId: req.user.id }, data: { avatarUrl: null } });
    }
    res.json({ message: 'Avatar removed' });
  } catch (err) { next(err); }
});

// ── GET /api/profile/users ───────────────────────────────────
// Faculty/admin can browse all users; students see only faculty
router.get('/users', authenticate, async (req, res, next) => {
  try {
    const { role, q } = req.query;
    const where = {};

    if (req.user.role === 'student') {
      // Students can only see faculty profiles
      where.role = 'faculty';
    } else if (role && ['student','faculty','admin'].includes(role)) {
      where.role = role;
    }

    if (q) {
      where.OR = [
        { name:  { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { profile: { department: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        profile: true,
        _count: { select: { resources: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ data: users, total: users.length });
  } catch (err) { next(err); }
});

// ── GET /api/profile/users/:id ───────────────────────────────
router.get('/users/:id', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        profile: true,
        resources: {
          select: {
            id: true, title: true, type: true, semester: true,
            subjectCode: true, subjectName: true, upvotesCount: true,
            isVerified: true, createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { resources: true, bookmarks: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// ── GET /api/profile/students  (faculty/admin only) ──────────
router.get('/students', authenticate, requireRole('faculty','admin'), async (req, res, next) => {
  try {
    const { semester, department, q } = req.query;
    const where = { role: 'student' };

    if (semester) where.profile = { semester: parseInt(semester) };
    if (department) where.profile = { ...where.profile, department };
    if (q) {
      where.OR = [
        { name:  { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { profile: { rollNumber: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        profile: true,
        _count: { select: { resources: true, bookmarks: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ data: students, total: students.length });
  } catch (err) { next(err); }
});

module.exports = router;

const router  = require('express').Router();
const multer  = require('multer');
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploadBuffer, deleteResource } = require('../lib/cloudinary');

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
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

router.get('/me', authenticate, async (req, res, next) => {
  try {
    res.json(await getFullProfile(req.user.id));
  } catch (err) { next(err); }
});

router.put('/me', authenticate, async (req, res, next) => {
  try {
    const {
      name, bio, phone, department, designation,
      employeeId, rollNumber, semester, batch,
      subjects, qualifications,
      githubUrl, linkedinUrl, websiteUrl,
    } = req.body;

    if (name && name.trim()) {
      await prisma.user.update({ where: { id: req.user.id }, data: { name: name.trim() } });
    }

    const profileData = {
      ...(bio          !== undefined && { bio }),
      ...(phone        !== undefined && { phone }),
      ...(department   !== undefined && { department }),
      ...(designation  !== undefined && { designation }),
      ...(employeeId   !== undefined && { employeeId }),
      ...(rollNumber   !== undefined && { rollNumber }),
      ...(semester     !== undefined && { semester: semester ? parseInt(semester) : null }),
      ...(batch        !== undefined && { batch }),
      ...(subjects     !== undefined && { subjects: Array.isArray(subjects) ? subjects : subjects ? [subjects] : [] }),
      ...(qualifications !== undefined && { qualifications: Array.isArray(qualifications) ? qualifications : qualifications ? [qualifications] : [] }),
      ...(githubUrl    !== undefined && { githubUrl }),
      ...(linkedinUrl  !== undefined && { linkedinUrl }),
      ...(websiteUrl   !== undefined && { websiteUrl }),
    };

    await prisma.profile.upsert({
      where:  { userId: req.user.id },
      create: { userId: req.user.id, ...profileData },
      update: profileData,
    });

    res.json(await getFullProfile(req.user.id));
  } catch (err) { next(err); }
});

router.post('/me/avatar', authenticate, avatarUpload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(422).json({ error: 'Image file is required' });

    // Remove old avatar from Cloudinary
    const existing = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    if (existing?.avatarPublicId) {
      await deleteResource(existing.avatarPublicId, 'image').catch(() => {});
    }

    const { url: avatarUrl, publicId: avatarPublicId } = await uploadBuffer(
      req.file.buffer,
      'pyq_hub/avatars',
      {
        resource_type: 'image',
        public_id: `avatar_${req.user.id}`,
        overwrite: true,
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      }
    );

    await prisma.profile.upsert({
      where:  { userId: req.user.id },
      create: { userId: req.user.id, avatarUrl, avatarPublicId },
      update: { avatarUrl, avatarPublicId },
    });

    res.json({ avatarUrl });
  } catch (err) { next(err); }
});

router.delete('/me/avatar', authenticate, async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    if (profile?.avatarPublicId) {
      await deleteResource(profile.avatarPublicId, 'image').catch(() => {});
      await prisma.profile.update({
        where: { userId: req.user.id },
        data:  { avatarUrl: null, avatarPublicId: null },
      });
    }
    res.json({ message: 'Avatar removed' });
  } catch (err) { next(err); }
});

router.get('/users', authenticate, async (req, res, next) => {
  try {
    const { role, q } = req.query;
    const where = {};
    if (req.user.role === 'student') {
      where.role = 'faculty';
    } else if (role && ['student','faculty','admin'].includes(role)) {
      where.role = role;
    }
    if (q) {
      where.OR = [
        { name:    { contains: q, mode: 'insensitive' } },
        { email:   { contains: q, mode: 'insensitive' } },
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

router.get('/users/:id', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        profile: true,
        resources: {
          select: { id: true, title: true, type: true, semester: true, subjectCode: true, subjectName: true, upvotesCount: true, isVerified: true, createdAt: true },
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

router.get('/students', authenticate, requireRole('faculty','admin'), async (req, res, next) => {
  try {
    const { semester, department, q } = req.query;
    const where = { role: 'student' };
    if (semester)   where.profile   = { semester: parseInt(semester) };
    if (department) where.profile   = { ...where.profile, department };
    if (q) {
      where.OR = [
        { name:    { contains: q, mode: 'insensitive' } },
        { email:   { contains: q, mode: 'insensitive' } },
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

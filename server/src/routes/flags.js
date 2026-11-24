const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/flags — faculty/admin review queue
router.get('/', authenticate, requireRole('faculty', 'admin'), async (req, res, next) => {
  try {
    const flags = await prisma.flag.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        resource: {
          select: {
            id: true,
            title: true,
            type: true,
            semester: true,
            subjectCode: true,
            subjectName: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: flags, total: flags.length });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/flags/:id — dismiss a flag
router.delete('/:id', authenticate, requireRole('faculty', 'admin'), async (req, res, next) => {
  try {
    await prisma.flag.delete({ where: { id: req.params.id } });
    res.json({ message: 'Flag dismissed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

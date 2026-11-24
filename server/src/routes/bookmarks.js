const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

// GET /api/bookmarks  — returns the current user's bookmarked resources
router.get('/', authenticate, async (req, res, next) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        resource: {
          include: {
            uploader: { select: { id: true, name: true, role: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    const data = bookmarks.map((b) => ({
      ...b.resource,
      userUpvoted: false,  // enriched on the detail view
      userBookmarked: true,
    }));

    res.json({ data, total: data.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

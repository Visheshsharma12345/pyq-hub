const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        resource: {
          include: { uploader: { select: { id: true, name: true, role: true } } },
        },
      },
      orderBy: { id: 'desc' },
    });

    // Enrich with actual upvote state for this user
    const resourceIds = bookmarks.map(b => b.resource.id);
    const upvotes = await prisma.upvote.findMany({
      where: { userId: req.user.id, resourceId: { in: resourceIds } },
      select: { resourceId: true },
    });
    const upvotedIds = new Set(upvotes.map(u => u.resourceId));

    const data = bookmarks.map(b => ({
      ...b.resource,
      userUpvoted:    upvotedIds.has(b.resource.id),
      userBookmarked: true,
    }));

    res.json({ data, total: data.length });
  } catch (err) { next(err); }
});

module.exports = router;

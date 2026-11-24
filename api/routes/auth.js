const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

function signTokens(user) {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: '2h' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(422).json({ error: 'name, email, and password are required' });

    const allowedRoles = ['student', 'faculty'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: userRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.status(201).json({ user, ...signTokens(user) });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(422).json({ error: 'email and password are required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, ...signTokens(safeUser) });
  } catch (err) { next(err); }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ accessToken });
  } catch (_) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

module.exports = router;

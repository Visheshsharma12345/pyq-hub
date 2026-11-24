require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const bookmarkRoutes = require('./routes/bookmarks');
const flagRoutes     = require('./routes/flags');
const profileRoutes  = require('./routes/profile');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/flags',     flagRoutes);
app.use('/api/profile',   profileRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;

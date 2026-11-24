require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const bookmarkRoutes = require('./routes/bookmarks');
const flagRoutes = require('./routes/flags');
const profileRoutes = require('./routes/profile');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(
  path.resolve(process.env.UPLOAD_DIR || './uploads')
));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

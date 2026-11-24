const multer = require('multer');

// Keep file in memory so we can hash the buffer before writing to disk
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    const err = new Error('Only PDF files are accepted');
    err.status = 422;
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

module.exports = upload;

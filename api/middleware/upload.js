const multer = require('multer');

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

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = upload;

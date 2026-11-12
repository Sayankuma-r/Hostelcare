const multer = require('multer');

const allowedTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const complaintUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error('Image must be JPEG, PNG, or WebP');
      error.status = 400;
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = { complaintUpload, allowedImageTypes: allowedTypes };

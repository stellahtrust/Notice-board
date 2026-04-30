const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// File filters
const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  // Allow documents
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype.includes('word') ||
    file.mimetype.includes('excel') ||
    file.mimetype.includes('powerpoint')
  ) {
    cb(null, true);
    return;
  }

  cb(new Error('Invalid file type. Only images, PDF, Word, Excel allowed.'), false);
};

// Single multer parser for both fields (prevents stream deadlocks/hangs)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // allow up to 10MB per file
  fileFilter,
}).fields([
  { name: 'thumbnailImage', maxCount: 1 },
  { name: 'attachments', maxCount: 10 },
]);

module.exports = {
  processUploads: async (req, res, next) => {
    try {
      upload(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });

        // Map uploaded files into req.body fields expected by routes/controllers
        const files = req.files || {};

        if (files.thumbnailImage?.[0]) {
          req.body.thumbnailImage = `/uploads/${files.thumbnailImage[0].filename}`;
        }

        if (files.attachments && Array.isArray(files.attachments) && files.attachments.length > 0) {
          req.body.attachments = files.attachments.map((file) => `/uploads/${file.filename}`);
        }

        next();
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

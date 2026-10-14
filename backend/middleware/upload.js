const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".heic",
  ".heif",
];

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    const mimeType = file.mimetype.toLowerCase();
    const extension = path.extname(file.originalname).toLowerCase();

    const isAllowedMimeType = allowedMimeTypes.includes(mimeType);
    const isAllowedExtension = allowedExtensions.includes(extension);

    if (isAllowedMimeType || isAllowedExtension) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Unsupported image format. Please upload JPG, PNG, WebP, GIF, AVIF, HEIC, or HEIF."
      )
    );
  },
});

module.exports = upload;
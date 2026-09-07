const multer = require("multer");
const path = require("path");
const fs = require("fs");

let storage;

// On serverless environments like Vercel, the local filesystem is read-only except /tmp
if (process.env.VERCEL || process.env.NODE_ENV === "production") {
  storage = multer.memoryStorage();
} else {
  const uploadsDir = path.join(__dirname, "../uploads");
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadsDir);
      },
      filename: function (req, file, cb) {
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        cb(null, Date.now() + "-" + cleanName);
      },
    });
  } catch (e) {
    storage = multer.memoryStorage();
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;

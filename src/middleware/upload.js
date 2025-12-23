import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const baseUploadDir = "uploads/users";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!req.user) {
      cb(new Error("unauthorized"), null);
    }
    const uploadDir = `${baseUploadDir}/${req.user.email}`;
    // if folder not exists then create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export default upload;

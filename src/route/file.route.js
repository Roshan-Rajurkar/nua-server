const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getUserId } = require("../middleware/authMiddleware.js");
const {
  downloadFile,
  getFiles,
  shareFile,
  uploadFiles,
} = require("../controllers/file.controller.js");

const fileRoutes = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
});

fileRoutes.post("/upload", getUserId, upload.array("files", 10), uploadFiles);
fileRoutes.get("/", getUserId, getFiles);
fileRoutes.get("/:id", getUserId, downloadFile);
fileRoutes.post("/share/:id", getUserId, shareFile);

export default fileRoutes;

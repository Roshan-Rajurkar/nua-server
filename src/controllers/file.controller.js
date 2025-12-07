import path from "path";
import fs from "fs";
import { File } from "../model/file.model.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFiles = async (req, res) => {
  try {
    const files = req.files;
    console.log("Called for files: ", files);
    if (!files || files.length === 0)
      return res.status(400).json({ error: "No files uploaded" });

    const fileDocs = await Promise.all(
      files?.map((file) =>
        File.create({
          filename: file.filename,
          path: file.path,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          ownerId: req.userId,
          sharedWith: [],
        })
      )
    );

    res.json({ success: true, files: fileDocs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const files = await File.find({
      $or: [{ ownerId: req.userId }, { sharedWith: req.userId }],
    }).sort({ uploadDate: -1 });

    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ error: "File not found" });

    if (file.ownerId !== req.userId && !file.sharedWith.includes(req.userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const filePath = path.join(__dirname, "../uploads", file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File missing on server" });
    }

    res.download(filePath, file.originalName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const shareFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: "userIds must be an array" });
    }

    const file = await File.findById(id);
    if (!file) return res.status(404).json({ error: "File not found" });

    if (file.ownerId.toString() !== req.userId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to share this file" });
    }

    const currentShared = new Set(file.sharedWith.map(String));
    for (const uid of userIds) {
      if (uid !== req.userId && !currentShared.has(uid)) {
        currentShared.add(uid);
      }
    }
    file.sharedWith = Array.from(currentShared);

    await file.save();

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

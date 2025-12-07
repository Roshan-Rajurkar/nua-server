import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  originalName: String,
  mimetype: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
  ownerId: String,
  sharedWith: [String],
});

export const File = mongoose.model("File", fileSchema);

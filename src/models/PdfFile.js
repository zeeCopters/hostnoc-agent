import mongoose from "mongoose";

const PdfFileSchema = new mongoose.Schema(
  {
    originalName: String,
    size: Number,
    namespace: String,
    pageCount: Number,
  },
  { timestamps: true }
);

export default mongoose.model("PdfFile", PdfFileSchema);

import { Router } from "express";
import { upload } from "../middlewares/upload";
import { extractText } from "../utils/pdfParser";
import { chunkText } from "../utils/chunker";
import { uploadToPinecone } from "../services/pinecone";
import PdfFile from "../models/PdfFile";
import { v4 as uuid } from "uuid";

const router = Router();

router.post("/upload-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file required" });
    }

    const namespace = `pdf-${uuid()}`;

    const { text, pages } = await extractText(req.file.buffer);
    const chunks = chunkText(text);

    await uploadToPinecone(chunks, namespace);

    const savedFile = await PdfFile.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      namespace,
      pageCount: pages,
    });

    res.json({
      message: "PDF indexed successfully",
      file: savedFile,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

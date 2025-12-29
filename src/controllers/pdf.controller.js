import { PdfIndexService } from "../services/pdfIndex.service.js";

const service = new PdfIndexService();

export class PdfController {
  static async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "PDF required" });
      }

      const result = await service.indexPdf(req.file);

      res.status(201).json({
        message: "PDF indexed successfully",
        file: result,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

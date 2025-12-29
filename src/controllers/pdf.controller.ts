import { Request, Response } from "express";
import { PdfIndexService } from "../services/pdfIndex.service";

const service = new PdfIndexService();

export class PdfController {
  static async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "PDF file required" });
      }

      const result = await service.indexPdf(req.file);

      res.status(201).json({
        message: "PDF indexed successfully",
        file: result,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

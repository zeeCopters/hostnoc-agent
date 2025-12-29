import { RAGService } from "../services/rag.service.js";
import PdfFile from "../models/PdfFile.js";

const ragService = new RAGService();

export class RAGController {
  static async ask(req, res) {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question required" });
      }

      // Fetch all uploaded PDFs from database
      const pdfs = await PdfFile.find({});
      if (!pdfs || pdfs.length === 0) {
        return res.status(404).json({ error: "No PDFs uploaded yet." });
      }

      const namespaces = pdfs.map((pdf) => pdf.namespace);

      const answer = await ragService.askQuestion(question, namespaces);

      res.status(200).json({ answer });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

import { extractText } from "../utils/pdfParser.js";
import { chunkText } from "../utils/chunker.js";
import { PdfRepository } from "../repositories/pdf.repository.js";
import { VectorRepository } from "../repositories/vector.repository.js";
import { v4 as uuid } from "uuid";

export class PdfIndexService {
  pdfRepo = new PdfRepository();
  vectorRepo = new VectorRepository();

  async indexPdf(file) {
    const namespace = `pdf-${uuid()}`;

    const { text, pages } = await extractText(file.buffer);
    const chunks = chunkText(text);

    await this.vectorRepo.upsertChunks(chunks, namespace);

    return this.pdfRepo.create({
      originalName: file.originalname,
      size: file.size,
      namespace,
      pageCount: pages,
    });
  }
}

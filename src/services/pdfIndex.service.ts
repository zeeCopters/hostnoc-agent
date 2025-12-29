import { extractText } from "../utils/pdfParser";
import { chunkText } from "../utils/chunker";
import { PdfRepository } from "../repositories/pdf.repository";
import { VectorRepository } from "../repositories/vector.repository";
import { v4 as uuid } from "uuid";

export class PdfIndexService {
  constructor(
    private pdfRepo = new PdfRepository(),
    private vectorRepo = new VectorRepository()
  ) {}

  async indexPdf(file: Express.Multer.File) {
    const namespace = `pdf-${uuid()}`;

    const { text, pages } = await extractText(file.buffer);
    const chunks = chunkText(text);

    await this.vectorRepo.upsertChunks(chunks, namespace);

    return this.pdfRepo.create({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      namespace,
      pageCount: pages,
    });
  }
}

import PdfFile from "../models/PdfFile";

export interface CreatePdfInput {
  filename: string;
  originalName: string;
  size: number;
  namespace: string;
  pageCount: number;
}

export class PdfRepository {
  async create(data: CreatePdfInput) {
    return PdfFile.create(data);
  }

  async findByNamespace(namespace: string) {
    return PdfFile.findOne({ namespace });
  }

  async findAll() {
    return PdfFile.find().sort({ createdAt: -1 });
  }
}

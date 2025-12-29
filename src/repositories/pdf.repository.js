import PdfFile from "../models/PdfFile.js";

export class PdfRepository {
  create(data) {
    return PdfFile.create(data);
  }

  findByNamespace(namespace) {
    return PdfFile.findOne({ namespace });
  }
}

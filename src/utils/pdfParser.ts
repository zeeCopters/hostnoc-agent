import pdf from "pdf-parse";

export async function extractText(buffer: Buffer) {
  const data = await pdf(buffer);
  return {
    text: data.text,
    pages: data.numpages,
  };
}

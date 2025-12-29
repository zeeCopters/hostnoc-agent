import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export async function extractText(buffer) {
  const pdf = (await import("pdf-parse")).default;
  const data = await pdf(buffer);
  return {
    text: data.text,
    pages: data.numpages,
  };
}

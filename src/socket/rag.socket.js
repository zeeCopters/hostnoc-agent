import PdfFile from "../models/PdfFile.js";
import { pinecone } from "../config/pinecone.js";
import { openai } from "../config/openai.js";

export function registerRAGSocket(socket) {
  socket.on("ask", async ({ question }) => {
    try {
      if (!question) {
        socket.emit("error", "Question is required");
        return;
      }

      // 1️⃣ Load all namespaces
      const pdfs = await PdfFile.find({});
      if (!pdfs.length) {
        socket.emit("error", "No documents uploaded yet");
        return;
      }

      const namespaces = pdfs.map((p) => p.namespace);

      // 2️⃣ Create embedding
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: question,
      });

      const vector = embedding.data[0].embedding;
      const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

      // 3️⃣ Query Pinecone across all namespaces
      let chunks = [];

      for (const ns of namespaces) {
        const res = await index.namespace(ns).query({
          vector,
          topK: 3,
          includeMetadata: true,
        });

        chunks.push(
          ...res.matches.map((m) => ({
            text: m.metadata.text,
            source: ns,
          }))
        );
      }

      if (!chunks.length) {
        socket.emit("done", "No relevant data found.");
        return;
      }

      // 4️⃣ Build prompt
      const context = chunks
        .map((c) => `Source(${c.source}): ${c.text}`)
        .join("\n\n");

      const messages = [
        {
          role: "system",
          content:
            "You are a helpful assistant. Answer ONLY using provided context. Cite sources.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${question}`,
        },
      ];

      // 5️⃣ STREAM RESPONSE
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2,
        stream: true,
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content;
        if (token) socket.emit("token", token);
      }

      socket.emit("done");
    } catch (err) {
      console.error(err);
      socket.emit("error", err.message);
    }
  });
}

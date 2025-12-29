import { pinecone } from "../config/pinecone.js";
import { openai } from "../config/openai.js";

export class RAGService {
  constructor() {
    this.indexName = process.env.PINECONE_INDEX_NAME;
  }

  // Retrieve relevant chunks from multiple namespaces
  async retrieveRelevantChunks(query, namespaces) {
    const index = pinecone.index(this.indexName);

    // Get embedding of the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryVector = embeddingResponse.data[0].embedding;

    let allChunks = [];

    // Query each namespace
    for (const ns of namespaces) {
      const searchResponse = await index.namespace(ns).query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
      });

      const chunks = searchResponse.matches.map((m) => m.metadata.text);
      allChunks = allChunks.concat(chunks);
    }

    return allChunks;
  }

  // Ask LLM using all retrieved chunks
  async askQuestion(query, namespaces) {
    const chunks = await this.retrieveRelevantChunks(query, namespaces);

    if (chunks.length === 0) {
      return "No relevant information found in your documents.";
    }

    const context = chunks.join("\n\n");
    const prompt = `You are an expert assistant. Use the following document context to answer the question.\n\nContext:\n${context}\n\nQuestion: ${query}\nAnswer:`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  }
}

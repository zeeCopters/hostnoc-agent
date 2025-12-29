import { v4 as uuid } from "uuid";
import { pinecone } from "../config/pinecone.js";
import { openai } from "../config/openai.js";

export class VectorRepository {
  async upsertChunks(chunks, namespace) {
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

    const vectors = [];

    for (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });

      vectors.push({
        id: uuid(),
        values: embedding.data[0].embedding,
        metadata: { text: chunk },
      });
    }

    await index.namespace(namespace).upsert(vectors);
  }
}

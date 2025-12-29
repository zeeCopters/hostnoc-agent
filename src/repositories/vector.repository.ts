import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { v4 as uuid } from "uuid";

export class VectorRepository {
  private pinecone;
  private openai;
  private indexName: string;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    this.indexName = process.env.PINECONE_INDEX_NAME!;
  }

  async upsertChunks(chunks: string[], namespace: string) {
    const index = this.pinecone.index(this.indexName);

    const vectors = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await this.openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk,
        });

        return {
          id: uuid(),
          values: embedding.data[0].embedding,
          metadata: { text: chunk },
        };
      })
    );

    await index.namespace(namespace).upsert(vectors);
  }
}

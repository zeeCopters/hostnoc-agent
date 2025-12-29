import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { v4 as uuid } from "uuid";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function uploadToPinecone(chunks: string[], namespace: string) {
  const index = pc.index(process.env.PINECONE_INDEX_NAME!);

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

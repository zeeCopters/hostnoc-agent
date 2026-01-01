import { ChatRepository } from "../repositories/chat.repository.js";
import PdfFile from "../models/PdfFile.js";
import { pinecone } from "../config/pinecone.js";
import { openai } from "../config/openai.js";

const chatRepo = new ChatRepository();

export class ChatService {
  async handleMessage({ userId, message }) {
    // 1️⃣ Save user message
    await chatRepo.saveMessage({
      userId,
      role: "user",
      message,
    });

    // Normalize question for exact match
    const normalizedQuestion = message.trim().toLowerCase();

    // 2️⃣ Get all namespaces
    const pdfs = await PdfFile.find({});
    const namespaces = pdfs.map((p) => p.namespace);

    // 3️⃣ Embed question
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });

    const vector = embedding.data[0].embedding;
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

    let chunks = [];
    let exactAnswer = null;

    // 4️⃣ Retrieve from Pinecone
    for (const ns of namespaces) {
      const res = await index.namespace(ns).query({
        vector,
        topK: 5,
        includeMetadata: true,
      });

      for (const match of res.matches || []) {
        const text = match.metadata?.text;
        if (!text || typeof text !== "string") continue;

        // 🔍 Try to extract Q/A from raw text
        const qaMatch = text.match(/Q[:\-]\s*(.+?)\n*A[:\-]\s*([\s\S]+)/i);

        if (qaMatch) {
          const question = qaMatch[1].trim().toLowerCase();
          const answer = qaMatch[2].trim();

          if (question === normalizedQuestion) {
            exactAnswer = answer;
            break;
          }
        }

        // Semantic fallback
        if (match.score >= 0.75) {
          chunks.push(text);
        }
      }

      if (exactAnswer) break;
    }

    // 5️⃣ Return exact document answer (NO LLM)
    if (exactAnswer) {
      await chatRepo.saveMessage({
        userId,
        role: "assistant",
        message: exactAnswer,
      });

      return exactAnswer;
    }

    // 6️⃣ Strict grounding check
    if (!chunks.length) {
      const fallback = "I don’t know based on the provided documents.";

      await chatRepo.saveMessage({
        userId,
        role: "assistant",
        message: fallback,
      });

      return fallback;
    }

    // 7️⃣ Build grounded prompt
    const systemPrompt = `
You are a document-grounded assistant.

STRICT RULES:
- Answer using ONLY the information inside <context>.
- Do NOT use prior knowledge or assumptions.
- If the answer is not explicitly stated, reply exactly:
  "I don’t know based on the provided documents."
`;

    const userPrompt = `
<context>
${chunks.join("\n\n")}
</context>

Question:
${message}
`;

    // 8️⃣ Ask LLM (STRICT RAG)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const aiMessage =
      completion.choices[0]?.message?.content ||
      "I don’t know based on the provided documents.";

    // 9️⃣ Save AI reply
    await chatRepo.saveMessage({
      userId,
      role: "assistant",
      message: aiMessage,
    });

    return aiMessage;
  }
}

import { ChatRepository } from "../repositories/chat.repository.js";
import PdfFile from "../models/PdfFile.js";
import { pinecone } from "../config/pinecone.js";
import { openai } from "../config/openai.js";

const chatRepo = new ChatRepository();

export class ChatService {
  async handleMessage({ userId, message }) {
    // 1️⃣ Fetch the last 10 messages for conversation context (Memory)
    const history = await chatRepo.getRecentMessages(userId, 10);

    // 2️⃣ Save the current user message to MongoDB
    await chatRepo.saveMessage({
      userId,
      role: "user",
      message,
    });

    const normalizedQuestion = message.trim().toLowerCase();

    // 3️⃣ Get all PDF namespaces for vector search
    const pdfs = await PdfFile.find({});
    const namespaces = pdfs.map((p) => p.namespace);

    // 4️⃣ Embed the current question for vector search
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });

    const vector = embedding.data[0].embedding;
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

    let chunks = [];
    let exactAnswer = null;

    // 5️⃣ Retrieve context from Pinecone
    for (const ns of namespaces) {
      const res = await index.namespace(ns).query({
        vector,
        topK: 5,
        includeMetadata: true,
      });

      for (const match of res.matches || []) {
        const text = match.metadata?.text;
        if (!text || typeof text !== "string") continue;

        // Check for exact Q&A pattern matches in the documents
        const qaMatch = text.match(/Q[:\-]\s*(.+?)\n*A[:\-]\s*([\s\S]+)/i);
        if (qaMatch) {
          const question = qaMatch[1].trim().toLowerCase();
          const answer = qaMatch[2].trim();
          if (question === normalizedQuestion) {
            exactAnswer = answer;
            break;
          }
        }

        if (match.score >= 0.5) {
          chunks.push(text);
        }
      }
      if (exactAnswer) break;
    }

    // 6️⃣ If an exact document match is found, return it immediately
    if (exactAnswer) {
      await chatRepo.saveMessage({
        userId,
        role: "assistant",
        message: exactAnswer,
      });
      return exactAnswer;
    }

    // 7️⃣ Fallback if no context is found in Pinecone
    if (!chunks.length) {
      const fallback = "I don’t know based on the provided documents.";
      await chatRepo.saveMessage({
        userId,
        role: "assistant",
        message: fallback,
      });
      return fallback;
    }

    // 8️⃣ Format MongoDB history for OpenAI
    const chatHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.message,
    }));

    // 9️⃣ Build grounded system prompt
    const systemPrompt = `
You are the HostNoc AI Customer Support Agent.
Your tone is professional, helpful, and confident.

STRICT RULES:
- Answer using ONLY the information inside <context>.
- Use the conversation history to understand pronouns (like "it", "that", "the first one").
- Do NOT use prior knowledge outside the provided context.
- If the answer is not in <context>, reply exactly: "I don’t know based on the provided documents."
`;

    const userPrompt = `
<context>
${chunks.join("\n\n")}
</context>

Question:
${message}
`;

    // 🔟 Call LLM with History + Context
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory, // Injection of the last 10 messages
        { role: "user", content: userPrompt },
      ],
    });

    const aiMessage =
      completion.choices[0]?.message?.content ||
      "I don’t know based on the provided documents.";

    // 1️⃣1️⃣ Save AI response to MongoDB
    await chatRepo.saveMessage({
      userId,
      role: "assistant",
      message: aiMessage,
    });

    return aiMessage;
  }
}

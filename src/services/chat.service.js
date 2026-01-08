import { ChatRepository } from "../repositories/chat.repository.js";
import PdfFile from "../models/PdfFile.js";
import { pinecone } from "../config/pinecone.js";
import { openai } from "../config/openai.js";

const chatRepo = new ChatRepository();

export class ChatService {
  async handleMessage({ userId, message }) {
    // 1️⃣ Fetch last 10 messages for context
    const history = await chatRepo.getRecentMessages(userId, 10);

    // 2️⃣ Query rewriting
    let searchMessage = message;
    if (history.length > 0) {
      const historySummary = history
        .map((m) => `${m.role}: ${m.message}`)
        .join("\n");

      const rewriteResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Rewrite the user's last message into a standalone search query.",
          },
          {
            role: "user",
            content: `History:\n${historySummary}\n\nLast Message: ${message}`,
          },
        ],
      });

      searchMessage = rewriteResponse.choices[0].message.content;
    }

    // 3️⃣ Embedding & Pinecone search
    const pdfs = await PdfFile.find({});
    const namespaces = pdfs.map((p) => p.namespace);

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: searchMessage,
    });

    const vector = embedding.data[0].embedding;
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

    let chunks = [];
    let exactAnswer = null;
    const normalizedQuestion = message.trim().toLowerCase();

    for (const ns of namespaces) {
      const res = await index.namespace(ns).query({
        vector,
        topK: 5,
        includeMetadata: true,
      });

      for (const match of res.matches || []) {
        const text = match.metadata?.text;
        if (!text) continue;

        const qaMatch = text.match(/Q[:\-]\s*(.+?)\n*A[:\-]\s*([\s\S]+)/i);
        if (qaMatch && qaMatch[1].trim().toLowerCase() === normalizedQuestion) {
          exactAnswer = qaMatch[2].trim();
          break;
        }

        if (match.score >= 0.4) chunks.push(text);
      }

      if (exactAnswer) break;
    }

    // 4️⃣ Exact answer
    if (exactAnswer) {
      await chatRepo.saveMessage({
        userId,
        role: "assistant",
        message: exactAnswer,
      });
      return exactAnswer;
    }

    // 5️⃣ Fallback
    if (!chunks.length) {
      const fallback = "I don’t know based on the provided documents.";
      await chatRepo.saveMessage({
        userId,
        role: "assistant",
        message: fallback,
      });
      return fallback;
    }

    // 6️⃣ Final LLM generation
    const chatHistory = history.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.message,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "You are HostNoc AI Support." },
        ...chatHistory,
        { role: "user", content: message },
      ],
    });

    const aiMessage =
      completion.choices[0]?.message?.content ||
      "I don’t know based on the provided documents.";

    // 7️⃣ Save AI reply
    await chatRepo.saveMessage({
      userId,
      role: "assistant",
      message: aiMessage,
    });

    return aiMessage;
  }

  // ✅ Save USER message
  async saveUserMessageOnly(userId, message) {
    return chatRepo.saveMessage({
      userId,
      role: "user",
      message,
    });
  }

  // ✅ Save ASSISTANT message (Human reply)
  async saveAssistantMessage(userId, message) {
    return chatRepo.saveMessage({
      userId,
      role: "assistant",
      message,
    });
  }

  async getUserListWithLastMessage() {
    return chatRepo.getAllUsersLastMessages();
  }

  async getUserChats(userId, limit = 20, offset = 0) {
    return chatRepo.getChatsByUserId({ userId, limit, offset });
  }
}

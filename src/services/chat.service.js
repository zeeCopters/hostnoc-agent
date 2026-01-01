import { ChatRepository } from "../repositories/chat.repository.js";
import PdfFile from "../models/PdfFile.js";
import { pinecone } from "../config/pinecone.js";
import { openai } from "../config/openai.js";

const chatRepo = new ChatRepository();

export class ChatService {
  async handleMessage({ userId, message }) {
    // 1️⃣ Fetch last 10 messages for context
    const history = await chatRepo.getRecentMessages(userId, 10);

    // 2️⃣ Query Rewriting: Resolve pronouns like "it" based on history
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
              "You are a query rewriter. Given the conversation history, rewrite the user's latest message into a standalone search query. If it's already clear, return the original message.",
          },
          {
            role: "user",
            content: `History:\n${historySummary}\n\nLast Message: ${message}`,
          },
        ],
      });
      searchMessage = rewriteResponse.choices[0].message.content;
    }

    // 3️⃣ Save current user message to DB
    await chatRepo.saveMessage({ userId, role: "user", message });

    // 4️⃣ Get Namespaces & Embed the REWRITTEN message
    const pdfs = await PdfFile.find({});
    const namespaces = pdfs.map((p) => p.namespace);

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: searchMessage, // We search for the resolved query
    });

    const vector = embedding.data[0].embedding;
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

    let chunks = [];
    let exactAnswer = null;
    const normalizedQuestion = message.trim().toLowerCase();

    // 5️⃣ Retrieve from Pinecone
    for (const ns of namespaces) {
      const res = await index.namespace(ns).query({
        vector,
        topK: 5,
        includeMetadata: true,
      });

      for (const match of res.matches || []) {
        const text = match.metadata?.text;
        if (!text) continue;

        // Exact match logic for FAQ-style blocks
        const qaMatch = text.match(/Q[:\-]\s*(.+?)\n*A[:\-]\s*([\s\S]+)/i);
        if (qaMatch && qaMatch[1].trim().toLowerCase() === normalizedQuestion) {
          exactAnswer = qaMatch[2].trim();
          break;
        }

        if (match.score >= 0.4) chunks.push(text);
      }
      if (exactAnswer) break;
    }

    // 6️⃣ Handle Exact Match
    if (exactAnswer) {
      await chatRepo.saveMessage({
        userId,
        role: "assistant",
        message: exactAnswer,
      });
      return exactAnswer;
    }

    // 7️⃣ Fallback if no relevant documents found
    if (!chunks.length) {
      const fallback = "I don’t know based on the provided documents.";
      await chatRepo.saveMessage({
        userId,
        role: "assistant",
        message: fallback,
      });
      return fallback;
    }

    // 8️⃣ Final LLM Generation (With Context + Memory)
    const chatHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.message,
    }));

    const systemPrompt = `
You are the HostNoc AI Customer Support Agent. Tone: Professional, helpful[cite: 476, 477].
STRICT RULES:
- Answer ONLY using information inside <context>.
- Use the conversation history to resolve pronouns like "it" or "that server".
- If the information is not in <context>, say "I don’t know based on the provided documents."[cite: 477, 478].
`;

    const userPrompt = `
<context>
${chunks.join("\n\n")}
</context>

User Question: ${message}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory,
        { role: "user", content: userPrompt },
      ],
    });

    const aiMessage =
      completion.choices[0]?.message?.content ||
      "I don’t know based on the provided documents.";

    // 9️⃣ Save AI response
    await chatRepo.saveMessage({
      userId,
      role: "assistant",
      message: aiMessage,
    });

    return aiMessage;
  }
}

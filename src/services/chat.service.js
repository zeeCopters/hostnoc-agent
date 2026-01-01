import { ChatRepository } from "../repositories/chat.repository.js";
import { openai } from "../config/openai.js";

const chatRepo = new ChatRepository();

export class ChatService {
  async handleMessage({ userId, message }) {
    // Save user message
    await chatRepo.saveMessage({
      userId,
      role: "user",
      message,
    });

    // Fetch recent chat history (memory)
    const history = await chatRepo.getUserChats(userId, 10);

    const messages = history.reverse().map((c) => ({
      role: c.role,
      content: c.message,
    }));

    // Ask LLM
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
    });

    const aiMessage = completion.choices[0].message.content;

    // Save AI response
    await chatRepo.saveMessage({
      userId,
      role: "assistant",
      message: aiMessage,
    });

    return aiMessage;
  }
}

import Chat from "../models/Chat.js";

export class ChatRepository {
  // Saves a single message (user or assistant) to MongoDB
  async saveMessage({ userId, role, message }) {
    return await Chat.create({ userId, role, message });
  }

  // Gets the most recent messages for a user, sorted chronologically
  async getRecentMessages(userId, limit = 10) {
    const messages = await Chat.find({ userId })
      .sort({ createdAt: -1 }) // Get newest first to apply limit
      .limit(limit)
      .lean();

    // Reverse them so they are in the correct order for the LLM:
    // [Older Message] -> [Newer Message]
    return messages.reverse();
  }

  // Optional: Gets all chats for a user (history view)
  async getUserChats(userId, limit = 20) {
    return await Chat.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

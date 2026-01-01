import Chat from "../models/Chat.js";

export class ChatRepository {
  async saveMessage({ userId, role, message }) {
    return await Chat.create({ userId, role, message });
  }

  async getRecentMessages(userId, limit = 10) {
    const messages = await Chat.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return messages.reverse();
  }

  async getUserChats(userId, limit = 20) {
    return await Chat.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

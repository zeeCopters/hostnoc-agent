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

  async getAllUsersLastMessages() {
    return await Chat.aggregate([
      {
        $sort: { createdAt: -1 }, // Sort all messages by date (newest first)
      },
      {
        $group: {
          _id: "$userId", // Group by userId
          lastMessage: { $first: "$message" }, // Get the first message after sorting
          role: { $first: "$role" },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $project: {
          userId: "$_id",
          _id: 0,
          lastMessage: 1,
          role: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 }, // Final sort to show users with the newest activity first
      },
    ]);
  }

  async getChatsByUserId({ userId, limit = 20, offset = 0 }) {
    return Chat.find({ userId })
      .sort({ createdAt: -1 }) // latest first
      .skip(offset)
      .limit(limit)
      .lean();
  }
}

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
    return Chat.aggregate([
      { $sort: { createdAt: -1 } },

      {
        $group: {
          _id: "$userId",
          lastMessage: { $first: "$message" },
          lastMessageRole: { $first: "$role" },
          lastMessageTime: { $first: "$createdAt" },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 0,
          userId: "$_id",

          // ✅ FIXED FIELD NAMES
          userName: { $ifNull: ["$user.fullName", "Unknown User"] },
          country: {
            $ifNull: ["$user.location.countryName", "Unknown"],
          },

          lastMessage: 1,
          lastMessageRole: 1,
          lastMessageTime: 1,
        },
      },

      { $sort: { lastMessageTime: -1 } },
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

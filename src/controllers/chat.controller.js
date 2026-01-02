import { ChatService } from "../services/chat.service.js";
import mongoose from "mongoose";

const chatService = new ChatService();

export class ChatController {
  async getUsers(req, res) {
    try {
      const users = await chatService.getUserListWithLastMessage();
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getUserChats(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }

      const messages = await chatService.getUserChats(userId, limit, offset);

      return res.status(200).json({
        userId,
        limit,
        offset,
        count: messages.length,
        messages,
      });
    } catch (err) {
      console.error("❌ getUserChats error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

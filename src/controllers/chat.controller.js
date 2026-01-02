import { ChatService } from "../services/chat.service.js";

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
}

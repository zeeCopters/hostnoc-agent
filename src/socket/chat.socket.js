import { ChatService } from "../services/chat.service.js";
import mongoose from "mongoose";

const chatService = new ChatService();

export function registerChatSocket(socket) {
  /**
   * Client must send:
   * {
   *   userId: "...",
   *   message: "Hello"
   * }
   */
  socket.on("chat", async ({ userId, message }) => {
    try {
      if (!userId || !message) {
        socket.emit("error", "userId and message are required");
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        socket.emit("error", "Invalid userId");
        return;
      }

      const reply = await chatService.handleMessage({
        userId,
        message,
      });

      socket.emit("reply", reply);
    } catch (err) {
      console.error(err);
      socket.emit("error", err.message);
    }
  });
}

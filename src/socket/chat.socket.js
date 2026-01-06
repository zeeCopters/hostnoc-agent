import { ChatService } from "../services/chat.service.js";
import mongoose from "mongoose";
import User from "../models/User.js";

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

      const user = await User.findById(userId).lean();

      // 🧑 HUMAN MODE → STOP AI
      if (user.chatMode === "HUMAN") {
        await chatService.saveUserMessageOnly(userId, message);

        // Notify human agents
        socket.to("AGENTS").emit("newHumanMessage", {
          userId,
          message,
        });

        return; // ❌ STOP HERE (NO AI)
      }

      // 🤖 AI MODE
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

  socket.on("toggleChatMode", async ({ userId, mode }) => {
    if (!["AI", "HUMAN"].includes(mode)) return;

    await User.findByIdAndUpdate(userId, {
      chatMode: mode,
    });

    socket.emit("chatModeUpdated", { mode });
  });
}

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
      const user = await User.findById(userId).lean();

      console.log("🧠 Chat mode:", user.chatMode);

      // 🤖 AI MODE → AI ONLY
      if (user.chatMode === "AI") {
        const reply = await chatService.handleMessage({ userId, message });
        socket.emit("reply", reply);
        return; // ❗ STOP HERE
      }

      // 🧑 HUMAN MODE → HUMAN ONLY
      if (user.chatMode === "HUMAN") {
        await chatService.saveUserMessageOnly(userId, message);

        socket.to("AGENTS").emit("newHumanMessage", {
          userId,
          message,
        });

        return; // ❗ STOP HERE
      }
    } catch (err) {
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

  socket.on("humanReply", async ({ userId, message }) => {
    try {
      await chatService.saveUserMessageOnly(userId, message);

      // Send message to USER room
      socket.to(userId).emit("reply", message);
    } catch (err) {
      socket.emit("error", err.message);
    }
  });
}

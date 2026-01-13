import { ChatService } from "../services/chat.service.js";
import User from "../models/User.js";

const chatService = new ChatService();

export function registerChatSocket(io, socket) {
  socket.on("init", async ({ userId, role }, ack) => {
    try {
      if (role === "USER" && userId) {
        socket.join(userId);
        socket.data.userId = userId;

        // 🔑 LOAD CHAT MODE FROM DATABASE
        const user = await User.findById(userId).lean();
        socket.data.chatMode = user?.chatMode || "AI";
      }

      if (role === "ADMIN") {
        socket.join("AGENTS");
      }

      if (ack) ack({ ok: true });
    } catch (err) {
      console.error("❌ init error:", err);
      if (ack) ack({ ok: false, error: err.message });
    }
  });

  socket.on("chat", async ({ userId, message }) => {
    try {
      if (!userId || !message) return;

      // 🔑 DB IS SOURCE OF TRUTH
      const user = await User.findById(userId).lean();
      const chatMode = user?.chatMode || socket.data.chatMode || "AI";

      // Keep socket cache in sync
      socket.data.chatMode = chatMode;

      // ✅ Always save user message
      await chatService.saveUserMessageOnly(userId, message);

      // 🤖 AI MODE
      if (chatMode === "AI") {
        io.to(`AI_MONITOR:${userId}`).emit("aiUserMessage", {
          userId,
          message,
          timestamp: new Date().toISOString(),
        });

        io.to(`AI_MONITOR:${userId}`).emit("aiThinking", {
          userId,
          status: "thinking",
          timestamp: new Date().toISOString(),
        });

        const reply = await chatService.handleMessage({ userId, message });

        io.to(`AI_MONITOR:${userId}`).emit("aiFinalMessage", {
          userId,
          message: reply,
          timestamp: new Date().toISOString(),
        });

        io.in(userId).emit("reply", reply);
        return;
      }

      // 🧑 HUMAN MODE
      if (chatMode === "HUMAN") {
        socket.to("AGENTS").emit("newHumanMessage", {
          userId,
          message,
        });
      }
    } catch (err) {
      socket.emit("error", err.message);
    }
  });

  socket.on("toggleChatMode", async ({ userId, mode }) => {
    try {
      if (!userId || !["AI", "HUMAN"].includes(mode)) return;

      socket.data.chatMode = mode;
      await User.findByIdAndUpdate(userId, { chatMode: mode });

      if (mode === "HUMAN") {
        socket.to("AGENTS").emit("humanChatRequested", { userId });
      }

      socket.emit("chatModeUpdated", { mode });
    } catch (err) {
      socket.emit("error", err.message);
    }
  });

  socket.on("humanReply", async ({ userId, message }) => {
    try {
      if (!userId || !message) return;

      // ✅ save as assistant (human)
      await chatService.saveAssistantMessage(userId, message);

      io.in(userId).emit("reply", message);
    } catch (err) {
      socket.emit("error", err.message);
    }
  });

  socket.on("joinAiMonitorUser", ({ userId }) => {
    if (!userId) return;

    socket.join(`AI_MONITOR:${userId}`);
    console.log(`🧠 Admin monitoring AI for user ${userId}`);
  });

  socket.on("leaveAiMonitorUser", ({ userId }) => {
    if (!userId) return;

    socket.leave(`AI_MONITOR:${userId}`);
    console.log(`🧠 Admin stopped monitoring AI for user ${userId}`);
  });
}

// import { ChatService } from "../services/chat.service.js";
// import User from "../models/User.js";

// const chatService = new ChatService();

// export function registerChatSocket(io, socket) {
//   socket.on("init", ({ userId, role }, ack) => {
//     if (role === "USER" && userId) {
//       socket.join(userId);
//       socket.data.chatMode = "AI";
//       socket.data.userId = userId;
//     }

//     if (role === "ADMIN") {
//       socket.join("AGENTS");
//     }

//     if (ack) ack({ ok: true });
//   });

//   socket.on("chat", async ({ userId, message }) => {
//     try {
//       if (!userId || !message) return;

//       const chatMode = socket.data.chatMode || "AI";

//       // ✅ ALWAYS save user message first
//       await chatService.saveUserMessageOnly(userId, message);

//       if (chatMode === "AI") {
//         // 🔔 ADMIN — USER MESSAGE
//         io.to(`AI_MONITOR:${userId}`).emit("aiUserMessage", {
//           userId,
//           message,
//           timestamp: new Date().toISOString(),
//         });

//         // 🔔 ADMIN — AI THINKING
//         io.to(`AI_MONITOR:${userId}`).emit("aiThinking", {
//           userId,
//           status: "thinking",
//           timestamp: new Date().toISOString(),
//         });

//         // 🤖 AI RESPONSE
//         const reply = await chatService.handleMessage({ userId, message });

//         // 🔔 ADMIN — AI FINAL MESSAGE
//         io.to(`AI_MONITOR:${userId}`).emit("aiFinalMessage", {
//           userId,
//           message: reply,
//           timestamp: new Date().toISOString(),
//         });

//         // ✅ SEND TO USER
//         io.in(userId).emit("reply", reply);
//         return;
//       }

//       if (chatMode === "HUMAN") {
//         socket.to("AGENTS").emit("newHumanMessage", {
//           userId,
//           message,
//         });
//       }
//     } catch (err) {
//       socket.emit("error", err.message);
//     }
//   });

//   socket.on("toggleChatMode", async ({ userId, mode }) => {
//     try {
//       if (!userId || !["AI", "HUMAN"].includes(mode)) return;

//       socket.data.chatMode = mode;
//       await User.findByIdAndUpdate(userId, { chatMode: mode });

//       if (mode === "HUMAN") {
//         socket.to("AGENTS").emit("humanChatRequested", { userId });
//       }

//       socket.emit("chatModeUpdated", { mode });
//     } catch (err) {
//       socket.emit("error", err.message);
//     }
//   });

//   socket.on("humanReply", async ({ userId, message }) => {
//     try {
//       if (!userId || !message) return;

//       // ✅ save as assistant (human)
//       await chatService.saveAssistantMessage(userId, message);

//       io.in(userId).emit("reply", message);
//     } catch (err) {
//       socket.emit("error", err.message);
//     }
//   });

//   socket.on("joinAiMonitorUser", ({ userId }) => {
//     if (!userId) return;

//     socket.join(`AI_MONITOR:${userId}`);
//     console.log(`🧠 Admin monitoring AI for user ${userId}`);
//   });

//   socket.on("leaveAiMonitorUser", ({ userId }) => {
//     if (!userId) return;

//     socket.leave(`AI_MONITOR:${userId}`);
//     console.log(`🧠 Admin stopped monitoring AI for user ${userId}`);
//   });
// }

import { ChatService } from "../services/chat.service.js";
import User from "../models/User.js";

const chatService = new ChatService();

export function registerChatSocket(io, socket) {
  // INIT
  socket.on("init", ({ userId, role }, ack) => {
    if (role === "USER" && userId) {
      socket.join(userId);
      socket.data.chatMode = "AI";
      socket.data.userId = userId;
    }

    if (role === "ADMIN") {
      socket.join("AGENTS");
    }

    if (ack) ack({ ok: true });
  });

  // CHAT (USER → AI / HUMAN)
  socket.on("chat", async ({ userId, message }) => {
    try {
      if (!userId || !message) return;

      const chatMode = socket.data.chatMode || "AI";

      // ✅ ALWAYS save user message first
      await chatService.saveUserMessageOnly(userId, message);

      // 🤖 AI MODE
      if (chatMode === "AI") {
        const reply = await chatService.handleMessage({ userId, message });
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

  // TOGGLE MODE
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

  // ADMIN → USER
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
}

// import { ChatService } from "../services/chat.service.js";
// import User from "../models/User.js";

// const chatService = new ChatService();

// export function registerChatSocket(io, socket) {
//   // INIT
//   socket.on("init", ({ userId, role }, ack) => {
//     if (role === "USER" && userId) {
//       socket.join(userId);
//       socket.data.chatMode = "AI";
//       socket.data.userId = userId;
//     }

//     if (role === "ADMIN") {
//       socket.join("AGENTS");
//     }

//     // ✅ tell client it's safe
//     if (ack) ack({ ok: true });
//   });

//   // CHAT
//   socket.on("chat", async ({ userId, message }) => {
//     try {
//       if (!userId || !message) return;

//       const chatMode = socket.data.chatMode || "AI";

//       // 🤖 AI MODE
//       if (chatMode === "AI") {
//         const reply = await chatService.handleMessage({ userId, message });

//         // ✅ SEND TO ALL USER SOCKETS (INCLUDING SENDER)
//         io.in(userId).emit("reply", reply);
//         return;
//       }

//       // 🧑 HUMAN MODE
//       if (chatMode === "HUMAN") {
//         await chatService.saveUserMessageOnly(userId, message);

//         socket.to("AGENTS").emit("newHumanMessage", {
//           userId,
//           message,
//         });
//       }
//     } catch (err) {
//       socket.emit("error", err.message);
//     }
//   });

//   // TOGGLE MODE
//   socket.on("toggleChatMode", async ({ userId, mode }) => {
//     try {
//       if (!userId || !["AI", "HUMAN"].includes(mode)) return;

//       // ✅ INSTANT SWITCH (NO RACE)
//       socket.data.chatMode = mode;

//       // persist if you want
//       await User.findByIdAndUpdate(userId, { chatMode: mode });

//       if (mode === "HUMAN") {
//         socket.to("AGENTS").emit("humanChatRequested", { userId });
//       }

//       socket.emit("chatModeUpdated", { mode });
//     } catch (err) {
//       socket.emit("error", err.message);
//     }
//   });

//   // ADMIN → USER
//   socket.on("humanReply", async ({ userId, message }) => {
//     try {
//       if (!userId || !message) return;

//       await chatService.saveUserMessageOnly(userId, message);
//       socket.in(userId).emit("reply", message);
//     } catch (err) {
//       socket.emit("error", err.message);
//     }
//   });
// }

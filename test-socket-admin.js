import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

const USER_ID = "695b6fda6859df810e722fd4";

socket.on("connect", () => {
  console.log("🧑‍💻 Admin connected:", socket.id);

  // ✅ INIT ADMIN
  socket.emit("init", {
    role: "ADMIN",
  });

  // ✅ JOIN AI MONITOR FOR THIS USER (AFTER CONNECT)
  socket.emit("joinAiMonitorUser", { userId: USER_ID });
});

/**
 * 🔔 AI MONITOR EVENTS
 */
socket.on("aiUserMessage", (data) => {
  console.log("👤 USER:", data.message);
});

socket.on("aiThinking", () => {
  console.log("🤔 AI THINKING...");
});

socket.on("aiFinalMessage", (data) => {
  console.log("🤖 AI:", data.message);
});

/**
 * 🧑 HUMAN CHAT EVENTS (still work)
 */
socket.on("humanChatRequested", ({ userId }) => {
  console.log("🔔 Human chat requested by:", userId);
});

socket.on("newHumanMessage", ({ userId, message }) => {
  console.log("📩 New user message:", message);

  setTimeout(() => {
    socket.emit("humanReply", {
      userId,
      message: "Hi! I'm a human agent. How can I help you?",
    });
  }, 2000);
});

socket.on("newUserJoined", (data) => {
  console.log("🔔 ADMIN ALERT:", data.msg);
  console.log("👤 USER:", data.user);
});

socket.on("error", (err) => {
  console.error("❌ Admin error:", err);
});

// TO LEAVE AI MONITOR
// socket.emit("leaveAiMonitorUser", { userId: "695b6fda6859df810e722fd4" });

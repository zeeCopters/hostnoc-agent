import { io } from "socket.io-client";

//const socket = io("http://localhost:3000");
const socket = io("https://hostnocchat.branex.org");

socket.on("connect", () => {
  console.log("🧑‍💻 Admin connected:", socket.id);

  // ✅ CORRECT INIT
  socket.emit("init", {
    role: "ADMIN",
  });
});

socket.on("humanChatRequested", ({ userId }) => {
  console.log("🔔 Human chat requested by:", userId);
});

socket.on("newHumanMessage", ({ userId, message }) => {
  console.log("📩 New user message:");
  console.log("User:", userId);
  console.log("Message:", message);

  setTimeout(() => {
    socket.emit("humanReply", {
      userId,
      message: "Hi! I'm a human agent. How can I help you?",
    });
  }, 2000);
});

socket.on("error", (err) => {
  console.error("❌ Admin error:", err);
});

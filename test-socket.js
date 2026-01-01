import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("✅ Connected to socket:", socket.id);

  socket.emit("chat", {
    userId: "695526239e1f207baa235eed",
    message: "How much does it cost?",
  });
});

socket.on("reply", (msg) => {
  console.log("🤖 AI:", msg);
});

socket.on("error", (err) => {
  console.error("❌ Error:", err);
});

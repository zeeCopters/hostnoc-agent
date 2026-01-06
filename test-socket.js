import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const USER_ID = "695b6fda6859df810e722fd4";

socket.on("connect", () => {
  console.log("👤 User connected:", socket.id);

  // 🔹 DEFAULT = AI MODE
  socket.emit("chat", {
    userId: USER_ID,
    message: "Hello AI",
  });

  // ⏳ Switch to HUMAN after 5 seconds
  setTimeout(() => {
    console.log("🔁 Switching to HUMAN mode");

    socket.emit("toggleChatMode", {
      userId: USER_ID,
      mode: "HUMAN",
    });

    // Send message to HUMAN
    setTimeout(() => {
      socket.emit("chat", {
        userId: USER_ID,
        message: "I want to talk to a human",
      });
    }, 1000);
  }, 5000);
});

socket.on("reply", (msg) => {
  console.log("💬 Reply:", msg);
});

socket.on("chatModeUpdated", ({ mode }) => {
  console.log("✅ Chat mode updated:", mode);
});

socket.on("error", (err) => {
  console.error("❌ Error:", err);
});

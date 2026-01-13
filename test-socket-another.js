import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});
// const socket = io("https://hostnocchat.branex.org", {
//   transports: ["websocket"],
// });

const USER_ID = "6961016e4cafdf0c1f7f58e5";
//const USER_ID = "695e433e22e9a78834516d4b";

socket.on("connect", () => {
  console.log("👤 User connected:", socket.id);

  // ✅ INIT WITH ACK (IMPORTANT)
  socket.emit(
    "init",
    {
      userId: USER_ID,
      role: "USER",
    },
    () => {
      console.log("✅ Init completed, safe to chat");

      // 🤖 AI MESSAGE (NOW SAFE)
      socket.emit("chat", {
        userId: USER_ID,
        message: "Tell me about cloud hosting.",
        //message: "Hi.",
      });

      //   setTimeout(() => {
      //     console.log("🔁 Switching to HUMAN mode");

      //     socket.emit("toggleChatMode", {
      //       userId: USER_ID,
      //       mode: "HUMAN",
      //     });

      //     setTimeout(() => {
      //       socket.emit("chat", {
      //         userId: USER_ID,
      //         message: "I want to talk to a human",
      //       });
      //     }, 1000);
      //   }, 20000);
    }
  );
});

socket.on("reply", (msg) => {
  console.log("💬 Reply:", msg);
});

// socket.on("chatModeUpdated", ({ mode }) => {
//   console.log("✅ Chat mode updated:", mode);
// });

socket.on("error", (err) => {
  console.error("❌ Error:", err);
});

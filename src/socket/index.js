import { Server } from "socket.io";
import { registerChatSocket } from "./chat.socket.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    // 👤 Human agent joins AGENTS room
    socket.on("joinAgent", () => {
      socket.join("AGENTS");
      console.log("🧑 Agent joined AGENTS room:", socket.id);
    });

    // Register chat events
    registerChatSocket(socket);

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
}

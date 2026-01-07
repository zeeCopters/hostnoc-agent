import { Server } from "socket.io";
import { registerChatSocket } from "./chat.socket.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("joinUser", ({ userId }) => {
      socket.join(userId);
      console.log("👤 User joined room:", userId);
    });

    socket.on("joinAgent", () => {
      socket.join("AGENTS");
      console.log("🧑 Agent joined AGENTS");
    });

    registerChatSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
}

import { Server } from "socket.io";
import { registerChatSocket } from "./chat.socket.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    registerChatSocket(socket);

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
}

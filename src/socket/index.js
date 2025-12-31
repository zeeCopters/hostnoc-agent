import { Server } from "socket.io";
import { registerRAGSocket } from "./rag.socket.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);
    registerRAGSocket(socket);
  });

  return io;
}

import { Server } from "socket.io";
import { registerChatSocket } from "./chat.socket.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // 🔴 CONNECTION ERROR (before connection)
  io.engine.on("connection_error", (err) => {
    console.error("❌ Socket connection error");
    console.error("Reason:", err.message);
    console.error("Code:", err.code);
    console.error("Context:", err.context);
  });

  // 🟢 CLIENT CONNECTED
  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);
    console.log("🌐 Transport:", socket.conn.transport.name);
    console.log("📡 IP:", socket.handshake.address);

    // 🔁 Transport upgrade (polling → websocket)
    socket.conn.on("upgrade", () => {
      console.log("⬆️ Transport upgraded to:", socket.conn.transport.name);
    });

    // 👤 USER ROOM
    socket.on("joinUser", ({ userId }) => {
      socket.join(userId);
      console.log("👤 User joined room:", userId);
    });

    // 🧑 AGENT ROOM
    socket.on("joinAgent", () => {
      socket.join("AGENTS");
      console.log("🧑 Agent joined AGENTS");
    });

    // 🔧 Register chat handlers
    registerChatSocket(io, socket);

    // 🔴 CLIENT DISCONNECTED
    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", socket.id);
      console.log("❓ Reason:", reason);
    });

    // ❌ SOCKET-LEVEL ERROR
    socket.on("error", (err) => {
      console.error("❌ Socket error:", err);
    });
  });

  return io;
}

// import { Server } from "socket.io";
// import { registerChatSocket } from "./chat.socket.js";

// export function initSocket(server) {
//   const io = new Server(server, {
//     cors: { origin: "*" },
//   });

//   io.on("connection", (socket) => {
//     socket.on("joinUser", ({ userId }) => {
//       socket.join(userId);
//       console.log("👤 User joined room:", userId);
//     });

//     socket.on("joinAgent", () => {
//       socket.join("AGENTS");
//       console.log("🧑 Agent joined AGENTS");
//     });

//     registerChatSocket(io, socket);

//     socket.on("disconnect", () => {
//       console.log("🔴 Socket disconnected:", socket.id);
//     });
//   });

//   return io;
// }

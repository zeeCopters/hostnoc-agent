import dotenv from "dotenv";
import app from "./app.js";
import { connectMongo } from "./config/mongo.js";
import { initSocket } from "./socket/index.js";
import http from "http";

dotenv.config();

await connectMongo();

// Create ONE http server
const server = http.createServer(app);

// Attach Socket.IO to the SAME server
initSocket(server);

const PORT = process.env.PORT || 3000;
const ENV = process.env.ENV || "http://localhost:";

// 🚀 START THE HTTP SERVER (NOT app.listen)
server.listen(PORT, () => {
  console.log(`🚀 Server running on ${ENV}${PORT}`);
});

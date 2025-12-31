import dotenv from "dotenv";
import app from "./app.js";
import { connectMongo } from "./config/mongo.js";
import { initSocket } from "./socket/index.js";
import http from "http";

dotenv.config();

await connectMongo();

const server = http.createServer(app);

// Init Socket.IO
initSocket(server);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

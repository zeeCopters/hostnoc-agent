import express from "express";
import pdfRoutes from "./routes/pdf.routes.js";
import { setupSwagger } from "./config/swagger.js";
import ragRoutes from "./routes/rag.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(express.json());

setupSwagger(app);

app.use("/api", pdfRoutes);
app.use("/api", ragRoutes);
app.use("/api", userRoutes);
app.use("/api", chatRoutes);

app.set("trust proxy", true);

export default app;

import express from "express";
import pdfRoutes from "./routes/pdf.routes.js";
import { setupSwagger } from "./config/swagger.js";
import ragRoutes from "./routes/rag.routes.js";

const app = express();

app.use(express.json());

setupSwagger(app);

app.use("/api", pdfRoutes);
app.use("/api", ragRoutes);

export default app;

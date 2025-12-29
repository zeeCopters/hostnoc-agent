import express from "express";
import pdfRoutes from "./routes/pdf.routes.js";
import { setupSwagger } from "./config/swagger.js";

const app = express();

app.use(express.json());

setupSwagger(app);

app.use("/api", pdfRoutes);

export default app;

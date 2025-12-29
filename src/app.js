import express from "express";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();

app.use(express.json());
app.use("/api", pdfRoutes);

export default app;

import express from "express";
import cors from "cors";

import pdfRoutes from "./routes/pdf.routes.js";
import { setupSwagger } from "./config/swagger.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

// ✅ TRUST PROXY (good for prod / reverse proxy)
app.set("trust proxy", true);

// ✅ CORS — allow ALL origins (development / testing)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Body parser
app.use(express.json());

// ✅ Swagger
setupSwagger(app);

// ✅ Routes
app.use("/api", pdfRoutes);
app.use("/api", userRoutes);
app.use("/api", chatRoutes);

export default app;

// import express from "express";
// import pdfRoutes from "./routes/pdf.routes.js";
// import { setupSwagger } from "./config/swagger.js";
// import userRoutes from "./routes/user.routes.js";
// import chatRoutes from "./routes/chat.routes.js";

// const app = express();

// app.use(express.json());

// setupSwagger(app);

// app.use("/api", pdfRoutes);
// app.use("/api", userRoutes);
// app.use("/api", chatRoutes);

// app.set("trust proxy", true);

// export default app;

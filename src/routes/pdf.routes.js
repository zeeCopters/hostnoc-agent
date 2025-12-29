import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import { PdfController } from "../controllers/pdf.controller.js";

const router = Router();

router.post("/pdf", upload.single("file"), PdfController.upload);

export default router;

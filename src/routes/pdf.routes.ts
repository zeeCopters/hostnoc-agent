import { Router } from "express";
import { upload } from "../middlewares/upload";
import { PdfController } from "../controllers/pdf.controller";

const router = Router();

router.post("/pdf", upload.single("file"), PdfController.upload);

export default router;

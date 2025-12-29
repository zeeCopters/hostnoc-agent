import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import { PdfController } from "../controllers/pdf.controller.js";

const router = Router();

/**
 * @swagger
 * /api/pdf:
 *   post:
 *     summary: Upload a PDF, index it in Pinecone, and store metadata in MongoDB
 *     tags:
 *       - PDF
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload
 *     responses:
 *       201:
 *         description: PDF indexed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 file:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     size:
 *                       type: number
 *                     namespace:
 *                       type: string
 *                     pageCount:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: PDF file required
 *       500:
 *         description: Internal server error
 */
router.post("/pdf", upload.single("file"), PdfController.upload);

export default router;

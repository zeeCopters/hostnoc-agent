import { Router } from "express";
import { RAGController } from "../controllers/rag.controller.js";

const router = Router();

/**
 * @swagger
 * /api/ask:
 *   post:
 *     summary: Ask a question across all uploaded PDF documents
 *     tags:
 *       - RAG
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer from LLM
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *       400:
 *         description: Question missing
 *       404:
 *         description: No PDFs uploaded yet
 *       500:
 *         description: Internal server error
 */
router.post("/ask", RAGController.ask);

export default router;

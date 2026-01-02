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

// import { Router } from "express";
// import { ChatController } from "../controllers/chat.controller.js"; // if used
// const router = Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Chat
//  *   description: Real-time chat API (via socket)
//  */

// /**
//  * @swagger
//  * /api/chat:
//  *   post:
//  *     summary: Send a chat message to the AI
//  *     tags:
//  *       - Chat
//  *     description: |
//  *       Sends a user chat message for AI response. The message will be stored and the AI reply
//  *       will also be saved in the database. This route can be used for HTTP test,
//  *       otherwise chat is handled over WebSocket.
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - userId
//  *               - message
//  *             properties:
//  *               userId:
//  *                 type: string
//  *                 description: MongoDB user ID
//  *               message:
//  *                 type: string
//  *                 description: Chat message from user
//  *     responses:
//  *       200:
//  *         description: AI reply with user message recorded
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 reply:
//  *                   type: string
//  *                   description: AI’s response to the message
//  *       400:
//  *         description: Invalid input
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *       500:
//  *         description: Internal server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  */
// router.post("/chat", ChatController.sendMessage);

// export default router;

import express from "express";
import { ChatController } from "../controllers/chat.controller.js";

const router = express.Router();
const chatController = new ChatController();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat and conversation related APIs
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get users who have chat history
 *     tags:
 *       - Chat
 *     description: |
 *       Returns a list of users who have interacted with the AI chat system.
 *       This endpoint is typically used to show users in a chat dashboard.
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: User ID
 *                   fullName:
 *                     type: string
 *                     description: User full name
 *                   email:
 *                     type: string
 *                     description: User email
 *                   phone:
 *                     type: string
 *                     description: User phone number
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/users", (req, res) => chatController.getUsers(req, res));

export default router;

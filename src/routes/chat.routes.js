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

/**
 * @swagger
 * /api/users/{userId}/messages:
 *   get:
 *     summary: Get chat history for a specific user
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB user ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of messages to skip
 *     responses:
 *       200:
 *         description: Chat messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 count:
 *                   type: integer
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [user, assistant]
 *                       message:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *       400:
 *         description: Invalid userId
 *       500:
 *         description: Internal server error
 */
router.get("/users/:userId/messages", (req, res) =>
  chatController.getUserChats(req, res)
);

export default router;

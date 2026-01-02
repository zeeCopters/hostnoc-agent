import express from "express";
import { ChatController } from "../controllers/chat.controller.js";

const router = express.Router();
const chatController = new ChatController();

// GET /api/chats/users
router.get("/users", (req, res) => chatController.getUsers(req, res));

export default router;

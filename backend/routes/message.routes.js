import express from 'express';
import { protectedRoute } from '../middlewares/protectedRoute.js';
import { getConversations, getMessages, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/conversations", protectedRoute, getConversations);
router.get("/:otherUserId", protectedRoute, getMessages);
router.post("/", protectedRoute, sendMessage);

export default router;
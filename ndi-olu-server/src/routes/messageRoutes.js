import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getConversations,
  getJobMessages,
  sendJobMessage,
  getUnreadMessageCount,
  markJobMessagesAsRead,
} from "../controllers/messageController.js";

const router = express.Router();

router.get(
  "/unread-count",
  authenticateToken,
  getUnreadMessageCount,
);

router.get(
  "/conversations",
  authenticateToken,
  getConversations,
);

router.get(
  "/jobs/:jobId",
  authenticateToken,
  getJobMessages,
);

router.post(
  "/jobs/:jobId",
  authenticateToken,
  sendJobMessage,
);

router.patch(
  "/jobs/:jobId/read",
  authenticateToken,
  markJobMessagesAsRead,
);

export default router;
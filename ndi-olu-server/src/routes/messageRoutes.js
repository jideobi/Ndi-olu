import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getConversations,
  getJobMessages,
  sendJobMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", authenticateToken, getConversations);
router.get("/jobs/:jobId", authenticateToken, getJobMessages);
router.post("/jobs/:jobId", authenticateToken, sendJobMessage);

export default router;

import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { createReview } from "../controllers/reviewController.js";

const router = express.Router();
router.post("/jobs/:jobId", authenticateToken, createReview);
export default router;

import express from "express";
import {
  createJob,
  completeCustomerJob,
  getCustomerJobs,
  getCustomerJobById,
} from "../controllers/jobController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getCustomerJobs);

router.post("/", authenticateToken, createJob);

router.patch("/:jobId/complete", authenticateToken, completeCustomerJob);

router.get("/:jobId", authenticateToken, getCustomerJobById);

export default router;

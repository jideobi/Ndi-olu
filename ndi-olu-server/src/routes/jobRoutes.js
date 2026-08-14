import express from "express";
import {
  createJob,
  getCustomerJobs,
  getCustomerJobById,
} from "../controllers/jobController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getCustomerJobs);

router.post("/", authenticateToken, createJob);

router.get("/:jobId", authenticateToken, getCustomerJobById);

export default router;
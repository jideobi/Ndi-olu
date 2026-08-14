import express from "express";

import {
  getMyWorkerProfile,
  updateMyWorkerProfile,
} from "../controllers/workerProfileController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authenticateToken, getMyWorkerProfile);

router.put("/me", authenticateToken, updateMyWorkerProfile);

export default router;
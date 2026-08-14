import express from "express";

import {
  getPendingWorkers,
  approveWorker,
} from "../controllers/adminController.js";

import {
  authenticateToken,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/workers/pending",
  authenticateToken,
  requireAdmin,
  getPendingWorkers,
);

router.patch(
  "/workers/:workerId/approve",
  authenticateToken,
  requireAdmin,
  approveWorker,
);

export default router;
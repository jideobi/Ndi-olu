import express from "express";

import {
    getAvailableJobs,
    getWorkerJobById,
} from "../controllers/workerJobController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getAvailableJobs);

router.get("/:id", authenticateToken, getWorkerJobById);

export default router;
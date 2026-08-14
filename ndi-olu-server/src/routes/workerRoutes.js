import express from "express";
import {
  getPublicWorkerById,
  getPublicWorkers,
} from "../controllers/workerController.js";

const router = express.Router();

router.get("/", getPublicWorkers);
router.get("/:workerId", getPublicWorkerById);

export default router;

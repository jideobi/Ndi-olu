import express from "express";
import { getPublicWorkers } from "../controllers/workerController.js";

const router = express.Router();

router.get("/", getPublicWorkers);

export default router;
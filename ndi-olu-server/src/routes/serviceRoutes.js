import express from "express";
import { getActiveServices } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getActiveServices);

export default router;
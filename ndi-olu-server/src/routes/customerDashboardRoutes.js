import express from "express";
import { getCustomerDashboard } from "../controllers/customerDashboardController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getCustomerDashboard);

export default router;
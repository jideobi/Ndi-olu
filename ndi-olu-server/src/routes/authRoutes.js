import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/google", googleLogin);
router.get("/me", authenticateToken, getMe);
router.post("/login", login);

export default router;
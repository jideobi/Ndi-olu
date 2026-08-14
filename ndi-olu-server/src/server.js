import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./config/database.js";

import authRoutes from "./routes/authRoutes.js";
import customerDashboardRoutes from "./routes/customerDashboardRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import workerJobRoutes from "./routes/workerJobRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import workerProfileRoutes from "./routes/workerProfileRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------------------
// Middleware
// -----------------------------------------

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

// -----------------------------------------
// API Routes
// -----------------------------------------

app.use("/api/auth", authRoutes);

app.use(
  "/api/customer/dashboard",
  customerDashboardRoutes,
);

app.use("/api/jobs", jobRoutes);

app.use("/api/services", serviceRoutes);

app.use("/api/worker/jobs", workerJobRoutes);

app.use("/api/proposals", proposalRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/workers", workerRoutes);

app.use("/api/worker-profile", workerProfileRoutes);

// -----------------------------------------
// Root
// -----------------------------------------

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Ndi-Olu API is running",
  });
});

// -----------------------------------------
// API Health Check
// -----------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Ndi-Olu backend is healthy",
  });
});

// -----------------------------------------
// Database Health Check
// -----------------------------------------

app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    return res.json({
      status: "ok",
      message: "Ndi-Olu database is connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// -----------------------------------------
// 404 Handler
// -----------------------------------------

app.use((req, res) => {
  return res.status(404).json({
    status: "error",
    message: "API route not found",
    path: req.originalUrl,
  });
});

// -----------------------------------------
// Start Server
// -----------------------------------------

app.listen(PORT, () => {
  console.log(`Ndi-Olu API running on port ${PORT}`);
});
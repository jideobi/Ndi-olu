import express from "express";

import {
  createProposal,
  getWorkerProposals,
  getCustomerProposals,
  getCustomerJobProposals,
  rejectProposal,
  acceptProposal,
} from "../controllers/proposalController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/mine",
  authenticateToken,
  getWorkerProposals,
);

router.get(
  "/customer",
  authenticateToken,
  getCustomerProposals,
);

router.get(
  "/customer/jobs/:jobId",
  authenticateToken,
  getCustomerJobProposals,
);

router.post(
  "/jobs/:jobId",
  authenticateToken,
  createProposal,
);

router.patch(
  "/customer/:proposalId/reject",
  authenticateToken,
  rejectProposal,
);

router.patch(
  "/customer/:proposalId/accept",
  authenticateToken,
  acceptProposal,
);

export default router;
import pool from "../config/database.js";

export async function createProposal(req, res) {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const {
      message,
      proposedAmount,
      estimatedDuration,
    } = req.body;

    // -----------------------------------------
    // Make sure the user is a worker
    // -----------------------------------------

    if (req.user.role !== "worker") {
      return res.status(403).json({
        status: "error",
        message: "Only workers can submit proposals",
      });
    }

    // -----------------------------------------
    // Validate message
    // -----------------------------------------

    if (!message || !message.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Proposal message is required",
      });
    }

    // -----------------------------------------
    // Validate proposed amount
    // -----------------------------------------

    let parsedAmount = null;

    if (
      proposedAmount !== undefined &&
      proposedAmount !== null &&
      proposedAmount !== ""
    ) {
      parsedAmount = Number(proposedAmount);

      if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({
          status: "error",
          message: "Proposed amount must be a valid number",
        });
      }
    }

    // -----------------------------------------
    // Find worker profile
    // -----------------------------------------

    const workerResult = await pool.query(
      `
      SELECT
        id,
        user_id,
        is_approved
      FROM worker_profiles
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId],
    );

    if (workerResult.rows.length === 0) {
      return res.status(403).json({
        status: "error",
        message: "Worker profile not found",
      });
    }

    const worker = workerResult.rows[0];

    const workerId = worker.id;

    // -----------------------------------------
    // Check worker approval
    // -----------------------------------------

    if (!worker.is_approved) {
      return res.status(403).json({
        status: "error",
        message: "Your worker profile has not been approved yet",
      });
    }

    // -----------------------------------------
    // Check that the job exists
    // -----------------------------------------

    const jobResult = await pool.query(
      `
      SELECT
        id,
        customer_id,
        title,
        status
      FROM jobs
      WHERE id = $1
      LIMIT 1
      `,
      [jobId],
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    const job = jobResult.rows[0];

    // -----------------------------------------
    // Make sure job is still open
    // -----------------------------------------

    if (job.status !== "open") {
      return res.status(400).json({
        status: "error",
        message: "This job is no longer accepting proposals",
      });
    }

    // -----------------------------------------
    // Prevent customer from applying to own job
    // -----------------------------------------

    if (job.customer_id === userId) {
      return res.status(400).json({
        status: "400",
        message: "You cannot submit a proposal to your own job",
      });
    }

    // -----------------------------------------
    // Check for existing proposal
    // -----------------------------------------

    const existingProposal = await pool.query(
      `
      SELECT id
      FROM proposals
      WHERE job_id = $1
        AND worker_id = $2
      LIMIT 1
      `,
      [jobId, workerId],
    );

    if (existingProposal.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "You have already submitted a proposal for this job",
      });
    }

    // -----------------------------------------
    // Create proposal
    // -----------------------------------------

    const result = await pool.query(
      `
      INSERT INTO proposals (
        job_id,
        worker_id,
        message,
        proposed_amount,
        estimated_duration
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        job_id,
        worker_id,
        message,
        proposed_amount,
        estimated_duration,
        status,
        created_at,
        updated_at
      `,
      [
        jobId,
        workerId,
        message.trim(),
        parsedAmount,
        estimatedDuration?.trim() || null,
      ],
    );

    return res.status(201).json({
      status: "success",
      message: "Proposal submitted successfully",
      proposal: result.rows[0],
    });
  } catch (error) {
    console.error("Create proposal error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to submit proposal",
      // Temporarily useful during development:
      error: error.message,
    });
  }
}

export async function getWorkerProposals(req, res) {
  try {
    const userId = req.user.id;

    // Only workers can access worker proposals
    if (req.user.role !== "worker") {
      return res.status(403).json({
        status: "error",
        message: "Only workers can access proposals",
      });
    }

    // Find the worker profile belonging to the logged-in user
    const workerResult = await pool.query(
      `
      SELECT
        id,
        user_id,
        is_approved
      FROM worker_profiles
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId],
    );

    if (workerResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Worker profile not found",
      });
    }

    const worker = workerResult.rows[0];

    /*
     * IMPORTANT:
     * We use worker.id to find proposals.
     *
     * worker_profiles.user_id = logged-in user
     * worker_profiles.id      = proposals.worker_id
     */

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.job_id,
        p.worker_id,
        p.message,
        p.proposed_amount,
        p.estimated_duration,
        p.status,
        p.created_at,
        p.updated_at,

        j.title,
        j.description,
        j.location,
        j.address_note,
        j.timing,
        j.budget_type,
        j.budget_amount,
        j.status AS job_status,

        s.id AS service_id,
        s.name AS service_name,
        s.slug AS service_slug

      FROM proposals p

      INNER JOIN jobs j
        ON j.id = p.job_id

      INNER JOIN services s
        ON s.id = j.service_id

      WHERE p.worker_id = $1

      ORDER BY p.created_at DESC
      `,
      [worker.id],
    );

    return res.json({
      status: "success",
      proposals: result.rows,
    });
  } catch (error) {
    console.error("Get worker proposals error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load proposals",
      error: error.message,
    });
  }
}

export async function getCustomerProposals(req, res) {
  try {
    const customerId = req.user.id;

    // Only customers can access received proposals
    if (req.user.role !== "customer") {
      return res.status(403).json({
        status: "error",
        message: "Only customers can view received proposals",
      });
    }

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.job_id,
        p.worker_id,
        p.message,
        p.proposed_amount,
        p.estimated_duration,
        p.status,
        p.created_at,
        p.updated_at,

        j.title,
        j.description,
        j.location,
        j.address_note,
        j.timing,
        j.budget_type,
        j.budget_amount,
        j.status AS job_status,

        wp.user_id AS worker_user_id,

        u.full_name AS worker_name,
        u.email AS worker_email,
        u.phone AS worker_phone

      FROM proposals p

      INNER JOIN jobs j
        ON j.id = p.job_id

      INNER JOIN worker_profiles wp
        ON wp.id = p.worker_id

      INNER JOIN users u
        ON u.id = wp.user_id

      WHERE j.customer_id = $1

      ORDER BY p.created_at DESC
      `,
      [customerId],
    );

    return res.status(200).json({
      status: "success",
      proposals: result.rows,
    });
  } catch (error) {
    console.error("Get customer proposals error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load received proposals",
      error: error.message,
    });
  }
}

export async function getCustomerJobProposals(req, res) {
  try {
    const customerId = req.user.id;
    const { jobId } = req.params;

    // Only customers can access received proposals
    if (req.user.role !== "customer") {
      return res.status(403).json({
        status: "error",
        message: "Only customers can view received proposals",
      });
    }

    // Make sure this job belongs to the logged-in customer
    const jobResult = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        location,
        address_note,
        timing,
        budget_type,
        budget_amount,
        status,
        created_at
      FROM jobs
      WHERE id = $1
        AND customer_id = $2
      LIMIT 1
      `,
      [jobId, customerId],
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    // Get proposals ONLY for this job
    const proposalResult = await pool.query(
      `
      SELECT
        p.id,
        p.job_id,
        p.worker_id,
        p.message,
        p.proposed_amount,
        p.estimated_duration,
        p.status,
        p.created_at,
        p.updated_at,

        wp.user_id AS worker_user_id,

        u.full_name AS worker_name,
        u.email AS worker_email,
        u.phone AS worker_phone

      FROM proposals p

      INNER JOIN worker_profiles wp
        ON wp.id = p.worker_id

      INNER JOIN users u
        ON u.id = wp.user_id

      WHERE p.job_id = $1

      ORDER BY p.created_at DESC
      `,
      [jobId],
    );

    return res.status(200).json({
      status: "success",
      job: jobResult.rows[0],
      proposals: proposalResult.rows,
    });
  } catch (error) {
    console.error("Get customer job proposals error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load job proposals",
      error: error.message,
    });
  }
}

export async function rejectProposal(req, res) {
  try {
    const customerId = req.user.id;
    const { proposalId } = req.params;

    // -----------------------------------------
    // Make sure the user is a customer
    // -----------------------------------------

    if (req.user.role !== "customer") {
      return res.status(403).json({
        status: "error",
        message: "Only customers can reject proposals",
      });
    }

    // -----------------------------------------
    // Find proposal and make sure the job
    // belongs to the logged-in customer
    // -----------------------------------------

    const proposalResult = await pool.query(
      `
      SELECT
        p.id,
        p.job_id,
        p.status,
        j.customer_id,
        j.status AS job_status
      FROM proposals p
      INNER JOIN jobs j
        ON j.id = p.job_id
      WHERE p.id = $1
        AND j.customer_id = $2
      LIMIT 1
      `,
      [proposalId, customerId],
    );

    if (proposalResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Proposal not found",
      });
    }

    const proposal = proposalResult.rows[0];

    // -----------------------------------------
    // Only pending proposals can be rejected
    // -----------------------------------------

    if (proposal.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: `This proposal is already ${proposal.status}`,
      });
    }

    // -----------------------------------------
    // Do not allow changes after job is completed
    // or cancelled
    // -----------------------------------------

    if (
      proposal.job_status === "completed" ||
      proposal.job_status === "cancelled"
    ) {
      return res.status(400).json({
        status: "error",
        message: "This job is no longer accepting proposal changes",
      });
    }

    // -----------------------------------------
    // Reject proposal
    // -----------------------------------------

    const result = await pool.query(
      `
      UPDATE proposals
      SET
        status = 'rejected',
        updated_at = NOW()
      WHERE id = $1
        AND status = 'pending'
      RETURNING
        id,
        job_id,
        worker_id,
        message,
        proposed_amount,
        estimated_duration,
        status,
        created_at,
        updated_at
      `,
      [proposalId],
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        status: "error",
        message: "Proposal could not be rejected because its status has changed",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Proposal rejected successfully",
      proposal: result.rows[0],
    });
  } catch (error) {
    console.error("Reject proposal error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to reject proposal",
      error: error.message,
    });
  }
}

export async function acceptProposal(req, res) {
  const client = await pool.connect();

  try {
    const customerId = req.user.id;
    const { proposalId } = req.params;

    // -----------------------------------------
    // Make sure the user is a customer
    // -----------------------------------------

    if (req.user.role !== "customer") {
      return res.status(403).json({
        status: "error",
        message: "Only customers can accept proposals",
      });
    }

    await client.query("BEGIN");

    // -----------------------------------------
    // Find proposal and lock the related job
    // -----------------------------------------

    const proposalResult = await client.query(
      `
      SELECT
        p.id,
        p.job_id,
        p.worker_id,
        p.status AS proposal_status,

        j.customer_id,
        j.status AS job_status
      FROM proposals p
      INNER JOIN jobs j
        ON j.id = p.job_id
      WHERE p.id = $1
        AND j.customer_id = $2
      FOR UPDATE
      `,
      [proposalId, customerId],
    );

    if (proposalResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        status: "error",
        message: "Proposal not found",
      });
    }

    const proposal = proposalResult.rows[0];

    // -----------------------------------------
    // Proposal must still be pending
    // -----------------------------------------

    if (proposal.proposal_status !== "pending") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        status: "error",
        message: `This proposal is already ${proposal.proposal_status}`,
      });
    }

    // -----------------------------------------
    // Job must still be open
    // -----------------------------------------

    if (proposal.job_status !== "open") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        status: "error",
        message: "This job is no longer accepting proposals",
      });
    }

    // -----------------------------------------
    // Accept selected proposal
    // -----------------------------------------

    const acceptedResult = await client.query(
      `
      UPDATE proposals
      SET
        status = 'accepted',
        updated_at = NOW()
      WHERE id = $1
        AND status = 'pending'
      RETURNING
        id,
        job_id,
        worker_id,
        message,
        proposed_amount,
        estimated_duration,
        status,
        created_at,
        updated_at
      `,
      [proposalId],
    );

    if (acceptedResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        status: "error",
        message: "Proposal could not be accepted because its status has changed",
      });
    }

    // -----------------------------------------
    // Reject all other pending proposals
    // for this same job
    // -----------------------------------------

    await client.query(
      `
      UPDATE proposals
      SET
        status = 'rejected',
        updated_at = NOW()
      WHERE job_id = $1
        AND id <> $2
        AND status = 'pending'
      `,
      [proposal.job_id, proposalId],
    );

    // -----------------------------------------
    // Move job into progress
    // and assign selected worker
    // -----------------------------------------

    const jobResult = await client.query(
      `
      UPDATE jobs
      SET
        status = 'in_progress',
        preferred_worker_id = $1,
        updated_at = NOW()
      WHERE id = $2
        AND customer_id = $3
        AND status = 'open'
      RETURNING
        id,
        status,
        preferred_worker_id,
        updated_at
      `,
      [
        proposal.worker_id,
        proposal.job_id,
        customerId,
      ],
    );

    if (jobResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        status: "error",
        message: "Job could not be updated because its status has changed",
      });
    }

    // -----------------------------------------
    // Everything succeeded
    // -----------------------------------------

    await client.query("COMMIT");

    return res.status(200).json({
      status: "success",
      message: "Proposal accepted successfully",
      proposal: acceptedResult.rows[0],
      job: jobResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Accept proposal error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to accept proposal",
      error: error.message,
    });
  } finally {
    client.release();
  }
}
import pool from "../config/database.js";

export async function getAvailableJobs(req, res) {
  try {
    const userId = req.user.id;

    // Find the worker profile belonging to the logged-in user
    const workerResult = await pool.query(
      `
      SELECT
        id,
        user_id,
        is_approved
      FROM worker_profiles
      WHERE user_id = $1
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

    if (!worker.is_approved) {
      return res.status(403).json({
        status: "error",
        message: "Your worker profile is awaiting approval",
      });
    }

    // -----------------------------------------
    // Get worker proposal count
    // -----------------------------------------

    const proposalCountResult = await pool.query(
      `
      SELECT COUNT(*) AS proposal_count
      FROM proposals
      WHERE worker_id = $1
      `,
      [worker.id],
    );

    const proposalCount = Number(
      proposalCountResult.rows[0].proposal_count,
    );

    // -----------------------------------------
    // Get available jobs
    // -----------------------------------------

    const result = await pool.query(
      `
      SELECT
        j.id,
        j.title,
        j.description,
        j.location,
        j.address_note,
        j.timing,
        j.budget_type,
        j.budget_amount,
        j.status,
        j.created_at,
        j.updated_at,

        s.id AS service_id,
        s.name AS service_name,
        s.slug AS service_slug,

        EXISTS (
          SELECT 1
          FROM proposals p
          WHERE p.job_id = j.id
            AND p.worker_id = $1
        ) AS has_proposal

      FROM jobs j

      INNER JOIN services s
        ON s.id = j.service_id

      WHERE j.status = 'open'
        AND s.is_active = TRUE
        AND j.customer_id <> $2

      ORDER BY j.created_at DESC
      `,
      [worker.id, userId],
    );

    return res.json({
      status: "success",
      jobs: result.rows,
      proposalCount,
    });
  } catch (error) {
    console.error("Get available worker jobs error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load available jobs",
    });
  }
}


export async function getWorkerJobById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Find the worker profile belonging to the logged-in user
    const workerResult = await pool.query(
      `
      SELECT
        id,
        user_id,
        is_approved
      FROM worker_profiles
      WHERE user_id = $1
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

    if (!worker.is_approved) {
      return res.status(403).json({
        status: "error",
        message: "Your worker profile is awaiting approval",
      });
    }

    const result = await pool.query(
      `
      SELECT
        j.id,
        j.title,
        j.description,
        j.location,
        j.address_note,
        j.timing,
        j.budget_type,
        j.budget_amount,
        j.status,
        j.created_at,
        j.updated_at,

        s.id AS service_id,
        s.name AS service_name,
        s.slug AS service_slug,

        EXISTS (
          SELECT 1
          FROM proposals p
          WHERE p.job_id = j.id
            AND p.worker_id = $1
        ) AS has_proposal

      FROM jobs j

      INNER JOIN services s
        ON s.id = j.service_id

      WHERE j.id = $2
        AND s.is_active = TRUE
      `,
      [worker.id, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    return res.json({
      status: "success",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Get worker job by ID error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load job",
    });
  }
}
import pool from "../config/database.js";

/**
 * Get all workers waiting for approval
 */
export async function getPendingWorkers(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,
        u.created_at,
        wp.id AS worker_profile_id,
        wp.is_approved
      FROM users u
      INNER JOIN worker_profiles wp
        ON wp.user_id = u.id
      WHERE u.role = 'worker'
        AND wp.is_approved = false
      ORDER BY u.created_at ASC
    `);

    return res.json({
      status: "success",
      workers: result.rows,
    });
  } catch (error) {
    console.error("Get pending workers error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to retrieve pending workers",
    });
  }
}


/**
 * Approve a worker
 */
export async function approveWorker(req, res) {
  try {
    const { workerId } = req.params;

    const result = await pool.query(
      `
      UPDATE worker_profiles wp
      SET is_approved = true
      FROM users u
      WHERE wp.user_id = u.id
        AND u.id = $1
        AND u.role = 'worker'
      RETURNING
        wp.id AS worker_profile_id,
        wp.user_id,
        wp.is_approved
      `,
      [workerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Worker not found",
      });
    }

    return res.json({
      status: "success",
      message: "Worker approved successfully",
      worker: result.rows[0],
    });
  } catch (error) {
    console.error("Approve worker error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to approve worker",
    });
  }
}
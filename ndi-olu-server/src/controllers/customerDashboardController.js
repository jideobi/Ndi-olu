import pool from "../config/database.js";

export async function getCustomerDashboard(req, res) {
  try {
    const customerId = req.user.id;

    // Get dashboard statistics
    const statsResult = await pool.query(
      `
      SELECT
        COUNT(*)::INTEGER AS jobs_posted,

        COUNT(*) FILTER (
          WHERE status IN ('open', 'in_progress')
        )::INTEGER AS active_jobs,

        COUNT(*) FILTER (
          WHERE status = 'completed'
        )::INTEGER AS completed_jobs

      FROM jobs
      WHERE customer_id = $1
      `,
      [customerId],
    );

    // Get the customer's five most recent jobs
const jobsResult = await pool.query(
  `
  SELECT
    jobs.id,
    jobs.title,
    jobs.description,
    jobs.location,
    jobs.budget_type,
    jobs.budget_amount,
    jobs.timing,
    jobs.status,
    jobs.created_at,

    services.id AS service_id,
    services.name AS service_name,
    services.slug AS service_slug

  FROM jobs

  INNER JOIN services
    ON services.id = jobs.service_id

  WHERE jobs.customer_id = $1

  ORDER BY jobs.created_at DESC

  LIMIT 5
  `,
  [customerId],
);

    const stats = statsResult.rows[0];

    return res.json({
      status: "success",

      stats: {
        jobsPosted: stats.jobs_posted,
        activeJobs: stats.active_jobs,
        completedJobs: stats.completed_jobs,
      },

      recentJobs: jobsResult.rows,
    });
  } catch (error) {
    console.error("Customer dashboard error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load customer dashboard",
    });
  }
}
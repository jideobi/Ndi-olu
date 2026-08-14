import pool from "../config/database.js";

export async function createReview(req, res) {
  const client = await pool.connect();

  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ status: "error", message: "Only customers can leave reviews" });
    }

    const rating = Number(req.body.rating);
    const comment = req.body.comment?.trim() || null;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ status: "error", message: "Please select a rating from 1 to 5" });
    }

    await client.query("BEGIN");
    const jobResult = await client.query(
      `
      SELECT id, preferred_worker_id
      FROM jobs
      WHERE id = $1 AND customer_id = $2 AND status = 'completed'
      FOR UPDATE
      `,
      [req.params.jobId, req.user.id],
    );

    if (!jobResult.rows.length || !jobResult.rows[0].preferred_worker_id) {
      await client.query("ROLLBACK");
      return res.status(400).json({ status: "error", message: "This completed job cannot be reviewed" });
    }

    const workerId = jobResult.rows[0].preferred_worker_id;
    const reviewResult = await client.query(
      `
      INSERT INTO reviews (job_id, customer_id, worker_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, job_id, worker_id, rating, comment, created_at
      `,
      [req.params.jobId, req.user.id, workerId, rating, comment],
    );

    await client.query(
      `
      UPDATE worker_profiles
      SET
        rating = (SELECT ROUND(AVG(r.rating)::numeric, 2) FROM reviews r WHERE r.worker_id = $1),
        review_count = (SELECT COUNT(*)::integer FROM reviews r WHERE r.worker_id = $1),
        jobs_completed = jobs_completed + 1,
        updated_at = NOW()
      WHERE id = $1
      `,
      [workerId],
    );

    await client.query("COMMIT");
    return res.status(201).json({ status: "success", review: reviewResult.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      return res.status(409).json({ status: "error", message: "You have already reviewed this job" });
    }
    console.error("Create review error:", error);
    return res.status(500).json({ status: "error", message: "Unable to save your review" });
  } finally {
    client.release();
  }
}

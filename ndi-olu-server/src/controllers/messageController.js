import pool from "../config/database.js";

async function getAccessibleJob(jobId, user) {
  const result = await pool.query(
    `
    SELECT
      j.id,
      j.title,
      j.status,
      j.customer_id,
      j.preferred_worker_id,
      wp.user_id AS worker_user_id,
      customer.full_name AS customer_name,
      worker.full_name AS worker_name
    FROM jobs j
    LEFT JOIN worker_profiles wp ON wp.id = j.preferred_worker_id
    INNER JOIN users customer ON customer.id = j.customer_id
    LEFT JOIN users worker ON worker.id = wp.user_id
    WHERE j.id = $1
    LIMIT 1
    `,
    [jobId],
  );

  if (result.rows.length === 0) return null;

  const job = result.rows[0];
  const isCustomer = job.customer_id === user.id;
  const isSelectedWorker = job.worker_user_id === user.id;

  return isCustomer || isSelectedWorker ? job : null;
}

export async function getJobMessages(req, res) {
  try {
    const { jobId } = req.params;
    const job = await getAccessibleJob(jobId, req.user);

    if (!job) {
      return res.status(403).json({ status: "error", message: "You cannot access this conversation" });
    }

    const messages = await pool.query(
      `
      SELECT m.id, m.job_id, m.sender_id, m.body, m.created_at, u.full_name AS sender_name
      FROM job_messages m
      INNER JOIN users u ON u.id = m.sender_id
      WHERE m.job_id = $1
      ORDER BY m.created_at ASC
      `,
      [jobId],
    );

    return res.json({ status: "success", job, messages: messages.rows });
  } catch (error) {
    console.error("Get job messages error:", error);
    return res.status(500).json({ status: "error", message: "Unable to load messages" });
  }
}

export async function sendJobMessage(req, res) {
  try {
    const { jobId } = req.params;
    const body = req.body.body?.trim();

    if (!body) {
      return res.status(400).json({ status: "error", message: "A message is required" });
    }

    if (body.length > 2000) {
      return res.status(400).json({ status: "error", message: "Messages must be 2,000 characters or fewer" });
    }

    const job = await getAccessibleJob(jobId, req.user);

    if (!job || !["in_progress", "completed"].includes(job.status)) {
      return res.status(403).json({ status: "error", message: "Messaging is available after a worker has been selected" });
    }

    const result = await pool.query(
      `
      INSERT INTO job_messages (job_id, sender_id, body)
      VALUES ($1, $2, $3)
      RETURNING id, job_id, sender_id, body, created_at
      `,
      [jobId, req.user.id, body],
    );

    const sender = await pool.query(
      "SELECT full_name FROM users WHERE id = $1",
      [req.user.id],
    );

    return res.status(201).json({
      status: "success",
      message: { ...result.rows[0], sender_name: sender.rows[0]?.full_name || "You" },
    });
  } catch (error) {
    console.error("Send job message error:", error);
    return res.status(500).json({ status: "error", message: "Unable to send message" });
  }
}

export async function getConversations(req, res) {
  try {
    const customerConversation = req.user.role === "customer";
    const result = await pool.query(
      `
      SELECT
        j.id AS job_id,
        j.title,
        j.status,
        other_user.full_name AS other_person_name,
        latest.body AS latest_message,
        latest.created_at AS latest_message_at
      FROM jobs j
      INNER JOIN worker_profiles wp ON wp.id = j.preferred_worker_id
      INNER JOIN users other_user ON other_user.id = ${customerConversation ? "wp.user_id" : "j.customer_id"}
      LEFT JOIN LATERAL (
        SELECT body, created_at
        FROM job_messages
        WHERE job_id = j.id
        ORDER BY created_at DESC
        LIMIT 1
      ) latest ON TRUE
      WHERE ${customerConversation ? "j.customer_id" : "wp.user_id"} = $1
        AND j.status IN ('in_progress', 'completed')
      ORDER BY latest.created_at DESC NULLS LAST, j.updated_at DESC
      `,
      [req.user.id],
    );

    return res.json({ status: "success", conversations: result.rows });
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ status: "error", message: "Unable to load conversations" });
  }
}

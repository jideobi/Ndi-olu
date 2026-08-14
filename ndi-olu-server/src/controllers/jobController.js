import pool from "../config/database.js";

export async function createJob(req, res) {
  try {
    const {
      title,
      service,
      description,
      location,
      addressNote,
      timing,
      budgetType = "discuss",
      budgetAmount,
    } = req.body;

    // Make sure the required fields are present
    if (
      !title ||
      !service ||
      !description ||
      !location ||
      !timing
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Title, service, description, location and timing are required",
      });
    }

    // Make sure the service exists
    const serviceResult = await pool.query(
      `
      SELECT id, name, slug
      FROM services
      WHERE slug = $1
      `,
      [service],
    );

    if (serviceResult.rows.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid service selected",
      });
    }

    const serviceRecord = serviceResult.rows[0];

    // Validate timing
    const allowedTiming = [
      "today",
      "this-week",
      "flexible",
    ];

    if (!allowedTiming.includes(timing)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid timing selected",
      });
    }

    // Validate budget type
    const allowedBudgetTypes = [
      "fixed",
      "hourly",
      "discuss",
    ];

    if (!allowedBudgetTypes.includes(budgetType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid budget type",
      });
    }

    // Convert budget to a number when provided
    let parsedBudget = null;

    if (budgetAmount !== undefined && budgetAmount !== "") {
      parsedBudget = Number(budgetAmount);

      if (Number.isNaN(parsedBudget) || parsedBudget < 0) {
        return res.status(400).json({
          status: "error",
          message: "Budget amount must be a valid positive number",
        });
      }
    }

    // Create the job
    const result = await pool.query(
      `
      INSERT INTO jobs (
        customer_id,
        service_id,
        title,
        description,
        location,
        address_note,
        timing,
        budget_type,
        budget_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        customer_id,
        service_id,
        title,
        description,
        location,
        address_note,
        timing,
        budget_type,
        budget_amount,
        status,
        created_at,
        updated_at
      `,
      [
        req.user.id,
        serviceRecord.id,
        title.trim(),
        description.trim(),
        location,
        addressNote?.trim() || null,
        timing,
        budgetType,
        parsedBudget,
      ],
    );

    return res.status(201).json({
      status: "success",
      message: "Job posted successfully",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Create job error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to create job",
    });
  }
}

export async function getCustomerJobs(req, res) {
  try {
    const customerId = req.user.id;

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
        s.slug AS service_slug

      FROM jobs j

      LEFT JOIN services s
        ON s.id = j.service_id

      WHERE j.customer_id = $1

      ORDER BY j.created_at DESC
      `,
      [customerId],
    );

    return res.json({
      status: "success",
      jobs: result.rows,
    });
  } catch (error) {
    console.error("Get customer jobs error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load your jobs",
    });
  }
}

export async function getCustomerJobById(req, res) {
  try {
    const customerId = req.user.id;
    const { jobId } = req.params;

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
        s.slug AS service_slug

      FROM jobs j

      LEFT JOIN services s
        ON s.id = j.service_id

      WHERE j.id = $1
        AND j.customer_id = $2

      LIMIT 1
      `,
      [jobId, customerId],
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
    console.error("Get customer job error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load job",
    });
  }
}

export async function completeCustomerJob(req, res) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ status: "error", message: "Only customers can complete jobs" });
    }

    const result = await pool.query(
      `
      UPDATE jobs
      SET status = 'completed', updated_at = NOW()
      WHERE id = $1
        AND customer_id = $2
        AND status = 'in_progress'
        AND preferred_worker_id IS NOT NULL
      RETURNING id, status, preferred_worker_id, updated_at
      `,
      [req.params.jobId, req.user.id],
    );

    if (!result.rows.length) {
      return res.status(400).json({
        status: "error",
        message: "Only an in-progress job with a selected worker can be marked complete",
      });
    }

    return res.json({ status: "success", job: result.rows[0] });
  } catch (error) {
    console.error("Complete customer job error:", error);
    return res.status(500).json({ status: "error", message: "Unable to complete this job" });
  }
}

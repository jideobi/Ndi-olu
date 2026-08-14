import pool from "../config/database.js";

export async function getPublicWorkers(req, res) {
  try {
    const {
      search = "",
      service = "",
      location = "",
      verified = "",
    } = req.query;

    const values = [];
    const conditions = [
      "u.role = 'worker'",
      "u.is_active = TRUE",
      "wp.is_approved = TRUE",
    ];

    // Search by worker name, bio, location or service name
    if (search.trim()) {
      values.push(`%${search.trim()}%`);

      conditions.push(`
        (
          u.full_name ILIKE $${values.length}
          OR wp.bio ILIKE $${values.length}
          OR wp.location ILIKE $${values.length}
          OR s.name ILIKE $${values.length}
        )
      `);
    }

    // Filter by service
    if (service.trim()) {
      values.push(service.trim());

      conditions.push(`
        s.slug = $${values.length}
      `);
    }

    // Filter by location
    if (location.trim() && location !== "enugu-metropolis") {
      values.push(`%${location.trim().replaceAll("-", " ")}%`);

      conditions.push(`
        wp.location ILIKE $${values.length}
      `);
    }

    // Verified workers only
    if (verified === "true") {
      conditions.push("u.is_verified = TRUE");
    }

    const result = await pool.query(
      `
      SELECT
        wp.id,
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,
        u.is_verified,

        wp.profile_image_url,
        wp.bio,
        wp.years_experience,
        wp.location,
        wp.availability,
        wp.jobs_completed,
        wp.rating,
        wp.review_count,
        wp.is_approved,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug,
              'is_primary', ws.is_primary
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS services

      FROM worker_profiles wp

      INNER JOIN users u
        ON u.id = wp.user_id

      LEFT JOIN worker_services ws
        ON ws.worker_id = wp.id

      LEFT JOIN services s
        ON s.id = ws.service_id
        AND s.is_active = TRUE

      WHERE ${conditions.join(" AND ")}

      GROUP BY
        wp.id,
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.is_verified,
        wp.profile_image_url,
        wp.bio,
        wp.years_experience,
        wp.location,
        wp.availability,
        wp.jobs_completed,
        wp.rating,
        wp.review_count,
        wp.is_approved

      ORDER BY
        wp.is_approved DESC,
        u.is_verified DESC,
        wp.rating DESC,
        wp.review_count DESC,
        u.full_name ASC
      `,
      values,
    );

    const workers = result.rows.map((worker) => {
      const primaryService =
        worker.services.find((item) => item.is_primary) ||
        worker.services[0] ||
        null;

      return {
        ...worker,

        name: worker.full_name,

        service: primaryService?.name || "Professional",

        serviceSlug: primaryService?.slug || "",

        area: worker.location || "Enugu",

        verified: worker.is_verified,

        skills: worker.services.map((item) => item.name),
      };
    });

    return res.json({
      status: "success",
      workers,
      count: workers.length,
    });
  } catch (error) {
    console.error("Get public workers error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load workers",
    });
  }
}
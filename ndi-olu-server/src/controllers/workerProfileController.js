import pool from "../config/database.js";

/**
 * Get the logged-in worker's profile
 */
export async function getMyWorkerProfile(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,
        u.is_verified,

        wp.id AS worker_profile_id,
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

      FROM users u

      LEFT JOIN worker_profiles wp
        ON wp.user_id = u.id

      LEFT JOIN worker_services ws
        ON ws.worker_id = wp.id

      LEFT JOIN services s
        ON s.id = ws.service_id
        AND s.is_active = TRUE

      WHERE u.id = $1
        AND u.role = 'worker'

      GROUP BY
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.is_verified,
        wp.id,
        wp.profile_image_url,
        wp.bio,
        wp.years_experience,
        wp.location,
        wp.availability,
        wp.jobs_completed,
        wp.rating,
        wp.review_count,
        wp.is_approved
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Worker profile not found",
      });
    }

    return res.json({
      status: "success",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Get worker profile error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to load worker profile",
    });
  }
}


/**
 * Update the logged-in worker's profile
 */
export async function updateMyWorkerProfile(req, res) {
  const client = await pool.connect();

  try {
    const userId = req.user.id;

    const {
      full_name,
      phone,
      profile_image_url,
      bio,
      years_experience,
      location,
      availability,
      service_ids,
      primary_service_id,
    } = req.body;

    await client.query("BEGIN");

    // -----------------------------------------
    // Update user information
    // -----------------------------------------

    await client.query(
      `
      UPDATE users
      SET
        full_name = $1,
        phone = $2,
        updated_at = NOW()
      WHERE id = $3
        AND role = 'worker'
      `,
      [full_name, phone, userId],
    );

    // -----------------------------------------
    // Find worker profile
    // -----------------------------------------

    const workerResult = await client.query(
      `
      SELECT id
      FROM worker_profiles
      WHERE user_id = $1
      `,
      [userId],
    );

    if (workerResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        status: "error",
        message: "Worker profile not found",
      });
    }

    const workerId = workerResult.rows[0].id;

    // -----------------------------------------
    // Update worker profile
    // -----------------------------------------

    await client.query(
      `
      UPDATE worker_profiles
      SET
        profile_image_url = $1,
        bio = $2,
        years_experience = $3,
        location = $4,
        availability = $5,
        updated_at = NOW()
      WHERE id = $6
      `,
      [
        profile_image_url || null,
        bio || null,
        years_experience || 0,
        location || null,
        availability || "Available this week",
        workerId,
      ],
    );

    // -----------------------------------------
    // Update worker services
    // -----------------------------------------

    if (Array.isArray(service_ids)) {
      await client.query(
        `
        DELETE FROM worker_services
        WHERE worker_id = $1
        `,
        [workerId],
      );

      for (const serviceId of service_ids) {
        await client.query(
          `
          INSERT INTO worker_services (
            worker_id,
            service_id,
            is_primary
          )
          VALUES ($1, $2, $3)
          ON CONFLICT (worker_id, service_id)
          DO UPDATE SET
            is_primary = EXCLUDED.is_primary
          `,
          [
            workerId,
            serviceId,
            serviceId === primary_service_id,
          ],
        );
      }
    }

    await client.query("COMMIT");

    return res.json({
      status: "success",
      message: "Worker profile updated successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update worker profile error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to update worker profile",
    });
  } finally {
    client.release();
  }
}
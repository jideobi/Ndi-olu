import pool from "../config/database.js";

export async function getActiveServices(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        description,
        icon
      FROM services
      WHERE is_active = true
      ORDER BY name ASC
      `,
    );

    res.status(200).json({
      status: "success",
      services: result.rows,
    });
  } catch (error) {
    console.error("Get services error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load services",
    });
  }
}
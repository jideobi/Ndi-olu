import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import pool from "../config/database.js";

export async function register(req, res) {
  const client = await pool.connect();

  try {
    const {
      fullName,
      email,
      password,
      phone,
      role = "customer",
    } = req.body;

    // -----------------------------
    // Validate input
    // -----------------------------
    if (!fullName || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Full name, email and password are required",
      });
    }

    const allowedRoles = ["customer", "worker"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration role",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------
    // Check existing user
    // -----------------------------
    const existingUser = await client.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [normalizedEmail],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "An account with this email already exists",
      });
    }

    // -----------------------------
    // Hash password
    // -----------------------------
    const passwordHash = await bcrypt.hash(password, 12);

    // -----------------------------
    // Start transaction
    // -----------------------------
    await client.query("BEGIN");

    // -----------------------------
    // Create user
    // -----------------------------
    const result = await client.query(
      `
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        phone,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        full_name,
        email,
        phone,
        role,
        is_verified,
        is_active,
        created_at
      `,
      [
        fullName.trim(),
        normalizedEmail,
        passwordHash,
        phone?.trim() || null,
        role,
      ],
    );

    const user = result.rows[0];

    // -----------------------------
    // Automatically create worker profile
    // -----------------------------
    if (role === "worker") {
      await client.query(
        `
        INSERT INTO worker_profiles (
          user_id
        )
        VALUES ($1)
        `,
        [user.id],
      );
    }

    // -----------------------------
    // Commit transaction
    // -----------------------------
    await client.query("COMMIT");

    // -----------------------------
    // Create JWT
    // -----------------------------
    const token = generateToken(user);

    return res.status(201).json({
      status: "success",
      message:
        role === "worker"
          ? "Worker account created successfully"
          : "Account created successfully",
      token,
      user,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Registration error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to create account",
    });
  } finally {
    client.release();
  }
}


export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // -----------------------------
    // Validate input
    // -----------------------------
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------
    // Find user
    // -----------------------------
    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        phone,
        role,
        is_verified,
        is_active,
        created_at
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [normalizedEmail],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // -----------------------------
    // Check active account
    // -----------------------------
    if (!user.is_active) {
      return res.status(403).json({
        status: "error",
        message: "This account has been deactivated",
      });
    }

    // -----------------------------
    // Check password
    // -----------------------------
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // -----------------------------
    // Create JWT
    // -----------------------------
    const token = generateToken(user);

    // Never send password hash to frontend
    delete user.password_hash;

    return res.json({
      status: "success",
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to login",
    });
  }
}


export async function getMe(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        role,
        is_verified,
        is_active,
        created_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        status: "error",
        message: "This account has been deactivated",
      });
    }

    return res.json({
      status: "success",
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to retrieve user",
    });
  }
}
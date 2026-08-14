import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}

export async function googleLogin(req, res) {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({
        status: "error",
        message: "Google credential is required",
      });
    }

    const userRole = role === "worker" ? "worker" : "customer";

    // --------------------------------------------------
    // Verify Google ID token
    // --------------------------------------------------

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        status: "error",
        message: "Invalid Google credential",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      email_verified: emailVerified,
    } = payload;

    if (!email || !emailVerified) {
      return res.status(401).json({
        status: "error",
        message: "Google email could not be verified",
      });
    }

    // --------------------------------------------------
    // 1. Check Google ID
    // --------------------------------------------------

    const existingGoogleUser = await pool.query(
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
      WHERE google_id = $1
      `,
      [googleId],
    );

    if (existingGoogleUser.rows.length > 0) {
      const user = existingGoogleUser.rows[0];

      if (!user.is_active) {
        return res.status(403).json({
          status: "error",
          message: "This account has been deactivated",
        });
      }

      const token = generateToken(user);

      return res.json({
        status: "success",
        message: "Google login successful",
        token,
        user,
      });
    }

    // --------------------------------------------------
    // 2. Check existing email
    // --------------------------------------------------

    const existingEmailUser = await pool.query(
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
      WHERE email = $1
      `,
      [email.toLowerCase()],
    );

    if (existingEmailUser.rows.length > 0) {
      const user = existingEmailUser.rows[0];

      if (!user.is_active) {
        return res.status(403).json({
          status: "error",
          message: "This account has been deactivated",
        });
      }

      // Link Google account to existing Ndi-Olu account
      const updatedUser = await pool.query(
        `
        UPDATE users
        SET
          google_id = $1,
          auth_provider = 'google',
          is_verified = TRUE,
          updated_at = NOW()
        WHERE id = $2
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
        [googleId, user.id],
      );

      const linkedUser = updatedUser.rows[0];

      const token = generateToken(linkedUser);

      return res.json({
        status: "success",
        message: "Google account linked successfully",
        token,
        user: linkedUser,
      });
    }

    // --------------------------------------------------
    // 3. Create new account
    // --------------------------------------------------

    const newUser = await pool.query(
      `
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        role,
        google_id,
        auth_provider,
        is_verified
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        'google',
        TRUE
      )
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
        name || "Ndi-Olu User",
        email.toLowerCase(),
        "GOOGLE_AUTH",
        userRole,
        googleId,
      ],
    );

    const user = newUser.rows[0];

    const token = generateToken(user);

    return res.status(201).json({
      status: "success",
      message: "Google account created successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Google authentication error:", error);

    return res.status(500).json({
      status: "error",
      message: "Google authentication failed",
    });
  }
}
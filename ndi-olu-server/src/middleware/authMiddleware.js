import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT authentication error:", error);

    return res.status(401).json({
      status: "error",
      message: "Invalid or expired authentication token",
    });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Admin access required",
    });
  }

  next();
}
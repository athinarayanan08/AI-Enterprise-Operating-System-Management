/**
 * Auth middleware: verifies the JWT on every protected route and
 * attaches the current user to req.user. requireRole() further
 * restricts a route to specific roles (Admin/Manager/Employee).
 */
const jwt = require("jsonwebtoken");
const db = require("../db");

const SECRET_KEY = process.env.NEXORA_SECRET_KEY || "dev-only-change-me-in-production";

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ detail: "Missing authentication token" });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.sub);
    if (!user) {
      return res.status(401).json({ detail: "User no longer exists" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ detail: "Insufficient permissions for this action" });
    }
    next();
  };
}

module.exports = { authenticate, requireRole, SECRET_KEY };

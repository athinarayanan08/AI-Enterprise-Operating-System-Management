/**
 * Maps to: AdminAudit component in Nexora.jsx
 * Endpoint: GET /api/audit
 * Every other route writes into this table (login, role changes, chat
 * activity, approvals) so this becomes the single source of truth log.
 */
const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, requireRole("Admin"), (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const rows = db
    .prepare("SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT ?")
    .all(limit);
  res.json(rows);
});

module.exports = router;

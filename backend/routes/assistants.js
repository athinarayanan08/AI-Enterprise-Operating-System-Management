/**
 * Maps to: AdminAIConfig component in Nexora.jsx ("AI Control Room")
 * Endpoints: GET /api/assistants, PATCH /api/assistants/:id
 * Also consumed by AIHub to know which assistants are currently enabled.
 */
const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

function serialize(a) {
  return { ...a, available: !!a.available };
}

router.get("/", authenticate, (req, res) => {
  const rows = db.prepare("SELECT * FROM assistants").all();
  res.json(rows.map(serialize));
});

router.patch("/:id", authenticate, requireRole("Admin"), (req, res) => {
  const assistant = db.prepare("SELECT * FROM assistants WHERE id = ?").get(req.params.id);
  if (!assistant) return res.status(404).json({ detail: "Assistant not found" });

  const available = req.body.available !== undefined ? (req.body.available ? 1 : 0) : assistant.available;
  db.prepare("UPDATE assistants SET available = ? WHERE id = ?").run(available, req.params.id);

  db.prepare(
    "INSERT INTO audit_events (user_name, action, resource, result) VALUES (?, ?, ?, ?)"
  ).run(req.user.name, "AI configuration updated", assistant.name, "Success");

  const updated = db.prepare("SELECT * FROM assistants WHERE id = ?").get(req.params.id);
  res.json(serialize(updated));
});

module.exports = router;

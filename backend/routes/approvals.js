/**
 * Maps to: ManagerApprovals component in Nexora.jsx
 * Endpoints: GET /api/approvals, POST /api/approvals,
 *            POST /api/approvals/:id/approve, POST /api/approvals/:id/reject
 */
const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const statusFilter = req.query.status || "Pending";
  let rows;
  if (statusFilter && statusFilter !== "All") {
    rows = db
      .prepare("SELECT * FROM approvals WHERE status = ? ORDER BY created_at DESC")
      .all(statusFilter);
  } else {
    rows = db.prepare("SELECT * FROM approvals ORDER BY created_at DESC").all();
  }
  res.json(rows);
});

// Any authenticated employee can submit a request (e.g. requesting AI assistant access)
router.post("/", authenticate, (req, res) => {
  const { requester_name, dept, request } = req.body;
  if (!requester_name || !request) {
    return res.status(400).json({ detail: "requester_name and request are required" });
  }

  const info = db
    .prepare("INSERT INTO approvals (requester_name, dept, request) VALUES (?, ?, ?)")
    .run(requester_name, dept || "", request);

  db.prepare(
    "INSERT INTO notifications (category, title, description) VALUES (?, ?, ?)"
  ).run("Approvals", `New request from ${requester_name}`, request);

  const created = db.prepare("SELECT * FROM approvals WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

function resolve(req, res, newStatus) {
  const approval = db.prepare("SELECT * FROM approvals WHERE id = ?").get(req.params.id);
  if (!approval) return res.status(404).json({ detail: "Approval not found" });

  db.prepare("UPDATE approvals SET status = ? WHERE id = ?").run(newStatus, req.params.id);

  db.prepare(
    "INSERT INTO audit_events (user_name, action, resource, result) VALUES (?, ?, ?, ?)"
  ).run(
    req.user.name,
    newStatus === "Approved" ? "Approval submitted" : "Approval rejected",
    approval.request,
    "Success"
  );

  const updated = db.prepare("SELECT * FROM approvals WHERE id = ?").get(req.params.id);
  res.json(updated);
}

router.post("/:id/approve", authenticate, requireRole("Admin", "Manager"), (req, res) =>
  resolve(req, res, "Approved")
);
router.post("/:id/reject", authenticate, requireRole("Admin", "Manager"), (req, res) =>
  resolve(req, res, "Rejected")
);

module.exports = router;

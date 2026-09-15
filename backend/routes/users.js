/**
 * Maps to: AdminUsers / PeopleTable component in Nexora.jsx
 * Endpoints: GET /api/users, GET /api/users/:id, PATCH /api/users/:id
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

function serializeUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

// Admin sees everyone; Manager sees only their own department.
router.get("/", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  let rows;
  if (req.user.role === "Manager") {
    rows = db.prepare("SELECT * FROM users WHERE dept = ?").all(req.user.dept);
  } else {
    rows = db.prepare("SELECT * FROM users").all();
  }
  res.json(rows.map(serializeUser));
});

router.get("/:id", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ detail: "User not found" });
  res.json(serializeUser(user));
});

router.patch("/:id", authenticate, requireRole("Admin"), (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ detail: "User not found" });

  const { role, status, dept } = req.body;
  const newRole = role ?? user.role;
  const newStatus = status ?? user.status;
  const newDept = dept ?? user.dept;

  db.prepare("UPDATE users SET role = ?, status = ?, dept = ? WHERE id = ?").run(
    newRole, newStatus, newDept, req.params.id
  );

  if (role && role !== user.role) {
    db.prepare(
      "INSERT INTO audit_events (user_name, action, resource, result) VALUES (?, ?, ?, ?)"
    ).run(req.user.name, "Role changed", user.name, "Success");
  }

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  res.json(serializeUser(updated));
});

router.post("/", authenticate, requireRole("Admin"), (req, res) => {
  const { name, email, password, dept, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ detail: "Name and email are required" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(400).json({ detail: "User with this email already exists" });
  }

  const userPassword = password || "ChangeMe123!";
  const passwordHash = bcrypt.hashSync(userPassword, 10);
  const userRole = role || "Employee";
  const userDept = dept || "Engineering";

  const result = db.prepare(
    "INSERT INTO users (name, email, password_hash, dept, role, status) VALUES (?, ?, ?, ?, ?, 'Active')"
  ).run(name, email, passwordHash, userDept, userRole);

  const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(serializeUser(newUser));
});

module.exports = router;

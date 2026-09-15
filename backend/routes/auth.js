/**
 * Maps to: Login component in Nexora.jsx
 * Endpoint: POST /api/auth/login
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { SECRET_KEY } = require("../middleware/auth");

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: "Email and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ detail: "Incorrect email or password" });
  }

  const token = jwt.sign({ sub: user.id }, SECRET_KEY, { expiresIn: "8h" });

  db.prepare(
    "INSERT INTO audit_events (user_name, action, resource, result) VALUES (?, ?, ?, ?)"
  ).run(user.name, "User signed in", "—", "Success");

  res.json({
    access_token: token,
    token_type: "bearer",
    role: user.role,
    name: user.name,
    dept: user.dept,
  });
});

router.post("/register", (req, res) => {
  const { name, email, password, dept } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ detail: "Name, email, and password are required" });
  }

  const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existingUser) {
    return res.status(400).json({ detail: "An account with this email already exists" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const userDept = dept || "Engineering";
  const role = "Employee";
  const status = "Active";

  const result = db.prepare(
    "INSERT INTO users (name, email, password_hash, dept, role, status) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(name, email, passwordHash, userDept, role, status);

  const userId = result.lastInsertRowid;
  const token = jwt.sign({ sub: userId }, SECRET_KEY, { expiresIn: "8h" });

  db.prepare(
    "INSERT INTO audit_events (user_name, action, resource, result) VALUES (?, ?, ?, ?)"
  ).run(name, "User registered account", "—", "Success");

  res.json({
    access_token: token,
    token_type: "bearer",
    role,
    name,
    dept: userDept,
  });
});

module.exports = router;

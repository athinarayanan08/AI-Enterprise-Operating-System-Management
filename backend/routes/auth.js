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

module.exports = router;

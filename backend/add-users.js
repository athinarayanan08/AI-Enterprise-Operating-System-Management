/**
 * One-off script to add extra users to the Nexora database.
 * Run once: node add-users.js
 * Safe to run multiple times — skips any email that already exists.
 */
const bcrypt = require("bcryptjs");
const db = require("./db");

const usersToAdd = [
  { name: "Adhinarayanan", email: "adhinarayanan.stm@gmail.com", password: "205019", dept: "Engineering", role: "Admin" },
  { name: "Aathithya", email: "aathithya730@gmail.com", password: "205002", dept: "Engineering", role: "Admin" },
];

const insert = db.prepare(
  "INSERT INTO users (name, email, password_hash, dept, role, status, usage_percent) VALUES (?, ?, ?, ?, ?, 'Active', 0)"
);
const findExisting = db.prepare("SELECT id FROM users WHERE email = ?");

for (const u of usersToAdd) {
  const existing = findExisting.get(u.email);
  if (existing) {
    console.log(`Skipped (already exists): ${u.email}`);
    continue;
  }
  const hash = bcrypt.hashSync(u.password, 10);
  insert.run(u.name, u.email, hash, u.dept, u.role);
  console.log(`Added: ${u.email} (${u.role})`);
}

console.log("Done.");
/**
 * Tasks router — allows Admin & Manager roles to assign "Project Work" and
 * "Problem Solving" tasks to employees/departments, and employees to update status.
 *
 * Endpoints:
 *   GET    /api/tasks
 *   POST   /api/tasks
 *   PATCH  /api/tasks/:id
 *   DELETE /api/tasks/:id
 */
const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/tasks
router.get("/", authenticate, (req, res) => {
  const { role, dept, name, id } = req.user;
  let rows;

  if (role === "Admin") {
    rows = db.prepare("SELECT * FROM tasks ORDER BY id DESC").all();
  } else if (role === "Manager") {
    rows = db.prepare(
      "SELECT * FROM tasks WHERE dept = ? OR assigned_by_id = ? ORDER BY id DESC"
    ).all(dept, id);
  } else {
    // Employee
    rows = db.prepare(
      "SELECT * FROM tasks WHERE assigned_to_name = ? OR assigned_to_id = ? OR dept = ? ORDER BY id DESC"
    ).all(name, id, dept);
  }

  res.json(rows);
});

// POST /api/tasks (Admin or Manager)
router.post("/", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const {
    title,
    type = "Project Work",
    description = "",
    assigned_to_name = "",
    assigned_to_id = null,
    dept = "",
    priority = "Medium",
    due_date = "",
  } = req.body;

  if (!title) {
    return res.status(400).json({ detail: "Task title is required" });
  }

  const assignedDept = dept || req.user.dept;
  const assignedTo = assigned_to_name || "All Department Members";

  const stmt = db.prepare(`
    INSERT INTO tasks (
      title, type, description, assigned_to_id, assigned_to_name,
      assigned_by_id, assigned_by_name, dept, priority, status, due_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
  `);

  const result = stmt.run(
    title,
    type,
    description,
    assigned_to_id,
    assignedTo,
    req.user.id,
    req.user.name,
    assignedDept,
    priority,
    due_date
  );

  db.prepare(
    "INSERT INTO audit_events (user_name, action, resource, result) VALUES (?, ?, ?, ?)"
  ).run(
    req.user.name,
    `Assigned ${type} task`,
    title,
    "Success"
  );

  const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(newTask);
});

// PATCH /api/tasks/:id
router.patch("/:id", authenticate, (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  if (!task) {
    return res.status(404).json({ detail: "Task not found" });
  }

  const { status, title, description, priority, due_date } = req.body;
  const newStatus = status ?? task.status;
  const newTitle = title ?? task.title;
  const newDesc = description ?? task.description;
  const newPriority = priority ?? task.priority;
  const newDueDate = due_date ?? task.due_date;

  db.prepare(`
    UPDATE tasks
    SET status = ?, title = ?, description = ?, priority = ?, due_date = ?
    WHERE id = ?
  `).run(newStatus, newTitle, newDesc, newPriority, newDueDate, req.params.id);

  if (status && status !== task.status) {
    db.prepare(
      "INSERT INTO audit_events (user_name, action, resource, result) VALUES (?, ?, ?, ?)"
    ).run(req.user.name, `Updated task status to ${status}`, task.title, "Success");
  }

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /api/tasks/:id (Admin or Manager)
router.delete("/:id", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  if (!task) {
    return res.status(404).json({ detail: "Task not found" });
  }

  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);

  db.prepare(
    "INSERT INTO audit_events (user_name, action, resource, result) VALUES (?, ?, ?, ?)"
  ).run(req.user.name, "Deleted task", task.title, "Success");

  res.json({ message: "Task deleted successfully" });
});

module.exports = router;

const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/documents?search=...
router.get("/", (req, res) => {
  const search = req.query.search || "";
  let rows;
  if (search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    rows = db
      .prepare(
        "SELECT * FROM documents WHERE LOWER(name) LIKE ? OR LOWER(dept) LIKE ? ORDER BY id ASC"
      )
      .all(q, q);
  } else {
    rows = db.prepare("SELECT * FROM documents ORDER BY id ASC").all();
  }
  res.json(rows);
});

// POST /api/documents (Upload/register new document)
router.post("/", (req, res) => {
  const { name, size = "1.2 MB", dept = "General", type = "pdf" } = req.body;
  if (!name) return res.status(400).json({ detail: "Document name is required" });

  const stmt = db.prepare(
    "INSERT INTO documents (name, size, dept, updated, type) VALUES (?, ?, ?, 'Just now', ?)"
  );
  const result = stmt.run(name, size, dept, type);
  const newDoc = db.prepare("SELECT * FROM documents WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(newDoc);
});

module.exports = router;

const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/knowledge?search=...
router.get("/", (req, res) => {
  const search = req.query.search || "";
  let rows;
  if (search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    rows = db
      .prepare(
        "SELECT * FROM knowledge_articles WHERE LOWER(title) LIKE ? OR LOWER(desc) LIKE ? OR LOWER(cat) LIKE ? ORDER BY id ASC"
      )
      .all(q, q, q);
  } else {
    rows = db.prepare("SELECT * FROM knowledge_articles ORDER BY id ASC").all();
  }
  res.json(rows);
});

// GET /api/knowledge/:id
router.get("/:id", (req, res) => {
  const article = db.prepare("SELECT * FROM knowledge_articles WHERE id = ?").get(req.params.id);
  if (!article) return res.status(404).json({ detail: "Article not found" });
  res.json(article);
});

module.exports = router;

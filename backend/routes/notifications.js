/**
 * Maps to: NotificationDrawer component in Nexora.jsx
 * Endpoints: GET /api/notifications, PATCH /api/notifications/:id/read
 */
const express = require("express");
const db = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const rows = db
    .prepare(
      "SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC"
    )
    .all(req.user.id);
  res.json(rows.map((n) => ({ ...n, unread: !!n.unread })));
});

router.patch("/:id/read", authenticate, (req, res) => {
  const notif = db.prepare("SELECT * FROM notifications WHERE id = ?").get(req.params.id);
  if (!notif) return res.status(404).json({ detail: "Notification not found" });

  db.prepare("UPDATE notifications SET unread = 0 WHERE id = ?").run(req.params.id);
  const updated = db.prepare("SELECT * FROM notifications WHERE id = ?").get(req.params.id);
  res.json({ ...updated, unread: !!updated.unread });
});

module.exports = router;

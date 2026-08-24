/**
 * Maps to: AdminDashboard, ManagerDashboard, EmployeeDashboard components.
 * Endpoints: GET /api/dashboard/admin, /manager, /employee
 * Each aggregates data from other tables rather than owning any data itself.
 */
const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/admin", authenticate, requireRole("Admin"), (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  const pendingApprovals = db
    .prepare("SELECT COUNT(*) AS c FROM approvals WHERE status = 'Pending'")
    .get().c;
  const assistants = db
    .prepare("SELECT * FROM assistants ORDER BY usage_percent DESC LIMIT 4")
    .all()
    .map((a) => ({ ...a, available: !!a.available }));
  const recentActivity = db
    .prepare("SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT 4")
    .all();

  // Placeholder for a real session-tracking table — swap for a live metric later.
  const activeAiSessions = 300 + Math.floor(Math.random() * 100);
  const activity30d = Array.from({ length: 30 }, () => 15 + Math.floor(Math.random() * 45));

  res.json({
    total_users: totalUsers,
    active_ai_sessions: activeAiSessions,
    system_health: "99.98%",
    pending_approvals: pendingApprovals,
    activity_30d: activity30d,
    most_used_assistants: assistants,
    recent_activity: recentActivity,
  });
});

router.get("/manager", authenticate, requireRole("Manager"), (req, res) => {
  const team = db.prepare("SELECT * FROM users WHERE dept = ?").all(req.user.dept);
  const pendingApprovals = db
    .prepare("SELECT COUNT(*) AS c FROM approvals WHERE status = 'Pending'")
    .get().c;
  const topAssistants = db
    .prepare("SELECT * FROM assistants ORDER BY usage_percent DESC LIMIT 3")
    .all()
    .map((a) => ({ ...a, available: !!a.available }));
  const avgUsage = team.length
    ? Math.round(team.reduce((sum, u) => sum + u.usage_percent, 0) / team.length)
    : 0;

  res.json({
    team_size: team.length,
    pending_approvals: pendingApprovals,
    team_ai_usage_avg: avgUsage,
    top_assistants: topAssistants,
  });
});

router.get("/employee", authenticate, (req, res) => {
  const aiSessions = db
    .prepare("SELECT COUNT(*) AS c FROM conversations WHERE owner_id = ?")
    .get(req.user.id).c;
  const documentsAnalyzed = db
    .prepare(
      `SELECT COUNT(*) AS c FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE c.owner_id = ? AND m.sources_json != '[]'`
    )
    .get(req.user.id).c;
  const requestsSubmitted = db
    .prepare("SELECT COUNT(*) AS c FROM approvals WHERE requester_name = ?")
    .get(req.user.name).c;

  res.json({
    ai_sessions: aiSessions,
    documents_analyzed: documentsAnalyzed,
    requests_submitted: requestsSubmitted,
  });
});

module.exports = router;

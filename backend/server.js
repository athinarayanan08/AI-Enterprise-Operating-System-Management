/**
 * Nexora backend — Express entrypoint.
 * Each router below is a self-contained module matching one frontend
 * component, so any one of them can be modified/replaced without
 * touching the others.
 *
 * Run locally:
 *   npm run seed   (once, to populate demo data)
 *   npm run dev    (starts with auto-restart on file changes)
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const auditRoutes = require("./routes/audit");
const assistantsRoutes = require("./routes/assistants");
const approvalsRoutes = require("./routes/approvals");
const chatRoutes = require("./routes/chat");
const notificationsRoutes = require("./routes/notifications");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Allow the Vite dev server (default port 5173) to call this API during development.
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/assistants", assistantsRoutes);
app.use("/api/approvals", approvalsRoutes);
app.use("/api", chatRoutes); // exposes /api/conversations and /api/chat
app.use("/api/notifications", notificationsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Centralized error handler — keeps every route's try/catch minimal
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ detail: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Nexora API running at http://127.0.0.1:${PORT}`);
});

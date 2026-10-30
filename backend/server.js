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
const tasksRoutes = require("./routes/tasks");
const knowledgeRoutes = require("./routes/knowledge");
const docsRoutes = require("./routes/docs");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl/scripts) or any localhost/127.0.0.1 port
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/assistants", assistantsRoutes);
app.use("/api/approvals", approvalsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api", chatRoutes); // exposes /api/conversations and /api/chat
app.use("/api/notifications", notificationsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/documents", docsRoutes);

// Centralized error handler — keeps every route's try/catch minimal
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ detail: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Nexora API running at http://127.0.0.1:${PORT}`);
});

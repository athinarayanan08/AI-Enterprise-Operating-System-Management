/**
 * Database module.
 * Uses better-sqlite3: synchronous API (no async/await noise for simple
 * queries), file-based (zero external setup), fast enough for a
 * final-year project or small production app.
 * Swap to Postgres/MySQL later by changing only this file.
 */
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "nexora.db"));
db.pragma("journal_mode = WAL");

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      dept TEXT DEFAULT '',
      role TEXT DEFAULT 'Employee',
      status TEXT DEFAULT 'Active',
      usage_percent INTEGER DEFAULT 0,
      last_active TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT DEFAULT '—',
      result TEXT DEFAULT 'Success',
      timestamp TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assistants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      available INTEGER DEFAULT 1,
      usage_percent INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_name TEXT NOT NULL,
      dept TEXT DEFAULT '',
      request TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL,
      title TEXT DEFAULT 'New conversation',
      assistant_id TEXT DEFAULT 'general',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      sources_json TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category TEXT DEFAULT 'System',
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      unread INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'Project Work',
      description TEXT DEFAULT '',
      assigned_to_id INTEGER,
      assigned_to_name TEXT NOT NULL,
      assigned_by_id INTEGER NOT NULL,
      assigned_by_name TEXT NOT NULL,
      dept TEXT DEFAULT '',
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Pending',
      due_date TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meeting_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      host_name TEXT NOT NULL,
      dept TEXT NOT NULL,
      platform TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      participants_count INTEGER NOT NULL,
      attendees_json TEXT DEFAULT '[]',
      sentiment TEXT DEFAULT 'Neutral',
      status TEXT DEFAULT 'Completed',
      summary TEXT DEFAULT '',
      talk_ratio INTEGER DEFAULT 60,
      listen_ratio INTEGER DEFAULT 40,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS knowledge_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      cat TEXT NOT NULL,
      read_time TEXT NOT NULL,
      desc TEXT NOT NULL,
      content TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      size TEXT NOT NULL,
      dept TEXT NOT NULL,
      updated TEXT NOT NULL,
      type TEXT DEFAULT 'pdf',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  seedAnalyticsAndDocs();
}

function seedAnalyticsAndDocs() {
  const meetingCount = db.prepare("SELECT COUNT(*) AS c FROM meeting_events").get().c;
  if (meetingCount === 0) {
    const insertMeeting = db.prepare(`
      INSERT INTO meeting_events (
        title, date, time, host_name, dept, platform, duration_minutes,
        participants_count, attendees_json, sentiment, status, summary, talk_ratio, listen_ratio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // High fidelity sessions for October 2026 (Current Month)
    const octMeetings = [
      ["Sprint Planning & Architecture Sync", "2026-10-01", "09:30 AM", "Evan Brightwood", "Engineering", "Google Meet", 60, 12, '["Evan Brightwood","Lila Casterly","Ava Starfall","Nitheshwaran"]', "Positive", "Completed", "Aligned Q4 microservices migration roadmaps and caching layer upgrade.", 68, 32],
      ["Enterprise Security & JWT Review", "2026-10-01", "02:00 PM", "Lila Casterly", "Engineering", "Zoom", 45, 8, '["Lila Casterly","Meera Krishnan","Adhinarayanan"]', "Neutral", "Completed", "Audited access tokens, session persistence, and role-based permissions.", 55, 45],
      ["Q4 Budget Allocation & AI Quotas", "2026-10-04", "10:00 AM", "Priya Chandran", "Finance", "MS Teams", 75, 10, '["Priya Chandran","Evan Brightwood","Luna Fairchild"]', "Positive", "Completed", "Approved department compute expenditure and cloud token pools.", 62, 38],
      ["Design System & UI Glassmorphism Review", "2026-10-04", "03:30 PM", "Luna Fairchild", "Marketing", "Google Meet", 50, 15, '["Luna Fairchild","Ava Starfall","Vignesh Raja"]', "Positive", "Completed", "Finalized violet glass panels, responsive typography, and navigation bar.", 74, 26],
      ["Customer Journey & Conversion Analysis", "2026-10-07", "11:00 AM", "Karthik Ramasamy", "Sales", "Zoom", 40, 6, '["Karthik Ramasamy","Rahul Mehta","Luna Fairchild"]', "Neutral", "Completed", "Reviewed drop-off rates on enterprise onboarding and trial upgrades.", 70, 30],
      ["Talent Acquisition & Technical Hiring", "2026-10-07", "04:00 PM", "Divya Suresh", "Human Resources", "Google Meet", 60, 9, '["Divya Suresh","Meera Krishnan","Nitheshwaran"]', "Positive", "Completed", "Reviewed senior backend engineering pipeline and interview rubrics.", 58, 42],
      ["Executive Strategic Operations Briefing", "2026-10-10", "09:00 AM", "Evan Brightwood", "Operations", "Google Meet", 90, 25, '["Evan Brightwood","Meera Krishnan","Priya Chandran","Luna Fairchild","Divya Suresh"]', "Positive", "Completed", "Enterprise OKR checkpoint with 99.98% operational uptime achievement.", 80, 20],
      ["Platform Scalability & SQLite WAL Tuning", "2026-10-10", "02:30 PM", "Nitheshwaran", "Engineering", "Zoom", 80, 14, '["Nitheshwaran","Lila Casterly","Arun Kumar"]', "Positive", "Completed", "Tuned database WAL mode pragmas, connection concurrency, and async queues.", 82, 18],
      ["Product Roadmap & Multi-Agent Assist", "2026-10-13", "10:30 AM", "Vignesh Raja", "Product", "Google Meet", 60, 11, '["Vignesh Raja","Evan Brightwood","Ava Starfall"]', "Positive", "Completed", "Defined autonomous workflows for document analysis and audit trails.", 65, 35],
      ["Compliance & Data Retention Policy", "2026-10-13", "03:00 PM", "Ananya Iyer", "Legal", "MS Teams", 45, 7, '["Ananya Iyer","Priya Chandran","Divya Suresh"]', "Neutral", "Completed", "Verified compliance with ISO27001 and GDPR data residency standards.", 50, 50],
      ["Frontend Component Architecture & Charts", "2026-10-16", "10:00 AM", "Ava Starfall", "Engineering", "Google Meet", 65, 13, '["Ava Starfall","Nitheshwaran","Arun Kumar"]', "Positive", "Completed", "Implemented reactive analytics filters, period switching, and report modals.", 70, 30],
      ["AI Assistant Token Optimization", "2026-10-16", "02:00 PM", "Meera Krishnan", "Engineering", "Zoom", 55, 9, '["Meera Krishnan","Lila Casterly","Evan Brightwood"]', "Positive", "Completed", "Reduced prompt latency by 34% with token pruning and prompt caching.", 64, 36],
      ["Quarterly Financial Forecast & Cash Flow", "2026-10-19", "11:00 AM", "Priya Chandran", "Finance", "MS Teams", 70, 8, '["Priya Chandran","Evan Brightwood","Karthik Ramasamy"]', "Neutral", "Completed", "Forecasted enterprise ARR growth, gross margin ratios, and reserve balances.", 60, 40],
      ["Global Brand Campaign & Product Launch", "2026-10-19", "03:30 PM", "Luna Fairchild", "Marketing", "Google Meet", 55, 16, '["Luna Fairchild","Rahul Mehta","Vignesh Raja"]', "Positive", "Completed", "Prepared global press release, interactive demo video, and collateral.", 72, 28],
      ["Infrastructure Resilience & Incident Response", "2026-10-24", "10:00 AM", "Nitheshwaran", "Engineering", "Google Meet", 75, 14, '["Nitheshwaran","Evan Brightwood","Lila Casterly"]', "Positive", "Completed", "Simulated failover drill, automatic service recovery, and audit tracking.", 76, 24],
      ["Sales Pipeline Acceleration & Enterprise Deals", "2026-10-24", "02:00 PM", "Karthik Ramasamy", "Sales", "Zoom", 60, 10, '["Karthik Ramasamy","Priya Chandran","Rahul Mehta"]', "Positive", "Completed", "Reviewed 5 pending enterprise contracts totaling $2.4M ARR.", 68, 32],
      ["Enterprise Operational Checkpoint", "2026-10-27", "09:30 AM", "Evan Brightwood", "Operations", "Google Meet", 60, 18, '["Evan Brightwood","Meera Krishnan","Luna Fairchild","Nitheshwaran"]', "Positive", "Completed", "Full enterprise KPI review, real-time analytics verification, and task dispatching.", 70, 30],
      ["Cross-Departmental AI Workflow Synthesis", "2026-10-27", "02:00 PM", "Meera Krishnan", "Engineering", "Zoom", 50, 12, '["Meera Krishnan","Vignesh Raja","Divya Suresh"]', "Positive", "Completed", "Demonstrated end-to-end task automation and report generation pipeline.", 62, 38]
    ];

    for (const m of octMeetings) {
      insertMeeting.run(...m);
    }

    // High fidelity sessions for September 2026 (Previous Month)
    const sepMeetings = [
      ["Q3 Retrospective & Performance Review", "2026-09-01", "10:00 AM", "Evan Brightwood", "Operations", "Google Meet", 60, 14, '["Evan Brightwood","Meera Krishnan","Priya Chandran"]', "Positive", "Completed", "Analyzed team delivery velocity, customer satisfaction, and sprint burndown.", 65, 35],
      ["Security Baseline & Perimeter Audit", "2026-09-04", "02:30 PM", "Lila Casterly", "Engineering", "Zoom", 45, 9, '["Lila Casterly","Nitheshwaran","Arun Kumar"]', "Neutral", "Completed", "Conducted penetration tests, port scan analysis, and SSL cipher updates.", 58, 42],
      ["Product Design System Unification", "2026-09-08", "11:00 AM", "Luna Fairchild", "Marketing", "Google Meet", 50, 12, '["Luna Fairchild","Vignesh Raja","Ava Starfall"]', "Positive", "Completed", "Standardized color tokens, button states, and modal layout specs.", 72, 28],
      ["Sales Pipeline Expansion & Target Review", "2026-09-11", "03:00 PM", "Karthik Ramasamy", "Sales", "Zoom", 60, 8, '["Karthik Ramasamy","Rahul Mehta"]', "Neutral", "Completed", "Established regional targets across North America and APAC territories.", 64, 36],
      ["Mid-Month Operations & Resource Planning", "2026-09-15", "09:30 AM", "Evan Brightwood", "Operations", "Google Meet", 75, 20, '["Evan Brightwood","Divya Suresh","Priya Chandran","Nitheshwaran"]', "Positive", "Completed", "Evaluated departmental headcounts, contractor budgets, and key deliverables.", 75, 25],
      ["Microservices Decoupling & API Standardization", "2026-09-15", "02:00 PM", "Nitheshwaran", "Engineering", "Zoom", 70, 15, '["Nitheshwaran","Lila Casterly","Meera Krishnan"]', "Positive", "Completed", "Agreed on REST contracts, JWT bearer headers, and centralized error logging.", 80, 20],
      ["Employee Benefits & Wellness Alignment", "2026-09-19", "10:30 AM", "Divya Suresh", "Human Resources", "MS Teams", 45, 10, '["Divya Suresh","Luna Fairchild","Rahul Mehta"]', "Positive", "Completed", "Introduced flexible remote schedules, wellness stipends, and learning credits.", 60, 40],
      ["Quarterly Financial Pre-Close Assessment", "2026-09-23", "01:30 PM", "Priya Chandran", "Finance", "MS Teams", 65, 7, '["Priya Chandran","Evan Brightwood"]', "Neutral", "Completed", "Prepared draft P&L statement, audit trial balance, and tax reconciliation.", 55, 45],
      ["End-of-Month Engineering Sprint Demo", "2026-09-27", "11:00 AM", "Ava Starfall", "Engineering", "Google Meet", 60, 16, '["Ava Starfall","Nitheshwaran","Lila Casterly","Vignesh Raja"]', "Positive", "Completed", "Live demonstration of automated task assignment and AI assistant hub.", 68, 32],
      ["September Executive Synthesis & Sign-off", "2026-09-30", "04:00 PM", "Evan Brightwood", "Operations", "Google Meet", 80, 22, '["Evan Brightwood","Meera Krishnan","Priya Chandran","Luna Fairchild"]', "Positive", "Completed", "Approved monthly operational report and signed off on Q4 objectives.", 78, 22]
    ];

    for (const m of sepMeetings) {
      insertMeeting.run(...m);
    }
  }

  const articleCount = db.prepare("SELECT COUNT(*) AS c FROM knowledge_articles").get().c;
  if (articleCount === 0) {
    const insertArticle = db.prepare(`
      INSERT INTO knowledge_articles (title, cat, read_time, desc, content)
      VALUES (?, ?, ?, ?, ?)
    `);

    const articles = [
      ["Enterprise OS Microservices Architecture", "Architecture", "5 min read", "Detailed guide to modular Express endpoints, SQLite WAL mode, and decoupled React state.", "NEXORA microservices follow decoupled domain-driven design. Endpoints are isolated across auth, tasks, audit, and analytics modules."],
      ["AI Model Governance & Rate Limiting Protocols", "Security", "8 min read", "Enterprise quotas, token tracking, fallback routines, and LLM safety filters.", "All AI assistant invocations route through centralized token meters with exponential backoff and department-level budget controls."],
      ["Autonomous Agent Function Calling Standards", "Engineering", "6 min read", "Format specification for structured JSON tool calls, error recovery, and feedback loops.", "Agents produce strongly typed JSON payloads validating against schema definitions before dispatch to backend controllers."],
      ["Corporate Data Privacy & Role-Based Access Controls", "Compliance", "4 min read", "JWT verification rules, departmental boundaries, and immutable audit event logging.", "Every mutation logs a cryptographic audit event record with operator ID, target resource, and result status."],
      ["Quarterly Performance Indicators & OKRs", "Operations", "7 min read", "Metrics tracking task resolution speed, meeting hour reduction, and AI adoption.", "Target milestones include 30% reduction in redundant sync meetings and 40% automated task resolution using NEXORA."]
    ];

    for (const a of articles) insertArticle.run(...a);
  }

  const docCount = db.prepare("SELECT COUNT(*) AS c FROM documents").get().c;
  if (docCount === 0) {
    const insertDoc = db.prepare(`
      INSERT INTO documents (name, size, dept, updated, type)
      VALUES (?, ?, ?, ?, ?)
    `);

    const docs = [
      ["Q3-Financial-Analysis-and-Audit.pdf", "2.4 MB", "Finance", "2 hours ago", "pdf"],
      ["Engineering-Design-Handbook-2026.pdf", "4.1 MB", "Engineering", "Yesterday", "pdf"],
      ["Information-Security-Charter.docx", "1.1 MB", "Security", "3 days ago", "docx"],
      ["Employee-Benefits-and-Leave-Policy.pdf", "850 KB", "Human Resources", "Last week", "pdf"],
      ["Product-Roadmap-Autonomous-Agents.pdf", "5.8 MB", "Product", "2 weeks ago", "pdf"],
      ["Enterprise-Architecture-Guidelines.pdf", "3.2 MB", "Engineering", "3 weeks ago", "pdf"]
    ];

    for (const d of docs) insertDoc.run(...d);
  }
}

initSchema();

module.exports = db;

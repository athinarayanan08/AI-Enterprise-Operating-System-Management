/**
 * Seeds the database with the same demo data already hardcoded in
 * Nexora.jsx (PEOPLE, AUDIT_EVENTS, ASSISTANTS, APPROVALS, NOTIFICATIONS),
 * so the frontend shows identical content once wired to the real API.
 * Run once: npm run seed
 */
const bcrypt = require("bcryptjs");
const db = require("./db");

function seed() {
  const existing = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (existing > 0) {
    console.log("Database already seeded — skipping.");
    return;
  }

  const defaultHash = bcrypt.hashSync("password123", 10);

  const people = [
    ["Meera Krishnan", "meera.krishnan@nexora.ai", "Engineering", "Admin", "Active", 87],
    ["Arun Kumar", "arun.kumar@nexora.ai", "Engineering", "Employee", "Active", 64],
    ["Priya Chandran", "priya.chandran@nexora.ai", "Finance", "Manager", "Active", 52],
    ["Karthik Ramasamy", "karthik.r@nexora.ai", "Sales", "Employee", "Away", 31],
    ["Divya Suresh", "divya.suresh@nexora.ai", "Human Resources", "Manager", "Active", 45],
    ["Vignesh Raja", "vignesh.raja@nexora.ai", "Product", "Employee", "Active", 71],
    ["Ananya Iyer", "ananya.iyer@nexora.ai", "Legal", "Employee", "Offline", 12],
    ["Rahul Mehta", "rahul.mehta@nexora.ai", "Marketing", "Employee", "Active", 58],
  ];
  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password_hash, dept, role, status, usage_percent) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const [name, email, dept, role, status, usage] of people) {
    insertUser.run(name, email, defaultHash, dept, role, status, usage);
  }

  const assistants = [
    ["general", "General Assistant", "Company-wide conversational AI", 1, 42],
    ["docs", "Document Intelligence", "Search and reason over company knowledge", 1, 31],
    ["code", "Code Assistant", "Engineering workspace copilot", 1, 18],
    ["data", "Data Analyst", "Turns raw data into insight", 0, 9],
    ["research", "Research Assistant", "Deep multi-source research", 0, 0],
  ];
  const insertAssistant = db.prepare(
    "INSERT INTO assistants (id, name, description, available, usage_percent) VALUES (?, ?, ?, ?, ?)"
  );
  for (const row of assistants) insertAssistant.run(...row);

  const approvals = [
    ["Arun Kumar", "Engineering", "Document Intelligence access"],
    ["Rahul Mehta", "Marketing", "Increased AI usage quota"],
    ["Ananya Iyer", "Legal", "Research Assistant access"],
  ];
  const insertApproval = db.prepare(
    "INSERT INTO approvals (requester_name, dept, request) VALUES (?, ?, ?)"
  );
  for (const row of approvals) insertApproval.run(...row);

  const auditEvents = [
    ["Arun Kumar", "AI Assistant accessed", "General Assistant", "Success"],
    ["Priya Chandran", "Document queried", "Q3-Financials.pdf", "Success"],
    ["Meera Krishnan", "AI configuration updated", "Code Assistant", "Success"],
    ["Divya Suresh", "Role changed", "Karthik Ramasamy", "Success"],
    ["Vignesh Raja", "Approval submitted", "Document Intelligence access", "Pending"],
    ["Ananya Iyer", "User signed in", "—", "Success"],
  ];
  const insertAudit = db.prepare(
    "INSERT INTO audit_events (user_name, action, resource, result) VALUES (?, ?, ?, ?)"
  );
  for (const row of auditEvents) insertAudit.run(...row);

  const notifications = [
    ["Approvals", "New request from Arun Kumar", "Document Intelligence access"],
    ["AI Activity", "Weekly usage report ready", "Engineering team"],
    ["System", "Scheduled maintenance", "Sunday, 2:00 AM IST"],
  ];
  const insertNotif = db.prepare(
    "INSERT INTO notifications (category, title, description) VALUES (?, ?, ?)"
  );
  for (const row of notifications) insertNotif.run(...row);

  console.log("Seed complete. Demo login: meera.krishnan@nexora.ai / password123 (Admin)");
}

seed();

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
  `);
}

initSchema();

module.exports = db;

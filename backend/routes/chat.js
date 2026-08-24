/**
 * Maps to: AIHub component in Nexora.jsx
 * Endpoints:
 *   GET  /api/conversations                       -> sidebar conversation list
 *   GET  /api/conversations/:id/messages          -> chat history for a thread
 *   POST /api/chat                                -> send a message, get AI reply + sources
 *
 * Intentionally isolated from every other route: this is the only file
 * that talks to an LLM, so swapping providers or wiring in real RAG
 * later never touches users/audit/approvals code.
 */
const express = require("express");
const db = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Tiny mock "knowledge base" standing in for a real document store /
// vector index. Replace with real embeddings + a vector DB when you
// wire up actual document ingestion.
const MOCK_KNOWLEDGE_BASE = [
  { title: "Employee Handbook.pdf", page: 24, keywords: ["remote", "work", "handbook", "leave", "policy"] },
  { title: "Q3-Financials.pdf", page: 6, keywords: ["sales", "revenue", "finance", "q3", "budget"] },
];

function retrieveSources(query) {
  const q = query.toLowerCase();
  const matches = [];
  for (const doc of MOCK_KNOWLEDGE_BASE) {
    const overlap = doc.keywords.filter((kw) => q.includes(kw)).length;
    if (overlap > 0) {
      matches.push({ title: doc.title, page: doc.page, relevance: Math.min(60 + overlap * 15, 99) });
    }
  }
  return matches;
}

const SYSTEM_PROMPTS = {
  general: "You are a helpful, concise company-wide assistant.",
  docs: "You answer strictly using the referenced document context provided. Cite sources.",
  code: "You are a software engineering copilot. Answer with code and brief explanations.",
};

async function callLLM(assistantId, userMessage, sources) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    if (sources.length > 0) {
      const cited = sources.map((s) => s.title).join(", ");
      return `[Demo mode — no LLM key configured] Based on ${cited}, here is a synthesized answer to: "${userMessage}"`;
    }
    return `[Demo mode — no LLM key configured] You asked: "${userMessage}". Configure OPENAI_API_KEY to get real answers.`;
  }

  const context = sources.length
    ? "\n\nRelevant context: " + sources.map((s) => `${s.title} (p.${s.page})`).join("; ")
    : "";

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[assistantId] || SYSTEM_PROMPTS.general },
        { role: "user", content: userMessage + context },
      ],
      max_tokens: 500,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI API error: ${resp.status} ${errText}`);
  }

  const data = await resp.json();
  return data.choices[0].message.content;
}

router.get("/conversations", authenticate, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM conversations WHERE owner_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json(rows);
});

router.get("/conversations/:id/messages", authenticate, (req, res) => {
  const convo = db
    .prepare("SELECT * FROM conversations WHERE id = ? AND owner_id = ?")
    .get(req.params.id, req.user.id);
  if (!convo) return res.status(404).json({ detail: "Conversation not found" });

  const rows = db
    .prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC")
    .all(req.params.id);

  res.json(rows.map((m) => ({ ...m, sources: JSON.parse(m.sources_json) })));
});

router.post("/chat", authenticate, async (req, res) => {
  const { conversation_id, assistant_id = "general", message } = req.body;
  if (!message) return res.status(400).json({ detail: "message is required" });

  const assistant = db.prepare("SELECT * FROM assistants WHERE id = ?").get(assistant_id);
  if (!assistant || !assistant.available) {
    return res.status(403).json({ detail: "This assistant is not currently available" });
  }

  let convo;
  if (conversation_id) {
    convo = db
      .prepare("SELECT * FROM conversations WHERE id = ? AND owner_id = ?")
      .get(conversation_id, req.user.id);
    if (!convo) return res.status(404).json({ detail: "Conversation not found" });
  } else {
    const info = db
      .prepare("INSERT INTO conversations (owner_id, title, assistant_id) VALUES (?, ?, ?)")
      .run(req.user.id, message.slice(0, 40), assistant_id);
    convo = db.prepare("SELECT * FROM conversations WHERE id = ?").get(info.lastInsertRowid);
  }

  db.prepare(
    "INSERT INTO messages (conversation_id, role, text) VALUES (?, 'user', ?)"
  ).run(convo.id, message);

  try {
    const sources = assistant_id === "docs" ? retrieveSources(message) : [];
    const replyText = await callLLM(assistant_id, message, sources);

    db.prepare(
      "INSERT INTO messages (conversation_id, role, text, sources_json) VALUES (?, 'ai', ?, ?)"
    ).run(convo.id, replyText, JSON.stringify(sources));

    db.prepare(
      "INSERT INTO audit_events (user_name, action, resource, result) VALUES (?, ?, ?, ?)"
    ).run(req.user.name, "AI Assistant accessed", assistant.name, "Success");

    res.json({ conversation_id: convo.id, reply: replyText, sources });
  } catch (err) {
    console.error(err);
    res.status(502).json({ detail: "The AI provider returned an error. Please try again." });
  }
});

module.exports = router;

# Nexora Backend (Node.js + Express)

Express backend for the Nexora AI Enterprise Operating System frontend.
Built as **one module per frontend component**, so each piece can be
worked on, tested, or replaced independently — same JavaScript stack
as your frontend, no context-switching between languages.

## Module Map (Frontend Component → Backend Route File)

| Frontend Component | Route File | Endpoints |
|---|---|---|
| `Login` | `routes/auth.js` | `POST /api/auth/login` |
| `AdminUsers` / `PeopleTable` | `routes/users.js` | `GET/PATCH /api/users` |
| `AdminAudit` | `routes/audit.js` | `GET /api/audit` |
| `AdminAIConfig` | `routes/assistants.js` | `GET/PATCH /api/assistants` |
| `ManagerApprovals` | `routes/approvals.js` | `GET/POST /api/approvals` |
| `AIHub` (chat) | `routes/chat.js` | `GET /api/conversations`, `POST /api/chat` |
| `NotificationDrawer` | `routes/notifications.js` | `GET /api/notifications` |
| `AdminDashboard`/`ManagerDashboard`/`EmployeeDashboard` | `routes/dashboard.js` | `GET /api/dashboard/{role}` |

## Setup

```bash
cd backend-node
npm install
npm run seed     # creates nexora.db + demo data (run once)
npm run dev       # starts server on http://127.0.0.1:8000 with auto-restart
```

Plain start (no auto-restart): `npm start`

### Demo login
Every seeded user shares the password `password123`. Try:
- `meera.krishnan@nexora.ai` → Admin
- `divya.suresh@nexora.ai` → Manager
- `arun.kumar@nexora.ai` → Employee

## Enabling Real AI Responses (optional)
By default, `POST /api/chat` runs in **demo mode** (no cost, no key
needed) and returns a clearly labeled placeholder reply. To get real
LLM answers, create a `.env` file (copy `.env.example`) and set:

```
OPENAI_API_KEY=sk-...
```

## Connecting the Frontend
Replace the hardcoded mock arrays in `Nexora.jsx` with `fetch` calls. Store
the token in React state (`useState`), not `localStorage` — this project's
artifact sandbox disallows browser storage, and it's good practice anyway
for a first pass.

```js
// Login component — replace the onLogin(role) call with:
const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { access_token, role, name, dept } = await res.json();
// store access_token in a parent useState, then setRole(role), setAuthed(true)
```

```js
// AIHub component — replace the send() function's setMsgs(...) with:
const res = await fetch("http://127.0.0.1:8000/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ assistant_id: assistant, message: input, conversation_id: convoId }),
});
const { reply, sources, conversation_id } = await res.json();
```

Every protected endpoint expects an `Authorization: Bearer <token>` header.

## Project Structure
```
backend-node/
├── server.js              # Express app + route registration
├── db.js                   # SQLite connection + schema
├── seed.js                  # Demo data matching the frontend mocks
├── middleware/
│   └── auth.js                # JWT verification + role guard
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── audit.js
│   ├── assistants.js
│   ├── approvals.js
│   ├── chat.js
│   ├── notifications.js
│   └── dashboard.js
├── .env.example
└── package.json
```

## Why better-sqlite3
It's synchronous (no callback/promise noise for simple CRUD), fast, and
needs zero external database setup — ideal for a final-year project
demo. Swap `db.js` for a Postgres/MySQL client later without touching
any route file, since every route only calls `db.prepare(...)`.

## Future Scope
- Replace the `MOCK_KNOWLEDGE_BASE` keyword search in `routes/chat.js`
  with real embeddings + a vector DB (e.g. via `langchain` or `pinecone`
  npm packages) for genuine RAG.
- Add file upload endpoints (`multer`) so `docs`/`kb` pages can ingest
  real PDFs.
- Add Socket.io for real-time chat streaming instead of request/response.
- Add refresh tokens / logout endpoint for production auth hardening.

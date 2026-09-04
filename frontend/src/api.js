// Thin wrapper around fetch() for talking to the Nexora backend.
// Base URL comes from Vite env var so it's easy to point at a different
// host in production (see .env.example).
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("nexora_token");
}

function setToken(token) {
  if (token) localStorage.setItem("nexora_token", token);
  else localStorage.removeItem("nexora_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.detail || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password }, auth: false }),
  register: (payload) =>
    request("/api/auth/register", { method: "POST", body: payload, auth: false }),

  // Users
  getUsers: () => request("/api/users"),
  createUser: (payload) => request("/api/users", { method: "POST", body: payload }),
  updateUser: (id, patch) => request(`/api/users/${id}`, { method: "PATCH", body: patch }),

  // Audit
  getAuditLog: (limit = 50) => request(`/api/audit?limit=${limit}`),

  // Assistants
  getAssistants: () => request("/api/assistants"),
  updateAssistant: (id, patch) => request(`/api/assistants/${id}`, { method: "PATCH", body: patch }),

  // Approvals
  getApprovals: (status = "Pending") => request(`/api/approvals?status=${status}`),
  createApproval: (payload) => request("/api/approvals", { method: "POST", body: payload }),
  approveRequest: (id) => request(`/api/approvals/${id}/approve`, { method: "POST" }),
  rejectRequest: (id) => request(`/api/approvals/${id}/reject`, { method: "POST" }),

  // Chat / AI Hub
  getConversations: () => request("/api/conversations"),
  getMessages: (conversationId) => request(`/api/conversations/${conversationId}/messages`),
  sendMessage: (payload) => request("/api/chat", { method: "POST", body: payload }),

  // Notifications
  getNotifications: () => request("/api/notifications"),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),

  // Dashboard
  getDashboard: (role) => request(`/api/dashboard/${role.toLowerCase()}`),
};

export { getToken, setToken };

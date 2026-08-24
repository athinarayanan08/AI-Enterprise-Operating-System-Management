import React, { useState, useEffect, useMemo, useRef } from "react";
import { api, setToken } from "./api";
import {
  LayoutGrid, Sparkles, BookOpen, FileText, Inbox, CheckSquare, ListChecks,
  BarChart3, FileBarChart, Users, ShieldCheck, SlidersHorizontal, Search,
  Bell, HelpCircle, ChevronDown, ChevronRight, Menu, X, Plus, Paperclip,
  ArrowUpRight, Send, Copy, RotateCcw, Bookmark, Share2, ThumbsUp, ThumbsDown,
  Filter, Download, MoreHorizontal, Lock, ArrowLeft, Command as CommandIcon, LogOut,
  Eye, EyeOff,
} from "lucide-react";

/* ============================== DESIGN TOKENS ============================== */
const C = {
  navy: "#0B1220",
  navyLight: "#141C2C",
  charcoal: "#151A22",
  ivory: "#F7F5EF",
  cream: "#EFECE5",
  gold: "#B79A5B",
  goldSoft: "#D9C79A",
  burgundy: "#6E3B3B",
  slate: "#6B7280",
  slateLight: "#9CA3AF",
  green: "#4C7A63",
  redMuted: "#8B4444",
  border: "#E4E0D6",
  borderDark: "#242C3B",
  textDark: "#1B2130",
  textMuted: "#6B7280",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&display=swap');
.nx { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; color: ${C.textDark}; }
.nx-serif { font-family: 'Playfair Display', Georgia, serif; }
.nx * { box-sizing: border-box; }
.nx ::selection { background: ${C.gold}33; }
.nx button, .nx input { font-family: inherit; }
.nx input:focus, .nx button:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
.nx-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.nx-scroll::-webkit-scrollbar-thumb { background: #D8D3C6; border-radius: 3px; }
.nx-fade { animation: nxfade .25s ease both; }
@keyframes nxfade { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .nx-fade { animation: none; } }
`;

/* ============================== STATIC CONFIG ============================== */
const DEPARTMENTS = ["Engineering", "Finance", "Operations", "Human Resources", "Sales", "Marketing", "Product", "Legal"];

const NAV = {
  Admin: [
    { group: "Overview", items: [{ id: "admin", label: "Dashboard", icon: LayoutGrid }] },
    { group: "Intelligence", items: [{ id: "ai", label: "AI Assistant", icon: Sparkles }, { id: "kb", label: "Knowledge Base", icon: BookOpen }, { id: "docs", label: "Documents", icon: FileText }] },
    { group: "Administration", items: [{ id: "admin-users", label: "User Management", icon: Users }, { id: "admin-audit", label: "Audit Logs", icon: ShieldCheck }, { id: "admin-ai", label: "AI Configuration", icon: SlidersHorizontal }] },
  ],
  Manager: [
    { group: "Overview", items: [{ id: "manager", label: "Dashboard", icon: LayoutGrid }] },
    { group: "Intelligence", items: [{ id: "ai", label: "AI Assistant", icon: Sparkles }, { id: "kb", label: "Knowledge Base", icon: BookOpen }] },
    { group: "Workflow", items: [{ id: "manager-approvals", label: "Approvals", icon: Inbox }, { id: "manager-team", label: "Team", icon: Users }] },
    { group: "Insights", items: [{ id: "manager-analytics", label: "Analytics", icon: BarChart3 }] },
  ],
  Employee: [
    { group: "Overview", items: [{ id: "employee", label: "Dashboard", icon: LayoutGrid }] },
    { group: "Intelligence", items: [{ id: "ai", label: "AI Assistant", icon: Sparkles }, { id: "docs", label: "Documents", icon: FileText }] },
    { group: "Workflow", items: [{ id: "requests", label: "Requests", icon: CheckSquare }, { id: "tasks", label: "Tasks", icon: ListChecks }] },
  ],
};

/* ============================== SMALL PRIMITIVES ============================== */
function Logo({ dark }) {
  const fg = dark ? C.ivory : C.navy;
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect x="0.5" y="0.5" width="25" height="25" rx="6" fill="none" stroke={C.gold} strokeWidth="1" />
        <path d="M7 19V7h2.1l7.8 8.6V7H19v12h-2.1L9.1 10.4V19H7z" fill={fg} />
      </svg>
      <div className="leading-tight">
        <div className="nx-serif" style={{ fontSize: 16, color: fg, letterSpacing: "0.02em" }}>NEXORA</div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded"
      style={{ background: `${C.gold}22`, color: C.gold, border: `1px solid ${C.gold}55` }}
    >
      {role}
    </span>
  );
}

function StatusDot({ status }) {
  const color = status === "Active" ? C.green : status === "Away" ? C.gold : C.slateLight;
  return <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />;
}

function Avatar({ name, size = 32 }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size, background: C.navy, color: C.goldSoft, fontSize: size * 0.36, fontWeight: 600 }}
    >
      {initials}
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2" style={{ color: C.gold }}>
            {eyebrow}
          </div>
        )}
        <h1 className="nx-serif" style={{ fontSize: 30, color: C.textDark, lineHeight: 1.15 }}>{title}</h1>
        {subtitle && <p className="mt-2 text-[14px]" style={{ color: C.textMuted, maxWidth: 520 }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function Card({ children, className = "", style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg ${className}`}
      style={{ border: `1px solid ${C.border}`, ...style }}
    >
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", icon: Icon, ...props }) {
  const styles = {
    primary: { background: C.navy, color: C.ivory, border: `1px solid ${C.navy}` },
    gold: { background: C.gold, color: C.navy, border: `1px solid ${C.gold}` },
    outline: { background: "transparent", color: C.textDark, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.textMuted, border: "1px solid transparent" },
    danger: { background: "transparent", color: C.redMuted, border: `1px solid ${C.redMuted}55` },
  };
  return (
    <button
      {...props}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium transition-all duration-200 hover:opacity-85 active:scale-[0.98]"
      style={styles[variant]}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function EmptyState({ title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-10 h-px mb-5" style={{ background: C.gold }} />
      <div className="nx-serif" style={{ fontSize: 20, color: C.textDark }}>{title}</div>
      <p className="mt-2 text-[13px] max-w-xs" style={{ color: C.textMuted }}>{desc}</p>
      {action}
    </div>
  );
}

/* ============================== METRIC MODULES ============================== */
function MetricHero({ label, value, delta, tone = "default" }) {
  const deltaColor = delta?.startsWith("+") ? C.green : C.redMuted;
  return (
    <Card className="p-5 flex-1 min-w-[150px]">
      <div className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: C.textMuted }}>{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="nx-serif" style={{ fontSize: 30, color: C.textDark }}>{value}</span>
        {delta && <span className="text-[12px] font-medium" style={{ color: deltaColor }}>{delta}</span>}
      </div>
    </Card>
  );
}

function MiniBars({ data, colorFn }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ height: `${(d.v / max) * 100}%`, background: colorFn ? colorFn(i) : C.gold, opacity: 0.35 + (d.v / max) * 0.65 }} title={`${d.v}`} />
      ))}
    </div>
  );
}

const ACTIVITY_30D = Array.from({ length: 30 }, (_, i) => ({ v: 20 + Math.round(Math.sin(i / 3) * 12 + i * 1.4 + (i % 5) * 3) }));

/* ============================== SIDEBAR ============================== */
function Sidebar({ role, view, setView, collapsed, mobileOpen, setMobileOpen }) {
  const groups = NAV[role];
  const width = collapsed ? 76 : 264;
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "#00000055" }} onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className="fixed lg:sticky top-0 h-screen shrink-0 z-50 transition-all duration-200 flex flex-col"
        style={{
          width,
          background: C.navy,
          transform: mobileOpen || typeof window === "undefined" ? "translateX(0)" : undefined,
          left: 0,
        }}
      >
        <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.borderDark}` }}>
          {!collapsed ? (
            <div>
              <Logo dark />
              <div className="text-[10px] mt-1.5 tracking-wide" style={{ color: C.slateLight }}>AI Enterprise Operating System</div>
            </div>
          ) : (
            <Logo dark />
          )}
          <button className="lg:hidden" onClick={() => setMobileOpen(false)} style={{ color: C.ivory }}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto nx-scroll py-4 px-3">
          {groups.map((g) => (
            <div key={g.group} className="mb-5">
              {!collapsed && (
                <div className="px-2.5 mb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: "#5C6478" }}>
                  {g.group}
                </div>
              )}
              {g.items.map((item) => {
                const active = view === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setView(item.id); setMobileOpen(false); }}
                    title={collapsed ? item.label : undefined}
                    className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-md mb-0.5 text-[13.5px] transition-all duration-200 relative"
                    style={{
                      color: active ? C.ivory : "#B7BECC",
                      background: active ? "#1B2436" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#161F30"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full" style={{ background: C.gold }} />}
                    <Icon size={16} style={{ color: active ? C.gold : "#7C8497" }} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

/* ============================== TOPBAR ============================== */
function TopBar({ role, user, onMenu, onPalette, onNotify, view, onSignOut }) {
  const crumbs = { admin: "Dashboard", "admin-users": "People & Access", "admin-audit": "Audit Log", "admin-ai": "AI Control Room", manager: "Dashboard", "manager-approvals": "Approvals", "manager-team": "Team", "manager-analytics": "Analytics", employee: "Workspace", ai: "AI Assistant Hub" };
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-5 py-3" style={{ background: `${C.ivory}F5`, backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-3 min-w-0">
        <button className="lg:hidden" onClick={onMenu}><Menu size={19} /></button>
        <div className="text-[13px] hidden sm:block truncate" style={{ color: C.textMuted }}>
          NEXORA <ChevronRight className="inline mx-1 -mt-0.5" size={12} /> <span style={{ color: C.textDark }}>{crumbs[view] || "Workspace"}</span>
        </div>
      </div>

      <button
        onClick={onPalette}
        className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-md flex-1 max-w-md text-[13px]"
        style={{ background: "#fff", border: `1px solid ${C.border}`, color: C.textMuted }}
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search people, documents, conversations...</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${C.border}`, color: C.textMuted }}>⌘K</span>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onPalette} className="md:hidden p-2"><Search size={17} /></button>
        <button onClick={onNotify} className="p-2 relative" style={{ color: C.textMuted }}>
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: C.burgundy }} />
        </button>
        <button className="p-2 hidden sm:block" style={{ color: C.textMuted }}><HelpCircle size={17} /></button>
        <div className="w-px h-6 mx-1 hidden sm:block" style={{ background: C.border }} />
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((m) => !m)} className="flex items-center gap-2">
            <Avatar name={user.name} />
            <div className="hidden sm:block leading-tight text-left">
              <div className="text-[13px] font-medium">{user.name}</div>
              <RoleBadge role={role} />
            </div>
            <ChevronDown size={13} style={{ color: C.textMuted }} className="hidden sm:block" />
          </button>
          {menuOpen && (
            <div className="nx-fade absolute right-0 top-full mt-2 w-48 rounded-md bg-white overflow-hidden z-50" style={{ border: `1px solid ${C.border}`, boxShadow: "0 8px 24px rgba(11,18,32,0.08)" }}>
              <div className="px-3.5 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="text-[13px] font-medium">{user.name}</div>
                <div className="text-[11.5px]" style={{ color: C.textMuted }}>{user.dept}</div>
              </div>
              <button
                onClick={() => { setMenuOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-left hover:bg-[#F7F5EF]"
                style={{ color: C.redMuted }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============================== COMMAND PALETTE ============================== */
function CommandPalette({ open, onClose, setView }) {
  const [q, setQ] = useState("");
  const results = [
    { icon: Users, title: "Arun Kumar", cat: "People", meta: "Engineering", go: "admin-users" },
    { icon: FileText, title: "Employee Handbook.pdf", cat: "Documents", meta: "Updated 3d ago", go: "docs" },
    { icon: Sparkles, title: "Q3 sales analysis", cat: "AI Conversations", meta: "Today", go: "ai" },
    { icon: Inbox, title: "Document Intelligence access", cat: "Requests", meta: "Pending", go: "manager-approvals" },
    { icon: FileBarChart, title: "Team analytics report", cat: "Reports", meta: "This week", go: "manager-analytics" },
  ].filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4" style={{ background: "#0B122099" }} onClick={onClose}>
      <div className="nx-fade w-full max-w-lg rounded-lg overflow-hidden" style={{ background: "#fff", border: `1px solid ${C.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          <Search size={15} style={{ color: C.textMuted }} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people, documents, conversations..." className="flex-1 text-[14px] outline-none" />
          <button onClick={onClose}><X size={16} style={{ color: C.textMuted }} /></button>
        </div>
        <div className="max-h-80 overflow-y-auto nx-scroll py-1.5">
          {results.length === 0 && <div className="px-4 py-6 text-center text-[13px]" style={{ color: C.textMuted }}>No results</div>}
          {results.map((r, i) => (
            <button key={i} onClick={() => { setView(r.go); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F7F5EF]">
              <r.icon size={15} style={{ color: C.gold }} />
              <span className="flex-1 text-[13.5px]">{r.title}</span>
              <span className="text-[11px]" style={{ color: C.textMuted }}>{r.meta}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.cream, color: C.textMuted }}>{r.cat}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== NOTIFICATION DRAWER ============================== */
function NotificationDrawer({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!open) return;
    api.getNotifications().then(setNotifications).catch(console.error);
  }, [open]);

  async function handleClick(n) {
    if (n.unread) {
      try {
        await api.markNotificationRead(n.id);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`}>
      <div onClick={onClose} className="absolute inset-0 transition-opacity duration-200" style={{ background: "#0B122055", opacity: open ? 1 : 0 }} />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white transition-transform duration-200" style={{ transform: open ? "translateX(0)" : "translateX(100%)", borderLeft: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="nx-serif text-[18px]">Notifications</div>
          <button onClick={onClose}><X size={17} /></button>
        </div>
        <div className="overflow-y-auto nx-scroll" style={{ height: "calc(100% - 60px)" }}>
          {notifications.length === 0 && (
            <div className="px-5 py-8 text-[13px]" style={{ color: C.textMuted }}>No notifications.</div>
          )}
          {notifications.map((n) => (
            <div key={n.id} onClick={() => handleClick(n)} className="px-5 py-4 flex gap-3 cursor-pointer" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="mt-1.5">{n.unread && <span className="block w-1.5 h-1.5 rounded-full" style={{ background: C.gold }} />}</div>
              <div className="flex-1">
                <div className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: C.gold }}>{n.category}</div>
                <div className="text-[13.5px] font-medium mt-0.5">{n.title}</div>
                <div className="text-[12.5px]" style={{ color: C.textMuted }}>{n.description}</div>
              </div>
              <div className="text-[11px] shrink-0" style={{ color: C.textMuted }}>{new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== DATA TABLE (People) ============================== */
function PeopleTable({ editable }) {
  const [people, setPeople] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getUsers()
      .then((rows) => setPeople(rows.map((u) => ({
        id: u.id, name: u.name, dept: u.dept, role: u.role, status: u.status,
        usage: u.usage_percent, last: u.last_active,
      }))))
      .catch(console.error);
  }, []);

  const person = people.find((p) => p.id === openRow);

  async function handleRoleChange(newRole) {
    setSaving(true);
    try {
      const updated = await api.updateUser(person.id, { role: newRole });
      setPeople((prev) => prev.map((p) => (p.id === person.id ? { ...p, role: updated.role, status: updated.status, dept: updated.dept } : p)));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <Card className="overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: C.cream }}>
              {["Name", "Department", "Role", "Status", "AI usage", "Last active", ""].map((h) => (
                <th key={h} className="text-left font-medium px-4 py-3" style={{ color: C.textMuted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center" style={{ color: C.textMuted }}>Loading users…</td></tr>
            )}
            {people.map((p) => (
              <tr key={p.id} className="group cursor-pointer" style={{ borderTop: `1px solid ${C.border}` }} onClick={() => setOpenRow(p.id)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5"><Avatar name={p.name} size={28} /><span className="font-medium">{p.name}</span></div>
                </td>
                <td className="px-4 py-3" style={{ color: C.textMuted }}>{p.dept}</td>
                <td className="px-4 py-3">{p.role}</td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><StatusDot status={p.status} />{p.status}</span></td>
                <td className="px-4 py-3" style={{ color: C.textMuted }}>{p.usage}%</td>
                <td className="px-4 py-3" style={{ color: C.textMuted }}>{p.last}</td>
                <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100"><MoreHorizontal size={15} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {person && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0" style={{ background: "#0B122055" }} onClick={() => setOpenRow(null)} />
          <div className="nx-fade absolute right-0 top-0 h-full w-full max-w-sm bg-white p-6 overflow-y-auto" style={{ borderLeft: `1px solid ${C.border}` }}>
            <button onClick={() => setOpenRow(null)} className="mb-6 flex items-center gap-1 text-[13px]" style={{ color: C.textMuted }}><ArrowLeft size={14} />Close</button>
            <div className="flex items-center gap-3 mb-6"><Avatar name={person.name} size={48} /><div><div className="nx-serif text-[19px]">{person.name}</div><div className="text-[13px]" style={{ color: C.textMuted }}>{person.dept}</div></div></div>
            {[["Role", editable ? <select disabled={saving} defaultValue={person.role} onChange={(e) => handleRoleChange(e.target.value)} className="text-[13px] px-2 py-1 rounded" style={{ border: `1px solid ${C.border}` }}><option>Admin</option><option>Manager</option><option>Employee</option></select> : person.role],
              ["Status", <span className="inline-flex items-center gap-1.5"><StatusDot status={person.status} />{person.status}</span>],
              ["AI usage this month", `${person.usage}%`],
              ["Last login", person.last]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-3" style={{ borderTop: `1px solid ${C.border}` }}>
                <span className="text-[12.5px]" style={{ color: C.textMuted }}>{k}</span><span className="text-[13px]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== ADMIN DASHBOARD ============================== */
function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getDashboard("admin").then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="nx-fade text-[13px]" style={{ color: C.textMuted }}>Loading dashboard…</div>;

  const activityChart = data.activity_30d.map((v) => ({ v }));
  const avgSessions = Math.round(data.activity_30d.reduce((a, b) => a + b, 0) / data.activity_30d.length);

  return (
    <div className="nx-fade">
      <SectionHeading eyebrow="Enterprise Overview" title="Your enterprise, in one view." subtitle="Monitor the intelligence environment across your organization." right={<div className="text-[12px] text-right" style={{ color: C.textMuted }}>System status<br /><span style={{ color: C.green }}>● Operational</span></div>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2 p-6" style={{ background: C.navy, border: "none" }}>
          <div className="nx-serif" style={{ fontSize: 24, color: C.ivory, lineHeight: 1.25 }}>Your enterprise,<br />in one view.</div>
          <p className="mt-3 text-[13.5px]" style={{ color: "#AEB6C6", maxWidth: 380 }}>Every assistant, request and decision across NEXORA — surfaced in one composed workspace.</p>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: C.textMuted }}>AI environment status</div>
          {[["System health", data.system_health], ["AI services", "5/5 online"], ["Active users", data.total_users], ["Security", "No incidents"]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 text-[13px]" style={{ borderTop: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMuted }}>{k}</span><span className="font-medium">{v}</span>
            </div>
          ))}
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <MetricHero label="Total users" value={data.total_users} delta="+8.4%" />
        <MetricHero label="Active AI sessions" value={data.active_ai_sessions} delta="+12.7%" />
        <MetricHero label="System health" value={data.system_health} delta="Operational" />
        <MetricHero label="Pending approvals" value={data.pending_approvals} delta="Needs attention" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-semibold">AI activity — 30 days</div>
            <span className="text-[11px]" style={{ color: C.textMuted }}>Avg. {avgSessions} sessions/day</span>
          </div>
          <MiniBars data={activityChart} />
        </Card>
        <Card className="p-6">
          <div className="text-[13px] font-semibold mb-4">Most used assistants</div>
          {data.most_used_assistants.map((a) => (
            <div key={a.id} className="mb-3">
              <div className="flex justify-between text-[12.5px] mb-1"><span>{a.name}</span><span style={{ color: C.textMuted }}>{a.usage_percent}%</span></div>
              <div className="h-1 rounded-full" style={{ background: C.cream }}>
                <div className="h-1 rounded-full" style={{ width: `${a.usage_percent}%`, background: C.gold }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-[13px] font-semibold mb-4">Recent enterprise activity</div>
        {data.recent_activity.map((e) => (
          <div key={e.id} className="flex items-center gap-3 py-2.5 text-[13px]" style={{ borderTop: `1px solid ${C.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.gold }} />
            <span className="font-medium">{e.user_name}</span>
            <span style={{ color: C.textMuted }}>{e.action.toLowerCase()}</span>
            <span className="flex-1 text-right text-[11.5px]" style={{ color: C.textMuted }}>{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AdminUsers() {
  return (
    <div className="nx-fade">
      <SectionHeading eyebrow="Administration" title="People & Access" subtitle="Manage roles, permissions and enterprise-wide access." right={<Button variant="gold" icon={Plus}>Add user</Button>} />
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="outline" icon={Filter}>Department</Button>
        <Button variant="outline" icon={Filter}>Role</Button>
        <Button variant="outline" icon={Filter}>Status</Button>
        <span className="flex-1" />
        <Button variant="outline" icon={Download}>Export</Button>
      </div>
      <PeopleTable editable />
    </div>
  );
}

function AdminAudit() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.getAuditLog(50).then(setEvents).catch(console.error);
  }, []);

  return (
    <div className="nx-fade">
      <SectionHeading eyebrow="Administration" title="Audit Log" subtitle="Every action taken across the intelligence environment." />
      <Card className="divide-y" style={{ borderColor: C.border }}>
        {events.map((e) => (
          <div key={e.id} className="px-5 py-4 flex items-center gap-4 flex-wrap" style={{ borderTop: `1px solid ${C.border}` }}>
            <Avatar name={e.user_name} size={30} />
            <div className="min-w-[140px]">
              <div className="text-[13px] font-medium">{e.user_name}</div>
              <div className="text-[11.5px]" style={{ color: C.textMuted }}>{e.resource}</div>
            </div>
            <div className="flex-1 text-[13px]" style={{ color: C.textMuted }}>{e.action}</div>
            <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: e.result === "Success" ? `${C.green}18` : `${C.gold}22`, color: e.result === "Success" ? C.green : C.gold }}>{e.result}</span>
            <span className="text-[12px] w-16 text-right" style={{ color: C.textMuted }}>{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AdminAIConfig() {
  const [assistants, setAssistants] = useState([]);

  useEffect(() => {
    api.getAssistants().then(setAssistants).catch(console.error);
  }, []);

  async function toggle(a) {
    try {
      const updated = await api.updateAssistant(a.id, { available: !a.available });
      setAssistants((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="nx-fade">
      <SectionHeading eyebrow="Administration" title="AI Control Room" subtitle="Configure which assistants are available across the enterprise." />
      <Card className="divide-y" style={{ borderColor: C.border }}>
        {assistants.map((a) => (
          <div key={a.id} className="px-5 py-4 flex items-center gap-4 flex-wrap" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: C.cream }}><Sparkles size={16} style={{ color: C.gold }} /></div>
            <div className="min-w-[180px] flex-1">
              <div className="text-[13.5px] font-medium">{a.name}</div>
              <div className="text-[12px]" style={{ color: C.textMuted }}>{a.description}</div>
            </div>
            <div className="text-[12.5px] w-16" style={{ color: C.textMuted }}>{a.usage_percent}%</div>
            <button
              onClick={() => toggle(a)}
              className="w-10 h-5.5 rounded-full relative transition-colors"
              style={{ background: a.available ? C.gold : C.border, height: 22, width: 40 }}
            >
              <span className="absolute top-0.5 rounded-full bg-white transition-all" style={{ width: 18, height: 18, left: a.available ? 20 : 2 }} />
            </button>
            <Button variant="ghost" icon={SlidersHorizontal} />
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ============================== MANAGER DASHBOARD ============================== */
function ManagerDashboard({ setView }) {
  const [data, setData] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    api.getDashboard("manager").then(setData).catch(console.error);
    api.getApprovals("Pending")
      .then((rows) => setApprovals(rows.map((a) => ({ id: a.id, name: a.requester_name, dept: a.dept, request: a.request, when: new Date(a.created_at).toLocaleString() }))))
      .catch(console.error);
    api.getUsers().then(setTeam).catch(console.error);
  }, []);

  if (!data) return <div className="nx-fade text-[13px]" style={{ color: C.textMuted }}>Loading dashboard…</div>;

  return (
    <div className="nx-fade">
      <SectionHeading eyebrow="Team Intelligence" title="Team Intelligence" subtitle="Understand how your team works with AI." />
      <div className="flex flex-wrap gap-4 mb-4">
        <MetricHero label="Team size" value={data.team_size} />
        <MetricHero label="AI adoption" value={`${data.team_ai_usage_avg}%`} delta="+6.2%" />
        <MetricHero label="Pending approvals" value={data.pending_approvals} />
        <MetricHero label="Weekly activity" value="214" delta="+9.1%" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-semibold">Needs your attention</div>
            <button onClick={() => setView("manager-approvals")} className="text-[12px] font-medium" style={{ color: C.gold }}>View all</button>
          </div>
          {approvals.slice(0, 2).map((a) => <ApprovalCard key={a.id} a={a} compact />)}
        </Card>
        <Card className="p-6">
          <div className="text-[13px] font-semibold mb-4">Team, at a glance</div>
          <div className="flex -space-x-2 mb-4">
            {team.slice(0, 6).map((p) => <div key={p.id} style={{ border: `2px solid #fff`, borderRadius: 999 }}><Avatar name={p.name} size={32} /></div>)}
          </div>
          <MiniBars data={ACTIVITY_30D.slice(0, 14)} />
        </Card>
      </div>
    </div>
  );
}

function ApprovalCard({ a, compact, onResolved }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function resolve(action) {
    setLoading(true);
    try {
      const updated = action === "approve" ? await api.approveRequest(a.id) : await api.rejectRequest(a.id);
      setStatus(updated.status);
      onResolved?.(a.id, updated.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={`p-4 flex items-center gap-4 flex-wrap ${compact ? "mb-2" : "mb-3"}`}>
      <Avatar name={a.name} size={36} />
      <div className="min-w-[150px] flex-1">
        <div className="text-[13.5px] font-medium">{a.name} <span className="text-[11px] font-normal" style={{ color: C.textMuted }}>· {a.dept}</span></div>
        <div className="text-[12.5px]" style={{ color: C.textMuted }}>Requesting: {a.request}</div>
        <div className="text-[11px] mt-0.5" style={{ color: C.slateLight }}>{a.when}</div>
      </div>
      {status ? (
        <span className="text-[12px] font-medium px-2.5 py-1 rounded" style={{ background: status === "Approved" ? `${C.green}18` : `${C.redMuted}18`, color: status === "Approved" ? C.green : C.redMuted }}>{status}</span>
      ) : (
        <div className="flex gap-2">
          <Button variant="gold" disabled={loading} onClick={() => resolve("approve")}>Approve</Button>
          <Button variant="outline" disabled={loading} onClick={() => resolve("reject")}>Reject</Button>
          {!compact && <Button variant="ghost">View details</Button>}
        </div>
      )}
    </Card>
  );
}

function ManagerApprovals() {
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    api.getApprovals("Pending")
      .then((rows) => setApprovals(rows.map((a) => ({ id: a.id, name: a.requester_name, dept: a.dept, request: a.request, when: new Date(a.created_at).toLocaleString() }))))
      .catch(console.error);
  }, []);

  function handleResolved(id) {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="nx-fade">
      <SectionHeading eyebrow="Workflow" title="Approval Center" subtitle="Requests from your team that need a decision." />
      {approvals.length === 0 && <div className="text-[13px]" style={{ color: C.textMuted }}>No pending requests.</div>}
      {approvals.map((a) => <ApprovalCard key={a.id} a={a} onResolved={handleResolved} />)}
    </div>
  );
}

function ManagerTeam() {
  return (
    <div className="nx-fade">
      <SectionHeading eyebrow="Workflow" title="Team" subtitle="A read-only view of your team's people and activity." />
      <PeopleTable editable={false} />
    </div>
  );
}

function ManagerAnalytics() {
  const [range, setRange] = useState("30D");
  const [assistants, setAssistants] = useState([]);

  useEffect(() => {
    api.getAssistants().then(setAssistants).catch(console.error);
  }, []);

  return (
    <div className="nx-fade">
      <SectionHeading eyebrow="Insights" title="Team Analytics" subtitle="How your team is using enterprise intelligence." right={
        <div className="flex gap-1">
          {["7D", "30D", "90D"].map((r) => (
            <button key={r} onClick={() => setRange(r)} className="px-3 py-1.5 rounded-md text-[12px] font-medium" style={{ background: range === r ? C.navy : "transparent", color: range === r ? C.ivory : C.textMuted, border: `1px solid ${range === r ? C.navy : C.border}` }}>{r}</button>
          ))}
        </div>
      } />
      <Card className="p-6 mb-4">
        <div className="text-[13px] font-semibold mb-4">AI usage over time</div>
        <MiniBars data={ACTIVITY_30D} />
      </Card>
      <Card className="p-6">
        <div className="text-[13px] font-semibold mb-4">Assistant adoption</div>
        {assistants.slice(0, 4).map((a) => (
          <div key={a.id} className="mb-3">
            <div className="flex justify-between text-[12.5px] mb-1"><span>{a.name}</span><span style={{ color: C.textMuted }}>{a.usage_percent}%</span></div>
            <div className="h-1 rounded-full" style={{ background: C.cream }}><div className="h-1 rounded-full" style={{ width: `${a.usage_percent}%`, background: C.burgundy }} /></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ============================== EMPLOYEE DASHBOARD ============================== */
function EmployeeDashboard({ setView, user }) {
  const first = user.name.split(" ")[0];
  const [stats, setStats] = useState(null);
  const tiles = [
    { title: "Ask your documents", desc: "Find answers across company knowledge.", icon: FileText },
    { title: "Submit a request", desc: "Request access, approval or support.", icon: CheckSquare },
    { title: "Analyze data", desc: "Turn your data into insights.", icon: BarChart3 },
    { title: "My activity", desc: "Review your personal AI usage.", icon: ListChecks },
  ];

  useEffect(() => {
    api.getDashboard("employee").then(setStats).catch(console.error);
  }, []);

  return (
    <div className="nx-fade">
      <div className="mb-8">
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2" style={{ color: C.gold }}>Your Intelligence Workspace</div>
        <div className="nx-serif" style={{ fontSize: 30 }}>Good evening, {first}.</div>
        <div className="nx-serif mt-1" style={{ fontSize: 18, color: C.textMuted }}>What would you like to work on?</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {tiles.map((t) => (
          <Card key={t.title} onClick={() => setView("ai")} className="p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5" style={{ borderColor: C.border }}>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-md flex items-center justify-center mb-3" style={{ background: C.cream }}><t.icon size={16} style={{ color: C.gold }} /></div>
              <ArrowUpRight size={15} style={{ color: C.textMuted }} />
            </div>
            <div className="text-[14.5px] font-medium">{t.title}</div>
            <div className="text-[12.5px] mt-1" style={{ color: C.textMuted }}>{t.desc}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricHero label="AI sessions" value={stats ? stats.ai_sessions : "—"} />
        <MetricHero label="Documents analyzed" value={stats ? stats.documents_analyzed : "—"} />
        <MetricHero label="Requests submitted" value={stats ? stats.requests_submitted : "—"} />
      </div>
    </div>
  );
}

/* ============================== AI ASSISTANT HUB ============================== */
function AIHub({ role }) {
  const allowedByRole = { Admin: ["general", "docs", "code"], Manager: ["general", "docs"], Employee: ["general", "docs"] };
  const allowed = allowedByRole[role] || ["general"];

  const [assistants, setAssistants] = useState([]);
  const [assistant, setAssistant] = useState("general");
  const [showSources, setShowSources] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [sources, setSources] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getAssistants().then(setAssistants).catch(console.error);
    api.getConversations().then(setConversations).catch(console.error);
  }, []);

  async function openConversation(id) {
    setConversationId(id);
    try {
      const rows = await api.getMessages(id);
      setMsgs(rows.map((m) => ({ role: m.role, text: m.text })));
      const lastSources = rows.filter((m) => m.sources?.length).slice(-1)[0]?.sources || [];
      setSources(lastSources);
    } catch (err) {
      console.error(err);
    }
  }

  function newConversation() {
    setConversationId(null);
    setMsgs([]);
    setSources([]);
  }

  async function send() {
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text }]);
    setSending(true);
    try {
      const res = await api.sendMessage({ conversation_id: conversationId, assistant_id: assistant, message: text });
      setConversationId(res.conversation_id);
      setMsgs((m) => [...m, { role: "ai", text: res.reply }]);
      setSources(res.sources || []);
      // Refresh sidebar so a brand-new conversation shows up.
      api.getConversations().then(setConversations).catch(console.error);
    } catch (err) {
      setMsgs((m) => [...m, { role: "ai", text: `Error: ${err.message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="nx-fade flex flex-col lg:flex-row gap-4" style={{ height: "calc(100vh - 120px)" }}>
      {/* Conversations */}
      <div className="lg:w-64 shrink-0 flex flex-col">
        <Button variant="outline" icon={Plus} onClick={newConversation} className="mb-3 w-full justify-center">New conversation</Button>
        <div className="overflow-y-auto nx-scroll flex-1">
          {conversations.length === 0 && (
            <div className="text-[12.5px] px-1" style={{ color: C.textMuted }}>No conversations yet.</div>
          )}
          {conversations.map((c) => (
            <button key={c.id} onClick={() => openConversation(c.id)} className="w-full text-left px-2.5 py-2 rounded-md text-[13px] mb-0.5 hover:bg-white" style={{ color: C.textDark, background: conversationId === c.id ? "#fff" : "transparent" }}>{c.title}</button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <Card className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-5 py-3 flex-wrap" style={{ borderBottom: `1px solid ${C.border}` }}>
          {allowed.map((id) => {
            const a = assistants.find((x) => x.id === id);
            if (!a) return null;
            return (
              <button key={id} onClick={() => setAssistant(id)} className="px-3 py-1.5 rounded-md text-[12.5px] font-medium" style={{ background: assistant === id ? C.navy : "transparent", color: assistant === id ? C.ivory : C.textMuted, border: `1px solid ${assistant === id ? C.navy : C.border}` }}>{a.name}</button>
            );
          })}
          <span className="flex-1" />
          <button className="lg:hidden text-[12px]" style={{ color: C.gold }} onClick={() => setShowSources((s) => !s)}>Sources</button>
        </div>

        <div className="flex-1 overflow-y-auto nx-scroll px-6 py-6">
          {msgs.length === 0 && (
            <div className="text-[13px]" style={{ color: C.textMuted }}>Ask anything to start a new conversation.</div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className="mb-6 max-w-2xl" style={{ marginLeft: m.role === "user" ? "auto" : 0 }}>
              <div className="text-[10.5px] font-semibold tracking-wide uppercase mb-1.5" style={{ color: m.role === "user" ? C.textMuted : C.gold, textAlign: m.role === "user" ? "right" : "left" }}>{m.role === "user" ? "You" : "NEXORA"}</div>
              <div className="text-[14.5px] leading-relaxed" style={{ color: C.textDark, textAlign: m.role === "user" ? "right" : "left" }}>{m.text}</div>
              {m.role === "ai" && (
                <div className="flex items-center gap-3 mt-2.5">
                  {[Copy, RotateCcw, Bookmark, Share2, ThumbsUp, ThumbsDown].map((I, idx) => <I key={idx} size={13.5} style={{ color: C.textMuted, cursor: "pointer" }} />)}
                </div>
              )}
            </div>
          ))}
          {sending && <div className="text-[13px]" style={{ color: C.textMuted }}>NEXORA is thinking…</div>}
        </div>

        <div className="px-5 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md" style={{ border: `1px solid ${C.border}` }}>
            <Paperclip size={15} style={{ color: C.textMuted }} />
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask anything about your enterprise workspace..." className="flex-1 text-[13.5px] outline-none" />
            <span className="text-[10.5px] px-1.5 py-0.5 rounded" style={{ background: C.cream, color: C.textMuted }}>{assistants.find((a) => a.id === assistant)?.name}</span>
            <button onClick={send} disabled={sending} className="p-1.5 rounded-md" style={{ background: C.navy, color: C.ivory }}><Send size={13.5} /></button>
          </div>
        </div>
      </Card>

      {/* Sources */}
      {showSources && (
        <div className="lg:w-72 shrink-0">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-3 px-1" style={{ color: C.textMuted }}>Referenced sources</div>
          {sources.length === 0 && <div className="text-[12.5px] px-1" style={{ color: C.textMuted }}>No sources for this message.</div>}
          {sources.map((s) => (
            <Card key={s.title} className="p-4 mb-3 cursor-pointer hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center gap-2 mb-1.5"><FileText size={14} style={{ color: C.gold }} /><span className="text-[13px] font-medium truncate">{s.title}</span></div>
              <div className="text-[11.5px]" style={{ color: C.textMuted }}>Page {s.page} · {s.relevance}% relevance</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== SIMPLE PAGES (KB, Docs, Requests, Tasks) ============================== */
function SimplePage({ title, subtitle, icon: Icon }) {
  return (
    <div className="nx-fade">
      <SectionHeading eyebrow="Workspace" title={title} subtitle={subtitle} />
      <EmptyState title="Nothing here yet" desc="This area is ready for your content — start by connecting a source or creating an item." action={<div className="mt-5"><Button variant="gold" icon={Plus}>Get started</Button></div>} />
    </div>
  );
}

/* ============================== ACCESS RESTRICTED ============================== */
function AccessRestricted({ setView, role }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <Lock size={22} style={{ color: C.gold }} className="mb-5" />
      <div className="nx-serif" style={{ fontSize: 24 }}>Access restricted</div>
      <p className="mt-2 text-[13.5px] max-w-sm" style={{ color: C.textMuted }}>Your current role does not have permission to access this workspace.</p>
      <div className="mt-6"><Button variant="gold" onClick={() => setView(role === "Admin" ? "admin" : role === "Manager" ? "manager" : "employee")}>Return to dashboard</Button></div>
    </div>
  );
}

/* ============================== LOGIN ============================== */
function Login({ onLogin }) {
  const [role, setRole] = useState("Employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError("");
    setLoading(true);
    try {
      // Calls POST /api/auth/login on the Express backend.
      const data = await api.login(email, password);
      setToken(data.access_token); // stored in localStorage, sent as Bearer token on every future request
      onLogin({ role: data.role, name: data.name, dept: data.dept });
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nx grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <style>{FONTS}</style>
      <div className="hidden lg:flex flex-col justify-between p-14 relative overflow-hidden" style={{ background: C.navy }}>
        <svg className="absolute inset-0 opacity-[0.06]" width="100%" height="100%"><defs><pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse"><path d="M 46 0 L 0 0 0 46" fill="none" stroke="#fff" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
        <Logo dark />
        <div className="relative">
          <div className="nx-serif" style={{ fontSize: 42, color: C.ivory, lineHeight: 1.2 }}>Intelligence,<br />built for<br />the enterprise.</div>
          <p className="mt-5 text-[14.5px]" style={{ color: "#AEB6C6", maxWidth: 360 }}>One workspace for your people, knowledge and AI.</p>
        </div>
        <div className="relative text-[12px]" style={{ color: "#6E7896" }}>© NEXORA — Intelligence that moves your enterprise forward.</div>
      </div>

      <div className="flex items-center justify-center p-8" style={{ background: C.ivory }}>
        <div className="w-full max-w-sm">
          <Logo />
          <div className="nx-serif mt-8" style={{ fontSize: 24 }}>Welcome back</div>
          <p className="text-[13.5px] mt-1" style={{ color: C.textMuted }}>Sign in to your enterprise workspace.</p>

          <div className="mt-7 space-y-4">
            <div>
              <label className="text-[11.5px] font-medium" style={{ color: C.textMuted }}>Work email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full mt-1.5 px-3.5 py-2.5 rounded-md text-[13.5px]" style={{ border: `1px solid ${C.border}`, background: "#fff" }} />
            </div>
            <div>
              <label className="text-[11.5px] font-medium" style={{ color: C.textMuted }}>Password</label>
              <div className="relative mt-1.5">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-3.5 py-2.5 pr-10 rounded-md text-[13.5px]" style={{ border: `1px solid ${C.border}`, background: "#fff" }} />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <div className="text-[12.5px]" style={{ color: C.redMuted }}>{error}</div>}
            <div className="flex items-center justify-between text-[12.5px]">
              <label className="flex items-center gap-1.5" style={{ color: C.textMuted }}><input type="checkbox" defaultChecked />Remember me</label>
              <span style={{ color: C.gold }} className="cursor-pointer">Forgot password?</span>
            </div>

            <div>
              <label className="text-[11.5px] font-medium" style={{ color: C.textMuted }}>Demo role (for preview only)</label>
              <div className="flex gap-2 mt-1.5">
                {["Admin", "Manager", "Employee"].map((r) => (
                  <button key={r} onClick={() => setRole(r)} className="flex-1 py-2 rounded-md text-[12.5px] font-medium" style={{ background: role === r ? C.navy : "#fff", color: role === r ? C.ivory : C.textMuted, border: `1px solid ${role === r ? C.navy : C.border}` }}>{r}</button>
                ))}
              </div>
            </div>

            <button onClick={handleSignIn} disabled={loading} className="w-full py-2.5 rounded-md text-[13.5px] font-medium mt-2 transition-opacity hover:opacity-90 disabled:opacity-60" style={{ background: C.gold, color: C.navy }}>{loading ? "SIGNING IN…" : "SIGN IN"}</button>
          </div>

          <div className="mt-8 text-center text-[11.5px]" style={{ color: C.slateLight }}>Secure enterprise environment</div>
        </div>
      </div>
    </div>
  );
}

/* ============================== APP SHELL / ROOT ============================== */
export default function NexoraApp() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState("Employee");
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("employee");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setPaletteOpen((p) => !p); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const allowedViews = useMemo(() => new Set(NAV[role].flatMap((g) => g.items.map((i) => i.id)).concat(["ai"])), [role]);

  if (!authed) {
    return <Login onLogin={(user) => { setRole(user.role); setCurrentUser(user); setView(user.role.toLowerCase()); setAuthed(true); }} />;
  }

  const restricted = !allowedViews.has(view);

  const renderView = () => {
    if (restricted) return <AccessRestricted setView={setView} role={role} />;
    switch (view) {
      case "admin": return <AdminDashboard />;
      case "admin-users": return <AdminUsers />;
      case "admin-audit": return <AdminAudit />;
      case "admin-ai": return <AdminAIConfig />;
      case "manager": return <ManagerDashboard setView={setView} />;
      case "manager-approvals": return <ManagerApprovals />;
      case "manager-team": return <ManagerTeam />;
      case "manager-analytics": return <ManagerAnalytics />;
      case "employee": return <EmployeeDashboard setView={setView} user={currentUser} />;
      case "ai": return <AIHub role={role} />;
      case "kb": return <SimplePage title="Knowledge Base" subtitle="Company-wide documents and reference material." />;
      case "docs": return <SimplePage title="Documents" subtitle="Everything shared with you, organized." />;
      case "requests": return <SimplePage title="Requests" subtitle="Track requests you've submitted." />;
      case "tasks": return <SimplePage title="Tasks" subtitle="Items assigned to you." />;
      default: return <AccessRestricted setView={setView} role={role} />;
    }
  };

  return (
    <div className="nx flex min-h-screen" style={{ background: C.ivory }}>
      <style>{FONTS}</style>
      <Sidebar role={role} view={view} setView={setView} collapsed={collapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar role={role} user={currentUser} onMenu={() => setMobileOpen(true)} onPalette={() => setPaletteOpen(true)} onNotify={() => setNotifOpen(true)} view={view} onSignOut={() => { setToken(null); setAuthed(false); }} />
        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8 max-w-[1400px] w-full mx-auto">
          {renderView()}
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} setView={setView} />
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Role switcher for preview convenience */}
      <div className="fixed bottom-4 right-4 z-[70] flex gap-1.5 bg-white rounded-md p-1.5 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
        {["Admin", "Manager", "Employee"].map((r) => (
          <button key={r} onClick={() => { setRole(r); setView(r.toLowerCase()); }} className="px-2.5 py-1.5 rounded text-[11px] font-medium" style={{ background: role === r ? C.navy : "transparent", color: role === r ? C.ivory : C.textMuted }}>{r}</button>
        ))}
      </div>
    </div>
  );
}
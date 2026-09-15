import React, { useState, useEffect, useMemo, useRef } from "react";
import { api, setToken } from "./api";
import {
  LayoutGrid, Sparkles, BookOpen, FileText, Inbox, CheckSquare, ListChecks,
  BarChart3, FileBarChart, Users, ShieldCheck, SlidersHorizontal, Search,
  Bell, HelpCircle, ChevronDown, ChevronRight, Menu, X, Plus, Paperclip,
  ArrowUpRight, Send, Copy, RotateCcw, Bookmark, Share2, ThumbsUp, ThumbsDown,
  Filter, Download, MoreHorizontal, Lock, ArrowLeft, Command as CommandIcon, LogOut,
  Eye, EyeOff, Briefcase, AlertTriangle, Clock, CheckCircle2, Circle, ArrowRight,
  TrendingUp, Phone, Mail, Globe, Settings, Layers, Calendar
} from "lucide-react";

/* ============================== DESIGN TOKENS (GLASSMORPHIC DEEP PURPLE) ============================== */
const C = {
  // Deep Purple / Violet Theme (Image 3)
  bgDeep: "#0D061A",
  bgPurple: "#160A29",
  bgPanel: "rgba(35, 16, 64, 0.45)",
  bgGlass: "rgba(45, 23, 76, 0.55)",
  bgCard: "rgba(255, 255, 255, 0.04)",
  
  borderGlass: "rgba(168, 85, 247, 0.2)",
  borderGlow: "rgba(192, 132, 252, 0.35)",
  
  textLight: "#F5F3FF",
  textMuted: "#A78BFA",
  textSubtle: "#818CF8",
  
  accentViolet: "#A855F7",
  accentPurple: "#8B5CF6",
  accentPink: "#EC4899",
  accentCyan: "#06B6D4",
  accentOrange: "#F97316",
  accentGreen: "#10B981",
  
  // Dark Landing (Image 2)
  landingBg: "#0B0E14",
  landingCard: "#131722",
  landingBorder: "rgba(255, 255, 255, 0.08)",
  landingOrange: "#FF5E3A"
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');
.nx { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: ${C.textLight}; }
.nx-serif { font-family: 'Playfair Display', Georgia, serif; }
.nx * { box-sizing: border-box; }
.nx ::selection { background: rgba(168, 85, 247, 0.3); }
.nx button, .nx input, .nx select, .nx textarea { font-family: inherit; }
.nx input:focus, .nx button:focus-visible, .nx select:focus { outline: 2px solid ${C.accentViolet}; outline-offset: 2px; }
.nx-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.nx-scroll::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.3); border-radius: 3px; }
.nx-fade { animation: nxfade .25s ease-out both; }
@keyframes nxfade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.glass-panel {
  background: rgba(32, 16, 60, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(168, 85, 247, 0.2);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.glass-card:hover {
  border-color: rgba(168, 85, 247, 0.35);
  background: rgba(255, 255, 255, 0.07);
}
`;

/* ============================== STATIC CONFIG ============================== */
const DEPARTMENTS = ["Engineering", "Finance", "Operations", "Human Resources", "Sales", "Marketing", "Product", "Legal"];

const NAV = {
  Admin: [
    { group: "Overview", items: [{ id: "admin", label: "Dashboard", icon: LayoutGrid }] },
    { group: "Intelligence", items: [{ id: "ai", label: "AI Assistant", icon: Sparkles }, { id: "kb", label: "Knowledge Base", icon: BookOpen }, { id: "docs", label: "Documents", icon: FileText }] },
    { group: "Tasks & Work", items: [{ id: "tasks", label: "Task Management", icon: ListChecks }] },
    { group: "Administration", items: [{ id: "admin-users", label: "User Management", icon: Users }, { id: "admin-audit", label: "Audit Logs", icon: ShieldCheck }, { id: "admin-ai", label: "AI Configuration", icon: SlidersHorizontal }] },
  ],
  Manager: [
    { group: "Overview", items: [{ id: "manager", label: "Dashboard", icon: LayoutGrid }] },
    { group: "Intelligence", items: [{ id: "ai", label: "AI Assistant", icon: Sparkles }, { id: "kb", label: "Knowledge Base", icon: BookOpen }] },
    { group: "Tasks & Work", items: [{ id: "tasks", label: "Task Management", icon: ListChecks }] },
    { group: "Workflow", items: [{ id: "manager-approvals", label: "Approvals", icon: Inbox }, { id: "manager-team", label: "Team", icon: Users }] },
    { group: "Insights", items: [{ id: "manager-analytics", label: "Analytics", icon: BarChart3 }] },
  ],
  Employee: [
    { group: "Overview", items: [{ id: "employee", label: "Dashboard", icon: LayoutGrid }] },
    { group: "Intelligence", items: [{ id: "ai", label: "AI Assistant", icon: Sparkles }, { id: "docs", label: "Documents", icon: FileText }] },
    { group: "Workflow", items: [{ id: "tasks", label: "My Tasks", icon: ListChecks }, { id: "requests", label: "Requests", icon: CheckSquare }] },
  ],
};

/* ============================== PRIMITIVES ============================== */
function Logo({ dark = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, #A855F7 0%, #6366F1 100%)", border: "1px solid rgba(255,255,255,0.2)" }}>
        N
      </div>
      <div className="leading-tight">
        <div className="nx-serif font-bold text-lg tracking-wide" style={{ color: "#FFF" }}>NEXORA</div>
        <div className="text-[9px] tracking-widest uppercase" style={{ color: C.textMuted }}>Enterprise OS</div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const isDiff = role === "Admin" ? C.accentPink : role === "Manager" ? C.accentCyan : C.accentViolet;
  return (
    <span className="text-[9.5px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full" style={{ background: `${isDiff}22`, color: isDiff, border: `1px solid ${isDiff}44` }}>
      {role}
    </span>
  );
}

function StatusDot({ status }) {
  const color = status === "Active" || status === "Completed" ? C.accentGreen : status === "In Progress" || status === "Away" ? C.accentOrange : C.textMuted;
  return <span className="inline-block w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />;
}

function Avatar({ name, size = 34 }) {
  const initials = name ? name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "U";
  return (
    <div className="flex items-center justify-center rounded-full shrink-0 font-semibold" style={{ width: size, height: size, background: "linear-gradient(135deg, #4C1D95, #7C3AED)", color: "#FFF", fontSize: size * 0.38, border: "1px solid rgba(255,255,255,0.2)" }}>
      {initials}
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
      <div>
        {eyebrow && <div className="text-[11px] font-bold tracking-[0.16em] uppercase mb-1.5" style={{ color: C.accentViolet }}>{eyebrow}</div>}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[13.5px]" style={{ color: C.textMuted, maxWidth: 540 }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function GlassCard({ children, className = "", style = {}, onClick }) {
  return (
    <div onClick={onClick} className={`glass-card rounded-xl p-5 transition-all duration-200 ${className}`} style={style}>
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", icon: Icon, className = "", ...props }) {
  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 active:scale-[0.98]";
  const styles = {
    primary: { background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", color: "#FFF", boxShadow: "0 4px 14px rgba(168, 85, 247, 0.4)" },
    orange: { background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "#FFF", boxShadow: "0 4px 14px rgba(249, 115, 22, 0.4)" },
    glass: { background: "rgba(255, 255, 255, 0.06)", color: "#FFF", border: "1px solid rgba(255, 255, 255, 0.12)" },
    outline: { background: "transparent", color: C.textLight, border: `1px solid ${C.borderGlass}` },
    ghost: { background: "transparent", color: C.textMuted, border: "1px solid transparent" },
  };
  return (
    <button {...props} className={`${base} ${className}`} style={styles[variant] || styles.primary}>
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

/* ============================== FLOATING GLASS SIDEBAR (Image 3 Style) ============================== */
function FloatingSidebar({ role, view, setView, mobileOpen, setMobileOpen }) {
  const groups = NAV[role];

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setMobileOpen(false)} />}
      <aside
        className={`fixed lg:sticky top-0 h-screen shrink-0 z-50 transition-all duration-300 flex flex-col p-4 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ width: 260, left: 0 }}
      >
        <div className="glass-panel h-full rounded-2xl flex flex-col p-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-3 border-b border-purple-500/20">
            <Logo />
            <button className="lg:hidden text-purple-300 hover:text-white" onClick={() => setMobileOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto nx-scroll space-y-5 pr-1">
            {groups.map((g) => (
              <div key={g.group}>
                <div className="px-2 mb-2 text-[10px] font-bold tracking-[0.18em] uppercase text-purple-400/80">
                  {g.group}
                </div>
                <div className="space-y-1">
                  {g.items.map((item) => {
                    const active = view === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setView(item.id); setMobileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 relative group"
                        style={{
                          color: active ? "#FFF" : "#C4B5FD",
                          background: active ? "linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(124, 58, 237, 0.25) 100%)" : "transparent",
                          border: active ? "1px solid rgba(192, 132, 252, 0.3)" : "1px solid transparent",
                        }}
                      >
                        {active && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-purple-400 shadow-[0_0_10px_#A855F7]" />
                        )}
                        <Icon size={17} style={{ color: active ? "#F472B6" : "#A78BFA" }} />
                        <span className="flex-1 text-left">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* System Status Footer */}
          <div className="pt-3 border-t border-purple-500/20 text-[11px] text-purple-300/70 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><StatusDot status="Active" /> Operational</span>
            <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300">v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ============================== TOPBAR (Glassmorphic) ============================== */
function TopBar({ role, user, onMenu, onPalette, onNotify, view, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 px-5 py-3.5 flex items-center justify-between gap-4" style={{ background: "rgba(15, 6, 29, 0.65)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(168, 85, 247, 0.15)" }}>
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 text-purple-300 hover:text-white" onClick={onMenu}><Menu size={20} /></button>
        <div className="hidden sm:flex items-center gap-2 text-[13px] text-purple-300">
          <span className="font-semibold text-white">NEXORA</span>
          <ChevronRight size={14} className="text-purple-500" />
          <span className="text-purple-200 font-medium capitalize">{view.replace("-", " ")}</span>
        </div>
      </div>

      {/* Glass Search Bar */}
      <button
        onClick={onPalette}
        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl flex-1 max-w-md text-[13px] transition-all"
        style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: C.textMuted }}
      >
        <Search size={15} className="text-purple-400" />
        <span className="flex-1 text-left">Find any meeting moment, task, or document...</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30">⌘K</span>
      </button>

      <div className="flex items-center gap-3 shrink-0">
        <button onClick={onPalette} className="md:hidden p-2 text-purple-300"><Search size={18} /></button>
        <button onClick={onNotify} className="p-2 relative rounded-xl bg-purple-900/30 border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-400/40">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#EC4899]" />
        </button>

        {/* Profile Pill */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((m) => !m)} className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full bg-purple-900/30 border border-purple-500/20 hover:border-purple-400/40">
            <Avatar name={user?.name || "User"} size={30} />
            <div className="hidden sm:block text-left pr-1 leading-tight">
              <div className="text-[12.5px] font-semibold text-white">{user?.name || "User"}</div>
              <RoleBadge role={role} />
            </div>
            <ChevronDown size={14} className="text-purple-400 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="nx-fade absolute right-0 top-full mt-2 w-52 rounded-xl bg-slate-900/95 border border-purple-500/30 backdrop-blur-xl p-2 z-50 shadow-2xl">
              <div className="px-3 py-2 border-b border-purple-500/20 mb-1">
                <div className="text-[13px] font-semibold text-white">{user?.name}</div>
                <div className="text-[11px] text-purple-400">{user?.dept}</div>
              </div>
              <button
                onClick={() => { setMenuOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============================== TASK MANAGEMENT VIEW (Admin & Manager Assign Tasks) ============================== */
function TasksView({ role, user }) {
  const [tasks, setTasks] = useState([]);
  const [filterType, setFilterType] = useState("All"); // All | Project Work | Problem Solving
  const [filterStatus, setFilterStatus] = useState("All"); // All | Pending | In Progress | Completed
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State for Admin / Manager creating a task
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Project Work"); // Project Work | Problem Solving
  const [description, setDescription] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    fetchTasks();
    if (role === "Admin" || role === "Manager") {
      api.getUsers().then(setUsersList).catch(console.error);
    }
  }, []);

  async function fetchTasks() {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await api.createTask({
        title,
        type,
        description,
        assigned_to_name: assignedToName || "All Department Members",
        dept: user?.dept || "Engineering",
        priority,
        due_date: dueDate || "Next Week",
      });
      setTitle("");
      setDescription("");
      setAssignedToName("");
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    try {
      await api.updateTask(taskId, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.deleteTask(taskId);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = tasks.filter((t) => {
    if (filterType !== "All" && t.type !== filterType) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="nx-fade space-y-6">
      <SectionHeading
        eyebrow="Enterprise Task Flow"
        title="Task Management & Problem Solving"
        subtitle="Tasks assigned by Admin and Managers for continuous project progress and problem resolution."
        right={
          (role === "Admin" || role === "Manager") && (
            <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
              Assign New Task
            </Button>
          )
        }
      />

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex p-1 rounded-xl bg-purple-950/60 border border-purple-500/20">
          {["All", "Project Work", "Problem Solving"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all"
              style={{
                background: filterType === t ? "linear-gradient(135deg, #A855F7, #7C3AED)" : "transparent",
                color: filterType === t ? "#FFF" : "#C4B5FD",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex p-1 rounded-xl bg-purple-950/60 border border-purple-500/20">
          {["All", "Pending", "In Progress", "Completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all"
              style={{
                background: filterStatus === s ? "rgba(255,255,255,0.12)" : "transparent",
                color: filterStatus === s ? "#FFF" : "#A78BFA",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center glass-panel rounded-2xl">
            <ListChecks size={36} className="mx-auto text-purple-400 mb-3" />
            <div className="text-lg font-semibold text-white">No tasks found</div>
            <p className="text-sm text-purple-300 mt-1">
              {(role === "Admin" || role === "Manager") ? "Click 'Assign New Task' above to delegate tasks to your team." : "You have no active assigned tasks matching these filters."}
            </p>
          </div>
        )}

        {filtered.map((t) => {
          const isProject = t.type === "Project Work";
          const statusBg = t.status === "Completed" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : t.status === "In Progress" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30";

          return (
            <GlassCard key={t.id} className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border"
                    style={{
                      background: isProject ? "rgba(6, 182, 212, 0.15)" : "rgba(244, 63, 94, 0.15)",
                      color: isProject ? "#38BDF8" : "#FB7185",
                      borderColor: isProject ? "rgba(56, 189, 248, 0.3)" : "rgba(251, 113, 133, 0.3)",
                    }}
                  >
                    {t.type}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBg}`}>
                    {t.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5">{t.title}</h3>
                <p className="text-[13px] text-purple-200/80 leading-relaxed mb-4">{t.description || "No specific instructions provided."}</p>

                <div className="space-y-1.5 text-[12px] text-purple-300 border-t border-purple-500/15 pt-3">
                  <div className="flex justify-between">
                    <span>Assigned to:</span>
                    <span className="font-semibold text-white">{t.assigned_to_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned by:</span>
                    <span className="text-purple-200">{t.assigned_by_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Priority:</span>
                    <span className="font-semibold" style={{ color: t.priority === "Urgent" ? "#F43F5E" : t.priority === "High" ? "#F97316" : "#A78BFA" }}>{t.priority}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="flex items-center justify-between gap-2 border-t border-purple-500/15 pt-3">
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  className="bg-purple-950/80 border border-purple-500/30 text-purple-100 text-[12px] rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                >
                  <option value="Pending">Mark Pending</option>
                  <option value="In Progress">Mark In Progress</option>
                  <option value="Completed">Mark Completed</option>
                </select>

                {(role === "Admin" || role === "Manager") && (
                  <button onClick={() => handleDeleteTask(t.id)} className="text-rose-400 hover:text-rose-300 text-[12px] font-medium p-1">
                    Delete
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Task Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <form onSubmit={handleCreateTask} className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 border border-purple-500/40">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h2 className="text-lg font-bold text-white">Assign Task (Project & Problem Solving)</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-purple-300 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-purple-300 mb-1 font-medium">Task Title *</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Optimize API response latency or Fix client login issue"
                  className="w-full bg-purple-950/60 border border-purple-500/30 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-300 mb-1 font-medium font-medium">Task Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-purple-950/60 border border-purple-500/30 rounded-lg px-3 py-2 text-white outline-none"
                  >
                    <option value="Project Work">Project Work</option>
                    <option value="Problem Solving">Problem Solving</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 mb-1 font-medium font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-purple-950/60 border border-purple-500/30 rounded-lg px-3 py-2 text-white outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium font-medium">Assign To</label>
                <select
                  value={assignedToName}
                  onChange={(e) => setAssignedToName(e.target.value)}
                  className="w-full bg-purple-950/60 border border-purple-500/30 rounded-lg px-3 py-2 text-white outline-none"
                >
                  <option value="">All Department Members</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.name}>{u.name} ({u.dept} - {u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium font-medium">Description / Deliverables</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about what needs to be solved or completed..."
                  className="w-full bg-purple-950/60 border border-purple-500/30 rounded-lg px-3 py-2 text-white outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-purple-500/20">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1 justify-center">Cancel</Button>
              <Button type="submit" variant="primary" disabled={loading} className="flex-1 justify-center">
                {loading ? "Assigning..." : "Assign Task"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ============================== ANALYTICS GLASSMORPHIC DASHBOARD (Image 3 Style) ============================== */
function GlassmorphismDashboard({ user, role }) {
  return (
    <div className="nx-fade space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Analytics & Enterprise Overview</h1>
          <p className="text-purple-300/80 text-sm mt-1">Real-time intelligence metrics, activity tracking, and sentiment analytics across NEXORA.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" icon={SlidersHorizontal}>Filters</Button>
          <Button variant="primary" icon={Calendar}>This month</Button>
        </div>
      </div>

      {/* Main Grid matching Image 3 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - General Stats Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-purple-400" size={20} />
              <h2 className="text-base font-bold text-white">General stats</h2>
            </div>
            <div className="flex p-1 rounded-xl bg-purple-950/60 border border-purple-500/20 text-xs">
              <button className="px-3 py-1 rounded-lg bg-purple-600 text-white font-semibold">Meetings</button>
              <button className="px-3 py-1 rounded-lg text-purple-300 hover:text-white">Hours</button>
              <button className="px-3 py-1 rounded-lg text-purple-300 hover:text-white">Participants</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-4">
              <div className="text-xs text-purple-300/80 font-medium">Total meetings</div>
              <div className="text-3xl font-bold text-white mt-1 flex items-baseline gap-2">
                352 <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">12% ↑</span>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4">
              <div className="text-xs text-purple-300/80 font-medium">Avg. per member</div>
              <div className="text-3xl font-bold text-white mt-1 flex items-baseline gap-2">
                15 <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">9% ↑</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="pt-2">
            <div className="flex items-end gap-2.5 h-44 px-2 border-b border-purple-500/20 pb-2">
              {[
                { day: "1.05", val: 32 }, { day: "4.05", val: 45 }, { day: "7.05", val: 22 },
                { day: "10.05", val: 50, active: true }, { day: "13.05", val: 28 },
                { day: "16.05", val: 38 }, { day: "19.05", val: 30 }
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  {bar.active && (
                    <span className="text-[10px] font-bold text-white bg-purple-600 px-2 py-0.5 rounded-full shadow-[0_0_10px_#A855F7]">25</span>
                  )}
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                    style={{
                      height: `${(bar.val / 50) * 130}px`,
                      background: bar.active ? "linear-gradient(180deg, #C084FC 0%, #A855F7 100%)" : "rgba(168, 85, 247, 0.25)",
                      boxShadow: bar.active ? "0 0 15px rgba(168,85,247,0.6)" : "none",
                    }}
                  />
                  <span className="text-[11px] text-purple-300/70">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Platforms & Sentiments */}
        <div className="space-y-6">
          {/* Platforms Donut Card */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Globe size={16} className="text-purple-400" /> Platforms
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 text-xs text-purple-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Google Meet</span>
                  <span className="font-bold text-white ml-auto">46%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Zoom</span>
                  <span className="font-bold text-white ml-auto">42%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>MS Teams</span>
                  <span className="font-bold text-white ml-auto">12%</span>
                </div>
              </div>

              {/* Custom SVG Donut */}
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-purple-900/40" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-cyan-400" strokeDasharray="46, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-500" strokeDasharray="42, 100" strokeDashoffset="-46" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sentiments Card */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" /> Sentiments
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 text-xs text-purple-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Positive</span>
                  <span className="font-bold text-white ml-auto">34%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Negative</span>
                  <span className="font-bold text-white ml-auto">5%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span>Neutral</span>
                  <span className="font-bold text-white ml-auto">61%</span>
                </div>
              </div>

              {/* Donut SVG */}
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-purple-900/40" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-400" strokeDasharray="34, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-purple-400" strokeDasharray="61, 100" strokeDashoffset="-34" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Time Spent & Team Members Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-purple-400" /> Time spent in tasks
            </h3>
            <span className="text-xs text-purple-300/70">Participants: 23</span>
          </div>

          <div className="space-y-4">
            {[
              { name: "Evan Brightwood", role: "Product Manager", time: "42h 14m", pct: 85 },
              { name: "Lila Casterly", role: "Senior Software Developer", time: "35h 47m", pct: 70 },
              { name: "Luna Fairchild", role: "VP of Marketing", time: "28h 10m", pct: 55 }
            ].map((p, i) => (
              <div key={i} className="glass-card rounded-xl p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} size={36} />
                  <div>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="text-[11px] text-purple-300">{p.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-xs">
                  <div className="flex-1 bg-purple-950/80 rounded-full h-2 overflow-hidden border border-purple-500/20">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-purple-200">{p.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers size={16} className="text-purple-400" /> Talk to listen ratio
            </h3>
            <span className="text-xs text-purple-300/70">Average: 9h 12m</span>
          </div>

          <div className="space-y-4">
            {[
              { name: "Luna Fairchild", role: "VP of Marketing", talk: 74, listen: 26 },
              { name: "Ava Starfall", role: "Technical Lead", talk: 70, listen: 30 },
              { name: "Nitheshwaran", role: "Lead Engineer", talk: 82, listen: 18 }
            ].map((p, i) => (
              <div key={i} className="glass-card rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.name} size={28} />
                    <span className="font-semibold text-white">{p.name}</span>
                  </div>
                  <div className="text-purple-300 text-[11px]">Talk: <span className="text-purple-100 font-bold">{p.talk}%</span> | Listen: <span className="text-purple-100 font-bold">{p.listen}%</span></div>
                </div>

                <div className="flex h-2 rounded-full overflow-hidden bg-purple-950/80 border border-purple-500/20">
                  <div style={{ width: `${p.talk}%` }} className="bg-gradient-to-r from-violet-500 to-purple-500 h-full" />
                  <div style={{ width: `${p.listen}%` }} className="bg-purple-900/50 h-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== LOGIN / SIGN UP ============================== */
function Login({ onLogin, initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [role, setRole] = useState("Employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSignIn() {
    setError("");
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.access_token);
      onLogin({ role: data.role, name: data.name, dept: data.dept });
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const data = await api.register({ name, email, password, dept });
      setToken(data.access_token);
      onLogin({ role: data.role, name: data.name, dept: data.dept });
    } catch (err) {
      setError(err.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nx grid grid-cols-1 lg:grid-cols-2 min-h-screen" style={{ background: C.bgDeep, color: "#FFF" }}>
      <style>{FONTS}</style>
      <div className="hidden lg:flex flex-col justify-between p-14 relative overflow-hidden" style={{ background: C.bgPurple }}>
        <Logo />
        <div className="relative z-10 space-y-4">
          <div className="text-4xl font-bold tracking-tight text-white leading-tight">
            Intelligence,<br />built for the<br />enterprise.
          </div>
          <p className="text-purple-300 text-sm max-w-sm">One glassmorphic workspace for your team, task management, problem solving, and AI.</p>
        </div>
        <div className="text-xs text-purple-400">© NEXORA — AI Enterprise Operating System.</div>
      </div>

      <div className="flex items-center justify-center p-8 glass-panel">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center justify-between">
            <Logo />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
            <p className="text-xs text-purple-300 mt-1">{mode === "signin" ? "Sign in to access your enterprise workspace." : "Set up access to your enterprise workspace."}</p>
          </div>

          <div className="space-y-4 text-xs">
            {mode === "signup" && (
              <div>
                <label className="block text-purple-300 mb-1 font-medium">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full bg-purple-950/60 border border-purple-500/30 rounded-lg px-3 py-2 text-white outline-none" />
              </div>
            )}

            <div>
              <label className="block text-purple-300 mb-1 font-medium">Work email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-purple-950/60 border border-purple-500/30 rounded-lg px-3 py-2 text-white outline-none" />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-purple-300 mb-1 font-medium">Department</label>
                <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full bg-purple-950/60 border border-purple-500/30 rounded-lg px-3 py-2 text-white outline-none">
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-purple-300 mb-1 font-medium">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full bg-purple-950/60 border border-purple-500/30 rounded-lg px-3 py-2 pr-9 text-white outline-none" />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2.5 top-2.5 text-purple-400">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-purple-300 mb-1 font-medium">Confirm password</label>
                <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="w-full bg-purple-950/60 border border-purple-500/30 rounded-lg px-3 py-2 text-white outline-none" />
              </div>
            )}

            {error && <div className="text-xs text-rose-400 font-medium">{error}</div>}

            {mode === "signin" ? (
              <button onClick={handleSignIn} disabled={loading} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/30 hover:opacity-90 transition-all">
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            ) : (
              <button onClick={handleSignUp} disabled={loading} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/30 hover:opacity-90 transition-all">
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </button>
            )}
          </div>

          <div className="text-center text-xs text-purple-300">
            {mode === "signin" ? (
              <>Don't have an account? <span onClick={() => setMode("signup")} className="font-semibold text-purple-200 hover:text-white cursor-pointer">Create one</span></>
            ) : (
              <>Already have an account? <span onClick={() => setMode("signin")} className="font-semibold text-purple-200 hover:text-white cursor-pointer">Sign in</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== OTHER ADMIN / MANAGER / EMPLOYEE VIEWS ============================== */
function AdminUsers() {
  const [people, setPeople] = useState([]);
  useEffect(() => { api.getUsers().then(setPeople).catch(console.error); }, []);
  return (
    <div className="nx-fade space-y-6">
      <SectionHeading eyebrow="Administration" title="User Management" subtitle="Manage enterprise roles, permissions and accounts." />
      <div className="glass-panel rounded-2xl p-6 overflow-x-auto">
        <table className="w-full text-xs text-left text-purple-200">
          <thead className="border-b border-purple-500/20 text-purple-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/15">
            {people.map((u) => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="py-3 px-4 flex items-center gap-2.5 font-medium text-white">
                  <Avatar name={u.name} size={28} /> {u.name}
                </td>
                <td className="py-3 px-4">{u.dept}</td>
                <td className="py-3 px-4"><RoleBadge role={u.role} /></td>
                <td className="py-3 px-4"><StatusDot status={u.status} /> {u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminAudit() {
  const [events, setEvents] = useState([]);
  useEffect(() => { api.getAuditLog(50).then(setEvents).catch(console.error); }, []);
  return (
    <div className="nx-fade space-y-6">
      <SectionHeading eyebrow="Administration" title="Audit Log" subtitle="Every action taken across the enterprise OS." />
      <div className="glass-panel rounded-2xl p-6 space-y-3">
        {events.map((e) => (
          <div key={e.id} className="flex items-center justify-between text-xs py-2.5 border-b border-purple-500/15 text-purple-200">
            <div className="flex items-center gap-3">
              <Avatar name={e.user_name} size={28} />
              <span className="font-semibold text-white">{e.user_name}</span>
              <span className="text-purple-300">{e.action}</span>
            </div>
            <span className="text-purple-400">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIHub({ role }) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([]);
  async function send() {
    if (!input.trim()) return;
    const text = input; setInput("");
    setMsgs((m) => [...m, { role: "user", text }]);
    try {
      const res = await api.sendMessage({ assistant_id: "general", message: text });
      setMsgs((m) => [...m, { role: "ai", text: res.reply }]);
    } catch (err) {
      setMsgs((m) => [...m, { role: "ai", text: `Error: ${err.message}` }]);
    }
  }
  return (
    <div className="nx-fade space-y-4 h-[calc(100vh-140px)] flex flex-col">
      <SectionHeading eyebrow="Intelligence" title="AI Assistant Hub" subtitle="Ask anything to your enterprise AI assistant." />
      <div className="flex-1 glass-panel rounded-2xl p-6 overflow-y-auto space-y-4">
        {msgs.length === 0 && <div className="text-xs text-purple-300">Start asking questions to your AI assistant...</div>}
        {msgs.map((m, i) => (
          <div key={i} className={`p-3.5 rounded-xl text-xs max-w-xl ${m.role === "user" ? "ml-auto bg-purple-600/40 text-white" : "bg-white/5 text-purple-100 border border-purple-500/20"}`}>
            <div className="font-bold text-[10px] text-purple-300 uppercase mb-1">{m.role}</div>
            <div>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type your message..." className="flex-1 bg-purple-950/60 border border-purple-500/30 rounded-xl px-4 py-2.5 text-xs text-white outline-none" />
        <Button onClick={send} icon={Send}>Send</Button>
      </div>
    </div>
  );
}

/* ============================== MAIN APP ROOT ============================== */
export default function NexoraApp() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState("Employee");
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("signin"); // signin | signup | admin | manager | employee | tasks ...
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  if (!authed) {
    return (
      <Login
        initialMode="signin"
        onLogin={(user) => {
          setRole(user.role);
          setCurrentUser(user);
          setView(user.role.toLowerCase());
          setAuthed(true);
        }}
      />
    );
  }

  const renderView = () => {
    switch (view) {
      case "admin":
      case "manager":
      case "employee":
        return <GlassmorphismDashboard user={currentUser} role={role} />;
      case "tasks":
        return <TasksView role={role} user={currentUser} />;
      case "admin-users":
        return <AdminUsers />;
      case "admin-audit":
        return <AdminAudit />;
      case "ai":
        return <AIHub role={role} />;
      default:
        return <GlassmorphismDashboard user={currentUser} role={role} />;
    }
  };

  return (
    <div className="nx min-h-screen flex" style={{ background: C.bgDeep }}>
      <style>{FONTS}</style>
      <FloatingSidebar role={role} view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar role={role} user={currentUser} onMenu={() => setMobileOpen(true)} onPalette={() => setPaletteOpen(false)} onNotify={() => {}} view={view} onSignOut={() => { setToken(null); setAuthed(false); setView("signin"); }} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
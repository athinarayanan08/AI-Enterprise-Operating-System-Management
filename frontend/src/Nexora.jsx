import React, { useState, useEffect, useMemo, useRef } from "react";
import { api, setToken } from "./api";
import {
  LayoutGrid, Sparkles, BookOpen, FileText, Inbox, CheckSquare, ListChecks,
  BarChart3, FileBarChart, Users, ShieldCheck, SlidersHorizontal, Search,
  Bell, HelpCircle, ChevronDown, ChevronRight, Menu, X, Plus, Paperclip,
  ArrowUpRight, Send, Copy, RotateCcw, Bookmark, Share2, ThumbsUp, ThumbsDown,
  Filter, Download, MoreHorizontal, Lock, ArrowLeft, Command as CommandIcon, LogOut,
  Eye, EyeOff, Briefcase, AlertTriangle, Clock, CheckCircle2, Circle, ArrowRight,
  TrendingUp, Phone, Mail, Globe, Settings, Layers, Calendar, Trash2, Check, RefreshCw,
  User, Upload, Image as ImageIcon, ScanSearch, Lightbulb
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
@keyframes nxaurora {
  0% { transform: translate3d(-4%, -2%, 0) rotate(0deg) scale(1); }
  50% { transform: translate3d(6%, 4%, 0) rotate(8deg) scale(1.08); }
  100% { transform: translate3d(-2%, 6%, 0) rotate(-6deg) scale(1.04); }
}
@keyframes nxsheen {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
.nx-aurora {
  background: #04060c;
  isolation: isolate;
}
.nx-aurora-ribbons {
  position: absolute;
  inset: -30%;
  background:
    radial-gradient(ellipse at 18% 28%, rgba(56, 230, 255, 0.42), transparent 42%),
    radial-gradient(ellipse at 82% 18%, rgba(255, 72, 186, 0.34), transparent 44%),
    radial-gradient(ellipse at 68% 78%, rgba(124, 92, 255, 0.46), transparent 48%),
    radial-gradient(ellipse at 12% 82%, rgba(255, 196, 86, 0.22), transparent 40%),
    conic-gradient(from 210deg at 50% 50%, rgba(56,230,255,0.12), rgba(255,72,186,0.08), rgba(124,92,255,0.14), transparent 55%);
  filter: blur(36px) saturate(140%);
  animation: nxaurora 16s ease-in-out infinite alternate;
  pointer-events: none;
}
.nx-grid-veil {
  background-image:
    linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 50% 30%, black 35%, transparent 78%);
}
.prism-glass {
  background: linear-gradient(145deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 42%, rgba(110,80,255,0.10) 100%);
  backdrop-filter: blur(32px) saturate(185%);
  -webkit-backdrop-filter: blur(32px) saturate(185%);
  border: 1px solid rgba(255,255,255,0.22);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.34),
    inset 0 -1px 0 rgba(255,255,255,0.05),
    0 28px 90px rgba(0,0,0,0.48);
}
.prism-input {
  background: rgba(8, 10, 22, 0.28);
  border: 1px solid rgba(255,255,255,0.16);
  color: #fff;
}
.prism-input::placeholder { color: rgba(226,232,255,0.45); }
.prism-input:focus {
  outline: none;
  border-color: rgba(125, 255, 212, 0.55);
  box-shadow: 0 0 0 3px rgba(125, 255, 212, 0.12);
}
.prism-cta {
  background: linear-gradient(90deg, #7dffd4, #a78bfa, #7dffd4);
  background-size: 200% 100%;
  animation: nxsheen 6s linear infinite;
  color: #061018;
}
`;

/* ============================== STATIC CONFIG ============================== */
const DEPARTMENTS = ["Engineering", "Finance", "Operations", "Human Resources", "Sales", "Marketing", "Product", "Legal"];

const NAV = {
  Admin: [
    { group: "Overview", items: [{ id: "admin", label: "Dashboard", icon: LayoutGrid }] },
    { group: "Intelligence", items: [{ id: "ai", label: "AI Assistant", icon: Sparkles }, { id: "kb", label: "Knowledge Base", icon: BookOpen }, { id: "docs", label: "Documents", icon: FileText }] },
    { group: "Tasks & Work", items: [{ id: "tasks", label: "Task Management", icon: ListChecks }] },
    { group: "Insights", items: [{ id: "analyze", label: "Analyze Report", icon: FileBarChart }] },
    { group: "Administration", items: [{ id: "admin-users", label: "User Management", icon: Users }, { id: "admin-audit", label: "Audit Logs", icon: ShieldCheck }, { id: "admin-ai", label: "AI Configuration", icon: SlidersHorizontal }] },
  ],
  Manager: [
    { group: "Overview", items: [{ id: "manager", label: "Dashboard", icon: LayoutGrid }] },
    { group: "Intelligence", items: [{ id: "ai", label: "AI Assistant", icon: Sparkles }, { id: "kb", label: "Knowledge Base", icon: BookOpen }] },
    { group: "Tasks & Work", items: [{ id: "tasks", label: "Task Management", icon: ListChecks }] },
    { group: "Workflow", items: [{ id: "manager-approvals", label: "Approvals", icon: Inbox }, { id: "manager-team", label: "Team", icon: Users }] },
    { group: "Insights", items: [{ id: "manager-analytics", label: "Analytics", icon: BarChart3 }, { id: "analyze", label: "Analyze Report", icon: FileBarChart }] },
  ],
  Employee: [
    { group: "Overview", items: [{ id: "employee", label: "Dashboard", icon: LayoutGrid }] },
    { group: "Intelligence", items: [{ id: "ai", label: "AI Assistant", icon: Sparkles }, { id: "docs", label: "Documents", icon: FileText }] },
    { group: "Workflow", items: [{ id: "tasks", label: "My Tasks", icon: ListChecks }, { id: "requests", label: "Requests", icon: CheckSquare }] },
    { group: "Insights", items: [{ id: "analyze", label: "Analyze Report", icon: FileBarChart }] },
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

/* ============================== PRISM AUTH GATE + LOGIN ============================== */
function PrismField({ icon: Icon, type = "text", value, onChange, placeholder, trailing }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="prism-input w-full rounded-full px-4 py-3 pr-11 text-[13px]"
      />
      {trailing || (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/55">
          <Icon size={16} />
        </span>
      )}
    </div>
  );
}

function Login({ onLogin, initialMode = "signin" }) {
  const [stage, setStage] = useState("gate");
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
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
      if (remember) localStorage.setItem("nexora_remember", email);
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

  const openLogin = (next = "signin") => {
    setMode(next);
    setStage("login");
    setError("");
  };

  return (
    <div className="nx nx-aurora min-h-screen relative overflow-hidden text-white">
      <style>{FONTS}</style>
      <div className="nx-aurora-ribbons" />
      <div className="nx-grid-veil absolute inset-0 pointer-events-none" />

      <header className="relative z-20 px-4 sm:px-8 pt-6">
        <div className="prism-glass mx-auto max-w-5xl rounded-full px-4 py-2.5 flex items-center justify-between gap-3">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-white/70">
            <button onClick={() => setStage("gate")} className="hover:text-white">Home</button>
            <span className="text-white/30">|</span>
            <span>Company</span>
            <span>Analyze</span>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => openLogin("signin")} className="text-[13px] px-3 py-1.5 rounded-full text-white/80 hover:text-white">
              Sign in
            </button>
            <button onClick={() => openLogin("signup")} className="prism-cta text-[13px] font-bold px-4 py-1.5 rounded-full">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {stage === "gate" ? (
        <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] tracking-widest uppercase mb-5" style={{ background: "rgba(125,255,212,0.12)", border: "1px solid rgba(125,255,212,0.35)", color: "#7dffd4" }}>
            Prism workspace
          </div>
          <h1 className="nx-serif text-4xl sm:text-6xl font-semibold tracking-tight">Clarity through glass.</h1>
          <p className="mt-4 text-sm sm:text-base text-white/65 max-w-xl mx-auto">
            NEXORA is a dark command deck with iridescent frost panels — not a payment landing, not a stock login. Upload work, run an Analyze Report, then sign in through a floating prism card.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => openLogin("signup")} className="prism-cta font-bold px-6 py-2.5 rounded-full text-sm">Start trial now</button>
            <button onClick={() => openLogin("signin")} className="px-6 py-2.5 rounded-full text-sm border border-white/25 bg-white/5 hover:bg-white/10">Book a demo</button>
          </div>

          <div className="mt-16 grid sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: Layers, title: "Operator desk", body: "Live task flow, approvals, and AI in one frost panel." },
              { icon: ScanSearch, title: "Analyze report", body: "Drop photos and notes. Get a scored glass brief." },
              { icon: ShieldCheck, title: "Role vault", body: "Admin, manager, and employee lenses stay isolated." },
            ].map((card) => (
              <div key={card.title} className="prism-glass rounded-2xl p-5">
                <card.icon size={18} className="text-cyan-200 mb-3" />
                <div className="font-semibold">{card.title}</div>
                <p className="text-[13px] text-white/60 mt-1.5 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <main className="relative z-10 min-h-[calc(100vh-96px)] flex items-center justify-center px-4 py-10">
          <div className="prism-glass w-full max-w-[440px] rounded-[32px] p-8 sm:p-10">
            <button onClick={() => setStage("gate")} className="text-[11px] text-white/50 hover:text-white mb-6 inline-flex items-center gap-1">
              <ArrowLeft size={12} /> Back to deck
            </button>
            <h2 className="text-4xl font-semibold tracking-tight">{mode === "signin" ? "Login" : "Signup"}</h2>
            <p className="text-sm text-white/60 mt-1">{mode === "signin" ? "Welcome back" : "Create a workspace identity"}</p>

            <div className="mt-8 space-y-4">
              {mode === "signup" && (
                <PrismField icon={User} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              )}
              <PrismField icon={User} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={mode === "signin" ? "User Name" : "Work email"} />
              {mode === "signup" && (
                <select value={dept} onChange={(e) => setDept(e.target.value)} className="prism-input w-full rounded-full px-4 py-3 text-[13px]">
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
              <PrismField
                icon={Eye}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                trailing={
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/55">
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                }
              />
              {mode === "signup" && (
                <PrismField icon={Lock} type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
              )}

              {mode === "signin" && (
                <label className="flex items-center gap-2 text-[13px] text-white/75 select-none">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-cyan-300" />
                  Remember me
                </label>
              )}

              {error && <div className="text-xs text-rose-300">{error}</div>}

              <button
                onClick={mode === "signin" ? handleSignIn : handleSignUp}
                disabled={loading}
                className="w-full rounded-full py-3 text-sm font-semibold border border-white/35 bg-white/5 hover:bg-white/12 transition-all"
              >
                {loading ? (mode === "signin" ? "Signing in..." : "Creating...") : (mode === "signin" ? "Login" : "Create account")}
              </button>

              {mode === "signin" && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { email: "meera.krishnan@nexora.ai", label: "Admin", name: "Meera" },
                    { email: "divya.suresh@nexora.ai", label: "Manager", name: "Divya" },
                    { email: "arun.kumar@nexora.ai", label: "Employee", name: "Arun" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => { setEmail(preset.email); setPassword("password123"); }}
                      className="rounded-2xl py-2 text-[11px] border border-white/12 bg-white/5 hover:bg-white/10"
                    >
                      <div className="font-semibold">{preset.label}</div>
                      <div className="text-white/45">{preset.name}</div>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-center text-[13px] text-white/65">
                {mode === "signin" ? (
                  <>Don't have an account? <button className="font-semibold text-white" onClick={() => setMode("signup")}>Signup</button></>
                ) : (
                  <>Already have an account? <button className="font-semibold text-white" onClick={() => setMode("signin")}>Login</button></>
                )}
              </p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

function hashScore(text, min = 42, max = 96) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 997;
  return min + (h % (max - min + 1));
}

function buildAnalyzeReport(files, ideas) {
  const names = files.map((f) => f.name.toLowerCase());
  const idea = ideas.toLowerCase();
  const combined = `${names.join(" ")} ${idea}`;
  const imageCount = files.filter((f) => f.kind === "image").length;
  const keywords = [
    ["risk", "Risk surface"],
    ["security", "Security posture"],
    ["login", "Access flow"],
    ["glass", "Visual system"],
    ["pricing", "Commercial layout"],
    ["report", "Reporting depth"],
    ["task", "Work routing"],
    ["ai", "Intelligence layer"],
  ];
  const hits = keywords.filter(([k]) => combined.includes(k)).map(([, label]) => label);
  const findings = [
    imageCount ? `${imageCount} visual sample${imageCount > 1 ? "s" : ""} read as composition references, not product clones.` : "No images yet — analysis leans on written intent.",
    files.length ? `${files.length} artifact${files.length > 1 ? "s" : ""} ingested (${files.map((f) => f.name).slice(0, 3).join(", ")}${files.length > 3 ? "…" : ""}).` : "Upload photos or docs to ground the brief.",
    ideas.trim() ? `Idea brief captured (${ideas.trim().split(/\s+/).length} words).` : "Add a short idea note so scoring can weigh intent.",
    hits.length ? `Signals: ${hits.join(", ")}.` : "No domain keywords yet — generic enterprise scoring applied.",
    "Glass treatment: frost only works over bright color variation. Keep aurora behind panels, 1px light rim, inner highlight.",
  ];
  return {
    clarity: hashScore(combined + "c", 58, 94),
    glassFidelity: imageCount ? hashScore(combined + "g", 70, 97) : 54,
    actionability: ideas.trim() ? hashScore(combined + "a", 61, 92) : 48,
    findings,
    moves: [
      "Keep login as a floating prism card over moving ribbons — never a solid split purple slab.",
      "Use outline glass buttons for Login; reserve mint sheen only for Get Started.",
      "Run Analyze Report after each design drop so visual and copy stay in one brief.",
    ],
  };
}

function AnalyzeReportView() {
  const [ideas, setIdeas] = useState("");
  const [files, setFiles] = useState([]);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  function ingest(list) {
    const next = Array.from(list || []).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      kind: file.type.startsWith("image/") ? "image" : "file",
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setFiles((prev) => [...prev, ...next]);
    setReport(null);
  }

  async function runAnalyze() {
    if (!files.length && !ideas.trim()) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    let extra = "";
    try {
      const res = await api.sendMessage({
        assistant_id: "general",
        message: `Write a 4-bullet enterprise analysis of this design brief. Ideas: ${ideas || "(none)"}. Files: ${files.map((f) => f.name).join(", ") || "(none)"}. Focus on glassmorphism, login, and reporting.`,
      });
      extra = res?.reply || "";
    } catch {
      extra = "";
    }
    const base = buildAnalyzeReport(files, ideas);
    if (extra) base.findings = [...base.findings, extra.slice(0, 420)];
    setReport(base);
    setBusy(false);
  }

  const ScoreRing = ({ label, value, tint }) => (
    <div className="prism-glass rounded-2xl p-4 text-center">
      <div className="text-3xl font-semibold" style={{ color: tint }}>{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-white/50 mt-1">{label}</div>
      <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: tint }} />
      </div>
    </div>
  );

  return (
    <div className="nx-fade space-y-6">
      <SectionHeading
        eyebrow="Insights"
        title="Analyze Report"
        subtitle="Drop reference photos and a short idea. NEXORA scores glass fidelity, clarity, and what to ship next — without cloning the samples."
      />

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); ingest(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className="prism-glass rounded-2xl p-6 cursor-pointer min-h-[180px] flex flex-col items-center justify-center text-center"
            style={{ borderColor: drag ? "rgba(125,255,212,0.7)" : undefined }}
          >
            <Upload size={22} className="text-cyan-200 mb-2" />
            <div className="text-sm font-semibold">Drop photos or files</div>
            <p className="text-[12px] text-white/50 mt-1">PNG, JPG, PDF, notes. Click to browse.</p>
            <input ref={inputRef} type="file" multiple accept="image/*,.pdf,.txt,.md" className="hidden" onChange={(e) => ingest(e.target.files)} />
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {files.map((f) => (
                <div key={f.id} className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-square">
                  {f.preview ? <img src={f.preview} alt={f.name} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] p-2 text-white/60">{f.name}</div>
                  )}
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"
                    onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="prism-glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[12px] text-white/60 mb-2">
              <Lightbulb size={14} className="text-amber-200" /> Idea notes
            </div>
            <textarea
              rows={5}
              value={ideas}
              onChange={(e) => setIdeas(e.target.value)}
              placeholder="What should this feel like? e.g. iridescent login, dark command deck, analyze report after upload…"
              className="w-full bg-transparent text-[13px] text-white outline-none resize-none"
            />
          </div>

          <Button onClick={runAnalyze} disabled={busy || (!files.length && !ideas.trim())} icon={ScanSearch} className="w-full justify-center">
            {busy ? "Reading samples..." : "Generate analyze report"}
          </Button>
        </div>

        <div className="lg:col-span-3">
          {!report ? (
            <div className="prism-glass rounded-2xl p-10 h-full min-h-[320px] flex flex-col items-center justify-center text-center text-white/55">
              <ImageIcon size={28} className="mb-3 text-white/35" />
              <p className="text-sm max-w-sm">Your brief will land here as scored glass panels — findings, moves, and fidelity against the references you dropped.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <ScoreRing label="Clarity" value={report.clarity} tint="#7dffd4" />
                <ScoreRing label="Glass fidelity" value={report.glassFidelity} tint="#c4b5fd" />
                <ScoreRing label="Actionability" value={report.actionability} tint="#f9a8d4" />
              </div>
              <div className="prism-glass rounded-2xl p-5">
                <h3 className="font-semibold mb-3">Findings</h3>
                <ul className="space-y-2 text-[13px] text-white/75">
                  {report.findings.map((line, i) => (
                    <li key={i} className="flex gap-2"><span className="text-cyan-200">▹</span><span>{line}</span></li>
                  ))}
                </ul>
              </div>
              <div className="prism-glass rounded-2xl p-5">
                <h3 className="font-semibold mb-3">Next moves</h3>
                <ol className="space-y-2 text-[13px] text-white/75 list-decimal pl-4">
                  {report.moves.map((line) => <li key={line}>{line}</li>)}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== ADMINISTRATION: USER MANAGEMENT ============================== */
function AdminUsers() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers()
      .then((data) => { setPeople(data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  return (
    <div className="nx-fade space-y-6">
      <SectionHeading
        eyebrow="Administration"
        title="User & Access Management"
        subtitle="Manage enterprise identities, assigned roles, departments, and AI usage quotas."
      />
      <div className="glass-panel rounded-2xl p-6 overflow-x-auto">
        <table className="w-full text-xs text-left text-purple-200">
          <thead className="border-b border-purple-500/20 text-purple-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">AI Usage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/15">
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-purple-400">Loading users...</td></tr>
            ) : people.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 flex items-center gap-3 font-medium text-white">
                  <Avatar name={u.name} size={30} />
                  <div>
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-[11px] text-purple-400">{u.email}</div>
                  </div>
                </td>
                <td className="py-3.5 px-4">{u.dept || "—"}</td>
                <td className="py-3.5 px-4"><RoleBadge role={u.role} /></td>
                <td className="py-3.5 px-4"><StatusDot status={u.status} /> {u.status}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2 max-w-[120px]">
                    <div className="flex-1 bg-purple-950/80 rounded-full h-1.5 overflow-hidden border border-purple-500/20">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${u.usage_percent || 0}%` }} />
                    </div>
                    <span className="text-[10px] text-purple-300 font-bold">{u.usage_percent || 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================== ADMINISTRATION: AUDIT LOG ============================== */
function AdminAudit() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLog(50)
      .then((data) => { setEvents(data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  return (
    <div className="nx-fade space-y-6">
      <SectionHeading
        eyebrow="Administration"
        title="Enterprise Audit Log"
        subtitle="Cryptographically tracked immutable stream of all user, assistant, and workflow events."
      />
      <div className="glass-panel rounded-2xl p-6">
        <div className="space-y-3">
          {loading ? (
            <div className="py-8 text-center text-purple-400">Loading audit events...</div>
          ) : events.length === 0 ? (
            <div className="py-8 text-center text-purple-400">No audit events recorded yet.</div>
          ) : (
            events.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-xs py-3 border-b border-purple-500/15 text-purple-200">
                <div className="flex items-center gap-3">
                  <Avatar name={e.user_name} size={28} />
                  <div>
                    <span className="font-semibold text-white mr-2">{e.user_name}</span>
                    <span className="text-purple-300 mr-2">{e.action}</span>
                    {e.resource && e.resource !== "—" && (
                      <span className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-200 border border-purple-500/20 text-[10px]">
                        {e.resource}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {e.result}
                  </span>
                  <span className="text-purple-400 text-[11px]">
                    {new Date(e.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                    {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== ADMINISTRATION: AI CONFIGURATION ============================== */
function AdminAIConfig() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAssistants = () => {
    api.getAssistants()
      .then((data) => { setAssistants(data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  };

  useEffect(() => { loadAssistants(); }, []);

  async function toggleAssistant(id, currentAvailable) {
    try {
      await api.updateAssistant(id, { available: !currentAvailable });
      loadAssistants();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="nx-fade space-y-6">
      <SectionHeading
        eyebrow="Administration"
        title="AI Control Room & Agents"
        subtitle="Configure autonomous agents, enable or disable assistants, and monitor token consumption."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-8 text-center text-purple-400">Loading assistants...</div>
        ) : assistants.map((a) => (
          <div key={a.id} className="glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  <h3 className="font-bold text-white text-sm">{a.name}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${a.available ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border-rose-500/30"}`}>
                  {a.available ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-purple-300/80 leading-relaxed">{a.description}</p>
            </div>

            <div className="space-y-3 pt-2 border-t border-purple-500/20">
              <div>
                <div className="flex justify-between text-[11px] text-purple-300 mb-1">
                  <span>Usage quota</span>
                  <span className="font-bold text-white">{a.usage_percent || 0}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-purple-950/80 overflow-hidden border border-purple-500/20">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${a.usage_percent || 0}%` }} />
                </div>
              </div>

              <button
                onClick={() => toggleAssistant(a.id, a.available)}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                  a.available
                    ? "bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
                    : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
                }`}
              >
                {a.available ? "Deactivate Assistant" : "Activate Assistant"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== WORKFLOW: APPROVALS & REQUESTS ============================== */
function ApprovalsView({ role, user }) {
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [loading, setLoading] = useState(false);

  const isManagerOrAdmin = role === "Admin" || role === "Manager";

  const loadApprovals = async () => {
    try {
      const data = await api.getApprovals(filter);
      setApprovals(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadApprovals(); }, [filter]);

  async function handleApprove(id) {
    try {
      await api.approveRequest(id);
      loadApprovals();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReject(id) {
    try {
      await api.rejectRequest(id);
      loadApprovals();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmitRequest(e) {
    e.preventDefault();
    if (!requestText.trim()) return;
    setLoading(true);
    try {
      await api.createApproval({
        requester_name: user?.name || "Team Member",
        dept: user?.dept || "Engineering",
        request: requestText,
      });
      setRequestText("");
      setModalOpen(false);
      loadApprovals();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nx-fade space-y-6">
      <SectionHeading
        eyebrow="Workflow & Compliance"
        title={isManagerOrAdmin ? "Approval Requests" : "My Requests"}
        subtitle="Manage resource permissions, AI usage expansions, and cross-departmental access."
        right={
          <Button onClick={() => setModalOpen(true)} icon={Plus}>
            New Request
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-purple-500/20 pb-3">
        {["All", "Pending", "Approved", "Rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === s
                ? "bg-purple-600 text-white shadow-[0_0_12px_#A855F7]"
                : "bg-purple-950/40 text-purple-300 hover:text-white border border-purple-500/20"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {approvals.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-purple-400 text-xs">
            No approvals found for filter "{filter}".
          </div>
        ) : (
          approvals.map((item) => (
            <div key={item.id} className="glass-panel rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Avatar name={item.requester_name} size={34} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">{item.requester_name}</span>
                    <span className="text-[10px] text-purple-400">({item.dept})</span>
                  </div>
                  <div className="text-xs text-purple-200 mt-0.5">{item.request}</div>
                  <div className="text-[10px] text-purple-400 mt-1">
                    {new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                    {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    item.status === "Approved"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : item.status === "Rejected"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {item.status}
                </span>

                {isManagerOrAdmin && item.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <Check size={12} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <X size={12} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h3 className="font-bold text-white text-base">Submit Access Request</h3>
              <button onClick={() => setModalOpen(false)} className="text-purple-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-purple-300 mb-1 font-medium">Request Description</label>
                <textarea
                  rows={3}
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  placeholder="e.g., Request access to Code Intelligence copilot for Q4 engineering sprint..."
                  className="w-full bg-purple-950/60 border border-purple-500/30 rounded-xl p-3 text-white outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="glass" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Request"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== INTELLIGENCE: KNOWLEDGE BASE ============================== */
function KnowledgeBaseView({ onAskAI }) {
  const [search, setSearch] = useState("");
  const articles = [
    { id: 1, title: "Enterprise OS Microservices Architecture", cat: "Architecture", time: "5 min read", desc: "Detailed guide to modular Express endpoints, SQLite WAL mode, and decoupled React state." },
    { id: 2, title: "AI Model Governance & Rate Limiting Protocols", cat: "Security", time: "8 min read", desc: "Enterprise quotas, token tracking, fallback routines, and LLM safety filters." },
    { id: 3, title: "Autonomous Agent Function Calling Standards", cat: "Engineering", time: "6 min read", desc: "Format specification for structured JSON tool calls, error recovery, and feedback loops." },
    { id: 4, title: "Corporate Data Privacy & Role-Based Access Controls", cat: "Compliance", time: "4 min read", desc: "JWT verification rules, departmental boundaries, and immutable audit event logging." },
    { id: 5, title: "Quarterly Performance Indicators & OKRs", cat: "Operations", time: "7 min read", desc: "Metrics tracking task resolution speed, meeting hour reduction, and AI adoption." }
  ];

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.desc.toLowerCase().includes(search.toLowerCase()) ||
    a.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="nx-fade space-y-6">
      <SectionHeading
        eyebrow="Intelligence"
        title="Enterprise Knowledge Base"
        subtitle="Search corporate wisdom, system documentation, and architectural standards."
        right={
          <div className="relative w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-purple-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-purple-950/60 border border-purple-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((art) => (
          <div key={art.id} className="glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-purple-400/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/20 uppercase tracking-wider">
                  {art.cat}
                </span>
                <span className="text-[11px] text-purple-400">{art.time}</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1">{art.title}</h3>
              <p className="text-xs text-purple-300/80 leading-relaxed">{art.desc}</p>
            </div>

            <button
              onClick={() => onAskAI(`Tell me about: ${art.title}`)}
              className="flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-white transition-colors pt-2 border-t border-purple-500/20"
            >
              <Sparkles size={14} className="text-purple-400" />
              Ask AI Assistant about this document →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== INTELLIGENCE: DOCUMENTS REPOSITORY ============================== */
function DocumentsView({ onAskAI }) {
  const [search, setSearch] = useState("");
  const docs = [
    { id: 1, name: "Q3-Financial-Analysis-and-Audit.pdf", size: "2.4 MB", dept: "Finance", updated: "2 hours ago" },
    { id: 2, name: "Engineering-Design-Handbook-2026.pdf", size: "4.1 MB", dept: "Engineering", updated: "Yesterday" },
    { id: 3, name: "Information-Security-Charter.docx", size: "1.1 MB", dept: "Security", updated: "3 days ago" },
    { id: 4, name: "Employee-Benefits-and-Leave-Policy.pdf", size: "850 KB", dept: "HR", updated: "Last week" },
    { id: 5, name: "Product-Roadmap-Autonomous-Agents.pdf", size: "5.8 MB", dept: "Product", updated: "2 weeks ago" }
  ];

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="nx-fade space-y-6">
      <SectionHeading
        eyebrow="Intelligence"
        title="Documents Repository"
        subtitle="Shared corporate files, reports, and compliance blueprints accessible to authorized personnel."
        right={
          <div className="relative w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-purple-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-purple-950/60 border border-purple-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
            />
          </div>
        }
      />

      <div className="glass-panel rounded-2xl p-4 divide-y divide-purple-500/15">
        {filtered.map((d) => (
          <div key={d.id} className="py-3 px-3 flex items-center justify-between gap-4 flex-wrap hover:bg-white/5 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{d.name}</div>
                <div className="text-[11px] text-purple-400 flex items-center gap-2 mt-0.5">
                  <span>{d.dept}</span>
                  <span>•</span>
                  <span>{d.size}</span>
                  <span>•</span>
                  <span>Updated {d.updated}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onAskAI(`Analyze the document ${d.name}`)}
                className="px-3 py-1.5 rounded-lg bg-purple-900/40 border border-purple-500/20 text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Sparkles size={13} className="text-purple-400" /> Analyze
              </button>
              <button
                onClick={() => alert(`Downloading ${d.name}...`)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Download size={13} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== WORKFLOW: TEAM ROSTER ============================== */
function TeamView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers()
      .then((data) => { setUsers(data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  return (
    <div className="nx-fade space-y-6">
      <SectionHeading
        eyebrow="Workflow"
        title="Departmental Team Roster"
        subtitle="View colleagues, monitor status, and inspect distributed workload balance."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-purple-400">Loading team...</div>
        ) : users.map((u) => (
          <div key={u.id} className="glass-panel rounded-2xl p-5 flex flex-col items-center text-center space-y-3">
            <Avatar name={u.name} size={52} />
            <div>
              <h3 className="font-bold text-white text-sm">{u.name}</h3>
              <div className="text-xs text-purple-300 mt-0.5">{u.dept}</div>
            </div>

            <div className="flex items-center gap-2">
              <RoleBadge role={u.role} />
              <div className="flex items-center gap-1 text-[11px] text-purple-400">
                <StatusDot status={u.status} /> {u.status}
              </div>
            </div>

            <div className="w-full pt-3 border-t border-purple-500/20 text-[11px] text-purple-300 flex justify-between">
              <span>Workload:</span>
              <span className="font-bold text-white">{u.usage_percent || 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== NOTIFICATIONS SLIDE DRAWER ============================== */
function NotificationDrawer({ open, onClose }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = () => {
    api.getNotifications()
      .then((data) => { setNotifs(data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    if (open) loadNotifs();
  }, [open]);

  async function markRead(id) {
    try {
      await api.markNotificationRead(id);
      loadNotifs();
    } catch (err) {
      console.error(err);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade">
      <div className="w-full max-w-sm h-full glass-panel p-6 flex flex-col space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Bell size={18} className="text-purple-400" /> Notifications
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 nx-scroll pr-1">
          {loading ? (
            <div className="py-8 text-center text-purple-400 text-xs">Loading notifications...</div>
          ) : notifs.length === 0 ? (
            <div className="py-8 text-center text-purple-400 text-xs">No notifications yet.</div>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  n.unread
                    ? "bg-purple-900/30 border-purple-500/40 text-purple-100"
                    : "bg-white/5 border-purple-500/15 text-purple-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 uppercase tracking-wider">
                    {n.category}
                  </span>
                  {n.unread && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-[10px] text-pink-400 hover:text-pink-300 font-semibold"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <div className="font-semibold text-white mt-1">{n.title}</div>
                {n.description && <div className="text-[11px] text-purple-300/80 mt-1">{n.description}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== COMMAND PALETTE (CMD+K) ============================== */
function CommandPalette({ open, onClose, setView, role }) {
  const [query, setQuery] = useState("");

  const items = [
    { label: "Dashboard Overview", view: role.toLowerCase(), icon: LayoutGrid },
    { label: "AI Assistant Copilot", view: "ai", icon: Sparkles },
    { label: "Task Flow & Problem Solving", view: "tasks", icon: ListChecks },
    { label: "Knowledge Base", view: "kb", icon: BookOpen },
    { label: "Documents Repository", view: "docs", icon: FileText },
    { label: "Analyze Report", view: "analyze", icon: FileBarChart },
    ...(role === "Admin" ? [
      { label: "User Management", view: "admin-users", icon: Users },
      { label: "System Audit Logs", view: "admin-audit", icon: ShieldCheck },
      { label: "AI Configuration Control", view: "admin-ai", icon: SlidersHorizontal },
    ] : []),
    ...(role === "Manager" ? [
      { label: "Approvals & Access Requests", view: "manager-approvals", icon: Inbox },
      { label: "Department Team Roster", view: "manager-team", icon: Users },
    ] : []),
    ...(role === "Employee" ? [
      { label: "My Requests", view: "requests", icon: CheckSquare },
    ] : [])
  ];

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg glass-panel rounded-2xl p-4 space-y-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-3 py-2 border-b border-purple-500/20">
          <Search size={18} className="text-purple-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to view..."
            className="flex-1 bg-transparent text-sm text-white outline-none"
          />
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-300">ESC</span>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => { setView(item.view); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-purple-200 hover:text-white hover:bg-purple-600/30 transition-all text-left"
              >
                <Icon size={16} className="text-purple-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================== INTELLIGENCE: AI HUB (CHAT) ============================== */
function AIHub({ role, initialPrompt = "" }) {
  const [input, setInput] = useState(initialPrompt);
  const [assistant, setAssistant] = useState("general");
  const [assistantsList, setAssistantsList] = useState([]);
  const [msgs, setMsgs] = useState([
    { role: "ai", text: "Hello! I am your NEXORA Enterprise AI Assistant. How can I assist your workflow today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.getAssistants().then(setAssistantsList).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialPrompt) setInput(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send() {
    if (!input.trim() || loading) return;
    const text = input;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await api.sendMessage({ assistant_id: assistant, message: text });
      setMsgs((m) => [...m, { role: "ai", text: res.reply, sources: res.sources }]);
    } catch (err) {
      setMsgs((m) => [...m, { role: "ai", text: `Error: ${err.message || "Failed to reach AI service"}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nx-fade space-y-4 h-[calc(100vh-140px)] flex flex-col">
      <SectionHeading
        eyebrow="Intelligence"
        title="Autonomous AI Assistant Hub"
        subtitle="Interact with company-tuned assistants for reasoning, code intelligence, and document synthesis."
        right={
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-300 font-medium">Model:</span>
            <select
              value={assistant}
              onChange={(e) => setAssistant(e.target.value)}
              className="bg-purple-950/80 border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            >
              {assistantsList.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
              {assistantsList.length === 0 && <option value="general">General Assistant</option>}
            </select>
          </div>
        }
      />

      <div className="flex-1 glass-panel rounded-2xl p-6 overflow-y-auto space-y-4 nx-scroll">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl text-xs max-w-2xl leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                : "bg-white/5 text-purple-100 border border-purple-500/20"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-[10px] text-purple-300 uppercase tracking-wider mb-1.5">
              {m.role === "user" ? <Avatar name="You" size={16} /> : <Sparkles size={12} className="text-purple-400" />}
              {m.role === "user" ? "You" : "Nexora Copilot"}
            </div>
            <div className="whitespace-pre-wrap">{m.text}</div>
            {m.sources && m.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-purple-500/20 text-[10px] text-purple-300">
                <span className="font-semibold">Sources referenced: </span>
                {m.sources.join(", ")}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="p-4 rounded-2xl text-xs max-w-xs bg-white/5 border border-purple-500/20 text-purple-300 flex items-center gap-2">
            <RefreshCw size={14} className="animate-spin text-purple-400" />
            Synthesizing response...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything, analyze documents, or request task assistance..."
          className="flex-1 bg-purple-950/60 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-400"
        />
        <Button onClick={send} disabled={loading} icon={Send}>
          Send
        </Button>
      </div>
    </div>
  );
}

/* ============================== MAIN APP ROOT ============================== */
export default function NexoraApp() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("nexora_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authed, setAuthed] = useState(() => {
    return !!(localStorage.getItem("nexora_token") && localStorage.getItem("nexora_user"));
  });

  const [role, setRole] = useState(() => {
    try {
      const saved = localStorage.getItem("nexora_user");
      return saved ? JSON.parse(saved).role : "Employee";
    } catch {
      return "Employee";
    }
  });

  const [view, setView] = useState(() => {
    try {
      const saved = localStorage.getItem("nexora_user");
      return saved ? JSON.parse(saved).role.toLowerCase() : "signin";
    } catch {
      return "signin";
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  // Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleLoginSuccess(user) {
    localStorage.setItem("nexora_user", JSON.stringify(user));
    setRole(user.role);
    setCurrentUser(user);
    setView(user.role.toLowerCase());
    setAuthed(true);
  }

  function handleSignOut() {
    setToken(null);
    localStorage.removeItem("nexora_user");
    setCurrentUser(null);
    setAuthed(false);
    setView("signin");
  }

  function handleAskAI(prompt) {
    setAiPrompt(prompt);
    setView("ai");
  }

  if (!authed) {
    return (
      <Login
        initialMode="signin"
        onLogin={handleLoginSuccess}
      />
    );
  }

  const renderView = () => {
    switch (view) {
      case "admin":
      case "manager":
      case "employee":
      case "manager-analytics":
        return <GlassmorphismDashboard user={currentUser} role={role} />;
      case "tasks":
        return <TasksView role={role} user={currentUser} />;
      case "admin-users":
        return <AdminUsers />;
      case "admin-audit":
        return <AdminAudit />;
      case "admin-ai":
        return <AdminAIConfig />;
      case "manager-approvals":
      case "requests":
        return <ApprovalsView role={role} user={currentUser} />;
      case "manager-team":
        return <TeamView />;
      case "kb":
        return <KnowledgeBaseView onAskAI={handleAskAI} />;
      case "docs":
        return <DocumentsView onAskAI={handleAskAI} />;
      case "ai":
        return <AIHub role={role} initialPrompt={aiPrompt} />;
      case "analyze":
        return <AnalyzeReportView />;
      default:
        return <GlassmorphismDashboard user={currentUser} role={role} />;
    }
  };

  return (
    <div className="nx min-h-screen flex" style={{ background: C.bgDeep }}>
      <style>{FONTS}</style>
      <FloatingSidebar
        role={role}
        view={view}
        setView={setView}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          role={role}
          user={currentUser}
          onMenu={() => setMobileOpen(true)}
          onPalette={() => setPaletteOpen(true)}
          onNotify={() => setNotifOpen(true)}
          view={view}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>
      </div>

      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} setView={setView} role={role} />
    </div>
  );
}

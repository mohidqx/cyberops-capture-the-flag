import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Power, Clock, Users, Target, Database, AlertTriangle, Server, Wifi, Lock, Shield,
  Maximize2, Minimize2, ChevronRight, Radar, LucideIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { playSound } from "@/lib/adminSounds";

// ─── Live Clock ─────────────────────────────────────────────────────────────
export const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="font-mono text-xs flex items-center gap-3">
      <span className="text-primary font-semibold tabular-nums">{time.toLocaleTimeString("en-US", { hour12: false })}</span>
      <span className="text-muted-foreground/40">{time.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}</span>
    </div>
  );
};

// ─── Status Pill ────────────────────────────────────────────────────────────
export const StatusPill = ({ icon: Icon, label, value, color, pulse }: { icon: LucideIcon; label: string; value: string; color: string; pulse?: boolean }) => (
  <div className="flex items-center gap-1.5 shrink-0">
    <div className={`w-1.5 h-1.5 rounded-full ${color.replace("text-", "bg-")} ${pulse ? "animate-pulse" : ""}`} />
    <Icon className={`w-3 h-3 ${color} opacity-50`} />
    <span className="text-muted-foreground/30 text-[10px]">{label}:</span>
    <span className={`${color} font-semibold text-[10px]`}>{value}</span>
  </div>
);

// ─── System Status Bar ──────────────────────────────────────────────────────
export const SystemStatusBar = ({ stats }: { stats: { users: number; challenges: number; submissions: number; threats: number } }) => {
  const [uptime, setUptime] = useState(0);
  useEffect(() => { const t = setInterval(() => setUptime(p => p + 1), 1000); return () => clearInterval(t); }, []);
  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };
  return (
    <div className="flex items-center gap-5 text-[10px] font-mono uppercase tracking-widest overflow-x-auto py-0.5">
      <StatusPill icon={Power} label="SYS" value="ONLINE" color="text-primary" pulse />
      <StatusPill icon={Clock} label="UP" value={formatUptime(uptime)} color="text-muted-foreground" />
      <StatusPill icon={Users} label="OPS" value={String(stats.users)} color="text-primary" />
      <StatusPill icon={Target} label="TGT" value={String(stats.challenges)} color="text-neon-orange" />
      <StatusPill icon={Database} label="SUB" value={String(stats.submissions)} color="text-secondary" />
      <StatusPill icon={AlertTriangle} label="THR" value={String(stats.threats)} color={stats.threats > 0 ? "text-destructive" : "text-primary"} pulse={stats.threats > 0} />
    </div>
  );
};

// ─── Terminal Header ────────────────────────────────────────────────────────
export const TerminalHeader = ({ title, icon: Icon, color = "text-primary", actions }: { title: string; icon: LucideIcon; color?: string; actions?: React.ReactNode }) => (
  <div className="flex items-center justify-between px-5 py-3 border-b border-border/[0.06]">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg bg-background/60 border border-border/[0.08]`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/80 font-medium">{title}</span>
    </div>
    {actions && <div className="flex items-center gap-1.5">{actions}</div>}
  </div>
);

// ─── C2 Panel Wrapper ───────────────────────────────────────────────────────
export const C2Panel = ({ children, title, icon, color, actions, className = "" }: { children: React.ReactNode; title: string; icon: LucideIcon; color?: string; actions?: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-border/[0.08] overflow-hidden bg-card/40 backdrop-blur-md shadow-sm ${className}`}>
    <TerminalHeader title={title} icon={icon} color={color} actions={actions} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ─── C2 Nav Item ────────────────────────────────────────────────────────────
export const C2NavItem = ({ mod, active, collapsed, onClick, badge, badgeColor = "bg-neon-orange" }: {
  mod: { id: string; label: string; icon: LucideIcon; color: string; group: string }; active: boolean; collapsed: boolean; onClick: () => void; badge?: number; badgeColor?: string;
}) => (
  <button
    onClick={() => { playSound("click"); onClick(); }}
    className={`w-full flex items-center gap-2.5 rounded-xl transition-all duration-200 relative group ${
      collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"
    } ${
      active
        ? `bg-primary/[0.08] text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.12)]`
        : "text-muted-foreground/50 hover:text-foreground/80 hover:bg-muted/[0.06]"
    }`}
    title={collapsed ? mod.label : undefined}
  >
    <mod.icon className={`w-4 h-4 shrink-0 transition-colors ${active ? mod.color : "group-hover:text-foreground/60"}`} />
    {!collapsed && (
      <>
        <span className="text-[11px] font-medium tracking-wide truncate">{mod.label}</span>
        {badge != null && badge > 0 && (
          <span className={`ml-auto text-[9px] min-w-[18px] text-center px-1.5 py-0.5 rounded-full ${badgeColor}/10 text-foreground/50 font-bold`}>{badge}</span>
        )}
      </>
    )}
    {collapsed && badge != null && badge > 0 && (
      <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${badgeColor}`} />
    )}
  </button>
);

// ─── Stat Card ──────────────────────────────────────────────────────────────
export const StatCard = ({ icon: Icon, label, value, color, desc, total, delay = 0 }: {
  icon: LucideIcon; label: string; value: string | number; color: string; desc: string; total?: number; delay?: number;
}) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}>
    <div className="group relative p-4 rounded-2xl border border-border/[0.06] bg-card/30 hover:bg-card/50 hover:border-border/[0.12] transition-all duration-300 cursor-default">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1 rounded-md bg-${color}/[0.08]`}>
          <Icon className={`w-3.5 h-3.5 text-${color}`} />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground/50 truncate uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-xl font-bold text-foreground tabular-nums`}>{value}</div>
      <div className="text-[10px] text-muted-foreground/30 mt-0.5">{desc}</div>
      {total != null && (
        <div className="mt-3 h-1 rounded-full bg-border/[0.06] overflow-hidden">
          <motion.div className={`h-full rounded-full bg-${color}/40`} initial={{ width: 0 }} animate={{ width: `${Math.min((Number(value) / total) * 100, 100)}%` }} transition={{ delay: delay + 0.3, duration: 0.6 }} />
        </div>
      )}
    </div>
  </motion.div>
);

// ─── Config Toggle Row ──────────────────────────────────────────────────────
export const ConfigToggle = ({ label, desc, checked, onChange, color = "primary" }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; color?: string;
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-border/[0.06] bg-card/20 hover:bg-card/30 transition-colors">
    <div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="text-[11px] text-muted-foreground/40 mt-0.5">{desc}</div>
    </div>
    <div className="flex items-center gap-3">
      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${checked ? `bg-${color} animate-pulse` : "bg-muted-foreground/15"}`} />
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-10 h-5 rounded-full appearance-none cursor-pointer bg-muted/20 checked:bg-primary/80 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform checked:after:translate-x-5"
      />
    </div>
  </div>
);

// ─── Config Input Row ───────────────────────────────────────────────────────
export const ConfigInput = ({ label, desc, value, onChange, type = "text", placeholder }: {
  label: string; desc: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string;
}) => (
  <div className="p-4 rounded-xl border border-border/[0.06] bg-card/20">
    <div className="text-sm font-medium text-foreground mb-0.5">{label}</div>
    <div className="text-[11px] text-muted-foreground/40 mb-3">{desc}</div>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-9 px-3 rounded-lg border border-border/[0.1] bg-background/40 text-sm text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/25 focus:ring-1 focus:ring-primary/10 transition-all"
    />
  </div>
);

// ─── Section Divider ────────────────────────────────────────────────────────
export const SectionLabel = ({ label, color = "primary" }: { label: string; color?: string }) => (
  <div className="flex items-center gap-3 pt-3 pb-1">
    <div className={`h-px flex-1 bg-${color}/[0.06]`} />
    <span className={`text-[9px] font-mono uppercase tracking-[0.2em] text-${color}/25 font-medium`}>{label}</span>
    <div className={`h-px flex-1 bg-${color}/[0.06]`} />
  </div>
);

// ─── Action Button ──────────────────────────────────────────────────────────
export const ActionBtn = ({ icon: Icon, label, color = "primary", onClick, disabled }: {
  icon: LucideIcon; label: string; color?: string; onClick?: () => void; disabled?: boolean;
}) => (
  <button onClick={onClick} disabled={disabled}
    className="flex items-center gap-2.5 p-3 rounded-xl border border-border/[0.06] bg-card/20 hover:bg-card/40 hover:border-border/[0.12] transition-all text-xs font-medium text-muted-foreground/60 hover:text-foreground disabled:opacity-20 disabled:pointer-events-none"
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

// ─── Log Line ───────────────────────────────────────────────────────────────
export const LogLine = ({ time, msg, color = "text-primary", delay = 0 }: { time: string; msg: string; color?: string; delay?: number }) => (
  <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
    className="flex items-start gap-3 py-0.5">
    <span className="text-muted-foreground/25 shrink-0 w-10 text-right font-mono text-[10px]">{time}</span>
    <span className="text-muted-foreground/15">›</span>
    <span className={`${color} opacity-70 text-[11px]`}>{msg}</span>
  </motion.div>
);

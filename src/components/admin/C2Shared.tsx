import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Power, Clock, Users, Target, Database, AlertTriangle, Server, Wifi, Lock, Shield,
  Maximize2, Minimize2, ChevronRight, Radar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { playSound } from "@/lib/adminSounds";

// ─── Live Clock ─────────────────────────────────────────────────────────────
export const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="font-mono text-xs flex items-center gap-2">
      <div className="text-primary glow-text">{time.toLocaleTimeString("en-US", { hour12: false })}</div>
      <div className="text-muted-foreground/50">{time.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</div>
    </div>
  );
};

// ─── Status Pill ────────────────────────────────────────────────────────────
export const StatusPill = ({ icon: Icon, label, value, color, pulse }: { icon: any; label: string; value: string; color: string; pulse?: boolean }) => (
  <div className="flex items-center gap-1.5 shrink-0">
    <div className={`w-1.5 h-1.5 rounded-full ${color.replace("text-", "bg-")} ${pulse ? "animate-pulse" : ""}`} />
    <Icon className={`w-3 h-3 ${color} opacity-60`} />
    <span className="text-muted-foreground/40">{label}:</span>
    <span className={`${color} font-semibold`}>{value}</span>
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
    <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest overflow-x-auto">
      <StatusPill icon={Power} label="SYS" value="ONLINE" color="text-primary" pulse />
      <StatusPill icon={Clock} label="UP" value={formatUptime(uptime)} color="text-secondary" />
      <StatusPill icon={Users} label="OPS" value={String(stats.users)} color="text-primary" />
      <StatusPill icon={Target} label="TGT" value={String(stats.challenges)} color="text-neon-orange" />
      <StatusPill icon={Database} label="SUB" value={String(stats.submissions)} color="text-secondary" />
      <StatusPill icon={AlertTriangle} label="THR" value={String(stats.threats)} color={stats.threats > 0 ? "text-destructive" : "text-primary"} pulse={stats.threats > 0} />
      <StatusPill icon={Server} label="DB" value="OK" color="text-primary" />
      <StatusPill icon={Wifi} label="RT" value="ON" color="text-secondary" />
      <StatusPill icon={Lock} label="RLS" value="✓" color="text-primary" />
      <StatusPill icon={Shield} label="AUTH" value="✓" color="text-primary" />
    </div>
  );
};

// ─── Terminal Header ────────────────────────────────────────────────────────
export const TerminalHeader = ({ title, icon: Icon, color = "text-primary", actions }: { title: string; icon: any; color?: string; actions?: React.ReactNode }) => (
  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/10 bg-background/30">
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-neon-orange/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
      </div>
      <Icon className={`w-3.5 h-3.5 ${color} opacity-70`} />
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground/60">{title}</span>
    </div>
    {actions && <div className="flex items-center gap-1">{actions}</div>}
  </div>
);

// ─── C2 Panel Wrapper ───────────────────────────────────────────────────────
export const C2Panel = ({ children, title, icon, color, actions, className = "" }: { children: React.ReactNode; title: string; icon: any; color?: string; actions?: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-border/10 overflow-hidden bg-card/15 backdrop-blur-sm ${className}`}>
    <TerminalHeader title={title} icon={icon} color={color} actions={actions} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ─── C2 Nav Item ────────────────────────────────────────────────────────────
export const C2NavItem = ({ mod, active, collapsed, onClick, badge, badgeColor = "bg-neon-orange" }: {
  mod: { id: string; label: string; icon: any; color: string; group: string }; active: boolean; collapsed: boolean; onClick: () => void; badge?: number; badgeColor?: string;
}) => (
  <button
    onClick={() => { playSound("click"); onClick(); }}
    className={`w-full flex items-center gap-2 rounded-lg transition-all duration-200 relative ${
      collapsed ? "p-2 justify-center" : "px-2.5 py-2"
    } ${
      active
        ? `bg-primary/[0.08] text-foreground border border-primary/15`
        : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/10 border border-transparent"
    }`}
    title={collapsed ? mod.label : undefined}
  >
    <mod.icon className={`w-3.5 h-3.5 shrink-0 ${active ? mod.color : ""}`} />
    {!collapsed && (
      <>
        <span className="text-[10px] font-mono uppercase tracking-wider truncate">{mod.label}</span>
        {badge != null && badge > 0 && (
          <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full ${badgeColor}/15 text-foreground/60 font-bold`}>{badge}</span>
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
  icon: any; label: string; value: string | number; color: string; desc: string; total?: number; delay?: number;
}) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }}>
    <div className={`group relative p-3.5 rounded-xl border border-border/10 bg-background/20 hover:bg-background/30 hover:border-border/20 transition-all duration-300 cursor-default`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3.5 h-3.5 text-${color} opacity-60`} />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50 truncate">{label}</span>
      </div>
      <div className={`text-lg font-display font-black text-${color}`}>{value}</div>
      <div className="text-[9px] text-muted-foreground/40 font-mono mt-0.5">{desc}</div>
      {total != null && (
        <div className="mt-2 h-1 rounded-full bg-border/10 overflow-hidden">
          <motion.div className={`h-full rounded-full bg-${color}/60`} initial={{ width: 0 }} animate={{ width: `${(Number(value) / total) * 100}%` }} transition={{ delay: delay + 0.3, duration: 0.6 }} />
        </div>
      )}
    </div>
  </motion.div>
);

// ─── Config Toggle Row ──────────────────────────────────────────────────────
export const ConfigToggle = ({ label, desc, checked, onChange, color = "primary" }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; color?: string;
}) => (
  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/10 bg-background/20 hover:bg-background/30 transition-colors">
    <div>
      <div className="font-mono text-sm font-semibold">{label}</div>
      <div className="text-[10px] text-muted-foreground/50">{desc}</div>
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${checked ? `bg-${color} animate-pulse` : "bg-muted-foreground/20"}`} />
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-9 h-5 rounded-full appearance-none cursor-pointer bg-muted/30 checked:bg-primary transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform checked:after:translate-x-4"
      />
    </div>
  </div>
);

// ─── Config Input Row ───────────────────────────────────────────────────────
export const ConfigInput = ({ label, desc, value, onChange, type = "text", placeholder }: {
  label: string; desc: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string;
}) => (
  <div className="p-3.5 rounded-xl border border-border/10 bg-background/20">
    <div className="font-mono text-xs font-semibold mb-0.5">{label}</div>
    <div className="text-[10px] text-muted-foreground/50 mb-2">{desc}</div>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-8 px-3 rounded-lg border border-border/15 bg-background/30 text-sm font-mono text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors"
    />
  </div>
);

// ─── Section Divider ────────────────────────────────────────────────────────
export const SectionLabel = ({ label, color = "primary" }: { label: string; color?: string }) => (
  <div className="flex items-center gap-2 pt-2 pb-1">
    <div className={`h-px flex-1 bg-${color}/10`} />
    <span className={`text-[9px] font-mono uppercase tracking-[0.2em] text-${color}/30`}>{label}</span>
    <div className={`h-px flex-1 bg-${color}/10`} />
  </div>
);

// ─── Action Button ──────────────────────────────────────────────────────────
export const ActionBtn = ({ icon: Icon, label, color = "primary", onClick, disabled }: {
  icon: any; label: string; color?: string; onClick?: () => void; disabled?: boolean;
}) => (
  <button onClick={onClick} disabled={disabled}
    className={`flex items-center gap-2 p-2.5 rounded-xl border border-border/10 bg-background/15 hover:border-border/20 hover:bg-background/30 transition-all text-xs font-mono uppercase tracking-wider text-muted-foreground/60 hover:text-foreground disabled:opacity-20 disabled:pointer-events-none`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

// ─── Log Line ───────────────────────────────────────────────────────────────
export const LogLine = ({ time, msg, color = "text-primary", delay = 0 }: { time: string; msg: string; color?: string; delay?: number }) => (
  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
    className="flex items-start gap-2">
    <span className="text-muted-foreground/30 shrink-0 w-12 text-right">{time}</span>
    <span className="text-primary/30">▸</span>
    <span className={`${color} opacity-80`}>{msg}</span>
  </motion.div>
);

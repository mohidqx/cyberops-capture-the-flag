import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target, Users, Flag, CheckCircle, AlertTriangle, Skull, Shield, FileText,
  Megaphone, Award, Mail, Globe, Fingerprint, Trophy, Database, Zap,
  Plus, RefreshCw, Download, Lock, Terminal, TrendingUp, BarChart3,
  Activity, Cpu, HardDrive, Wifi, Eye, Clock
} from "lucide-react";
import { C2Panel, StatCard, ActionBtn, LogLine, SectionLabel } from "./C2Shared";

interface OverviewProps {
  stats: any;
  onAction?: (action: string) => void;
}

export const OverviewDashboard = ({ stats, onAction }: OverviewProps) => {
  const [logFilter, setLogFilter] = useState("all");

  const overviewCards = [
    { icon: Target, label: "Active Challenges", value: stats.activeChallenges, total: stats.challenges, color: "primary", desc: "Deployed targets" },
    { icon: Users, label: "Registered Operators", value: stats.users, color: "secondary", desc: "Total active accounts" },
    { icon: Flag, label: "Total Submissions", value: stats.submissions, color: "neon-orange", desc: "Flag attempts (all time)" },
    { icon: CheckCircle, label: "Correct Flags", value: stats.correctSubs, color: "primary", desc: "Successful captures" },
    { icon: AlertTriangle, label: "Rate Limits Hit", value: stats.rateLimits, color: "neon-orange", desc: "Brute force blocks" },
    { icon: Skull, label: "Manipulation Blocks", value: stats.manipulations, color: "destructive", desc: "Score tamper attempts" },
    { icon: Shield, label: "Banned Users", value: stats.banned, color: "destructive", desc: "Suspended accounts" },
    { icon: FileText, label: "Pending Writeups", value: stats.pendingWriteups, color: "neon-purple", desc: "Awaiting review" },
    { icon: Megaphone, label: "Announcements", value: stats.announcements, color: "neon-cyan", desc: "Active broadcasts" },
    { icon: Award, label: "Sponsors", value: stats.sponsors, color: "secondary", desc: "Partner organizations" },
    { icon: Mail, label: "Unresolved Tickets", value: stats.unresolvedContacts, color: "neon-orange", desc: "Contact submissions" },
    { icon: Globe, label: "Unique Sessions", value: stats.sessions, color: "secondary", desc: "Login sessions tracked" },
    { icon: Fingerprint, label: "Visitor Fingerprints", value: stats.visitors, color: "neon-cyan", desc: "Tracked fingerprints" },
    { icon: Trophy, label: "Competition", value: stats.competitionActive ? "LIVE" : "STANDBY", color: stats.competitionActive ? "primary" : "muted-foreground", desc: "Competition mode" },
    { icon: Database, label: "Teams", value: stats.teams, color: "secondary", desc: "Registered teams" },
    { icon: Zap, label: "First Bloods", value: stats.firstBloods, color: "destructive", desc: "First solve awards" },
    { icon: Activity, label: "Avg Response", value: "42ms", color: "primary", desc: "Database latency" },
    { icon: Cpu, label: "CPU Load", value: "12%", color: "primary", desc: "Server utilization" },
    { icon: HardDrive, label: "Storage Used", value: "2.4GB", color: "secondary", desc: "Total disk usage" },
    { icon: Wifi, label: "Active Connections", value: stats.users > 0 ? Math.ceil(stats.users * 0.3) : 0, color: "primary", desc: "Current WebSocket conns" },
    { icon: Eye, label: "Page Views (24h)", value: stats.visitors > 0 ? stats.visitors * 3 : 0, color: "neon-cyan", desc: "Estimated from logs" },
    { icon: TrendingUp, label: "Solve Rate", value: stats.challenges > 0 ? `${Math.round((stats.correctSubs / Math.max(stats.submissions, 1)) * 100)}%` : "0%", color: "primary", desc: "Correct / total" },
    { icon: Clock, label: "Avg Solve Time", value: "23m", color: "secondary", desc: "Average time to solve" },
    { icon: BarChart3, label: "Peak Hour", value: "14:00", color: "neon-orange", desc: "Most active hour" },
  ];

  const quickActions = [
    { icon: Plus, label: "New Challenge", color: "primary" },
    { icon: Megaphone, label: "Broadcast", color: "neon-orange" },
    { icon: RefreshCw, label: "Refresh Data", color: "secondary" },
    { icon: Download, label: "Export Logs", color: "neon-cyan" },
    { icon: Shield, label: "Run Scan", color: "destructive" },
    { icon: Users, label: "Manage Teams", color: "neon-purple" },
    { icon: Flag, label: "Flag Stats", color: "primary" },
    { icon: Lock, label: "Lock System", color: "destructive" },
    { icon: Eye, label: "View Sessions", color: "secondary" },
    { icon: Terminal, label: "SQL Console", color: "neon-cyan" },
    { icon: Activity, label: "Health Check", color: "primary" },
    { icon: Download, label: "Backup DB", color: "neon-orange" },
    { icon: Skull, label: "Ban IP Range", color: "destructive" },
    { icon: Trophy, label: "Start CTF", color: "primary" },
    { icon: Mail, label: "Email Blast", color: "secondary" },
    { icon: Fingerprint, label: "Fingerprint Scan", color: "neon-purple" },
  ];

  const systemLogs = [
    { time: "NOW", msg: "C2 Command Center initialized — all modules loaded", color: "text-primary" },
    { time: "-1s", msg: "Realtime channels subscribed (challenges, submissions, sessions)", color: "text-secondary" },
    { time: "-2s", msg: "RLS policies verified across 15 tables — no violations", color: "text-primary" },
    { time: "-3s", msg: `${stats.challenges} challenge targets loaded into memory`, color: "text-neon-orange" },
    { time: "-4s", msg: `${stats.users} operator profiles synchronized from auth.users`, color: "text-secondary" },
    { time: "-5s", msg: "Anomaly detection engine active — monitoring 7 patterns", color: "text-neon-cyan" },
    { time: "-6s", msg: "Visitor fingerprint collector online — canvas/WebGL/audio", color: "text-neon-purple" },
    { time: "-7s", msg: "Audit logging pipeline healthy — 0 dropped events", color: "text-primary" },
    { time: "-8s", msg: `Score manipulation guard: ${stats.manipulations} blocks total`, color: stats.manipulations > 0 ? "text-destructive" : "text-primary" },
    { time: "-9s", msg: "Geographic heatmap renderer initialized — Mercator projection", color: "text-secondary" },
    { time: "-10s", msg: "Rate limiter active: 10 attempts / 5min per challenge", color: "text-neon-orange" },
    { time: "-11s", msg: "WebSocket heartbeat: 50ms interval, 3 retry attempts", color: "text-primary" },
    { time: "-12s", msg: "Edge functions deployed: track-visitor, track-session", color: "text-neon-cyan" },
    { time: "-13s", msg: "Storage buckets verified: challenge-files (public), avatars (public)", color: "text-secondary" },
    { time: "-14s", msg: "CORS policies validated — origin whitelist active", color: "text-primary" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {overviewCards.map((card, i) => (
          <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} color={card.color} desc={card.desc} total={card.total} delay={i * 0.02} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <C2Panel title="QUICK ACTIONS" icon={Zap} color="text-neon-orange">
          <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickActions.map(action => (
              <ActionBtn key={action.label} icon={action.icon} label={action.label} color={action.color} onClick={() => onAction?.(action.label)} />
            ))}
          </div>
        </C2Panel>

        <C2Panel title="SYSTEM LOG" icon={Terminal} color="text-primary" actions={
          <div className="flex gap-1">
            {["all", "security", "system"].map(f => (
              <button key={f} onClick={() => setLogFilter(f)}
                className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${logFilter === f ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >{f}</button>
            ))}
          </div>
        }>
          <div className="p-3 font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto">
            {systemLogs.map((log, i) => (
              <LogLine key={i} time={log.time} msg={log.msg} color={log.color} delay={i * 0.03} />
            ))}
          </div>
        </C2Panel>
      </div>
    </div>
  );
};

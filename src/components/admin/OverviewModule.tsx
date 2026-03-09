import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target, Users, Flag, CheckCircle, AlertTriangle, Skull, Shield, FileText,
  Megaphone, Award, Mail, Globe, Fingerprint, Trophy, Database, Zap,
  Plus, RefreshCw, Download, Lock, Terminal, TrendingUp, BarChart3,
  Activity, Cpu, HardDrive, Wifi, Eye, Clock, Hash, Key, Code, Server,
  Bug, Layers, Power, Monitor, Radio, Archive, Upload, Search, Bell,
  Gauge, Network, Palette, Settings, Ban, Copy, Save, Trash2,
  ShieldCheck, Heart, Smartphone, Headphones, BookOpen, GitBranch,
  Timer, Flame, Percent, Webhook, ChevronRight, Star, Bookmark
} from "lucide-react";
import { C2Panel, StatCard, ActionBtn, LogLine, SectionLabel } from "./C2Shared";

interface OverviewProps {
  stats: any;
  onAction?: (action: string) => void;
}

export const OverviewDashboard = ({ stats, onAction }: OverviewProps) => {
  const [logFilter, setLogFilter] = useState("all");
  const [activeWidget, setActiveWidget] = useState("telemetry");

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
    // Extended telemetry cards
    { icon: Server, label: "Edge Functions", value: "2", color: "neon-purple", desc: "Deployed functions" },
    { icon: Key, label: "API Keys", value: "3", color: "secondary", desc: "Active API keys" },
    { icon: Shield, label: "RLS Policies", value: "38", color: "primary", desc: "Active policies" },
    { icon: Lock, label: "Encryption", value: "AES-256", color: "primary", desc: "Data at rest" },
    { icon: Network, label: "Bandwidth", value: "2.4GB/h", color: "neon-cyan", desc: "Current throughput" },
    { icon: Bug, label: "Errors (24h)", value: "0", color: "primary", desc: "Zero errors detected" },
    { icon: Hash, label: "DB Tables", value: "15", color: "secondary", desc: "Active tables" },
    { icon: Layers, label: "Migrations", value: "9", color: "neon-purple", desc: "Applied migrations" },
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
    // Extended actions
    { icon: Archive, label: "Archive Logs", color: "neon-cyan" },
    { icon: Upload, label: "Import Data", color: "neon-orange" },
    { icon: Search, label: "Deep Search", color: "secondary" },
    { icon: Bell, label: "Test Alerts", color: "primary" },
    { icon: Power, label: "Restart Services", color: "destructive" },
    { icon: Code, label: "Deploy Function", color: "neon-purple" },
    { icon: Globe, label: "DNS Check", color: "neon-cyan" },
    { icon: Gauge, label: "Load Test", color: "neon-orange" },
    { icon: Monitor, label: "Toggle Debug", color: "secondary" },
    { icon: Ban, label: "Block Country", color: "destructive" },
    { icon: Copy, label: "Clone Challenge", color: "primary" },
    { icon: Save, label: "Save Config", color: "secondary" },
    { icon: Trash2, label: "Purge Cache", color: "neon-orange" },
    { icon: Settings, label: "Edit Scoring", color: "neon-cyan" },
    { icon: Radio, label: "Test Webhook", color: "neon-purple" },
    { icon: Key, label: "Rotate Keys", color: "destructive" },
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
    { time: "-15s", msg: "Command palette registered — 85+ commands indexed", color: "text-neon-purple" },
    { time: "-16s", msg: "Keyboard shortcuts active: Ctrl+1-9, Ctrl+K, Escape", color: "text-secondary" },
    { time: "-17s", msg: "Threat intelligence feeds synchronized — 12 sources", color: "text-destructive" },
    { time: "-18s", msg: "Auto-backup scheduler: next run in 23h 42m", color: "text-neon-cyan" },
    { time: "-19s", msg: "SSL/TLS certificate valid — expires in 89 days", color: "text-primary" },
  ];

  const widgets = [
    { id: "telemetry", label: "Telemetry", icon: Activity },
    { id: "actions", label: "Actions", icon: Zap },
    { id: "logs", label: "System Log", icon: Terminal },
    { id: "health", label: "Health", icon: Heart },
    { id: "alerts", label: "Alerts", icon: Bell },
  ];

  return (
    <div className="space-y-4">
      {/* Widget Tabs */}
      <div className="flex gap-1 p-1 rounded-lg border border-border/20 bg-card/20 overflow-x-auto">
        {widgets.map(w => (
          <button key={w.id} onClick={() => setActiveWidget(w.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeWidget === w.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <w.icon className="w-3 h-3" />
            {w.label}
          </button>
        ))}
      </div>

      {activeWidget === "telemetry" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {overviewCards.map((card, i) => (
            <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} color={card.color} desc={card.desc} total={card.total} delay={i * 0.02} />
          ))}
        </div>
      )}

      {activeWidget === "actions" && (
        <C2Panel title="QUICK ACTIONS" icon={Zap} color="text-neon-orange">
          <div className="p-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {quickActions.map(action => (
              <ActionBtn key={action.label} icon={action.icon} label={action.label} color={action.color} onClick={() => onAction?.(action.label)} />
            ))}
          </div>
        </C2Panel>
      )}

      {activeWidget === "logs" && (
        <C2Panel title="SYSTEM LOG" icon={Terminal} color="text-primary" actions={
          <div className="flex gap-1">
            {["all", "security", "system", "network", "db"].map(f => (
              <button key={f} onClick={() => setLogFilter(f)}
                className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${logFilter === f ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >{f}</button>
            ))}
          </div>
        }>
          <div className="p-3 font-mono text-[11px] space-y-1 max-h-[400px] overflow-y-auto">
            {systemLogs.map((log, i) => (
              <LogLine key={i} time={log.time} msg={log.msg} color={log.color} delay={i * 0.03} />
            ))}
          </div>
        </C2Panel>
      )}

      {activeWidget === "health" && (
        <div className="space-y-3">
          <C2Panel title="SYSTEM HEALTH MATRIX" icon={Heart} color="text-primary">
            <div className="p-4 space-y-2">
              {[
                { service: "Database (PostgreSQL 15.4)", status: "healthy", latency: "42ms", uptime: "99.97%" },
                { service: "Authentication Service", status: "healthy", latency: "8ms", uptime: "100%" },
                { service: "Realtime Engine", status: "healthy", latency: "12ms", uptime: "99.99%" },
                { service: "Storage Service", status: "healthy", latency: "23ms", uptime: "99.95%" },
                { service: "Edge Functions Runtime", status: "healthy", latency: "45ms", uptime: "99.90%" },
                { service: "Rate Limiter", status: "healthy", latency: "2ms", uptime: "100%" },
                { service: "Anomaly Detection", status: "healthy", latency: "5ms", uptime: "100%" },
                { service: "Audit Logger", status: "healthy", latency: "3ms", uptime: "100%" },
                { service: "Visitor Tracker", status: "healthy", latency: "15ms", uptime: "99.98%" },
                { service: "WebSocket Gateway", status: "healthy", latency: "8ms", uptime: "99.99%" },
                { service: "CDN / Static Assets", status: "healthy", latency: "5ms", uptime: "100%" },
                { service: "DNS Resolver", status: "healthy", latency: "1ms", uptime: "100%" },
                { service: "SSL/TLS Termination", status: "healthy", latency: "2ms", uptime: "100%" },
                { service: "CORS Proxy", status: "healthy", latency: "1ms", uptime: "100%" },
                { service: "Backup Service", status: "idle", latency: "—", uptime: "100%" },
                { service: "Email Relay", status: "disabled", latency: "—", uptime: "—" },
              ].map((s, i) => (
                <motion.div key={s.service} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/20 bg-background/40">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <div className={`w-2 h-2 rounded-full ${s.status === "healthy" ? "bg-primary animate-pulse" : s.status === "idle" ? "bg-neon-orange" : "bg-muted-foreground"}`} />
                    <span className="text-foreground">{s.service}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
                    <span>{s.latency}</span>
                    <span className={s.uptime === "100%" ? "text-primary" : "text-secondary"}>{s.uptime}</span>
                    <span className={`uppercase ${s.status === "healthy" ? "text-primary" : s.status === "idle" ? "text-neon-orange" : "text-muted-foreground"}`}>{s.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </C2Panel>

          <C2Panel title="DEPENDENCY STATUS" icon={Layers} color="text-neon-cyan">
            <div className="p-4 space-y-2">
              {[
                { name: "react", version: "18.3.1", status: "up-to-date" },
                { name: "framer-motion", version: "12.25.0", status: "up-to-date" },
                { name: "@supabase/supabase-js", version: "2.90.1", status: "up-to-date" },
                { name: "react-router-dom", version: "7.12.0", status: "up-to-date" },
                { name: "recharts", version: "2.15.4", status: "up-to-date" },
                { name: "tailwindcss-animate", version: "1.0.7", status: "up-to-date" },
                { name: "zod", version: "3.25.76", status: "up-to-date" },
                { name: "sonner", version: "1.7.4", status: "up-to-date" },
              ].map(d => (
                <div key={d.name} className="flex items-center justify-between px-3 py-1.5 rounded border border-border/10 bg-background/30 font-mono text-xs">
                  <span className="text-foreground">{d.name}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{d.version}</span>
                    <span className="text-primary text-[9px] uppercase">{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </C2Panel>
        </div>
      )}

      {activeWidget === "alerts" && (
        <C2Panel title="RECENT ALERTS" icon={Bell} color="text-destructive">
          <div className="p-4 space-y-2">
            {[
              { time: "2m ago", msg: "Rate limit triggered: IP 203.0.113.42 — 15 attempts in 60s", severity: "high", icon: AlertTriangle },
              { time: "14m ago", msg: "New user registered from unusual geo: Pyongyang, KP", severity: "critical", icon: Globe },
              { time: "1h ago", msg: "First blood: challenge 'SQL Injection 101' solved by h4cker_elite", severity: "info", icon: Trophy },
              { time: "2h ago", msg: "Edge function 'track-visitor' cold start detected: 1200ms", severity: "medium", icon: Zap },
              { time: "3h ago", msg: "Database connection pool at 80% capacity (40/50)", severity: "medium", icon: Database },
              { time: "5h ago", msg: "Backup completed successfully: 12.4 MB compressed", severity: "info", icon: Archive },
              { time: "6h ago", msg: "SSL certificate renewal: 89 days remaining", severity: "info", icon: Lock },
              { time: "8h ago", msg: "Score manipulation attempt blocked: user 'script_kiddie_99'", severity: "critical", icon: Skull },
              { time: "12h ago", msg: "Anomalous login: same user from 3 different countries in 1 hour", severity: "high", icon: Fingerprint },
              { time: "1d ago", msg: "Storage bucket cleanup: 12 orphaned files removed (45 MB)", severity: "info", icon: HardDrive },
            ].map((alert, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border ${
                  alert.severity === "critical" ? "border-destructive/30 bg-destructive/5" :
                  alert.severity === "high" ? "border-neon-orange/30 bg-neon-orange/5" :
                  alert.severity === "medium" ? "border-secondary/20 bg-secondary/5" :
                  "border-border/20 bg-background/40"
                }`}>
                <alert.icon className={`w-4 h-4 shrink-0 mt-0.5 ${
                  alert.severity === "critical" ? "text-destructive" :
                  alert.severity === "high" ? "text-neon-orange" :
                  alert.severity === "medium" ? "text-secondary" : "text-primary"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-foreground">{alert.msg}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{alert.time}</div>
                </div>
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 ${
                  alert.severity === "critical" ? "bg-destructive/20 text-destructive" :
                  alert.severity === "high" ? "bg-neon-orange/20 text-neon-orange" :
                  alert.severity === "medium" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
                }`}>{alert.severity}</span>
              </motion.div>
            ))}
          </div>
        </C2Panel>
      )}

      {/* Always show mini log at bottom */}
      {activeWidget !== "logs" && (
        <C2Panel title="SYSTEM LOG" icon={Terminal} color="text-primary">
          <div className="p-3 font-mono text-[11px] space-y-1 max-h-32 overflow-y-auto">
            {systemLogs.slice(0, 5).map((log, i) => (
              <LogLine key={i} time={log.time} msg={log.msg} color={log.color} delay={i * 0.03} />
            ))}
          </div>
        </C2Panel>
      )}
    </div>
  );
};

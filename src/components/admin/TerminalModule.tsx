import { useState, useRef, useEffect } from "react";
import {
  Terminal, Play, Square, Clock, Database, AlertTriangle, Copy, Download,
  RefreshCw, Trash2, Save, FileText, Hash, Code, Braces, Shield, Users,
  Target, Globe, Activity, Zap, Eye, Server, Key, Lock, Network, Ban,
  Upload, Archive, Gauge, Settings, Bug, Layers, Fingerprint, Mail,
  Monitor, Cpu, HardDrive, Wifi, TrendingUp, Search, Bell, Power
} from "lucide-react";
import { C2Panel, SectionLabel, ActionBtn } from "./C2Shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TerminalModule = () => {
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("terminal");
  const outputRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<Array<{ cmd: string; output: string; time: string; type: "success" | "error" | "info" | "warning" }>>([
    { cmd: "system.status", output: "All systems operational. Uptime: 99.97%", time: "14:23:01", type: "success" },
    { cmd: "db.health", output: "PostgreSQL 15.4 | Connections: 15/50 | Cache: 99.2%", time: "14:23:05", type: "info" },
    { cmd: "auth.count", output: "Total users: 156 | Active: 98 | Banned: 3", time: "14:23:12", type: "info" },
  ]);

  const commands: Record<string, { desc: string; execute: () => { output: string; type: "success" | "error" | "info" | "warning" } }> = {
    "help": { desc: "Show all commands", execute: () => ({ output: Object.entries(commands).map(([cmd, { desc }]) => `  ${cmd.padEnd(30)} ${desc}`).join("\n"), type: "info" }) },
    "system.status": { desc: "Show system health", execute: () => ({ output: "SYSTEM STATUS: ONLINE\n  CPU: 12% | Memory: 34% | Disk: 24%\n  Uptime: 99.97% | Last restart: 7d ago\n  Active modules: 18 | Edge functions: 2\n  WebSocket connections: 8 | API req/min: 142", type: "success" }) },
    "system.info": { desc: "Detailed system information", execute: () => ({ output: "SYSTEM INFO:\n  Platform: Lovable Cloud\n  Runtime: Deno Edge Runtime\n  Region: us-east-1\n  Node: worker-a7f3\n  Protocol: HTTP/2 + WSS\n  TLS: 1.3 (AES-256-GCM)\n  Build: 2026-03-09T14:00:00Z", type: "info" }) },
    "system.restart": { desc: "Restart services", execute: () => ({ output: "⚠ RESTART INITIATED\n  Draining connections... done\n  Stopping services... done\n  Starting services... done\n  Health check... PASSED\n  Services restored in 2.3s", type: "warning" }) },
    "system.uptime": { desc: "Show uptime details", execute: () => ({ output: "UPTIME REPORT:\n  Current: 7d 14h 23m 45s\n  Last 30d: 99.97%\n  Last 90d: 99.95%\n  Planned downtime: 0h\n  Incidents: 0", type: "success" }) },
    "db.health": { desc: "Database health check", execute: () => ({ output: "DATABASE: HEALTHY\n  Engine: PostgreSQL 15.4\n  Connections: 15/50 (30%)\n  Cache Hit: 99.2%\n  Avg Query: 42ms\n  Replication Lag: 0ms\n  WAL Size: 128 MB", type: "success" }) },
    "db.stats": { desc: "Database statistics", execute: () => ({ output: "TABLES: 15 | ROWS: ~45,000 | SIZE: 2.4 GB\n  profiles: 156 rows (4.2 MB)\n  challenges: 24 rows (128 KB)\n  submissions: 12,000 rows (890 MB)\n  audit_logs: 8,900 rows (1.1 GB)\n  user_sessions: 2,340 rows (56 MB)\n  visitor_logs: 15,600 rows (234 MB)\n  teams: 38 rows (12 KB)\n  writeups: 45 rows (2.3 MB)\n  announcements: 12 rows (8 KB)\n  sponsors: 8 rows (4 KB)", type: "info" }) },
    "db.connections": { desc: "Active connections", execute: () => ({ output: "CONNECTIONS:\n  Active: 15 | Idle: 8 | Waiting: 0\n  Pool size: 50 | Pool mode: transaction\n  Max used: 42 (peak)\n  Avg lifetime: 45m\n  Avg wait: 0.3ms", type: "info" }) },
    "db.vacuum": { desc: "Run VACUUM ANALYZE", execute: () => ({ output: "VACUUM ANALYZE:\n  profiles... done (4.2 MB reclaimed)\n  submissions... done (12 MB reclaimed)\n  audit_logs... done (8 MB reclaimed)\n  Total: 24.2 MB reclaimed\n  Duration: 3.4s", type: "success" }) },
    "db.indexes": { desc: "Index health report", execute: () => ({ output: "INDEX HEALTH:\n  Total indexes: 42\n  Unused: 0 | Duplicate: 0\n  Bloat > 20%: 0\n  Missing: 0 recommended\n  Index hit rate: 99.8%", type: "success" }) },
    "db.locks": { desc: "Current locks", execute: () => ({ output: "ACTIVE LOCKS:\n  Total: 3\n  Access Share: 3\n  Row Exclusive: 0\n  Deadlocks (24h): 0\n  Avg wait: 0ms", type: "info" }) },
    "db.replication": { desc: "Replication status", execute: () => ({ output: "REPLICATION: HEALTHY\n  Mode: streaming\n  Lag: 0 bytes\n  State: streaming\n  WAL position: 0/1A4B5C6D", type: "success" }) },
    "auth.count": { desc: "User count summary", execute: () => ({ output: "AUTH SUMMARY:\n  Total users: 156\n  Active (24h): 62\n  Active (7d): 109\n  Banned: 3\n  Admin: 1\n  Moderator: 0", type: "info" }) },
    "auth.sessions": { desc: "Active sessions", execute: () => ({ output: "ACTIVE SESSIONS: 23\n  Desktop: 15 | Mobile: 6 | Tablet: 2\n  Avg duration: 45m\n  Unique IPs: 19\n  Countries: 8", type: "info" }) },
    "auth.tokens": { desc: "Token statistics", execute: () => ({ output: "TOKEN STATS:\n  Active JWTs: 23\n  Avg TTL remaining: 2h 34m\n  Refreshed (24h): 156\n  Revoked (24h): 0\n  Algorithm: HS256", type: "info" }) },
    "auth.providers": { desc: "Auth provider status", execute: () => ({ output: "AUTH PROVIDERS:\n  Email/Password: ACTIVE (156 users)\n  OAuth Google: DISABLED\n  OAuth GitHub: DISABLED\n  Magic Link: DISABLED\n  Phone/SMS: DISABLED", type: "info" }) },
    "challenges.list": { desc: "List all challenges", execute: () => ({ output: "CHALLENGES:\n  [web] SQL Injection 101 (100pts, 45 solves)\n  [web] XSS Playground (200pts, 23 solves)\n  [crypto] Caesar's Secret (50pts, 89 solves)\n  [reverse] Binary Bomb (500pts, 3 solves)\n  [forensics] Hidden Message (150pts, 34 solves)\n  ... 19 more challenges", type: "info" }) },
    "challenges.stats": { desc: "Challenge statistics", execute: () => ({ output: "CHALLENGE STATS:\n  Total: 24 | Active: 22 | Draft: 2\n  Categories: web(8) crypto(5) reverse(4) forensics(3) pwn(2) misc(2)\n  Avg solve rate: 34%\n  Hardest: 'Binary Bomb' (3 solves)\n  Easiest: 'Hello CTF' (156 solves)", type: "info" }) },
    "submissions.recent": { desc: "Recent submissions", execute: () => ({ output: "RECENT SUBMISSIONS:\n  [14:22] h4cker_elite → SQL Injection 101 ✓ (100pts)\n  [14:20] n00b_pwner → XSS Playground ✗\n  [14:18] cyber_wolf → Caesar's Secret ✓ (50pts)\n  [14:15] dark_knight → Binary Bomb ✗\n  [14:12] l33t_c0der → Hidden Message ✓ (150pts)", type: "info" }) },
    "submissions.stats": { desc: "Submission statistics", execute: () => ({ output: "SUBMISSION STATS:\n  Total: 12,000 | Correct: 4,080 (34%)\n  Today: 234 | This week: 1,890\n  Avg attempts/solve: 2.9\n  First bloods: 24\n  Rate limited: 42", type: "info" }) },
    "audit.recent": { desc: "Recent audit events", execute: () => ({ output: "RECENT AUDIT:\n  [14:22] FLAG_SUBMIT - h4cker_elite (correct)\n  [14:20] FLAG_SUBMIT - n00b_pwner (incorrect)\n  [14:18] USER_LOGIN - cyber_wolf (US)\n  [14:15] RATE_LIMIT_HIT - suspicious_bot\n  [14:12] WRITEUP_SUBMIT - l33t_c0der", type: "info" }) },
    "audit.threats": { desc: "Threat summary", execute: () => ({ output: "THREAT SUMMARY (24h):\n  Rate limits: 42\n  Score manipulation: 0\n  Banned attempts: 3\n  Anomalous logins: 2\n  Brute force: 5\n  XSS attempts: 0\n  SQL injection: 0\n  THREAT LEVEL: LOW", type: "warning" }) },
    "audit.export": { desc: "Export audit logs", execute: () => ({ output: "EXPORTING AUDIT LOGS...\n  8,900 events exported\n  Format: CSV\n  File: audit_2026-03-09.csv\n  Size: 2.3 MB\n  Download initiated.", type: "success" }) },
    "cache.clear": { desc: "Clear all caches", execute: () => ({ output: "CACHE CLEARED:\n  Query cache: 234 entries purged\n  Response cache: 156 entries purged\n  Session cache: 23 entries purged\n  Total: 413 entries | 12 MB freed", type: "success" }) },
    "cache.stats": { desc: "Cache statistics", execute: () => ({ output: "CACHE STATS:\n  Hit rate: 87%\n  Entries: 413\n  Size: 12 MB / 64 MB\n  Evictions (24h): 45\n  TTL: 300s default", type: "info" }) },
    "rls.verify": { desc: "Verify RLS policies", execute: () => ({ output: "RLS VERIFICATION: PASSED ✓\n  15 tables checked | 38 policies verified\n  No violations detected | All tables protected\n  Force-enabled: profiles, challenges, submissions\n  Public views: challenges_public, teams_public\n  Unprotected: 0 tables", type: "success" }) },
    "rls.policies": { desc: "List all RLS policies", execute: () => ({ output: "RLS POLICIES (38 total):\n  profiles: 4 policies (select, insert, update, delete)\n  challenges: 3 policies (admin CRUD + public select)\n  submissions: 3 policies (user insert, select own, admin all)\n  audit_logs: 2 policies (admin select, func insert)\n  user_roles: 2 policies (admin manage, func check)\n  ... 24 more policies across 10 tables", type: "info" }) },
    "storage.stats": { desc: "Storage usage", execute: () => ({ output: "STORAGE:\n  Total: 2.4 GB / 10 GB\n  challenge-files: 1.8 GB (24 files)\n  avatars: 340 MB (156 files)\n  temp: 12 MB (3 files)\n  Orphaned: 0 files", type: "info" }) },
    "storage.buckets": { desc: "List storage buckets", execute: () => ({ output: "BUCKETS:\n  challenge-files (public) — 1.8 GB, 24 files\n  avatars (public) — 340 MB, 156 files\n  backups (private) — 45 MB, 5 files", type: "info" }) },
    "functions.list": { desc: "List edge functions", execute: () => ({ output: "EDGE FUNCTIONS:\n  track-visitor — active (1,240 invocations, 45ms avg)\n  track-session — active (890 invocations, 32ms avg)\n  Deployed: 2 | Failed: 0 | Pending: 0", type: "info" }) },
    "functions.logs": { desc: "Edge function logs", execute: () => ({ output: "FUNCTION LOGS (last 10):\n  [14:22] track-visitor: 200 OK (43ms)\n  [14:21] track-session: 200 OK (28ms)\n  [14:20] track-visitor: 200 OK (51ms)\n  [14:19] track-visitor: 200 OK (39ms)\n  [14:18] track-session: 200 OK (35ms)", type: "info" }) },
    "network.stats": { desc: "Network statistics", execute: () => ({ output: "NETWORK:\n  Requests/min: 142\n  Bandwidth in: 1.2 MB/s\n  Bandwidth out: 0.8 MB/s\n  Active WebSockets: 8\n  HTTP/2 streams: 23\n  DNS queries: 12/min\n  TLS handshakes: 8/min", type: "info" }) },
    "network.dns": { desc: "DNS configuration", execute: () => ({ output: "DNS RECORDS:\n  A   @ → 76.76.21.21\n  CNAME www → cyberops-ctf.lovable.app\n  TXT @ → v=spf1 ...\n  MX  @ → 10 mail.cyberops.ctf\n  TTL: 300s", type: "info" }) },
    "network.ssl": { desc: "SSL/TLS status", execute: () => ({ output: "SSL/TLS:\n  Protocol: TLS 1.3\n  Cipher: AES-256-GCM\n  Certificate: Let's Encrypt\n  Expires: 2026-06-07\n  HSTS: enabled (max-age=31536000)\n  OCSP: stapled", type: "success" }) },
    "whoami": { desc: "Current admin info", execute: () => ({ output: "OPERATOR: admin\n  Role: ADMIN\n  Session: active\n  Last login: 2m ago\n  IP: 192.168.1.1\n  MFA: disabled", type: "info" }) },
    "uptime": { desc: "System uptime", execute: () => ({ output: "UPTIME: 7d 14h 23m 45s\n  Load: 0.12 0.08 0.05\n  Processes: 23\n  Memory: 2.1 GB / 8 GB", type: "success" }) },
    "date": { desc: "Current date/time", execute: () => ({ output: new Date().toISOString(), type: "info" }) },
    "clear": { desc: "Clear terminal", execute: () => { setHistory([]); return { output: "", type: "info" as const }; } },
    "ping": { desc: "Ping database", execute: () => ({ output: "PING db.supabase.co\n  Reply: 8ms\n  Reply: 7ms\n  Reply: 9ms\n  Reply: 8ms\n  Avg: 8ms | Loss: 0%", type: "success" }) },
    "neofetch": { desc: "System info banner", execute: () => ({ output: `
   ██████╗██████╗     
  ██╔════╝╚════██╗    CyberOps C2 v4.0
  ██║      █████╔╝    ──────────────────
  ██║     ██╔═══╝     OS: Lovable Cloud
  ╚██████╗███████╗    Kernel: Deno Edge
   ╚═════╝╚══════╝    Modules: 18
                       Commands: 40+
  Users: 156           Tables: 15
  Challenges: 24       Uptime: 7d 14h`, type: "info" }) },
    "matrix": { desc: "Enter the matrix", execute: () => ({ output: "Wake up, Neo...\nThe Matrix has you...\nFollow the white rabbit.\n\n01001000 01100001 01100011 01101011\n01010100 01101000 01100101 01010000\n01101100 01100001 01101110 01100101 01110100", type: "success" }) },
    "cowsay": { desc: "Moo", execute: () => ({ output: " _______________\n< Hack the planet! >\n ---------------\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||", type: "info" }) },
  };

  const executeCommand = () => {
    if (!input.trim()) return;
    const cmd = input.trim().toLowerCase();
    setCommandHistory(prev => [...prev, input]);
    setHistoryIndex(-1);

    const handler = commands[cmd];
    if (handler) {
      const result = handler.execute();
      if (result.output) {
        setHistory(prev => [...prev, { cmd: input, output: result.output, time: new Date().toLocaleTimeString("en-US", { hour12: false }), type: result.type }]);
      }
    } else {
      setHistory(prev => [...prev, {
        cmd: input,
        output: `bash: ${cmd}: command not found\nType 'help' for available commands.`,
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        type: "error"
      }]);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = Object.keys(commands).filter(c => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1) {
        setHistory(prev => [...prev, { cmd: input, output: `Completions: ${matches.join(", ")}`, time: new Date().toLocaleTimeString("en-US", { hour12: false }), type: "info" }]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  useEffect(() => {
    outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
  }, [history]);

  const tabs = [
    { id: "terminal", label: "Terminal", icon: Terminal },
    { id: "reference", label: "Commands", icon: Code },
    { id: "scripts", label: "Scripts", icon: FileText },
    { id: "snippets", label: "Snippets", icon: Braces },
    { id: "cron", label: "Cron Jobs", icon: Clock },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 rounded-lg border border-border/20 bg-card/20 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "terminal" && (
        <C2Panel title="C2 TERMINAL" icon={Terminal} color="text-primary" actions={
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-6 text-[9px] font-mono" onClick={() => setHistory([])}>Clear</Button>
            <Button size="sm" variant="ghost" className="h-6 text-[9px] font-mono" onClick={() => { navigator.clipboard.writeText(history.map(h => `$ ${h.cmd}\n${h.output}`).join("\n\n")); toast.success("Copied!"); }}>Copy</Button>
          </div>
        }>
          <div className="bg-background/80 font-mono text-xs">
            <div ref={outputRef} className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              <div className="text-primary">
                ╔══════════════════════════════════════════════════╗{"\n"}
                ║  CyberOps C2 Terminal v4.0                      ║{"\n"}
                ║  Type 'help' for {Object.keys(commands).length} available commands{" ".repeat(14 - String(Object.keys(commands).length).length)}║{"\n"}
                ║  Tab to autocomplete • ↑↓ history • Ctrl+L clear║{"\n"}
                ╚══════════════════════════════════════════════════╝
              </div>
              {history.map((entry, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">root@c2</span>
                    <span className="text-muted-foreground">:</span>
                    <span className="text-secondary">~</span>
                    <span className="text-muted-foreground">$</span>
                    <span className="text-foreground">{entry.cmd}</span>
                    <span className="text-muted-foreground/40 ml-auto">{entry.time}</span>
                  </div>
                  <pre className={`mt-1 whitespace-pre-wrap ${
                    entry.type === "success" ? "text-primary" :
                    entry.type === "error" ? "text-destructive" :
                    entry.type === "warning" ? "text-neon-orange" :
                    "text-muted-foreground"
                  }`}>
                    {entry.output}
                  </pre>
                </div>
              ))}
            </div>
            <div className="border-t border-border/20 p-2 flex items-center gap-2">
              <span className="text-primary">root@c2:~$</span>
              <input
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/30"
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command... (Tab to autocomplete)"
                autoFocus
              />
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={executeCommand}><Play className="w-3 h-3 text-primary" /></Button>
            </div>
          </div>
        </C2Panel>
      )}

      {activeTab === "reference" && (
        <C2Panel title="COMMAND REFERENCE" icon={Code} color="text-secondary">
          <div className="p-3 max-h-[500px] overflow-y-auto">
            {Object.entries(
              Object.entries(commands).reduce((acc, [cmd, { desc }]) => {
                const cat = cmd.split(".")[0] || "misc";
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push({ cmd, desc });
                return acc;
              }, {} as Record<string, { cmd: string; desc: string }[]>)
            ).map(([cat, cmds]) => (
              <div key={cat}>
                <SectionLabel label={cat.toUpperCase()} color="secondary" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-2">
                  {cmds.map(c => (
                    <button key={c.cmd} onClick={() => { setInput(c.cmd); setActiveTab("terminal"); }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-primary/5 transition-colors"
                    >
                      <Code className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-[10px] font-mono text-primary">{c.cmd}</span>
                      <span className="text-[9px] text-muted-foreground truncate">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "scripts" && (
        <C2Panel title="SAVED SCRIPTS" icon={FileText} color="text-neon-purple">
          <div className="p-4 space-y-2">
            {[
              { name: "full_health_check.sh", desc: "Run complete system health check", cmds: ["system.status", "db.health", "rls.verify", "cache.stats", "network.stats"] },
              { name: "daily_maintenance.sh", desc: "Daily maintenance routine", cmds: ["cache.clear", "db.vacuum", "storage.stats", "audit.threats"] },
              { name: "security_audit.sh", desc: "Full security audit", cmds: ["rls.verify", "rls.policies", "auth.sessions", "audit.threats", "network.ssl"] },
              { name: "performance_check.sh", desc: "Performance benchmark", cmds: ["db.health", "db.connections", "db.indexes", "db.locks", "cache.stats"] },
              { name: "user_report.sh", desc: "User activity report", cmds: ["auth.count", "auth.sessions", "submissions.stats", "challenges.stats"] },
              { name: "backup_and_clean.sh", desc: "Backup then cleanup", cmds: ["db.stats", "storage.stats", "cache.clear", "db.vacuum"] },
              { name: "incident_response.sh", desc: "Security incident gathering", cmds: ["audit.threats", "audit.recent", "auth.sessions", "network.stats", "rls.verify"] },
              { name: "deploy_check.sh", desc: "Post-deploy verification", cmds: ["system.status", "functions.list", "db.health", "rls.verify", "network.ssl"] },
            ].map(script => (
              <div key={script.name} className="p-3 rounded-lg border border-border/20 bg-background/40 hover:bg-background/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-neon-purple" />
                    <span className="font-mono text-xs font-semibold text-foreground">{script.name}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-6 text-[9px] font-mono" onClick={() => {
                    script.cmds.forEach((cmd, i) => {
                      setTimeout(() => {
                        const handler = commands[cmd];
                        if (handler) {
                          const result = handler.execute();
                          if (result.output) {
                            setHistory(prev => [...prev, { cmd, output: result.output, time: new Date().toLocaleTimeString("en-US", { hour12: false }), type: result.type }]);
                          }
                        }
                      }, i * 500);
                    });
                    setActiveTab("terminal");
                    toast.success(`Running ${script.name}...`);
                  }}>
                    <Play className="w-3 h-3 mr-1" />Run
                  </Button>
                </div>
                <div className="text-[10px] text-muted-foreground mb-1">{script.desc}</div>
                <div className="text-[9px] font-mono text-primary/60">{script.cmds.join(" → ")}</div>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "snippets" && (
        <C2Panel title="SQL SNIPPETS" icon={Braces} color="text-neon-cyan">
          <div className="p-4 space-y-2">
            {[
              { name: "Active users (24h)", sql: "SELECT * FROM profiles WHERE updated_at > NOW() - INTERVAL '24 hours'" },
              { name: "Top 10 solvers", sql: "SELECT username, challenges_solved, total_points FROM profiles ORDER BY total_points DESC LIMIT 10" },
              { name: "Unsolved challenges", sql: "SELECT title, category, difficulty FROM challenges WHERE solves = 0 AND is_active = true" },
              { name: "Recent submissions", sql: "SELECT s.*, p.username, c.title FROM submissions s JOIN profiles p ON ... LIMIT 50" },
              { name: "Failed logins (24h)", sql: "SELECT * FROM audit_logs WHERE event_type = 'LOGIN_FAILED' AND created_at > NOW() - '24h'" },
              { name: "Banned users", sql: "SELECT username, ban_reason, banned_at FROM profiles WHERE is_banned = true" },
              { name: "Team standings", sql: "SELECT name, total_points FROM teams ORDER BY total_points DESC" },
              { name: "Rate limit hits", sql: "SELECT * FROM submission_rate_limits WHERE attempt_count >= 10 ORDER BY window_start DESC" },
              { name: "Visitor geo distribution", sql: "SELECT country_name, COUNT(*) FROM visitor_logs GROUP BY country_name ORDER BY count DESC" },
              { name: "Challenge solve times", sql: "SELECT c.title, AVG(s.created_at - c.created_at) as avg_time FROM submissions s JOIN ..." },
            ].map(snippet => (
              <div key={snippet.name} className="p-3 rounded-lg border border-border/20 bg-background/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold">{snippet.name}</span>
                  <Button size="sm" variant="ghost" className="h-6 text-[9px] font-mono" onClick={() => { navigator.clipboard.writeText(snippet.sql); toast.success("Copied!"); }}>
                    <Copy className="w-3 h-3 mr-1" />Copy
                  </Button>
                </div>
                <pre className="text-[10px] font-mono text-primary/70 bg-background/60 p-2 rounded overflow-x-auto">{snippet.sql}</pre>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "cron" && (
        <C2Panel title="SCHEDULED TASKS" icon={Clock} color="text-neon-orange">
          <div className="p-4 space-y-2">
            {[
              { name: "Daily Backup", schedule: "0 2 * * *", next: "Tomorrow 02:00", status: "active", last: "Today 02:00 ✓" },
              { name: "Cache Cleanup", schedule: "0 */6 * * *", next: "In 4h", status: "active", last: "6h ago ✓" },
              { name: "Log Rotation", schedule: "0 0 * * 0", next: "Sunday 00:00", status: "active", last: "Last Sunday ✓" },
              { name: "Anomaly Scan", schedule: "*/15 * * * *", next: "In 8m", status: "active", last: "7m ago ✓" },
              { name: "Health Ping", schedule: "*/5 * * * *", next: "In 2m", status: "active", last: "3m ago ✓" },
              { name: "Leaderboard Refresh", schedule: "*/10 * * * *", next: "In 6m", status: "active", last: "4m ago ✓" },
              { name: "Session Cleanup", schedule: "0 3 * * *", next: "Tomorrow 03:00", status: "active", last: "Today 03:00 ✓" },
              { name: "SSL Check", schedule: "0 12 * * 1", next: "Monday 12:00", status: "active", last: "Last Monday ✓" },
              { name: "DB Vacuum", schedule: "0 4 * * 0", next: "Sunday 04:00", status: "paused", last: "Last Sunday ✓" },
              { name: "Email Digest", schedule: "0 8 * * 1", next: "Monday 08:00", status: "disabled", last: "Never" },
            ].map(job => (
              <div key={job.name} className={`flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/20 bg-background/40 ${job.status === "disabled" ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2 h-2 rounded-full ${job.status === "active" ? "bg-primary animate-pulse" : job.status === "paused" ? "bg-neon-orange" : "bg-muted-foreground"}`} />
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-semibold">{job.name}</div>
                    <div className="text-[9px] text-muted-foreground font-mono">{job.schedule} • Next: {job.next}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground shrink-0">
                  <span>{job.last}</span>
                  <Badge variant="outline" className={`text-[8px] ${job.status === "active" ? "border-primary/20 text-primary" : job.status === "paused" ? "border-neon-orange/20 text-neon-orange" : "border-muted text-muted-foreground"}`}>
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {/* Terminal Actions */}
      <C2Panel title="TERMINAL ACTIONS" icon={Hash} color="text-neon-cyan">
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <ActionBtn icon={Copy} label="Copy Output" color="secondary" onClick={() => { navigator.clipboard.writeText(history.map(h => `$ ${h.cmd}\n${h.output}`).join("\n\n")); toast.success("Copied!"); }} />
          <ActionBtn icon={Download} label="Export Log" color="neon-cyan" />
          <ActionBtn icon={Trash2} label="Clear" color="neon-orange" onClick={() => setHistory([])} />
          <ActionBtn icon={Save} label="Save Session" color="primary" />
          <ActionBtn icon={Upload} label="Load Script" color="neon-purple" />
          <ActionBtn icon={RefreshCw} label="Reset Terminal" color="secondary" onClick={() => { setHistory([]); setCommandHistory([]); }} />
          <ActionBtn icon={Settings} label="Terminal Config" color="neon-orange" />
          <ActionBtn icon={FileText} label="Export History" color="neon-cyan" />
        </div>
      </C2Panel>
    </div>
  );
};

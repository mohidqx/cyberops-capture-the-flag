import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Radar, Target, Users, Radio, Award, FileText, Trophy, Mail, Terminal,
  Globe, ShieldAlert, Fingerprint, AlertTriangle, Network, Activity, Database,
  Settings, Plus, Ban, Download, Lock, RefreshCw, Eye, Megaphone, Shield,
  Zap, Cpu, HardDrive, Wifi, Key, Code, Hash, BarChart3, Gauge, Server,
  Bell, Palette, Bug, Layers, Power, Monitor, Clock, Archive, Upload,
  Trash2, Copy, Save, ChevronRight, Command, Keyboard
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (moduleId: string) => void;
  onAction?: (action: string) => void;
  stats?: any;
}

interface CommandItem {
  id: string;
  label: string;
  desc: string;
  icon: any;
  color: string;
  category: "navigate" | "action" | "search" | "shortcut" | "tool" | "script" | "query";
  action?: string;
  shortcut?: string;
}

export const CommandPalette = ({ open, onClose, onNavigate, onAction, stats }: CommandPaletteProps) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    { id: "nav-overview", label: "Go to Overview", desc: "System telemetry dashboard", icon: Radar, color: "text-primary", category: "navigate", action: "overview", shortcut: "Ctrl+1" },
    { id: "nav-challenges", label: "Go to Challenges", desc: "Manage challenge targets", icon: Target, color: "text-primary", category: "navigate", action: "challenges", shortcut: "Ctrl+2" },
    { id: "nav-users", label: "Go to Operators", desc: "User management roster", icon: Users, color: "text-secondary", category: "navigate", action: "users", shortcut: "Ctrl+3" },
    { id: "nav-announcements", label: "Go to Broadcasts", desc: "Announcement management", icon: Radio, color: "text-neon-orange", category: "navigate", action: "announcements", shortcut: "Ctrl+4" },
    { id: "nav-sponsors", label: "Go to Assets", desc: "Sponsor management", icon: Award, color: "text-neon-cyan", category: "navigate", action: "sponsors", shortcut: "Ctrl+5" },
    { id: "nav-writeups", label: "Go to Intel", desc: "Writeup review queue", icon: FileText, color: "text-neon-purple", category: "navigate", action: "writeups", shortcut: "Ctrl+6" },
    { id: "nav-competition", label: "Go to Operations", desc: "Competition settings", icon: Trophy, color: "text-primary", category: "navigate", action: "competition", shortcut: "Ctrl+7" },
    { id: "nav-contacts", label: "Go to Comms", desc: "Contact submissions", icon: Mail, color: "text-secondary", category: "navigate", action: "contacts", shortcut: "Ctrl+8" },
    { id: "nav-terminal", label: "Go to Terminal", desc: "C2 command terminal", icon: Terminal, color: "text-primary", category: "navigate", action: "terminal", shortcut: "Ctrl+9" },
    { id: "nav-security", label: "Go to Threat Map", desc: "Security dashboard & heatmap", icon: Globe, color: "text-destructive", category: "navigate", action: "security" },
    { id: "nav-audit", label: "Go to Audit Trail", desc: "Audit log viewer", icon: ShieldAlert, color: "text-neon-orange", category: "navigate", action: "audit-logs" },
    { id: "nav-visitors", label: "Go to Recon", desc: "Visitor log analysis", icon: Fingerprint, color: "text-neon-cyan", category: "navigate", action: "visitors" },
    { id: "nav-investigation", label: "Go to Forensics", desc: "User activity timeline", icon: Search, color: "text-neon-purple", category: "navigate", action: "investigation" },
    { id: "nav-anomalies", label: "Go to Anomalies", desc: "Anomaly detection engine", icon: AlertTriangle, color: "text-destructive", category: "navigate", action: "anomalies" },
    { id: "nav-network", label: "Go to Network Ops", desc: "Network monitoring & firewall", icon: Network, color: "text-primary", category: "navigate", action: "network" },
    { id: "nav-performance", label: "Go to Performance", desc: "System performance metrics", icon: Activity, color: "text-secondary", category: "navigate", action: "performance" },
    { id: "nav-data", label: "Go to Data Ops", desc: "Export, import, backups", icon: Database, color: "text-neon-cyan", category: "navigate", action: "data-ops" },
    { id: "nav-config", label: "Go to Sys Config", desc: "System configuration", icon: Settings, color: "text-neon-orange", category: "navigate", action: "config" },

    // Quick Actions
    { id: "act-new-challenge", label: "Create New Challenge", desc: "Deploy a new challenge target", icon: Plus, color: "text-primary", category: "action", action: "challenges" },
    { id: "act-broadcast", label: "Send Broadcast", desc: "Create new announcement", icon: Megaphone, color: "text-neon-orange", category: "action", action: "announcements" },
    { id: "act-ban-user", label: "Ban User", desc: "Ban an operator by username", icon: Ban, color: "text-destructive", category: "action" },
    { id: "act-unban-user", label: "Unban User", desc: "Restore a banned operator", icon: Shield, color: "text-primary", category: "action" },
    { id: "act-export-data", label: "Export All Data", desc: "Download complete database export", icon: Download, color: "text-neon-cyan", category: "action", action: "data-ops" },
    { id: "act-lock-system", label: "Lock System", desc: "Enable maintenance mode", icon: Lock, color: "text-destructive", category: "action", action: "config" },
    { id: "act-refresh", label: "Refresh All Data", desc: "Reload all dashboard data", icon: RefreshCw, color: "text-secondary", category: "action" },
    { id: "act-clear-cache", label: "Clear Cache", desc: "Purge all cached data", icon: Trash2, color: "text-neon-orange", category: "action" },
    { id: "act-backup-db", label: "Backup Database", desc: "Create immediate backup", icon: Archive, color: "text-primary", category: "action", action: "data-ops" },
    { id: "act-promote-user", label: "Promote User to Admin", desc: "Grant admin privileges", icon: Key, color: "text-neon-purple", category: "action", action: "users" },
    { id: "act-reset-scores", label: "Reset User Scores", desc: "Recalculate user points", icon: RefreshCw, color: "text-neon-orange", category: "action" },
    { id: "act-toggle-competition", label: "Toggle Competition", desc: "Start or stop the CTF", icon: Power, color: "text-primary", category: "action", action: "competition" },
    { id: "act-view-sessions", label: "View Live Sessions", desc: "Monitor active connections", icon: Wifi, color: "text-secondary", category: "action", action: "network" },
    { id: "act-run-scan", label: "Run Security Scan", desc: "Execute full security audit", icon: Shield, color: "text-destructive", category: "action", action: "security" },
    { id: "act-check-health", label: "Health Check", desc: "Verify system health", icon: Activity, color: "text-primary", category: "action" },
    { id: "act-export-audit", label: "Export Audit Logs", desc: "Download audit trail CSV", icon: Download, color: "text-neon-orange", category: "action", action: "data-ops" },
    { id: "act-kill-sessions", label: "Kill All Sessions", desc: "Force logout all users", icon: Power, color: "text-destructive", category: "action" },
    { id: "act-vacuum", label: "Vacuum Database", desc: "Optimize DB storage", icon: Database, color: "text-secondary", category: "action" },
    { id: "act-reindex", label: "Reindex Tables", desc: "Rebuild database indexes", icon: Layers, color: "text-neon-cyan", category: "action" },

    // Terminal Commands
    { id: "cmd-system-status", label: "system.status", desc: "Show system health status", icon: Terminal, color: "text-primary", category: "shortcut" },
    { id: "cmd-db-health", label: "db.health", desc: "Database health check", icon: Database, color: "text-secondary", category: "shortcut" },
    { id: "cmd-rls-verify", label: "rls.verify", desc: "Verify RLS policies", icon: Shield, color: "text-primary", category: "shortcut" },
    { id: "cmd-cache-clear", label: "cache.clear", desc: "Clear all caches", icon: Trash2, color: "text-neon-orange", category: "shortcut" },
    { id: "cmd-auth-count", label: "auth.count", desc: "User count summary", icon: Users, color: "text-secondary", category: "shortcut" },
    { id: "cmd-audit-threats", label: "audit.threats", desc: "Threat summary", icon: AlertTriangle, color: "text-destructive", category: "shortcut" },

    // Tools
    { id: "tool-ip-lookup", label: "IP Address Lookup", desc: "Geolocate an IP address", icon: Globe, color: "text-neon-cyan", category: "tool" },
    { id: "tool-hash-check", label: "Hash Validator", desc: "Verify flag hash integrity", icon: Hash, color: "text-primary", category: "tool" },
    { id: "tool-user-search", label: "Deep User Search", desc: "Search across all user data", icon: Search, color: "text-secondary", category: "tool" },
    { id: "tool-flag-test", label: "Flag Tester", desc: "Test flag format validation", icon: Code, color: "text-neon-purple", category: "tool" },
    { id: "tool-perf-profile", label: "Performance Profiler", desc: "Profile query performance", icon: Gauge, color: "text-neon-orange", category: "tool" },
    { id: "tool-log-analyzer", label: "Log Analyzer", desc: "Analyze system log patterns", icon: BarChart3, color: "text-secondary", category: "tool" },
    { id: "tool-dns-check", label: "DNS Checker", desc: "Verify DNS configuration", icon: Server, color: "text-primary", category: "tool" },
    { id: "tool-ssl-check", label: "SSL Certificate Check", desc: "Verify SSL/TLS status", icon: Lock, color: "text-primary", category: "tool" },
    { id: "tool-webhook-test", label: "Webhook Tester", desc: "Send test webhook payload", icon: Zap, color: "text-neon-cyan", category: "tool" },
    { id: "tool-email-test", label: "Email Tester", desc: "Send test email notification", icon: Mail, color: "text-secondary", category: "tool" },
    { id: "tool-cors-check", label: "CORS Validator", desc: "Test CORS policy headers", icon: Shield, color: "text-neon-orange", category: "tool" },
    { id: "tool-ratelimit-test", label: "Rate Limit Tester", desc: "Test rate limit enforcement", icon: Gauge, color: "text-destructive", category: "tool" },

    // SQL Queries
    { id: "query-active-users", label: "Active Users (24h)", desc: "SELECT users active in last 24h", icon: Database, color: "text-primary", category: "query" },
    { id: "query-top-solvers", label: "Top Solvers", desc: "SELECT top 10 by challenges solved", icon: Trophy, color: "text-primary", category: "query" },
    { id: "query-recent-subs", label: "Recent Submissions", desc: "SELECT last 50 submissions", icon: FileText, color: "text-secondary", category: "query" },
    { id: "query-failed-logins", label: "Failed Logins", desc: "SELECT failed login attempts", icon: AlertTriangle, color: "text-destructive", category: "query" },
    { id: "query-unsolved", label: "Unsolved Challenges", desc: "SELECT challenges with 0 solves", icon: Target, color: "text-neon-orange", category: "query" },
    { id: "query-anomalies", label: "Login Anomalies", desc: "SELECT detected anomalies", icon: Bug, color: "text-destructive", category: "query" },
    { id: "query-storage", label: "Storage Usage", desc: "SELECT storage stats by bucket", icon: HardDrive, color: "text-neon-cyan", category: "query" },
    { id: "query-team-standings", label: "Team Standings", desc: "SELECT teams ORDER BY points", icon: Users, color: "text-secondary", category: "query" },
  ];

  const filtered = query.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.desc.toLowerCase().includes(query.toLowerCase()) ||
        c.category.includes(query.toLowerCase())
      )
    : commands;

  const grouped = {
    navigate: filtered.filter(c => c.category === "navigate"),
    action: filtered.filter(c => c.category === "action"),
    shortcut: filtered.filter(c => c.category === "shortcut"),
    tool: filtered.filter(c => c.category === "tool"),
    query: filtered.filter(c => c.category === "query"),
  };

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      const cmd = filtered[selectedIndex];
      if (cmd.action) onNavigate(cmd.action);
      onAction?.(cmd.id);
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [filtered, selectedIndex, onNavigate, onAction, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!open) return null;

  const categoryLabels: Record<string, { label: string; color: string }> = {
    navigate: { label: "NAVIGATION", color: "text-primary" },
    action: { label: "QUICK ACTIONS", color: "text-neon-orange" },
    shortcut: { label: "TERMINAL COMMANDS", color: "text-secondary" },
    tool: { label: "TOOLS", color: "text-neon-cyan" },
    query: { label: "SQL QUERIES", color: "text-neon-purple" },
  };

  let flatIndex = -1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl rounded-xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-neon-orange/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary/80" />
            </div>
            <Command className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">C2 Command Palette</span>
            <div className="ml-auto flex items-center gap-2">
              <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-border/30 bg-background/60 text-muted-foreground">ESC</kbd>
              <span className="text-[9px] text-muted-foreground">to close</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="px-4 py-3 border-b border-border/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, actions, modules, tools..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-border/30 bg-background/60 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 mt-2 text-[9px] font-mono text-muted-foreground/60">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-border/30 bg-background/60">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-border/30 bg-background/60">↵</kbd> Execute</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-border/30 bg-background/60">Ctrl+K</kbd> Toggle</span>
              <span className="ml-auto">{filtered.length} commands available</span>
            </div>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                No commands match "{query}"
              </div>
            )}

            {Object.entries(grouped).map(([cat, items]) => {
              if (items.length === 0) return null;
              const catInfo = categoryLabels[cat];
              return (
                <div key={cat} className="mb-2">
                  <div className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.2em] ${catInfo.color}/50`}>
                    {catInfo.label} ({items.length})
                  </div>
                  {items.map(cmd => {
                    flatIndex++;
                    const idx = flatIndex;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        data-index={idx}
                        onClick={() => {
                          if (cmd.action) onNavigate(cmd.action);
                          onAction?.(cmd.id);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                          isSelected ? "bg-primary/10 border border-primary/20" : "border border-transparent hover:bg-muted/20"
                        }`}
                      >
                        <cmd.icon className={`w-4 h-4 shrink-0 ${isSelected ? cmd.color : "text-muted-foreground"}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`font-mono text-xs ${isSelected ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{cmd.label}</div>
                          <div className="text-[10px] text-muted-foreground/60 truncate">{cmd.desc}</div>
                        </div>
                        {cmd.shortcut && (
                          <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-border/30 bg-background/60 text-muted-foreground shrink-0">{cmd.shortcut}</kbd>
                        )}
                        <ChevronRight className={`w-3 h-3 shrink-0 ${isSelected ? "text-primary" : "text-transparent"}`} />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border/20 flex items-center justify-between text-[9px] font-mono text-muted-foreground/50">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Keyboard className="w-3 h-3" /> Ctrl+1-9 Switch Modules</span>
              <span>• Escape Collapse Sidebar</span>
            </div>
            <span>C2 v4.0</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

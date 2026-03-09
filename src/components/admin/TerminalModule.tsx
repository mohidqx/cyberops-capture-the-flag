import { useState } from "react";
import {
  Terminal, Play, Square, Clock, Database, AlertTriangle, Copy, Download,
  RefreshCw, Trash2, Save, FileText, Hash, Code, Braces
} from "lucide-react";
import { C2Panel, SectionLabel, ActionBtn } from "./C2Shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const TerminalModule = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Array<{ cmd: string; output: string; time: string; type: "success" | "error" | "info" }>>([
    { cmd: "system.status", output: "All systems operational. Uptime: 99.97%", time: "14:23:01", type: "success" },
    { cmd: "db.health", output: "PostgreSQL 15.4 | Connections: 15/50 | Cache: 99.2%", time: "14:23:05", type: "info" },
    { cmd: "auth.count", output: "Total users: 156 | Active: 98 | Banned: 3", time: "14:23:12", type: "info" },
  ]);

  const commands = [
    { cmd: "system.status", desc: "Show system health" },
    { cmd: "db.health", desc: "Database health check" },
    { cmd: "db.stats", desc: "Database statistics" },
    { cmd: "db.connections", desc: "Active connections" },
    { cmd: "auth.count", desc: "User count summary" },
    { cmd: "auth.sessions", desc: "Active sessions" },
    { cmd: "challenges.list", desc: "List all challenges" },
    { cmd: "challenges.stats", desc: "Challenge statistics" },
    { cmd: "submissions.recent", desc: "Recent submissions" },
    { cmd: "submissions.stats", desc: "Submission statistics" },
    { cmd: "audit.recent", desc: "Recent audit events" },
    { cmd: "audit.threats", desc: "Threat summary" },
    { cmd: "cache.clear", desc: "Clear all caches" },
    { cmd: "cache.stats", desc: "Cache statistics" },
    { cmd: "rls.verify", desc: "Verify RLS policies" },
    { cmd: "storage.stats", desc: "Storage usage" },
    { cmd: "functions.list", desc: "List edge functions" },
    { cmd: "functions.logs", desc: "Edge function logs" },
    { cmd: "network.stats", desc: "Network statistics" },
    { cmd: "help", desc: "Show all commands" },
  ];

  const executeCommand = () => {
    if (!input.trim()) return;
    const cmd = input.trim().toLowerCase();
    let output = "Unknown command. Type 'help' for available commands.";
    let type: "success" | "error" | "info" = "error";

    if (cmd === "help") {
      output = commands.map(c => `  ${c.cmd.padEnd(25)} ${c.desc}`).join("\n");
      type = "info";
    } else if (cmd === "system.status") {
      output = "SYSTEM STATUS: ONLINE\n  CPU: 12% | Memory: 34% | Disk: 24%\n  Uptime: 99.97% | Last restart: 7d ago";
      type = "success";
    } else if (cmd === "db.health") {
      output = "DATABASE: HEALTHY\n  Engine: PostgreSQL 15.4\n  Connections: 15/50\n  Cache Hit: 99.2%\n  Avg Query: 42ms";
      type = "success";
    } else if (cmd === "db.stats") {
      output = "TABLES: 15 | ROWS: ~45,000 | SIZE: 2.4 GB\n  profiles: 156 rows | challenges: 24 rows\n  submissions: 12,000 rows | audit_logs: 8,900 rows";
      type = "info";
    } else if (cmd === "rls.verify") {
      output = "RLS VERIFICATION: PASSED ✓\n  15 tables checked | 38 policies verified\n  No violations detected | All tables protected";
      type = "success";
    } else if (cmd === "cache.clear") {
      output = "Cache cleared successfully. 234 entries purged.";
      type = "success";
    } else if (commands.some(c => c.cmd === cmd)) {
      output = `Executing ${cmd}...\n  Operation completed successfully.`;
      type = "info";
    }

    setHistory(prev => [...prev, { cmd: input, output, time: new Date().toLocaleTimeString("en-US", { hour12: false }), type }]);
    setInput("");
  };

  return (
    <div className="space-y-3">
      <C2Panel title="C2 TERMINAL" icon={Terminal} color="text-primary">
        <div className="bg-background/80 font-mono text-xs">
          {/* Output */}
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            <div className="text-primary">
              ╔══════════════════════════════════════════════════╗{"\n"}
              ║  CyberOps C2 Terminal v3.0                      ║{"\n"}
              ║  Type 'help' for available commands              ║{"\n"}
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
                <pre className={`mt-1 whitespace-pre-wrap ${entry.type === "success" ? "text-primary" : entry.type === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                  {entry.output}
                </pre>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-border/20 p-2 flex items-center gap-2">
            <span className="text-primary">root@c2:~$</span>
            <input
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/30"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && executeCommand()}
              placeholder="Enter command..."
              autoFocus
            />
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={executeCommand}><Play className="w-3 h-3 text-primary" /></Button>
          </div>
        </div>
      </C2Panel>

      {/* Command Reference */}
      <C2Panel title="COMMAND REFERENCE" icon={FileText} color="text-secondary">
        <div className="p-3 max-h-[300px] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {commands.map(c => (
              <button key={c.cmd} onClick={() => { setInput(c.cmd); }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-primary/5 transition-colors"
              >
                <Code className="w-3 h-3 text-primary shrink-0" />
                <span className="text-[10px] font-mono text-primary">{c.cmd}</span>
                <span className="text-[9px] text-muted-foreground truncate">{c.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </C2Panel>

      {/* Quick Actions */}
      <C2Panel title="TERMINAL ACTIONS" icon={Hash} color="text-neon-cyan">
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <ActionBtn icon={Copy} label="Copy Output" color="secondary" />
          <ActionBtn icon={Download} label="Export Log" color="neon-cyan" />
          <ActionBtn icon={Trash2} label="Clear" color="neon-orange" onClick={() => setHistory([])} />
          <ActionBtn icon={Save} label="Save Session" color="primary" />
        </div>
      </C2Panel>
    </div>
  );
};

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, Upload, Database, FileText, Archive, Clock, Shield, RefreshCw,
  Trash2, HardDrive, Check, AlertTriangle, Layers, Hash, Copy, Server
} from "lucide-react";
import { C2Panel, ActionBtn, SectionLabel, ConfigToggle, ConfigInput } from "./C2Shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const DataOpsModule = () => {
  const [activeTab, setActiveTab] = useState("export");
  const [exporting, setExporting] = useState(false);

  const tabs = [
    { id: "export", label: "Export Data", icon: Download },
    { id: "import", label: "Import Data", icon: Upload },
    { id: "backup", label: "Backups", icon: Archive },
    { id: "cleanup", label: "Data Cleanup", icon: Trash2 },
    { id: "migration", label: "Migrations", icon: Layers },
    { id: "storage", label: "Storage", icon: HardDrive },
  ];

  const exportTable = async (table: string) => {
    setExporting(true);
    try {
      const { data, error } = await supabase.from(table as any).select("*");
      if (error) throw error;
      const csv = data && data.length > 0
        ? [Object.keys(data[0]).join(","), ...data.map(r => Object.values(r).map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))].join("\n")
        : "No data";
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${table}_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success(`Exported ${table} (${data?.length || 0} rows)`);
    } catch (e: any) {
      toast.error(e.message);
    }
    setExporting(false);
  };

  const exportables = [
    { table: "profiles", label: "User Profiles", icon: Database, count: "all users", desc: "Username, points, team, country" },
    { table: "challenges", label: "Challenges", icon: Database, count: "all challenges", desc: "Title, flag, category, difficulty, points" },
    { table: "submissions", label: "Submissions", icon: Database, count: "all submissions", desc: "User, challenge, flag, correct, points" },
    { table: "teams", label: "Teams", icon: Database, count: "all teams", desc: "Name, captain, points, invite code" },
    { table: "announcements", label: "Announcements", icon: Database, count: "all announcements", desc: "Title, content, priority, active" },
    { table: "sponsors", label: "Sponsors", icon: Database, count: "all sponsors", desc: "Name, tier, logo, website" },
    { table: "writeups", label: "Writeups", icon: Database, count: "all writeups", desc: "Title, content, challenge, author" },
    { table: "audit_logs", label: "Audit Logs", icon: Shield, count: "all events", desc: "Event type, user, details, timestamp" },
    { table: "user_sessions", label: "User Sessions", icon: Database, count: "all sessions", desc: "IP, country, city, user agent" },
    { table: "visitor_logs", label: "Visitor Logs", icon: Database, count: "all visitors", desc: "Browser, OS, device, location" },
    { table: "hint_unlocks", label: "Hint Unlocks", icon: Database, count: "all unlocks", desc: "User, challenge, hint index, cost" },
    { table: "contact_submissions", label: "Contact Forms", icon: Database, count: "all contacts", desc: "Name, email, subject, message" },
    { table: "newsletter_subscribers", label: "Newsletter", icon: Database, count: "all subscribers", desc: "Email, active, subscribed date" },
    { table: "competition_settings", label: "Competition Config", icon: Database, count: "settings", desc: "Timing, scoring, modes" },
    { table: "user_roles", label: "User Roles", icon: Shield, count: "all roles", desc: "User ID, role assignment" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 rounded-lg border border-border/20 bg-card/20 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "export" && (
        <C2Panel title="DATA EXPORT" icon={Download} color="text-neon-cyan">
          <div className="p-3 space-y-1 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <ActionBtn icon={Download} label="Export All (JSON)" color="primary" />
              <ActionBtn icon={Download} label="Export All (CSV)" color="secondary" />
              <ActionBtn icon={FileText} label="Generate Report" color="neon-purple" />
              <ActionBtn icon={Archive} label="Full Backup" color="neon-orange" />
            </div>
            <SectionLabel label="Individual Tables" color="neon-cyan" />
            {exportables.map(exp => (
              <div key={exp.table} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/20 bg-background/40 hover:bg-background/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <exp.icon className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-semibold">{exp.label}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{exp.desc}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px] font-mono shrink-0" onClick={() => exportTable(exp.table)} disabled={exporting}>
                  <Download className="w-3 h-3 mr-1" />CSV
                </Button>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "import" && (
        <C2Panel title="DATA IMPORT" icon={Upload} color="text-neon-orange">
          <div className="p-4 space-y-3">
            <div className="border-2 border-dashed border-border/30 rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <div className="font-mono text-sm text-muted-foreground mb-1">Drop CSV/JSON files here</div>
              <div className="text-[10px] text-muted-foreground/60">Supports: challenges, users, teams, announcements</div>
            </div>
            <SectionLabel label="Import Options" color="neon-orange" />
            <ConfigToggle label="Merge Mode" desc="Merge with existing data (vs replace)" checked={true} onChange={() => {}} />
            <ConfigToggle label="Skip Duplicates" desc="Ignore rows with duplicate IDs" checked={true} onChange={() => {}} />
            <ConfigToggle label="Validate Before Import" desc="Dry-run validation first" checked={true} onChange={() => {}} />
            <ConfigToggle label="Create Backup First" desc="Auto-backup before import" checked={true} onChange={() => {}} />
            <SectionLabel label="Import Templates" color="neon-orange" />
            {["Challenges Template", "Users Template", "Teams Template", "Sponsors Template"].map(t => (
              <div key={t} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/20 bg-background/40">
                <span className="font-mono text-xs">{t}</span>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono"><Download className="w-3 h-3 mr-1" />Download</Button>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "backup" && (
        <C2Panel title="BACKUP MANAGEMENT" icon={Archive} color="text-primary">
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <ActionBtn icon={Database} label="Full Backup" color="primary" />
              <ActionBtn icon={RefreshCw} label="Restore Latest" color="neon-orange" />
              <ActionBtn icon={Clock} label="Schedule" color="secondary" />
            </div>
            <SectionLabel label="Backup History" color="primary" />
            {[
              { date: "2026-03-09 14:00", size: "12.4 MB", type: "Full", status: "completed" },
              { date: "2026-03-08 14:00", size: "11.8 MB", type: "Full", status: "completed" },
              { date: "2026-03-07 14:00", size: "11.2 MB", type: "Full", status: "completed" },
              { date: "2026-03-06 14:00", size: "10.9 MB", type: "Incremental", status: "completed" },
              { date: "2026-03-05 02:00", size: "10.5 MB", type: "Full", status: "completed" },
            ].map((b, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/20 bg-background/40">
                <div className="flex items-center gap-3">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  <div>
                    <div className="font-mono text-xs font-semibold">{b.date}</div>
                    <div className="text-[9px] text-muted-foreground">{b.type} • {b.size}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono"><Download className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono"><RefreshCw className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
            <SectionLabel label="Backup Settings" color="primary" />
            <ConfigToggle label="Auto Backup" desc="Daily automated backups" checked={true} onChange={() => {}} />
            <ConfigToggle label="Encryption" desc="AES-256 backup encryption" checked={true} onChange={() => {}} />
            <ConfigInput label="Retention (days)" desc="Keep backups for N days" value="30" onChange={() => {}} type="number" />
          </div>
        </C2Panel>
      )}

      {activeTab === "cleanup" && (
        <C2Panel title="DATA CLEANUP" icon={Trash2} color="text-destructive">
          <div className="p-4 space-y-3">
            <div className="p-3 rounded-lg border border-neon-orange/20 bg-neon-orange/5 text-xs font-mono text-neon-orange">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Warning: Cleanup operations are irreversible. Create a backup first.
            </div>
            {[
              { label: "Purge Old Audit Logs", desc: "Delete logs older than 90 days", icon: Shield, color: "neon-orange" },
              { label: "Purge Visitor Logs", desc: "Delete visitor logs older than 60 days", icon: Database, color: "neon-orange" },
              { label: "Purge Old Sessions", desc: "Delete sessions older than 30 days", icon: Clock, color: "neon-orange" },
              { label: "Remove Inactive Users", desc: "Delete users with 0 activity (30+ days)", icon: Trash2, color: "destructive" },
              { label: "Clear Rate Limits", desc: "Reset all submission rate limit counters", icon: RefreshCw, color: "secondary" },
              { label: "Purge Failed Submissions", desc: "Delete incorrect flag submissions", icon: Trash2, color: "destructive" },
              { label: "Clean Orphaned Files", desc: "Remove storage files with no references", icon: HardDrive, color: "neon-orange" },
              { label: "Vacuum Database", desc: "Reclaim disk space and optimize", icon: Database, color: "primary" },
            ].map(action => (
              <div key={action.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/20 bg-background/40">
                <div className="flex items-center gap-2 min-w-0">
                  <action.icon className={`w-3.5 h-3.5 text-${action.color} shrink-0`} />
                  <div>
                    <div className="font-mono text-xs font-semibold">{action.label}</div>
                    <div className="text-[9px] text-muted-foreground">{action.desc}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px] font-mono border-destructive/20 text-destructive hover:bg-destructive/10 shrink-0">Execute</Button>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "migration" && (
        <C2Panel title="DATABASE MIGRATIONS" icon={Layers} color="text-neon-purple">
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <ActionBtn icon={Layers} label="Run Pending" color="primary" />
              <ActionBtn icon={RefreshCw} label="Rollback Last" color="neon-orange" />
            </div>
            <SectionLabel label="Migration History" color="neon-purple" />
            {[
              { name: "001_create_profiles", date: "2026-01-15", status: "applied" },
              { name: "002_create_challenges", date: "2026-01-16", status: "applied" },
              { name: "003_create_submissions", date: "2026-01-16", status: "applied" },
              { name: "004_create_teams", date: "2026-01-17", status: "applied" },
              { name: "005_add_audit_logs", date: "2026-02-01", status: "applied" },
              { name: "006_add_user_sessions", date: "2026-02-10", status: "applied" },
              { name: "007_add_visitor_tracking", date: "2026-02-15", status: "applied" },
              { name: "008_add_ban_system", date: "2026-02-20", status: "applied" },
              { name: "009_add_rls_policies", date: "2026-03-01", status: "applied" },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/20 bg-background/40 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  <span className="text-foreground">{m.name}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{m.date}</span>
                  <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">Applied</Badge>
                </div>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "storage" && (
        <C2Panel title="STORAGE MANAGEMENT" icon={HardDrive} color="text-secondary">
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Total Used", value: "2.4 GB", color: "primary" },
                { label: "Challenges", value: "1.8 GB", color: "neon-orange" },
                { label: "Avatars", value: "340 MB", color: "secondary" },
                { label: "Available", value: "7.6 GB", color: "primary" },
              ].map(s => (
                <div key={s.label} className="p-2.5 rounded-lg border border-border/20 bg-background/40">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">{s.label}</div>
                  <div className={`text-sm font-display font-bold text-${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
            <SectionLabel label="Storage Buckets" color="secondary" />
            {[
              { name: "challenge-files", public: true, files: 24, size: "1.8 GB" },
              { name: "avatars", public: true, files: 156, size: "340 MB" },
            ].map(b => (
              <div key={b.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/20 bg-background/40">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-secondary" />
                  <div>
                    <div className="font-mono text-xs font-semibold">{b.name}</div>
                    <div className="text-[9px] text-muted-foreground">{b.files} files • {b.size} • {b.public ? "Public" : "Private"}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono">Browse</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono"><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </div>
            ))}
            <SectionLabel label="Storage Settings" color="secondary" />
            <ConfigToggle label="Auto-Cleanup" desc="Delete orphaned files weekly" checked={false} onChange={() => {}} />
            <ConfigInput label="Max File Size (MB)" desc="Per upload limit" value="50" onChange={() => {}} type="number" />
            <ConfigInput label="Allowed Types" desc="File extensions" value=".zip,.tar.gz,.pdf,.py,.c,.txt" onChange={() => {}} />
          </div>
        </C2Panel>
      )}
    </div>
  );
};

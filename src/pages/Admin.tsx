import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Users, Target, FileText, CheckCircle, XCircle, ShieldCheck,
  Clock, Trophy, Megaphone, Edit, Award, Image, Mail, MessageSquare,
  ShieldAlert, BarChart3, Eye, Activity, AlertTriangle, Fingerprint,
  Terminal, Cpu, Wifi, Zap, Radio, Database, Server, Lock,
  RefreshCw, Maximize2, Minimize2, Radar, ChevronRight, Shield,
  Search, Globe, Bug, Skull, Layers, Download, Upload, Settings,
  Gauge, Network, HardDrive, Power, Hash, Bell, Palette, Ban, Code, Key,
  PanelLeftClose, PanelLeft, Command
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playSound, c2Toast } from "@/lib/adminSounds";
import { useAuth } from "@/contexts/AuthContext";
import ChallengeFileUpload from "@/components/ChallengeFileUpload";
import AuditLogViewer from "@/components/AuditLogViewer";
import AdminSecurityNotifications from "@/components/AdminSecurityNotifications";
import SecurityDashboard from "@/components/SecurityDashboard";
import VisitorLogViewer from "@/components/VisitorLogViewer";
import UserActivityTimeline from "@/components/UserActivityTimeline";
import AnomalyDetection from "@/components/AnomalyDetection";

import { LiveClock, SystemStatusBar, C2Panel, C2NavItem, StatusPill } from "@/components/admin/C2Shared";
import { OverviewDashboard } from "@/components/admin/OverviewModule";
import { SystemConfigModule } from "@/components/admin/SystemConfigModule";
import { NetworkOpsModule } from "@/components/admin/NetworkOpsModule";
import { DataOpsModule } from "@/components/admin/DataOpsModule";
import { PerformanceModule } from "@/components/admin/PerformanceModule";
import { UserManagementModule } from "@/components/admin/UserManagementModule";
import { TerminalModule } from "@/components/admin/TerminalModule";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { SiteSettingsModule } from "@/components/admin/SiteSettingsModule";
import { ContentManagementModule } from "@/components/admin/ContentManagementModule";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Writeup { id: string; title: string; content: string; is_approved: boolean; created_at: string; challenges: { title: string } | null; profiles: { username: string } | null; }
interface CompetitionSettings { id: string; is_active: boolean; start_time: string | null; end_time: string | null; freeze_time: string | null; decay_enabled: boolean; decay_minimum: number; team_mode: boolean; }
interface Announcement { id: string; title: string; content: string; priority: "low" | "normal" | "high" | "urgent"; is_active: boolean; created_at: string; }
interface Sponsor { id: string; name: string; logo_url: string; website_url: string | null; tier: "platinum" | "gold" | "silver" | "bronze"; is_active: boolean; display_order: number; }
interface ContactSubmission { id: string; name: string; email: string; subject: string; message: string; is_resolved: boolean; created_at: string; }

// ─── Module Registry ────────────────────────────────────────────────────────
const C2_MODULES = [
  { id: "overview", label: "Overview", icon: Radar, color: "text-primary", group: "command" },
  { id: "challenges", label: "Challenges", icon: Target, color: "text-primary", group: "command" },
  { id: "users", label: "Users", icon: Users, color: "text-secondary", group: "command" },
  { id: "site-settings", label: "Site Control", icon: Settings, color: "text-neon-purple", group: "command" },
  { id: "announcements", label: "Broadcasts", icon: Radio, color: "text-neon-orange", group: "command" },
  { id: "sponsors", label: "Sponsors", icon: Award, color: "text-neon-cyan", group: "command" },
  { id: "content", label: "CMS", icon: FileText, color: "text-neon-cyan", group: "command" },
  { id: "writeups", label: "Writeups", icon: FileText, color: "text-neon-purple", group: "intel" },
  { id: "competition", label: "Competition", icon: Trophy, color: "text-primary", group: "intel" },
  { id: "contacts", label: "Messages", icon: Mail, color: "text-secondary", group: "intel" },
  { id: "terminal", label: "Terminal", icon: Terminal, color: "text-primary", group: "intel" },
  { id: "security", label: "Threat Map", icon: Globe, color: "text-destructive", group: "security" },
  { id: "audit-logs", label: "Audit Trail", icon: ShieldAlert, color: "text-neon-orange", group: "security" },
  { id: "visitors", label: "Visitors", icon: Fingerprint, color: "text-neon-cyan", group: "security" },
  { id: "investigation", label: "Forensics", icon: Search, color: "text-neon-purple", group: "security" },
  { id: "anomalies", label: "Anomalies", icon: AlertTriangle, color: "text-destructive", group: "security" },
  { id: "network", label: "Network", icon: Network, color: "text-primary", group: "ops" },
  { id: "performance", label: "Performance", icon: Activity, color: "text-secondary", group: "ops" },
  { id: "data-ops", label: "Data Ops", icon: Database, color: "text-neon-cyan", group: "ops" },
  { id: "config", label: "Sys Config", icon: Settings, color: "text-neon-orange", group: "ops" },
];

const GROUP_META: Record<string, { label: string; color: string }> = {
  command: { label: "Command", color: "text-primary/30" },
  intel: { label: "Intel", color: "text-neon-purple/30" },
  security: { label: "Security", color: "text-destructive/30" },
  ops: { label: "Operations", color: "text-neon-cyan/30" },
};

// ═══════════════════════════════════════════════════════════════════════════════
const Admin = () => {
  const { profile } = useAuth();
  const [activeModule, setActiveModule] = useState("overview");
  const [challenges, setChallenges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [competitionSettings, setCompetitionSettings] = useState<CompetitionSettings | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [visitors, setVisitors] = useState(0);
  const [teams, setTeams] = useState(0);
  const [firstBloods, setFirstBloods] = useState(0);
  const [auditThreats, setAuditThreats] = useState(0);

  // ─── Keyboard Shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    const moduleKeys = ["overview", "challenges", "users", "announcements", "sponsors", "writeups", "competition", "contacts", "terminal"];
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCommandPaletteOpen(prev => !prev); return; }
      if (e.key === "Escape") { if (commandPaletteOpen) setCommandPaletteOpen(false); return; }
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (idx < moduleKeys.length) setActiveModule(moduleKeys[idx]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen]);

  const [newChallenge, setNewChallenge] = useState({
    title: "", description: "", category: "web", difficulty: "easy", points: 100, flag: "", hints: "", hint_costs: "", files: [] as string[],
  });
  const [newAnnouncement, setNewAnnouncement] = useState<{ title: string; content: string; priority: "low" | "normal" | "high" | "urgent" }>({
    title: "", content: "", priority: "normal",
  });
  const [newSponsor, setNewSponsor] = useState({
    name: "", logo_url: "", website_url: "", tier: "bronze" as "platinum" | "gold" | "silver" | "bronze", display_order: 0,
  });

  const fetchData = useCallback(async () => {
    const [cRes, uRes, wRes, csRes, annRes, spRes, cs2Res, sessRes, visRes, teamRes, fbRes, threatRes] = await Promise.all([
      supabase.from("challenges").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("total_points", { ascending: false }),
      supabase.from("writeups").select("*, challenges(title), profiles(username)").order("created_at", { ascending: false }),
      supabase.from("competition_settings").select("*").eq("name", "default").maybeSingle(),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("sponsors").select("*").order("display_order", { ascending: true }),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("user_sessions").select("id", { count: "exact" }),
      supabase.from("visitor_logs").select("id", { count: "exact" }),
      supabase.from("teams").select("id", { count: "exact" }),
      supabase.from("submissions").select("id", { count: "exact" }).eq("is_first_blood", true),
      supabase.from("audit_logs").select("id", { count: "exact" }).in("event_type", ["SCORE_MANIPULATION_BLOCKED", "RATE_LIMIT_HIT", "BANNED_USER_ATTEMPT"]),
    ]);
    if (cRes.data) setChallenges(cRes.data);
    if (uRes.data) setUsers(uRes.data);
    if (wRes.data) setWriteups(wRes.data as Writeup[]);
    if (csRes.data) setCompetitionSettings(csRes.data as CompetitionSettings);
    if (annRes.data) setAnnouncements(annRes.data as Announcement[]);
    if (spRes.data) setSponsors(spRes.data as Sponsor[]);
    if (cs2Res.data) setContactSubmissions(cs2Res.data as ContactSubmission[]);
    setSessions(sessRes.count || 0);
    setVisitors(visRes.count || 0);
    setTeams(teamRes.count || 0);
    setFirstBloods(fbRes.count || 0);
    setAuditThreats(threatRes.count || 0);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── CRUD Functions ─────────────────────────────────────────────────────
  const createChallenge = async () => {
    const hintsArray = newChallenge.hints.split("\n").filter(h => h.trim());
    const costsArray = newChallenge.hint_costs.split(",").map(c => parseInt(c.trim())).filter(c => !isNaN(c));
    const { error } = await supabase.from("challenges").insert({ title: newChallenge.title, description: newChallenge.description, category: newChallenge.category, difficulty: newChallenge.difficulty, points: newChallenge.points, flag: newChallenge.flag, hints: hintsArray, hint_costs: costsArray, files: newChallenge.files } as any);
    if (error) { c2Toast.error(error.message); return; }
    c2Toast.deploy("Challenge deployed!"); setNewChallenge({ title: "", description: "", category: "web", difficulty: "easy", points: 100, flag: "", hints: "", hint_costs: "", files: [] }); fetchData();
  };

  const updateChallenge = async () => {
    if (!editingChallenge) return;
    const hintsArray = editingChallenge.hintsText?.split("\n").filter((h: string) => h.trim()) || editingChallenge.hints || [];
    const costsArray = editingChallenge.hintCostsText?.split(",").map((c: string) => parseInt(c.trim())).filter((c: number) => !isNaN(c)) || editingChallenge.hint_costs || [];
    const { error } = await supabase.from("challenges").update({ title: editingChallenge.title, description: editingChallenge.description, category: editingChallenge.category, difficulty: editingChallenge.difficulty, points: editingChallenge.points, flag: editingChallenge.flag, hints: hintsArray, hint_costs: costsArray, files: editingChallenge.files || [] }).eq("id", editingChallenge.id);
    if (error) { c2Toast.error(error.message); return; }
    c2Toast.success("Challenge updated!"); setEditingChallenge(null); fetchData();
  };

  const deleteChallenge = async (id: string) => { await supabase.from("challenges").delete().eq("id", id); c2Toast.alert("Challenge deleted"); fetchData(); };
  const approveWriteup = async (id: string) => { await supabase.from("writeups").update({ is_approved: true }).eq("id", id); c2Toast.success("Writeup approved"); fetchData(); };
  const rejectWriteup = async (id: string) => { await supabase.from("writeups").delete().eq("id", id); c2Toast.warning("Writeup rejected"); fetchData(); };

  const confirmMakeAdmin = async () => {
    if (!promotingUserId) return;
    const { error } = await supabase.from("user_roles").upsert({ user_id: promotingUserId, role: "admin" as any });
    if (error) { c2Toast.error(error.message); setPromotingUserId(null); return; }
    c2Toast.deploy("User promoted to Admin"); setPromotingUserId(null); fetchData();
  };

  const updateCompetitionSettings = async (updates: Partial<CompetitionSettings>) => {
    if (!competitionSettings) return;
    const { error } = await supabase.from("competition_settings").update(updates).eq("id", competitionSettings.id);
    if (error) { c2Toast.error(error.message); return; }
    setCompetitionSettings({ ...competitionSettings, ...updates }); c2Toast.success("Settings updated");
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) { c2Toast.error("Fill all fields"); return; }
    const { error } = await supabase.from("announcements").insert({ title: newAnnouncement.title, content: newAnnouncement.content, priority: newAnnouncement.priority, author_id: profile?.id } as any);
    if (error) { c2Toast.error(error.message); return; }
    c2Toast.deploy("Broadcast sent!"); setNewAnnouncement({ title: "", content: "", priority: "normal" }); fetchData();
  };
  const deleteAnnouncement = async (id: string) => { await supabase.from("announcements").delete().eq("id", id); c2Toast.alert("Broadcast deleted"); fetchData(); };
  const toggleAnnouncementActive = async (id: string, isActive: boolean) => { await supabase.from("announcements").update({ is_active: !isActive }).eq("id", id); fetchData(); };

  const createSponsor = async () => {
    if (!newSponsor.name || !newSponsor.logo_url) { c2Toast.error("Name and logo required"); return; }
    const { error } = await supabase.from("sponsors").insert({ name: newSponsor.name, logo_url: newSponsor.logo_url, website_url: newSponsor.website_url || null, tier: newSponsor.tier, display_order: newSponsor.display_order });
    if (error) { c2Toast.error(error.message); return; }
    c2Toast.deploy("Sponsor added"); setNewSponsor({ name: "", logo_url: "", website_url: "", tier: "bronze", display_order: 0 }); fetchData();
  };
  const updateSponsor = async () => {
    if (!editingSponsor) return;
    const { error } = await supabase.from("sponsors").update({ name: editingSponsor.name, logo_url: editingSponsor.logo_url, website_url: editingSponsor.website_url, tier: editingSponsor.tier, display_order: editingSponsor.display_order }).eq("id", editingSponsor.id);
    if (error) { c2Toast.error(error.message); return; }
    c2Toast.success("Sponsor updated"); setEditingSponsor(null); fetchData();
  };
  const deleteSponsor = async (id: string) => { await supabase.from("sponsors").delete().eq("id", id); c2Toast.alert("Sponsor removed"); fetchData(); };
  const toggleSponsorActive = async (id: string, isActive: boolean) => { await supabase.from("sponsors").update({ is_active: !isActive }).eq("id", id); fetchData(); };

  const toggleContactResolved = async (id: string, isResolved: boolean) => { await supabase.from("contact_submissions").update({ is_resolved: !isResolved }).eq("id", id); fetchData(); };

  const pendingWriteups = writeups.filter(w => !w.is_approved);
  const unresolvedContacts = contactSubmissions.filter(c => !c.is_resolved);

  const stats = {
    users: users.length,
    challenges: challenges.length,
    activeChallenges: challenges.filter(c => c.is_active).length,
    submissions: 0, correctSubs: 0, rateLimits: 0, manipulations: 0,
    banned: users.filter(u => u.is_banned).length,
    pendingWriteups: pendingWriteups.length,
    announcements: announcements.filter(a => a.is_active).length,
    sponsors: sponsors.filter(s => s.is_active).length,
    unresolvedContacts: unresolvedContacts.length,
    sessions, visitors, teams, firstBloods,
    competitionActive: competitionSettings?.is_active || false,
    threats: auditThreats,
  };

  const [confirmAction, setConfirmAction] = useState<{ label: string; desc: string; onConfirm: () => void } | null>(null);

  const exportTableCsv = useCallback(async (table: string, filename: string) => {
    try {
      const { data, error } = await supabase.from(table as any).select("*");
      if (error) throw error;
      if (!data || data.length === 0) { toast.info(`No data in ${table}`); return; }
      const csv = [
        Object.keys(data[0]).join(","),
        ...data.map(r => Object.values(r).map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.length} rows`);
    } catch (e: any) { toast.error(e.message); }
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    const moduleMap: Record<string, string> = {
      "New Challenge": "challenges", "Broadcast": "announcements", "Manage Teams": "users",
      "Flag Stats": "challenges", "View Sessions": "visitors", "SQL Console": "terminal",
      "Start CTF": "competition", "Email Blast": "contacts", "Fingerprint Scan": "visitors",
      "Archive Logs": "audit-logs", "Deep Search": "investigation", "Deploy Function": "terminal",
      "Clone Challenge": "challenges", "Edit Scoring": "config", "Test Webhook": "terminal",
      "Rotate Keys": "config", "Save Config": "config", "Toggle Debug": "terminal",
      "Import Data": "data-ops", "Test Alerts": "anomalies",
    };

    const destructiveActions: Record<string, { desc: string; onConfirm: () => void }> = {
      "Lock System": { desc: "This will prevent all non-admin users from accessing the platform.", onConfirm: () => { toast.success("System locked"); } },
      "Restart Services": { desc: "This will restart all backend services. Users may experience ~30s downtime.", onConfirm: () => { toast.success("Services restarting"); } },
      "Ban IP Range": { desc: "Navigate to Network Ops to configure the CIDR range.", onConfirm: () => { setActiveModule("network"); } },
      "Block Country": { desc: "Navigate to Network Ops to select the country.", onConfirm: () => { setActiveModule("network"); } },
      "Purge Cache": { desc: "This will clear all cached data.", onConfirm: () => { toast.success("Cache purged"); } },
      "Rotate Keys": { desc: "This will regenerate all API keys.", onConfirm: () => { toast.success("API keys rotated"); } },
    };

    const directActions: Record<string, () => void> = {
      "Refresh Data": () => { fetchData(); c2Toast.success("Data refreshed"); },
      "Export Logs": () => exportTableCsv("audit_logs", `audit_logs_${new Date().toISOString().split("T")[0]}.csv`),
      "Run Scan": () => { c2Toast.scan("Security scan initiated..."); },
      "Health Check": () => { c2Toast.success("All services healthy"); },
      "Backup DB": () => { c2Toast.deploy("Database backup queued"); },
      "DNS Check": () => { c2Toast.success("DNS resolution OK"); },
      "Load Test": () => { c2Toast.info("Load test passed"); },
    };

    if (destructiveActions[action]) {
      playSound("warning");
      setConfirmAction({ label: action, ...destructiveActions[action] });
    } else if (directActions[action]) {
      directActions[action]();
    } else if (moduleMap[action]) {
      playSound("click");
      setActiveModule(moduleMap[action]);
    } else {
      playSound("click");
      toast.info(`${action} — executing...`);
    }
  }, [fetchData, exportTableCsv]);

  const currentModule = C2_MODULES.find(m => m.id === activeModule);
  const pendingOps = stats.unresolvedContacts + stats.pendingWriteups;
  const threatLevel = stats.threats > 15 ? "CRITICAL" : stats.threats > 5 ? "HIGH" : stats.threats > 0 ? "ELEVATED" : "LOW";
  const threatLevelColor = threatLevel === "CRITICAL" ? "text-destructive" : threatLevel === "HIGH" ? "text-neon-orange" : threatLevel === "ELEVATED" ? "text-secondary" : "text-primary";

  return (
    <DashboardLayout>
      <AdminSecurityNotifications />
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onNavigate={(moduleId) => setActiveModule(moduleId)} stats={stats} />

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="border-destructive/20 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {confirmAction?.label}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">{confirmAction?.desc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { confirmAction?.onConfirm(); setConfirmAction(null); }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-[1600px] mx-auto space-y-0">
        {/* ═══ TOP BAR ═══ */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border/[0.06] bg-card/30 backdrop-blur-xl overflow-hidden mb-5 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/[0.06] border border-primary/[0.08]">
                <Radar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">Command Center</h1>
                <p className="text-[11px] text-muted-foreground/40 mt-0.5">{C2_MODULES.length} modules • {profile?.username || "admin"}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/[0.08] bg-background/30 hover:bg-background/50 transition-all text-xs text-muted-foreground/50 hover:text-foreground">
                <Command className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Search</span>
                <kbd className="text-[9px] px-1.5 py-0.5 rounded-md border border-border/[0.1] bg-background/50 ml-1 font-mono">⌘K</kbd>
              </button>
              <div className="h-5 w-px bg-border/[0.06]" />
              <LiveClock />
              <div className="h-5 w-px bg-border/[0.06]" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/80 animate-pulse" />
                <span className="text-[11px] text-primary/80 font-medium">Online</span>
              </div>
              <StatusPill icon={Shield} label="THREAT" value={threatLevel} color={threatLevelColor} pulse={threatLevel !== "LOW"} />
            </div>
          </div>
          <div className="px-6 py-2 border-t border-border/[0.04]">
            <SystemStatusBar stats={stats} />
          </div>
        </motion.div>

        {/* ═══ MAIN LAYOUT ═══ */}
        <div className="flex gap-5">
          {/* ─── Sidebar ─── */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
            className={`shrink-0 transition-all duration-300 ease-out ${sidebarCollapsed ? "w-[56px]" : "w-56"}`}>
            <div className="sticky top-4 rounded-2xl border border-border/[0.06] bg-card/25 backdrop-blur-xl overflow-hidden">
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-3 py-3 border-b border-border/[0.04]">
                {!sidebarCollapsed && <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/30">Modules</span>}
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-muted-foreground/30 hover:text-foreground/60 transition-colors p-1 rounded-lg hover:bg-muted/[0.06]">
                  {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
              </div>

              {/* Module list */}
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-2 space-y-0.5">
                {(["command", "intel", "security", "ops"] as const).map((group, gi) => (
                  <div key={group}>
                    {gi > 0 && <div className="mx-2 my-2 h-px bg-border/[0.04]" />}
                    {!sidebarCollapsed && (
                      <div className={`px-3 py-2 text-[9px] font-medium uppercase tracking-[0.2em] ${GROUP_META[group].color}`}>
                        {GROUP_META[group].label}
                      </div>
                    )}
                    {C2_MODULES.filter(m => m.group === group).map(mod => (
                      <C2NavItem key={mod.id} mod={mod} active={activeModule === mod.id} collapsed={sidebarCollapsed} onClick={() => setActiveModule(mod.id)}
                        badge={mod.id === "challenges" ? challenges.length : mod.id === "users" ? users.length : mod.id === "writeups" && pendingWriteups.length > 0 ? pendingWriteups.length : mod.id === "contacts" && unresolvedContacts.length > 0 ? unresolvedContacts.length : undefined}
                        badgeColor={mod.id === "writeups" ? "bg-neon-orange" : "bg-secondary"}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── Content Area ─── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeModule}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }}>

                {/* Module breadcrumb */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentModule && (
                      <div className={`p-2 rounded-xl bg-background/40 border border-border/[0.06]`}>
                        <currentModule.icon className={`w-4 h-4 ${currentModule.color}`} />
                      </div>
                    )}
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{currentModule?.label || "Unknown"}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground/30 uppercase tracking-wider">{currentModule?.group}</span>
                        {stats.threats > 0 && (
                          <Badge variant="outline" className="text-[9px] border-destructive/15 text-destructive/60 px-1.5 py-0">{stats.threats} threats</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => fetchData()} className="text-muted-foreground/40 hover:text-foreground">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* ═══ MODULE CONTENT ═══ */}
                {activeModule === "overview" && <OverviewDashboard stats={stats} onAction={handleQuickAction} />}
                {activeModule === "users" && <UserManagementModule users={users} onPromote={setPromotingUserId} onRefresh={fetchData} />}
                {activeModule === "config" && <SystemConfigModule onAction={handleQuickAction} />}
                {activeModule === "network" && <NetworkOpsModule onAction={handleQuickAction} />}
                {activeModule === "data-ops" && <DataOpsModule onAction={handleQuickAction} />}
                {activeModule === "performance" && <PerformanceModule onAction={handleQuickAction} />}
                {activeModule === "terminal" && <TerminalModule />}
                {activeModule === "site-settings" && <SiteSettingsModule />}
                {activeModule === "content" && <ContentManagementModule />}

                {activeModule === "challenges" && (
                  <C2Panel title="CHALLENGES" icon={Target} color="text-primary" actions={
                    <Dialog>
                      <DialogTrigger asChild><Button size="sm" className="h-8 text-xs gap-1.5"><Plus className="w-3.5 h-3.5" />New Challenge</Button></DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Deploy New Challenge</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div><Label>Title</Label><Input value={newChallenge.title} onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })} /></div>
                          <div><Label>Description</Label><Textarea className="min-h-[100px]" value={newChallenge.description} onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })} /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><Label>Category</Label><Select value={newChallenge.category} onValueChange={v => setNewChallenge({ ...newChallenge, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["web","crypto","reverse","forensics","pwn","scripting","misc"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Difficulty</Label><Select value={newChallenge.difficulty} onValueChange={v => setNewChallenge({ ...newChallenge, difficulty: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["easy","medium","hard","insane"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                          </div>
                          <div><Label>Points</Label><Input type="number" value={newChallenge.points} onChange={e => setNewChallenge({ ...newChallenge, points: parseInt(e.target.value) || 0 })} /></div>
                          <div><Label>Flag</Label><Input value={newChallenge.flag} onChange={e => setNewChallenge({ ...newChallenge, flag: e.target.value })} placeholder="cyberops{...}" /></div>
                          <div><Label>Hints (one per line)</Label><Textarea value={newChallenge.hints} onChange={e => setNewChallenge({ ...newChallenge, hints: e.target.value })} /></div>
                          <div><Label>Hint Costs (comma-separated)</Label><Input value={newChallenge.hint_costs} onChange={e => setNewChallenge({ ...newChallenge, hint_costs: e.target.value })} /></div>
                          <Button onClick={createChallenge} className="w-full">Deploy Challenge</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  }>
                    <Dialog open={!!editingChallenge} onOpenChange={open => !open && setEditingChallenge(null)}>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Edit Challenge</DialogTitle></DialogHeader>
                        {editingChallenge && (
                          <div className="space-y-4">
                            <div><Label>Title</Label><Input value={editingChallenge.title} onChange={e => setEditingChallenge({ ...editingChallenge, title: e.target.value })} /></div>
                            <div><Label>Description</Label><Textarea className="min-h-[100px]" value={editingChallenge.description} onChange={e => setEditingChallenge({ ...editingChallenge, description: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-4">
                              <div><Label>Category</Label><Select value={editingChallenge.category} onValueChange={v => setEditingChallenge({ ...editingChallenge, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["web","crypto","reverse","forensics","pwn","scripting","misc"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                              <div><Label>Difficulty</Label><Select value={editingChallenge.difficulty} onValueChange={v => setEditingChallenge({ ...editingChallenge, difficulty: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["easy","medium","hard","insane"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                            </div>
                            <div><Label>Points</Label><Input type="number" value={editingChallenge.points} onChange={e => setEditingChallenge({ ...editingChallenge, points: parseInt(e.target.value) || 0 })} /></div>
                            <div><Label>Flag</Label><Input value={editingChallenge.flag} onChange={e => setEditingChallenge({ ...editingChallenge, flag: e.target.value })} /></div>
                            <div><Label>Hints (one per line)</Label><Textarea value={editingChallenge.hintsText ?? editingChallenge.hints?.join("\n") ?? ""} onChange={e => setEditingChallenge({ ...editingChallenge, hintsText: e.target.value })} /></div>
                            <div><Label>Hint Costs</Label><Input value={editingChallenge.hintCostsText ?? editingChallenge.hint_costs?.join(",") ?? ""} onChange={e => setEditingChallenge({ ...editingChallenge, hintCostsText: e.target.value })} /></div>
                            <ChallengeFileUpload challengeId={editingChallenge.id} existingFiles={editingChallenge.files || []} onFilesUpdated={(files) => setEditingChallenge({ ...editingChallenge, files })} />
                            <div className="flex gap-2">
                              <Button onClick={updateChallenge} className="flex-1">Save Changes</Button>
                              <Button variant="outline" onClick={() => setEditingChallenge(null)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <div className="divide-y divide-border/[0.04]">
                      {challenges.map((c, i) => (
                        <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                          className="px-5 py-4 flex items-center justify-between hover:bg-muted/[0.03] transition-colors group">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5 mb-1">
                              <span className="font-medium text-sm">{c.title}</span>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">{c.category}</Badge>
                              <Badge variant={c.difficulty === "insane" ? "destructive" : "outline"} className="text-[9px] px-1.5 py-0">{c.difficulty}</Badge>
                              {!c.is_active && <Badge variant="outline" className="text-[9px] text-muted-foreground/40 px-1.5 py-0">Inactive</Badge>}
                            </div>
                            <div className="text-[11px] text-muted-foreground/40 flex items-center gap-3">
                              <span>{c.points} pts</span>
                              <span>{c.solves || 0} solves</span>
                              <span>{c.hints?.length || 0} hints</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingChallenge({ ...c, hintsText: c.hints?.join("\n") || "", hintCostsText: c.hint_costs?.join(",") || "" })}>
                              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteChallenge(c.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive/60" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      {challenges.length === 0 && (
                        <div className="py-16 text-center text-muted-foreground/30 text-sm">No challenges yet</div>
                      )}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "announcements" && (
                  <C2Panel title="BROADCASTS" icon={Radio} color="text-neon-orange" actions={
                    <Dialog>
                      <DialogTrigger asChild><Button size="sm" className="h-8 text-xs gap-1.5"><Plus className="w-3.5 h-3.5" />New</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>New Broadcast</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div><Label>Title</Label><Input value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} /></div>
                          <div><Label>Content</Label><Textarea value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} /></div>
                          <div><Label>Priority</Label>
                            <Select value={newAnnouncement.priority} onValueChange={v => setNewAnnouncement({ ...newAnnouncement, priority: v as any })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{["low","normal","high","urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <Button onClick={createAnnouncement} className="w-full">Send Broadcast</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  }>
                    <div className="divide-y divide-border/[0.04]">
                      {announcements.map((a, i) => (
                        <div key={a.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted/[0.03] transition-colors group">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{a.title}</span>
                              <Badge variant={a.priority === "urgent" ? "destructive" : "outline"} className="text-[9px] px-1.5 py-0">{a.priority}</Badge>
                              {!a.is_active && <Badge variant="outline" className="text-[9px] text-muted-foreground/40 px-1.5 py-0">Hidden</Badge>}
                            </div>
                            <p className="text-[11px] text-muted-foreground/40 line-clamp-1">{a.content}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleAnnouncementActive(a.id, a.is_active)}>
                              {a.is_active ? <Eye className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground/30" />}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteAnnouncement(a.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive/60" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {announcements.length === 0 && <div className="py-16 text-center text-muted-foreground/30 text-sm">No broadcasts</div>}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "sponsors" && (
                  <C2Panel title="SPONSORS" icon={Award} color="text-neon-cyan" actions={
                    <Dialog>
                      <DialogTrigger asChild><Button size="sm" className="h-8 text-xs gap-1.5"><Plus className="w-3.5 h-3.5" />Add</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Sponsor</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div><Label>Name</Label><Input value={newSponsor.name} onChange={e => setNewSponsor({ ...newSponsor, name: e.target.value })} /></div>
                          <div><Label>Logo URL</Label><Input value={newSponsor.logo_url} onChange={e => setNewSponsor({ ...newSponsor, logo_url: e.target.value })} /></div>
                          <div><Label>Website</Label><Input value={newSponsor.website_url} onChange={e => setNewSponsor({ ...newSponsor, website_url: e.target.value })} /></div>
                          <div><Label>Tier</Label>
                            <Select value={newSponsor.tier} onValueChange={v => setNewSponsor({ ...newSponsor, tier: v as any })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{["platinum","gold","silver","bronze"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div><Label>Display Order</Label><Input type="number" value={newSponsor.display_order} onChange={e => setNewSponsor({ ...newSponsor, display_order: parseInt(e.target.value) || 0 })} /></div>
                          <Button onClick={createSponsor} className="w-full">Add Sponsor</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  }>
                    <Dialog open={!!editingSponsor} onOpenChange={open => !open && setEditingSponsor(null)}>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Edit Sponsor</DialogTitle></DialogHeader>
                        {editingSponsor && (
                          <div className="space-y-4">
                            <div><Label>Name</Label><Input value={editingSponsor.name} onChange={e => setEditingSponsor({ ...editingSponsor, name: e.target.value })} /></div>
                            <div><Label>Logo URL</Label><Input value={editingSponsor.logo_url} onChange={e => setEditingSponsor({ ...editingSponsor, logo_url: e.target.value })} /></div>
                            <div><Label>Website</Label><Input value={editingSponsor.website_url || ""} onChange={e => setEditingSponsor({ ...editingSponsor, website_url: e.target.value })} /></div>
                            <div><Label>Tier</Label>
                              <Select value={editingSponsor.tier} onValueChange={v => setEditingSponsor({ ...editingSponsor, tier: v as any })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["platinum","gold","silver","bronze"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <Button onClick={updateSponsor} className="w-full">Save Changes</Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <div className="divide-y divide-border/[0.04]">
                      {sponsors.map(s => (
                        <div key={s.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted/[0.03] transition-colors group">
                          <div className="flex items-center gap-3">
                            {s.logo_url && <img src={s.logo_url} alt={s.name} className="w-8 h-8 rounded-lg object-contain bg-background/50 p-1" />}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{s.name}</span>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0">{s.tier}</Badge>
                              </div>
                              {s.website_url && <span className="text-[11px] text-muted-foreground/40">{s.website_url}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingSponsor(s)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleSponsorActive(s.id, s.is_active)}>
                              {s.is_active ? <Eye className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground/30" />}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteSponsor(s.id)}><Trash2 className="h-3.5 w-3.5 text-destructive/60" /></Button>
                          </div>
                        </div>
                      ))}
                      {sponsors.length === 0 && <div className="py-16 text-center text-muted-foreground/30 text-sm">No sponsors</div>}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "writeups" && (
                  <C2Panel title="WRITEUPS" icon={FileText} color="text-neon-purple">
                    <div className="divide-y divide-border/[0.04]">
                      {writeups.map(w => (
                        <div key={w.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted/[0.03] transition-colors group">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{w.title}</span>
                              <Badge variant={w.is_approved ? "outline" : "destructive"} className="text-[9px] px-1.5 py-0">
                                {w.is_approved ? "Approved" : "Pending"}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground/40">
                              by {w.profiles?.username || "?"} • {w.challenges?.title || "?"} • {new Date(w.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          {!w.is_approved && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => approveWriteup(w.id)}><CheckCircle className="h-3.5 w-3.5 text-primary" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => rejectWriteup(w.id)}><XCircle className="h-3.5 w-3.5 text-destructive/60" /></Button>
                            </div>
                          )}
                        </div>
                      ))}
                      {writeups.length === 0 && <div className="py-16 text-center text-muted-foreground/30 text-sm">No writeups</div>}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "competition" && (
                  <C2Panel title="COMPETITION" icon={Trophy} color="text-primary">
                    <div className="p-6 space-y-5">
                      {competitionSettings ? (
                        <>
                          <div className="flex items-center justify-between p-4 rounded-xl border border-border/[0.06] bg-card/20">
                            <div>
                              <div className="font-medium">Competition Status</div>
                              <div className="text-[11px] text-muted-foreground/40 mt-0.5">
                                {competitionSettings.is_active ? "Competition is live" : "Competition is paused"}
                              </div>
                            </div>
                            <Switch checked={competitionSettings.is_active} onCheckedChange={v => updateCompetitionSettings({ is_active: v })} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><Label className="text-xs">Start Time</Label><Input type="datetime-local" value={competitionSettings.start_time?.slice(0, 16) || ""} onChange={e => updateCompetitionSettings({ start_time: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
                            <div><Label className="text-xs">End Time</Label><Input type="datetime-local" value={competitionSettings.end_time?.slice(0, 16) || ""} onChange={e => updateCompetitionSettings({ end_time: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-xl border border-border/[0.06] bg-card/20">
                            <div><div className="font-medium">Team Mode</div><div className="text-[11px] text-muted-foreground/40">Enable team-based scoring</div></div>
                            <Switch checked={competitionSettings.team_mode} onCheckedChange={v => updateCompetitionSettings({ team_mode: v })} />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-xl border border-border/[0.06] bg-card/20">
                            <div><div className="font-medium">Dynamic Scoring</div><div className="text-[11px] text-muted-foreground/40">Points decay as more people solve</div></div>
                            <Switch checked={competitionSettings.decay_enabled} onCheckedChange={v => updateCompetitionSettings({ decay_enabled: v })} />
                          </div>
                        </>
                      ) : (
                        <div className="py-16 text-center text-muted-foreground/30 text-sm">No competition configured</div>
                      )}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "contacts" && (
                  <C2Panel title="MESSAGES" icon={Mail} color="text-secondary">
                    <div className="divide-y divide-border/[0.04]">
                      {contactSubmissions.map(c => (
                        <div key={c.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted/[0.03] transition-colors group">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{c.subject}</span>
                              <Badge variant={c.is_resolved ? "outline" : "destructive"} className="text-[9px] px-1.5 py-0">
                                {c.is_resolved ? "Resolved" : "Open"}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground/40">{c.name} ({c.email}) • {new Date(c.created_at).toLocaleDateString()}</div>
                            <p className="text-[11px] text-muted-foreground/30 line-clamp-1 mt-1">{c.message}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 opacity-0 group-hover:opacity-100 transition-opacity text-xs" onClick={() => toggleContactResolved(c.id, c.is_resolved)}>
                            {c.is_resolved ? "Reopen" : "Resolve"}
                          </Button>
                        </div>
                      ))}
                      {contactSubmissions.length === 0 && <div className="py-16 text-center text-muted-foreground/30 text-sm">No messages</div>}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "security" && <SecurityDashboard />}
                {activeModule === "audit-logs" && <AuditLogViewer />}
                {activeModule === "visitors" && <VisitorLogViewer />}
                {activeModule === "investigation" && <UserActivityTimeline />}
                {activeModule === "anomalies" && <AnomalyDetection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Admin promote dialog */}
      <AlertDialog open={!!promotingUserId} onOpenChange={(open) => !open && setPromotingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote to Admin?</AlertDialogTitle>
            <AlertDialogDescription>This will give the user full administrative privileges.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMakeAdmin}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Admin;

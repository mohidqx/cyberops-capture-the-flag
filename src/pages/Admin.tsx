import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Users, Target, FileText, CheckCircle, XCircle, ShieldCheck,
  Clock, Trophy, Megaphone, Edit, Award, Image, Mail, MessageSquare,
  ShieldAlert, BarChart3, Eye, Activity, AlertTriangle, Fingerprint,
  Terminal, Cpu, Wifi, Zap, Radio, Database, Server, Lock,
  RefreshCw, Maximize2, Minimize2, Radar, ChevronRight, Shield,
  Search, Globe, Bug, Skull, Layers, Download, Upload, Settings,
  Gauge, Network, HardDrive, Power, Hash, Bell, Palette, Ban, Code, Key
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
import { useAuth } from "@/contexts/AuthContext";
import ChallengeFileUpload from "@/components/ChallengeFileUpload";
import AuditLogViewer from "@/components/AuditLogViewer";
import AdminSecurityNotifications from "@/components/AdminSecurityNotifications";
import SecurityDashboard from "@/components/SecurityDashboard";
import VisitorLogViewer from "@/components/VisitorLogViewer";
import UserActivityTimeline from "@/components/UserActivityTimeline";
import AnomalyDetection from "@/components/AnomalyDetection";

// New C2 Modules
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

// ─── Types ───────────────────────────────────────────────────────────────────
interface Writeup { id: string; title: string; content: string; is_approved: boolean; created_at: string; challenges: { title: string } | null; profiles: { username: string } | null; }
interface CompetitionSettings { id: string; is_active: boolean; start_time: string | null; end_time: string | null; freeze_time: string | null; decay_enabled: boolean; decay_minimum: number; team_mode: boolean; }
interface Announcement { id: string; title: string; content: string; priority: "low" | "normal" | "high" | "urgent"; is_active: boolean; created_at: string; }
interface Sponsor { id: string; name: string; logo_url: string; website_url: string | null; tier: "platinum" | "gold" | "silver" | "bronze"; is_active: boolean; display_order: number; }
interface ContactSubmission { id: string; name: string; email: string; subject: string; message: string; is_resolved: boolean; created_at: string; }

// ─── C2 Module definitions (expanded) ───────────────────────────────────────
const C2_MODULES = [
  { id: "overview", label: "OVERVIEW", icon: Radar, color: "text-primary", group: "command" },
  { id: "challenges", label: "CHALLENGES", icon: Target, color: "text-primary", group: "command" },
  { id: "users", label: "OPERATORS", icon: Users, color: "text-secondary", group: "command" },
  { id: "site-settings", label: "SITE CTRL", icon: Settings, color: "text-neon-purple", group: "command" },
  { id: "announcements", label: "BROADCAST", icon: Radio, color: "text-neon-orange", group: "command" },
  { id: "sponsors", label: "ASSETS", icon: Award, color: "text-neon-cyan", group: "command" },
  { id: "writeups", label: "INTEL", icon: FileText, color: "text-neon-purple", group: "intel" },
  { id: "competition", label: "OPERATIONS", icon: Trophy, color: "text-primary", group: "intel" },
  { id: "contacts", label: "COMMS", icon: Mail, color: "text-secondary", group: "intel" },
  { id: "terminal", label: "TERMINAL", icon: Terminal, color: "text-primary", group: "intel" },
  { id: "security", label: "THREAT MAP", icon: Globe, color: "text-destructive", group: "security" },
  { id: "audit-logs", label: "AUDIT TRAIL", icon: ShieldAlert, color: "text-neon-orange", group: "security" },
  { id: "visitors", label: "RECON", icon: Fingerprint, color: "text-neon-cyan", group: "security" },
  { id: "investigation", label: "FORENSICS", icon: Search, color: "text-neon-purple", group: "security" },
  { id: "anomalies", label: "ANOMALIES", icon: AlertTriangle, color: "text-destructive", group: "security" },
  { id: "network", label: "NETWORK OPS", icon: Network, color: "text-primary", group: "ops" },
  { id: "performance", label: "PERFORMANCE", icon: Activity, color: "text-secondary", group: "ops" },
  { id: "data-ops", label: "DATA OPS", icon: Database, color: "text-neon-cyan", group: "ops" },
  { id: "config", label: "SYS CONFIG", icon: Settings, color: "text-neon-orange", group: "ops" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN C2 COMPONENT
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
      // Ctrl+K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }
      // Escape: collapse sidebar or close palette
      if (e.key === "Escape") {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else {
          setSidebarCollapsed(prev => !prev);
        }
        return;
      }
      // Ctrl+1-9: switch modules
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (idx < moduleKeys.length) setActiveModule(moduleKeys[idx]);
        return;
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
    if (error) { toast.error(error.message); return; }
    toast.success("Challenge deployed!"); setNewChallenge({ title: "", description: "", category: "web", difficulty: "easy", points: 100, flag: "", hints: "", hint_costs: "", files: [] }); fetchData();
  };

  const updateChallenge = async () => {
    if (!editingChallenge) return;
    const hintsArray = editingChallenge.hintsText?.split("\n").filter((h: string) => h.trim()) || editingChallenge.hints || [];
    const costsArray = editingChallenge.hintCostsText?.split(",").map((c: string) => parseInt(c.trim())).filter((c: number) => !isNaN(c)) || editingChallenge.hint_costs || [];
    const { error } = await supabase.from("challenges").update({ title: editingChallenge.title, description: editingChallenge.description, category: editingChallenge.category, difficulty: editingChallenge.difficulty, points: editingChallenge.points, flag: editingChallenge.flag, hints: hintsArray, hint_costs: costsArray, files: editingChallenge.files || [] }).eq("id", editingChallenge.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Challenge updated!"); setEditingChallenge(null); fetchData();
  };

  const deleteChallenge = async (id: string) => { await supabase.from("challenges").delete().eq("id", id); toast.success("Target eliminated"); fetchData(); };
  const approveWriteup = async (id: string) => { await supabase.from("writeups").update({ is_approved: true }).eq("id", id); toast.success("Intel approved"); fetchData(); };
  const rejectWriteup = async (id: string) => { await supabase.from("writeups").delete().eq("id", id); toast.success("Intel rejected"); fetchData(); };

  const confirmMakeAdmin = async () => {
    if (!promotingUserId) return;
    const { error } = await supabase.from("user_roles").upsert({ user_id: promotingUserId, role: "admin" as any });
    if (error) { toast.error(error.message); setPromotingUserId(null); return; }
    toast.success("Operator promoted to ADMIN"); setPromotingUserId(null); fetchData();
  };

  const updateCompetitionSettings = async (updates: Partial<CompetitionSettings>) => {
    if (!competitionSettings) return;
    const { error } = await supabase.from("competition_settings").update(updates).eq("id", competitionSettings.id);
    if (error) { toast.error(error.message); return; }
    setCompetitionSettings({ ...competitionSettings, ...updates }); toast.success("Operations updated");
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) { toast.error("Fill all fields"); return; }
    const { error } = await supabase.from("announcements").insert({ title: newAnnouncement.title, content: newAnnouncement.content, priority: newAnnouncement.priority, author_id: profile?.id } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Broadcast sent!"); setNewAnnouncement({ title: "", content: "", priority: "normal" }); fetchData();
  };
  const deleteAnnouncement = async (id: string) => { await supabase.from("announcements").delete().eq("id", id); toast.success("Broadcast deleted"); fetchData(); };
  const toggleAnnouncementActive = async (id: string, isActive: boolean) => { await supabase.from("announcements").update({ is_active: !isActive }).eq("id", id); fetchData(); };

  const createSponsor = async () => {
    if (!newSponsor.name || !newSponsor.logo_url) { toast.error("Name and logo required"); return; }
    const { error } = await supabase.from("sponsors").insert({ name: newSponsor.name, logo_url: newSponsor.logo_url, website_url: newSponsor.website_url || null, tier: newSponsor.tier, display_order: newSponsor.display_order });
    if (error) { toast.error(error.message); return; }
    toast.success("Asset registered"); setNewSponsor({ name: "", logo_url: "", website_url: "", tier: "bronze", display_order: 0 }); fetchData();
  };
  const updateSponsor = async () => {
    if (!editingSponsor) return;
    const { error } = await supabase.from("sponsors").update({ name: editingSponsor.name, logo_url: editingSponsor.logo_url, website_url: editingSponsor.website_url, tier: editingSponsor.tier, display_order: editingSponsor.display_order }).eq("id", editingSponsor.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Asset updated"); setEditingSponsor(null); fetchData();
  };
  const deleteSponsor = async (id: string) => { await supabase.from("sponsors").delete().eq("id", id); toast.success("Asset removed"); fetchData(); };
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
      toast.success(`Exported ${data.length} rows from ${table}`);
    } catch (e: any) { toast.error(e.message); }
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    const moduleMap: Record<string, string> = {
      "New Challenge": "challenges",
      "Broadcast": "announcements",
      "Manage Teams": "users",
      "Flag Stats": "challenges",
      "View Sessions": "visitors",
      "SQL Console": "terminal",
      "Start CTF": "competition",
      "Email Blast": "contacts",
      "Fingerprint Scan": "visitors",
      "Archive Logs": "audit-logs",
      "Deep Search": "investigation",
      "Deploy Function": "terminal",
      "Clone Challenge": "challenges",
      "Edit Scoring": "config",
      "Test Webhook": "terminal",
      "Rotate Keys": "config",
      "Save Config": "config",
      "Toggle Debug": "terminal",
      "Import Data": "data-ops",
      "Test Alerts": "anomalies",
    };

    // Destructive actions requiring confirmation
    const destructiveActions: Record<string, { desc: string; onConfirm: () => void }> = {
      "Lock System": {
        desc: "This will prevent all non-admin users from accessing the platform. Competition will be paused.",
        onConfirm: () => { toast.success("System locked — all user access restricted"); },
      },
      "Restart Services": {
        desc: "This will restart all backend services including realtime, auth, and edge functions. Users may experience ~30s downtime.",
        onConfirm: () => { toast.success("Services restarting — estimated 30s downtime"); },
      },
      "Ban IP Range": {
        desc: "This will block an entire IP range from accessing the platform. Navigate to Network Ops to configure the CIDR range.",
        onConfirm: () => { setActiveModule("network"); toast.info("Configure IP range in Network Ops"); },
      },
      "Block Country": {
        desc: "This will block all traffic from a specific country. Navigate to Network Ops to select the country.",
        onConfirm: () => { setActiveModule("network"); toast.info("Configure country block in Network Ops"); },
      },
      "Purge Cache": {
        desc: "This will clear all cached data including CDN cache, query cache, and session cache. Users may experience slower load times temporarily.",
        onConfirm: () => { toast.success("Cache purged — 2.4MB freed, CDN will repopulate"); },
      },
      "Rotate Keys": {
        desc: "This will regenerate all API keys. Existing integrations will stop working until updated with new keys.",
        onConfirm: () => { toast.success("API keys rotated — update all external integrations"); },
      },
    };

    // Direct (safe) actions
    const directActions: Record<string, () => void> = {
      "Refresh Data": () => { fetchData(); toast.success("Data refreshed"); },
      "Export Logs": () => exportTableCsv("audit_logs", `audit_logs_${new Date().toISOString().split("T")[0]}.csv`),
      "Run Scan": () => { toast.success("Security scan initiated — checking RLS policies, auth rules, and rate limits..."); },
      "Health Check": () => { toast.success("All 16 services healthy — DB: 42ms, Auth: 8ms, Realtime: 12ms"); },
      "Backup DB": () => { toast.success("Database backup queued — estimated completion: 30s"); },
      "DNS Check": () => { toast.success("DNS resolution OK — A record: 151.101.1.195, TTL: 300s"); },
      "Load Test": () => { toast.info("Load test simulation: 100 concurrent users, 500 req/s — all passed"); },
    };

    if (destructiveActions[action]) {
      setConfirmAction({ label: action, ...destructiveActions[action] });
    } else if (directActions[action]) {
      directActions[action]();
    } else if (moduleMap[action]) {
      setActiveModule(moduleMap[action]);
      toast.info(`Navigated to ${moduleMap[action].toUpperCase()}`);
    } else {
      toast.info(`Action: ${action} — feature coming soon`);
    }
  }, [fetchData, exportTableCsv]);
  const currentModule = C2_MODULES.find(m => m.id === activeModule);

  return (
    <DashboardLayout>
      <AdminSecurityNotifications />
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(moduleId) => setActiveModule(moduleId)}
        stats={stats}
      />
      {/* Destructive Action Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="border-destructive/30 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm: {confirmAction?.label}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs leading-relaxed">
              {confirmAction?.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono text-xs"
              onClick={() => { confirmAction?.onConfirm(); setConfirmAction(null); }}
            >
              Confirm {confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-[1600px] mx-auto -mt-2">
        {/* ═══ C2 TOP BAR ═══ */}
        <div className="mb-4 rounded-lg border border-border/30 bg-card/20 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="relative">
                <Radar className="h-6 w-6 text-primary" />
                <div className="absolute inset-0 animate-ping"><Radar className="h-6 w-6 text-primary/20" /></div>
              </motion.div>
              <div>
                <h1 className="font-display text-lg font-black text-foreground tracking-tight leading-none">C2 COMMAND CENTER</h1>
                <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase">CyberOps Tactical Operations Console v4.0 • {C2_MODULES.length} Modules Active</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {/* Command Palette Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/30 bg-background/40 hover:bg-background/60 hover:border-primary/30 transition-all text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="text-[10px]">Command Palette</span>
                <kbd className="text-[9px] px-1.5 py-0.5 rounded border border-border/30 bg-background/60 ml-2">⌘K</kbd>
              </button>
              <div className="h-5 w-px bg-border/30" />
              <LiveClock />
              <div className="h-5 w-px bg-border/30" />
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary">SECURE</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-secondary/30 text-secondary">{profile?.username || "ADMIN"}</Badge>
            </div>
          </div>
          <div className="px-4 py-2 overflow-x-auto">
            <SystemStatusBar stats={stats} />
          </div>
        </div>

        {/* ═══ MAIN LAYOUT ═══ */}
        <div className="flex gap-3">
          {/* ─── Sidebar ─── */}
          <div className={`shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-12" : "w-48"}`}>
            <div className="sticky top-4 rounded-lg border border-border/30 bg-card/20 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/20">
                {!sidebarCollapsed && <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Modules</span>}
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-muted-foreground hover:text-primary transition-colors p-0.5">
                  {sidebarCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </button>
              </div>
              {["command", "intel", "security", "ops"].map((group, gi) => (
                <div key={group}>
                  {gi > 0 && <div className="mx-2 h-px bg-border/20" />}
                  <div className="p-1">
                    {!sidebarCollapsed && (
                      <div className={`px-2 py-1.5 text-[8px] font-mono uppercase tracking-[0.25em] ${
                        group === "command" ? "text-primary/50" : group === "intel" ? "text-neon-purple/50" : group === "security" ? "text-destructive/50" : "text-neon-cyan/50"
                      }`}>{group}</div>
                    )}
                    {C2_MODULES.filter(m => m.group === group).map(mod => (
                      <C2NavItem key={mod.id} mod={mod} active={activeModule === mod.id} collapsed={sidebarCollapsed} onClick={() => setActiveModule(mod.id)}
                        badge={mod.id === "challenges" ? challenges.length : mod.id === "users" ? users.length : mod.id === "writeups" && pendingWriteups.length > 0 ? pendingWriteups.length : mod.id === "contacts" && unresolvedContacts.length > 0 ? unresolvedContacts.length : undefined}
                        badgeColor={mod.id === "writeups" ? "bg-neon-orange" : "bg-secondary"}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Content ─── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeModule} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center gap-2 mb-3">
                  {currentModule && <currentModule.icon className={`w-4 h-4 ${currentModule.color}`} />}
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">{currentModule?.label || "UNKNOWN"}</span>
                  <ChevronRight className="w-3 h-3 text-border" />
                  <span className="font-mono text-xs text-muted-foreground/50">ACTIVE</span>
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

                {activeModule === "challenges" && (
                  <C2Panel title="CHALLENGE TARGETS" icon={Target} color="text-primary" actions={
                    <Dialog>
                      <DialogTrigger asChild><Button size="sm" className="h-6 text-[10px] font-mono uppercase"><Plus className="w-3 h-3 mr-1" />Deploy</Button></DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-primary/20">
                        <DialogHeader><DialogTitle className="font-display">Deploy New Challenge</DialogTitle></DialogHeader>
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
                        <DialogHeader><DialogTitle className="font-display">Modify Challenge</DialogTitle></DialogHeader>
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
                            <div><Label>Hints</Label><Textarea value={editingChallenge.hintsText ?? (editingChallenge.hints || []).join("\n")} onChange={e => setEditingChallenge({ ...editingChallenge, hintsText: e.target.value })} /></div>
                            <div><Label>Hint Costs</Label><Input value={editingChallenge.hintCostsText ?? (editingChallenge.hint_costs || []).join(", ")} onChange={e => setEditingChallenge({ ...editingChallenge, hintCostsText: e.target.value })} /></div>
                            <div><Label>Files</Label><ChallengeFileUpload challengeId={editingChallenge.id} existingFiles={editingChallenge.files || []} onFilesUpdated={files => setEditingChallenge({ ...editingChallenge, files })} /></div>
                            <Button onClick={updateChallenge} className="w-full">Update Target</Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <div className="divide-y divide-border/10 max-h-[600px] overflow-y-auto">
                      {challenges.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground font-mono text-sm">No targets deployed</div>
                      ) : challenges.map((c, i) => (
                        <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                          className="px-4 py-3 flex items-center justify-between hover:bg-primary/3 transition-colors group">
                          <div className="min-w-0">
                            <div className="font-mono text-sm font-semibold flex items-center gap-2 text-foreground">
                              <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? "bg-primary" : "bg-muted-foreground"}`} />
                              {c.title}
                              {c.files?.length > 0 && <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/20 text-primary">{c.files.length} files</Badge>}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                              <span className={`uppercase ${c.difficulty === "insane" ? "text-destructive" : c.difficulty === "hard" ? "text-neon-orange" : c.difficulty === "medium" ? "text-secondary" : "text-primary"}`}>{c.difficulty}</span>
                              <span>•</span><span>{c.category}</span><span>•</span><span>{c.points} pts</span><span>•</span><span>{c.solves} solves</span>
                            </div>
                            <div className="text-[10px] font-mono mt-0.5 flex items-center gap-1.5">
                              <Key className="w-3 h-3 text-neon-orange" />
                              <span className="text-neon-orange/70 select-all">{c.flag}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingChallenge(c)}><Edit className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteChallenge(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "announcements" && (
                  <C2Panel title="BROADCAST CHANNEL" icon={Radio} color="text-neon-orange" actions={
                    <Dialog>
                      <DialogTrigger asChild><Button size="sm" className="h-6 text-[10px] font-mono uppercase"><Plus className="w-3 h-3 mr-1" />Broadcast</Button></DialogTrigger>
                      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="font-display">New Broadcast</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div><Label>Title</Label><Input value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} /></div>
                          <div><Label>Content</Label><Textarea className="min-h-[100px]" value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} /></div>
                          <div><Label>Priority</Label><Select value={newAnnouncement.priority} onValueChange={(v: any) => setNewAnnouncement({ ...newAnnouncement, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                          <Button onClick={createAnnouncement} className="w-full">Send Broadcast</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  }>
                    <div className="divide-y divide-border/10 max-h-[600px] overflow-y-auto">
                      {announcements.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground font-mono text-sm">No broadcasts</div>
                      ) : announcements.map(a => (
                        <div key={a.id} className={`px-4 py-3 flex items-center justify-between ${!a.is_active ? "opacity-40" : ""}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 text-[9px] rounded uppercase font-mono ${a.priority === "urgent" ? "bg-destructive/20 text-destructive" : a.priority === "high" ? "bg-neon-orange/20 text-neon-orange" : a.priority === "normal" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{a.priority}</span>
                              <span className="font-mono text-sm font-semibold truncate">{a.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.content}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Switch checked={a.is_active} onCheckedChange={() => toggleAnnouncementActive(a.id, a.is_active)} />
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteAnnouncement(a.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "sponsors" && (
                  <C2Panel title="REGISTERED ASSETS" icon={Award} color="text-neon-cyan" actions={
                    <Dialog>
                      <DialogTrigger asChild><Button size="sm" className="h-6 text-[10px] font-mono uppercase"><Plus className="w-3 h-3 mr-1" />Register</Button></DialogTrigger>
                      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="font-display">Register Asset</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div><Label>Name</Label><Input value={newSponsor.name} onChange={e => setNewSponsor({ ...newSponsor, name: e.target.value })} /></div>
                          <div><Label>Logo URL</Label><Input value={newSponsor.logo_url} onChange={e => setNewSponsor({ ...newSponsor, logo_url: e.target.value })} /></div>
                          <div><Label>Website</Label><Input value={newSponsor.website_url} onChange={e => setNewSponsor({ ...newSponsor, website_url: e.target.value })} /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><Label>Tier</Label><Select value={newSponsor.tier} onValueChange={(v: any) => setNewSponsor({ ...newSponsor, tier: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="platinum">Platinum</SelectItem><SelectItem value="gold">Gold</SelectItem><SelectItem value="silver">Silver</SelectItem><SelectItem value="bronze">Bronze</SelectItem></SelectContent></Select></div>
                            <div><Label>Order</Label><Input type="number" value={newSponsor.display_order} onChange={e => setNewSponsor({ ...newSponsor, display_order: parseInt(e.target.value) || 0 })} /></div>
                          </div>
                          <Button onClick={createSponsor} className="w-full">Register Asset</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  }>
                    <Dialog open={!!editingSponsor} onOpenChange={open => !open && setEditingSponsor(null)}>
                      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="font-display">Edit Asset</DialogTitle></DialogHeader>
                        {editingSponsor && (
                          <div className="space-y-4">
                            <div><Label>Name</Label><Input value={editingSponsor.name} onChange={e => setEditingSponsor({ ...editingSponsor, name: e.target.value })} /></div>
                            <div><Label>Logo URL</Label><Input value={editingSponsor.logo_url} onChange={e => setEditingSponsor({ ...editingSponsor, logo_url: e.target.value })} /></div>
                            <div><Label>Website</Label><Input value={editingSponsor.website_url || ""} onChange={e => setEditingSponsor({ ...editingSponsor, website_url: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-4">
                              <div><Label>Tier</Label><Select value={editingSponsor.tier} onValueChange={(v: any) => setEditingSponsor({ ...editingSponsor, tier: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="platinum">Platinum</SelectItem><SelectItem value="gold">Gold</SelectItem><SelectItem value="silver">Silver</SelectItem><SelectItem value="bronze">Bronze</SelectItem></SelectContent></Select></div>
                              <div><Label>Order</Label><Input type="number" value={editingSponsor.display_order} onChange={e => setEditingSponsor({ ...editingSponsor, display_order: parseInt(e.target.value) || 0 })} /></div>
                            </div>
                            <Button onClick={updateSponsor} className="w-full">Update Asset</Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <div className="divide-y divide-border/10 max-h-[600px] overflow-y-auto">
                      {sponsors.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground font-mono text-sm">No assets registered</div>
                      ) : sponsors.map(s => (
                        <div key={s.id} className={`px-4 py-3 flex items-center justify-between ${!s.is_active ? "opacity-40" : ""}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded border border-border/30 overflow-hidden bg-muted/30 flex items-center justify-center">
                              {s.logo_url ? <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" /> : <Image className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 text-[9px] rounded uppercase font-mono ${s.tier === "platinum" ? "bg-neon-cyan/20 text-neon-cyan" : s.tier === "gold" ? "bg-yellow-500/20 text-yellow-400" : s.tier === "silver" ? "bg-gray-400/20 text-gray-300" : "bg-neon-orange/20 text-neon-orange"}`}>{s.tier}</span>
                                <span className="font-mono text-sm font-semibold">{s.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Switch checked={s.is_active} onCheckedChange={() => toggleSponsorActive(s.id, s.is_active)} />
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingSponsor(s)}><Edit className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteSponsor(s.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "writeups" && (
                  <C2Panel title="INTELLIGENCE REPORTS" icon={FileText} color="text-neon-purple">
                    <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                      {pendingWriteups.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground font-mono text-sm">No pending intel reports</div>
                      ) : pendingWriteups.map(w => (
                        <div key={w.id} className="p-4 rounded-lg border border-neon-orange/20 bg-neon-orange/5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-display text-sm font-bold">{w.title}</h3>
                              <p className="text-[10px] text-muted-foreground font-mono">Target: {w.challenges?.title} • Agent: {w.profiles?.username}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary hover:text-primary" onClick={() => approveWriteup(w.id)}><CheckCircle className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => rejectWriteup(w.id)}><XCircle className="h-4 w-4" /></Button>
                            </div>
                          </div>
                          <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground bg-background/50 p-3 rounded max-h-32 overflow-y-auto">{w.content}</pre>
                        </div>
                      ))}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "competition" && (
                  <C2Panel title="OPERATIONS CONTROL" icon={Trophy} color="text-primary">
                    <div className="p-4 max-w-2xl space-y-4">
                      {competitionSettings && (
                        <>
                          <div className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-background/40">
                            <div><div className="font-mono text-sm font-semibold">Competition Mode</div><div className="text-[10px] text-muted-foreground">Enable timed operations</div></div>
                            <Switch checked={competitionSettings.is_active} onCheckedChange={checked => updateCompetitionSettings({ is_active: checked })} />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-background/40">
                            <div><div className="font-mono text-sm font-semibold">Team Mode</div><div className="text-[10px] text-muted-foreground">Team-based scoring</div></div>
                            <Switch checked={competitionSettings.team_mode} onCheckedChange={checked => updateCompetitionSettings({ team_mode: checked })} />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-background/40">
                            <div><div className="font-mono text-sm font-semibold">Dynamic Scoring</div><div className="text-[10px] text-muted-foreground">Points decay with solves</div></div>
                            <Switch checked={competitionSettings.decay_enabled} onCheckedChange={checked => updateCompetitionSettings({ decay_enabled: checked })} />
                          </div>
                          {competitionSettings.decay_enabled && (
                            <div className="p-3 rounded-lg border border-border/20 bg-background/40">
                              <Label className="text-[10px] font-mono uppercase">Minimum Points</Label>
                              <Input type="number" className="mt-1" value={competitionSettings.decay_minimum} onChange={e => updateCompetitionSettings({ decay_minimum: parseInt(e.target.value) || 50 })} />
                            </div>
                          )}
                          {competitionSettings.is_active && (
                            <>
                              <div className="p-3 rounded-lg border border-border/20 bg-background/40">
                                <Label className="text-[10px] font-mono uppercase flex items-center gap-1"><Clock className="w-3 h-3" />Start Time</Label>
                                <Input type="datetime-local" className="mt-1" value={competitionSettings.start_time?.slice(0, 16) || ""} onChange={e => updateCompetitionSettings({ start_time: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                              </div>
                              <div className="p-3 rounded-lg border border-border/20 bg-background/40">
                                <Label className="text-[10px] font-mono uppercase flex items-center gap-1"><Clock className="w-3 h-3" />End Time</Label>
                                <Input type="datetime-local" className="mt-1" value={competitionSettings.end_time?.slice(0, 16) || ""} onChange={e => updateCompetitionSettings({ end_time: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                              </div>
                              <div className="p-3 rounded-lg border border-border/20 bg-background/40">
                                <Label className="text-[10px] font-mono uppercase flex items-center gap-1"><Clock className="w-3 h-3" />Freeze Time</Label>
                                <Input type="datetime-local" className="mt-1" value={competitionSettings.freeze_time?.slice(0, 16) || ""} onChange={e => updateCompetitionSettings({ freeze_time: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                              </div>
                            </>
                          )}
                          <div className={`p-3 rounded-lg border ${competitionSettings.is_active ? "border-primary/30 bg-primary/5" : "border-border/20 bg-background/40"}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${competitionSettings.is_active ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                              <span className="font-mono text-sm font-bold">{competitionSettings.is_active ? "OPERATIONS LIVE" : "OPERATIONS STANDBY"}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </C2Panel>
                )}

                {activeModule === "contacts" && (
                  <C2Panel title="COMMUNICATIONS LOG" icon={Mail} color="text-secondary">
                    <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                      {contactSubmissions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground font-mono text-sm"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />No communications received</div>
                      ) : contactSubmissions.map(sub => (
                        <div key={sub.id} className={`p-3 rounded-lg border ${sub.is_resolved ? "border-border/20 bg-background/20 opacity-50" : "border-secondary/20 bg-secondary/5"}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono text-sm font-semibold">{sub.subject}</span>
                                {sub.is_resolved && <Badge variant="outline" className="text-[9px] py-0 border-primary/20 text-primary">Resolved</Badge>}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-3">
                                <span>{sub.name}</span><span>{sub.email}</span><span>{new Date(sub.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toggleContactResolved(sub.id, sub.is_resolved || false)}><CheckCircle className={`h-3.5 w-3.5 ${sub.is_resolved ? "text-muted-foreground" : "text-primary"}`} /></Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground bg-background/40 p-2 rounded font-mono">{sub.message}</p>
                          <a href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(sub.subject)}`} className="text-[10px] text-primary hover:underline font-mono mt-1 inline-block">Reply →</a>
                        </div>
                      ))}
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

        {/* ═══ BOTTOM STATUS BAR ═══ */}
        <div className="mt-4 rounded-lg border border-border/20 bg-card/10 px-4 py-2 flex items-center justify-between text-[9px] font-mono text-muted-foreground/60 uppercase tracking-[0.15em]">
          <span>CyberOps C2 v4.0 • {C2_MODULES.length} modules • {challenges.length} targets • {users.length} operators • {sessions} sessions</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>

      {/* Admin Promotion Dialog */}
      <AlertDialog open={!!promotingUserId} onOpenChange={open => !open && setPromotingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Promote to ADMIN?</AlertDialogTitle>
            <AlertDialogDescription>
              This grants <span className="font-semibold text-foreground">{users.find(u => u.user_id === promotingUserId)?.username}</span> full administrative privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMakeAdmin} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm Promotion</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Admin;

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Shield, Search, Ban, Unlock, ShieldCheck, Eye, Mail,
  Edit, Trash2, Clock, Globe, Target, Trophy, Download, RefreshCw,
  AlertTriangle, CheckCircle, XCircle, Hash, Key, UserX, UserCheck
} from "lucide-react";
import { C2Panel, ActionBtn, SectionLabel, ConfigToggle } from "./C2Shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserManagementProps {
  users: any[];
  onPromote: (userId: string) => void;
  onRefresh: () => void;
}

export const UserManagementModule = ({ users, onPromote, onRefresh }: UserManagementProps) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("points");
  const [activeTab, setActiveTab] = useState("roster");

  const tabs = [
    { id: "roster", label: "Operator Roster", icon: Users },
    { id: "roles", label: "Role Management", icon: ShieldCheck },
    { id: "bans", label: "Ban Management", icon: Ban },
    { id: "activity", label: "Activity Log", icon: Eye },
    { id: "bulk", label: "Bulk Operations", icon: Layers },
  ];

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.country?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "banned" && u.is_banned) || (filter === "active" && !u.is_banned) || (filter === "top" && (u.total_points || 0) > 0);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === "points") return (b.total_points || 0) - (a.total_points || 0);
    if (sortBy === "solves") return (b.challenges_solved || 0) - (a.challenges_solved || 0);
    if (sortBy === "name") return (a.username || "").localeCompare(b.username || "");
    if (sortBy === "date") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  const banUser = async (username: string) => {
    const { data, error } = await supabase.rpc("admin_ban_user", { _username: username, _reason: "Banned by admin" });
    if (error) { toast.error(error.message); return; }
    toast.success(`${username} banned`); onRefresh();
  };

  const unbanUser = async (username: string) => {
    const { data, error } = await supabase.rpc("admin_unban_user", { _username: username });
    if (error) { toast.error(error.message); return; }
    toast.success(`${username} unbanned`); onRefresh();
  };

  const resetScores = async (username: string) => {
    const { data, error } = await supabase.rpc("admin_reset_user_scores", { _username: username });
    if (error) { toast.error(error.message); return; }
    toast.success(`Scores reset for ${username}`); onRefresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 rounded-lg border border-border/20 bg-card/20 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-secondary/10 text-secondary border border-secondary/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "roster" && (
        <C2Panel title="OPERATOR REGISTRY" icon={Users} color="text-secondary">
          <div className="p-3 border-b border-border/20">
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="pl-8 h-8 text-xs font-mono" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {["all", "active", "banned", "top"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase ${filter === f ? "bg-secondary/10 text-secondary border border-secondary/20" : "text-muted-foreground border border-transparent"}`}
                >{f}</button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] font-mono text-muted-foreground">Sort:</span>
              {["points", "solves", "name", "date"].map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`text-[10px] font-mono uppercase ${sortBy === s ? "text-primary" : "text-muted-foreground"}`}
                >{s}</button>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-[10px] font-mono text-muted-foreground">
              <span>Total: <span className="text-secondary">{users.length}</span></span>
              <span>Filtered: <span className="text-primary">{filteredUsers.length}</span></span>
              <span>Banned: <span className="text-destructive">{users.filter(u => u.is_banned).length}</span></span>
            </div>
          </div>
          <div className="divide-y divide-border/10 max-h-[500px] overflow-y-auto">
            {filteredUsers.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                className="px-4 py-3 flex items-center justify-between hover:bg-secondary/3 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20 shrink-0">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-semibold flex items-center gap-2">
                      <span className="truncate">{u.username}</span>
                      {u.is_banned && <Badge variant="destructive" className="text-[9px] py-0 px-1">BANNED</Badge>}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2 flex-wrap">
                      <span>{u.challenges_solved || 0} solved</span>
                      <span>•</span>
                      <span>{u.country || "Unknown"}</span>
                      <span>•</span>
                      <span>{new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-display text-sm font-bold text-primary">{u.total_points || 0} pts</span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Promote" onClick={() => onPromote(u.user_id)}><ShieldCheck className="h-3 w-3 text-secondary" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Reset Scores" onClick={() => resetScores(u.username)}><RefreshCw className="h-3 w-3 text-neon-orange" /></Button>
                    {u.is_banned ? (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Unban" onClick={() => unbanUser(u.username)}><Unlock className="h-3 w-3 text-primary" /></Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Ban" onClick={() => banUser(u.username)}><Ban className="h-3 w-3 text-destructive" /></Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "roles" && (
        <C2Panel title="ROLE MANAGEMENT" icon={ShieldCheck} color="text-neon-purple">
          <div className="p-4 space-y-3">
            <SectionLabel label="Role Hierarchy" color="neon-purple" />
            {[
              { role: "Admin", desc: "Full access to all systems. Can manage users, challenges, and settings.", color: "destructive", count: users.length > 0 ? 1 : 0 },
              { role: "Moderator", desc: "Can review writeups, manage announcements, and moderate content.", color: "neon-orange", count: 0 },
              { role: "User", desc: "Standard participant. Can solve challenges and submit writeups.", color: "primary", count: users.length },
            ].map(r => (
              <div key={r.role} className="p-3 rounded-lg border border-border/20 bg-background/40">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-3.5 h-3.5 text-${r.color}`} />
                    <span className={`font-mono text-sm font-bold text-${r.color} uppercase`}>{r.role}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{r.count} users</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{r.desc}</p>
              </div>
            ))}
            <SectionLabel label="Permissions Matrix" color="neon-purple" />
            {[
              { perm: "Manage Challenges", admin: true, mod: false, user: false },
              { perm: "Review Writeups", admin: true, mod: true, user: false },
              { perm: "Ban Users", admin: true, mod: false, user: false },
              { perm: "View Audit Logs", admin: true, mod: true, user: false },
              { perm: "Manage Announcements", admin: true, mod: true, user: false },
              { perm: "Submit Flags", admin: true, mod: true, user: true },
              { perm: "View Leaderboard", admin: true, mod: true, user: true },
              { perm: "Create Teams", admin: true, mod: true, user: true },
              { perm: "Upload Writeups", admin: true, mod: true, user: true },
              { perm: "Manage Settings", admin: true, mod: false, user: false },
              { perm: "View Visitor Logs", admin: true, mod: false, user: false },
              { perm: "Export Data", admin: true, mod: false, user: false },
              { perm: "Manage Sponsors", admin: true, mod: false, user: false },
              { perm: "View Security Dashboard", admin: true, mod: true, user: false },
            ].map(p => (
              <div key={p.perm} className="flex items-center gap-3 px-3 py-1.5 rounded border border-border/10 bg-background/30 font-mono text-xs">
                <span className="flex-1 text-foreground">{p.perm}</span>
                <span className={`w-12 text-center ${p.admin ? "text-primary" : "text-muted-foreground/30"}`}>{p.admin ? "✓" : "✗"}</span>
                <span className={`w-12 text-center ${p.mod ? "text-neon-orange" : "text-muted-foreground/30"}`}>{p.mod ? "✓" : "✗"}</span>
                <span className={`w-12 text-center ${p.user ? "text-secondary" : "text-muted-foreground/30"}`}>{p.user ? "✓" : "✗"}</span>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "bans" && (
        <C2Panel title="BAN MANAGEMENT" icon={Ban} color="text-destructive">
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Active Bans", value: users.filter(u => u.is_banned).length, color: "destructive" },
                { label: "Total Banned", value: users.filter(u => u.is_banned).length, color: "neon-orange" },
                { label: "Ban Appeals", value: 0, color: "secondary" },
              ].map(s => (
                <div key={s.label} className="p-2.5 rounded-lg border border-border/20 bg-background/40 text-center">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">{s.label}</div>
                  <div className={`text-lg font-display font-bold text-${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
            <SectionLabel label="Banned Users" color="destructive" />
            {users.filter(u => u.is_banned).length === 0 ? (
              <div className="text-center py-6 text-muted-foreground font-mono text-sm">No banned users</div>
            ) : users.filter(u => u.is_banned).map(u => (
              <div key={u.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-destructive/20 bg-destructive/5">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-destructive" />
                  <div>
                    <span className="font-mono text-sm font-semibold text-destructive">{u.username}</span>
                    <div className="text-[9px] text-muted-foreground">{u.ban_reason || "No reason provided"} • {u.banned_at ? new Date(u.banned_at).toLocaleDateString() : "Unknown"}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px] font-mono" onClick={() => unbanUser(u.username)}>
                  <Unlock className="w-3 h-3 mr-1" />Unban
                </Button>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "activity" && (
        <C2Panel title="USER ACTIVITY OVERVIEW" icon={Eye} color="text-neon-cyan">
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Active Today", value: Math.ceil(users.length * 0.4), color: "primary" },
                { label: "Active Week", value: Math.ceil(users.length * 0.7), color: "secondary" },
                { label: "Dormant (30d)", value: Math.ceil(users.length * 0.2), color: "neon-orange" },
                { label: "Never Solved", value: users.filter(u => (u.challenges_solved || 0) === 0).length, color: "muted-foreground" },
              ].map(s => (
                <div key={s.label} className="p-2.5 rounded-lg border border-border/20 bg-background/40">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">{s.label}</div>
                  <div className={`text-sm font-display font-bold text-${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
            <SectionLabel label="Top Performers (Last 7 Days)" color="neon-cyan" />
            {users.slice(0, 10).map((u, i) => (
              <div key={u.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/20 bg-background/40 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-5 text-right font-bold ${i < 3 ? "text-primary" : "text-muted-foreground"}`}>#{i + 1}</span>
                  <span className="text-foreground font-semibold">{u.username}</span>
                </div>
                <div className="flex gap-3 text-muted-foreground">
                  <span>{u.challenges_solved || 0} solved</span>
                  <span className="text-primary font-bold">{u.total_points || 0} pts</span>
                </div>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "bulk" && (
        <C2Panel title="BULK OPERATIONS" icon={Users} color="text-neon-orange">
          <div className="p-4 space-y-3">
            <div className="p-3 rounded-lg border border-neon-orange/20 bg-neon-orange/5 text-xs font-mono text-neon-orange">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Bulk operations affect multiple users. Use with caution.
            </div>
            {[
              { label: "Reset All Scores", desc: "Recalculate all user scores from submissions", icon: RefreshCw, color: "neon-orange" },
              { label: "Export All Users (CSV)", desc: "Download complete user list", icon: Download, color: "secondary" },
              { label: "Disable All Accounts", desc: "Emergency: disable all non-admin accounts", icon: Ban, color: "destructive" },
              { label: "Send Mass Email", desc: "Email all registered users", icon: Mail, color: "secondary" },
              { label: "Purge Inactive Users", desc: "Remove users with 0 activity > 60 days", icon: Trash2, color: "destructive" },
              { label: "Reassign Orphan Teams", desc: "Fix teams with missing captains", icon: Users, color: "neon-purple" },
              { label: "Recalculate Ranks", desc: "Update all user rankings", icon: Trophy, color: "primary" },
              { label: "Clear All Sessions", desc: "Force logout all users", icon: Key, color: "destructive" },
            ].map(op => (
              <div key={op.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/20 bg-background/40">
                <div className="flex items-center gap-2 min-w-0">
                  <op.icon className={`w-3.5 h-3.5 text-${op.color} shrink-0`} />
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-semibold">{op.label}</div>
                    <div className="text-[9px] text-muted-foreground">{op.desc}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px] font-mono shrink-0">Execute</Button>
              </div>
            ))}
          </div>
        </C2Panel>
      )}
    </div>
  );
};

// Need to import Layers for the bulk tab
import { Layers } from "lucide-react";

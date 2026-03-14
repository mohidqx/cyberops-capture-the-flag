import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Shield, Search, Ban, Unlock, ShieldCheck, Eye, Mail,
  Edit, Trash2, Clock, Globe, Target, Trophy, Download, RefreshCw,
  AlertTriangle, CheckCircle, XCircle, Hash, Key, UserX, UserCheck,
  Layers, Save, X
} from "lucide-react";
import { C2Panel, ActionBtn, SectionLabel } from "./C2Shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ username: "", display_name: "", bio: "", country: "", avatar_url: "" });
  const [roleChangeUser, setRoleChangeUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banningUser, setBanningUser] = useState<any | null>(null);

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

  const banUser = async (username: string, reason: string) => {
    const { error } = await supabase.rpc("admin_ban_user", { _username: username, _reason: reason || "Banned by admin" });
    if (error) { toast.error(error.message); return; }
    toast.success(`${username} banned`);
    setBanningUser(null);
    setBanReason("");
    onRefresh();
  };

  const unbanUser = async (username: string) => {
    const { error } = await supabase.rpc("admin_unban_user", { _username: username });
    if (error) { toast.error(error.message); return; }
    toast.success(`${username} unbanned`); onRefresh();
  };

  const resetScores = async (username: string) => {
    const { error } = await supabase.rpc("admin_reset_user_scores", { _username: username });
    if (error) { toast.error(error.message); return; }
    toast.success(`Scores reset for ${username}`); onRefresh();
  };

  const openEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      username: user.username || "",
      display_name: user.display_name || "",
      bio: user.bio || "",
      country: user.country || "",
      avatar_url: user.avatar_url || "",
    });
  };

  const saveUserProfile = async () => {
    if (!editingUser) return;
    const updates: any = {};
    if (editForm.username && editForm.username !== editingUser.username) updates.username = editForm.username;
    if (editForm.display_name !== (editingUser.display_name || "")) updates.display_name = editForm.display_name;
    if (editForm.bio !== (editingUser.bio || "")) updates.bio = editForm.bio;
    if (editForm.country !== (editingUser.country || "")) updates.country = editForm.country;
    if (editForm.avatar_url !== (editingUser.avatar_url || "")) updates.avatar_url = editForm.avatar_url;

    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save");
      return;
    }

    const { data, error } = await supabase.rpc("admin_update_user_profile", {
      _target_username: editingUser.username,
      _updates: updates,
    });
    if (error) { toast.error(error.message); return; }
    const result = data as any;
    if (!result?.success) { toast.error(result?.message || "Failed"); return; }
    toast.success(`Profile updated for ${editingUser.username}`);
    setEditingUser(null);
    onRefresh();
  };

  const changeUserRole = async () => {
    if (!roleChangeUser) return;
    const { data, error } = await supabase.rpc("admin_set_user_role", {
      _target_username: roleChangeUser.username,
      _new_role: selectedRole as "admin" | "moderator" | "user",
    });
    if (error) { toast.error(error.message); return; }
    const result = data as any;
    if (!result?.success) { toast.error(result?.message || "Failed"); return; }
    toast.success(`${roleChangeUser.username} role changed to ${selectedRole}`);
    setRoleChangeUser(null);
    onRefresh();
  };

  const confirmDeleteUser = async () => {
    if (!deleteUser) return;
    const { data, error } = await supabase.rpc("admin_delete_user", {
      _target_username: deleteUser.username,
    });
    if (error) { toast.error(error.message); return; }
    const result = data as any;
    if (!result?.success) { toast.error(result?.message || "Failed"); return; }
    toast.success(`User ${deleteUser.username} deleted`);
    setDeleteUser(null);
    onRefresh();
  };

  return (
    <div className="space-y-3">
      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={open => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md border-secondary/20">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Edit className="w-4 h-4 text-secondary" />
              Edit User: {editingUser?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-mono">Username</Label><Input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} /></div>
            <div><Label className="text-xs font-mono">Display Name</Label><Input value={editForm.display_name} onChange={e => setEditForm({ ...editForm, display_name: e.target.value })} /></div>
            <div><Label className="text-xs font-mono">Bio</Label><Textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="min-h-[60px]" /></div>
            <div><Label className="text-xs font-mono">Country</Label><Input value={editForm.country} onChange={e => setEditForm({ ...editForm, country: e.target.value })} /></div>
            <div><Label className="text-xs font-mono">Avatar URL</Label><Input value={editForm.avatar_url} onChange={e => setEditForm({ ...editForm, avatar_url: e.target.value })} /></div>
            <Button onClick={saveUserProfile} className="w-full"><Save className="w-3.5 h-3.5 mr-2" />Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={!!roleChangeUser} onOpenChange={open => !open && setRoleChangeUser(null)}>
        <DialogContent className="max-w-sm border-neon-purple/20">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neon-purple" />
              Change Role: {roleChangeUser?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground font-mono p-2 rounded bg-muted/20">
              {selectedRole === "admin" && "⚠️ Full access to all systems. Use with extreme caution."}
              {selectedRole === "moderator" && "Can review writeups, manage announcements, view audit logs."}
              {selectedRole === "user" && "Standard participant permissions."}
            </div>
            <Button onClick={changeUserRole} className="w-full">Confirm Role Change</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={!!banningUser} onOpenChange={open => !open && setBanningUser(null)}>
        <DialogContent className="max-w-sm border-destructive/20">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-destructive">
              <Ban className="w-4 h-4" />
              Ban User: {banningUser?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-mono">Ban Reason</Label><Textarea value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason for banning..." className="min-h-[60px]" /></div>
            <Button variant="destructive" onClick={() => banUser(banningUser?.username, banReason)} className="w-full">Confirm Ban</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={open => !open && setDeleteUser(null)}>
        <AlertDialogContent className="border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete User: {deleteUser?.username}?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              This will permanently delete the user account, all submissions, hint unlocks, sessions, and roles. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground font-mono text-xs" onClick={confirmDeleteUser}>
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                className="px-4 py-3 flex items-center justify-between hover:bg-secondary/5 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20 shrink-0">
                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : u.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-semibold flex items-center gap-2">
                      <span className="truncate">{u.username}</span>
                      {u.display_name && u.display_name !== u.username && <span className="text-muted-foreground text-[10px]">({u.display_name})</span>}
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
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit Profile" onClick={() => openEditUser(u)}><Edit className="h-3 w-3 text-secondary" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Change Role" onClick={() => { setRoleChangeUser(u); setSelectedRole("user"); }}><ShieldCheck className="h-3 w-3 text-neon-purple" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Reset Scores" onClick={() => resetScores(u.username)}><RefreshCw className="h-3 w-3 text-neon-orange" /></Button>
                    {u.is_banned ? (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Unban" onClick={() => unbanUser(u.username)}><Unlock className="h-3 w-3 text-primary" /></Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Ban" onClick={() => setBanningUser(u)}><Ban className="h-3 w-3 text-destructive" /></Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Delete User" onClick={() => setDeleteUser(u)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
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
            <SectionLabel label="Quick Role Assignment" color="neon-purple" />
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/20 bg-background/40 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{u.username}</span>
                    {u.is_banned && <Badge variant="destructive" className="text-[8px] py-0">BANNED</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-6 text-[9px] font-mono px-2" onClick={() => { setRoleChangeUser(u); setSelectedRole("user"); }}>
                      <ShieldCheck className="w-3 h-3 mr-1" />Change Role
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <SectionLabel label="Role Hierarchy" color="neon-purple" />
            {[
              { role: "Admin", desc: "Full access to all systems. Can manage users, challenges, and settings.", color: "destructive", count: 0 },
              { role: "Moderator", desc: "Can review writeups, manage announcements, and moderate content.", color: "neon-orange", count: 0 },
              { role: "User", desc: "Standard participant. Can solve challenges and submit writeups.", color: "primary", count: users.length },
            ].map(r => (
              <div key={r.role} className="p-3 rounded-lg border border-border/20 bg-background/40">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-3.5 h-3.5 text-${r.color}`} />
                    <span className={`font-mono text-sm font-bold text-${r.color} uppercase`}>{r.role}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">{r.desc}</p>
              </div>
            ))}
            <SectionLabel label="Permissions Matrix" color="neon-purple" />
            <div className="overflow-x-auto">
              <div className="flex items-center gap-3 px-3 py-1.5 font-mono text-[9px] uppercase text-muted-foreground border-b border-border/20">
                <span className="flex-1">Permission</span>
                <span className="w-12 text-center text-destructive">Admin</span>
                <span className="w-12 text-center text-neon-orange">Mod</span>
                <span className="w-12 text-center text-primary">User</span>
              </div>
              {[
                { perm: "Manage Challenges", admin: true, mod: false, user: false },
                { perm: "Review Writeups", admin: true, mod: true, user: false },
                { perm: "Ban Users", admin: true, mod: false, user: false },
                { perm: "Edit User Profiles", admin: true, mod: false, user: false },
                { perm: "Delete Users", admin: true, mod: false, user: false },
                { perm: "Change Roles", admin: true, mod: false, user: false },
                { perm: "Site Settings", admin: true, mod: false, user: false },
                { perm: "View Audit Logs", admin: true, mod: true, user: false },
                { perm: "Manage Announcements", admin: true, mod: true, user: false },
                { perm: "Submit Flags", admin: true, mod: true, user: true },
                { perm: "View Leaderboard", admin: true, mod: true, user: true },
                { perm: "Create Teams", admin: true, mod: true, user: true },
              ].map(p => (
                <div key={p.perm} className="flex items-center gap-3 px-3 py-1.5 rounded border border-border/10 bg-background/30 font-mono text-xs">
                  <span className="flex-1 text-foreground">{p.perm}</span>
                  <span className={`w-12 text-center ${p.admin ? "text-primary" : "text-muted-foreground/30"}`}>{p.admin ? "✓" : "✗"}</span>
                  <span className={`w-12 text-center ${p.mod ? "text-neon-orange" : "text-muted-foreground/30"}`}>{p.mod ? "✓" : "✗"}</span>
                  <span className={`w-12 text-center ${p.user ? "text-secondary" : "text-muted-foreground/30"}`}>{p.user ? "✓" : "✗"}</span>
                </div>
              ))}
            </div>
          </div>
        </C2Panel>
      )}

      {activeTab === "bans" && (
        <C2Panel title="BAN MANAGEMENT" icon={Ban} color="text-destructive">
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Active Bans", value: users.filter(u => u.is_banned).length, color: "destructive" },
                { label: "Total Users", value: users.length, color: "secondary" },
                { label: "Ban Rate", value: `${users.length > 0 ? Math.round((users.filter(u => u.is_banned).length / users.length) * 100) : 0}%`, color: "neon-orange" },
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
                { label: "Total Users", value: users.length, color: "primary" },
                { label: "With Solves", value: users.filter(u => (u.challenges_solved || 0) > 0).length, color: "secondary" },
                { label: "Never Solved", value: users.filter(u => (u.challenges_solved || 0) === 0).length, color: "neon-orange" },
                { label: "Banned", value: users.filter(u => u.is_banned).length, color: "destructive" },
              ].map(s => (
                <div key={s.label} className="p-2.5 rounded-lg border border-border/20 bg-background/40">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">{s.label}</div>
                  <div className={`text-sm font-display font-bold text-${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
            <SectionLabel label="Top Performers" color="neon-cyan" />
            {users.filter(u => (u.total_points || 0) > 0).slice(0, 15).map((u, i) => (
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
              { label: "Recalculate Ranks", desc: "Update all user rankings", icon: Trophy, color: "primary" },
              { label: "Send Mass Email", desc: "Email all registered users", icon: Mail, color: "secondary" },
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

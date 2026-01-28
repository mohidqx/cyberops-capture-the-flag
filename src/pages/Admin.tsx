import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Users, Target, FileText, CheckCircle, XCircle, ShieldCheck, Clock, Trophy, Megaphone, Edit, Award, Image, Mail, MessageSquare, ShieldAlert, BarChart3 } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ChallengeFileUpload from "@/components/ChallengeFileUpload";
import AuditLogViewer from "@/components/AuditLogViewer";
import AdminSecurityNotifications from "@/components/AdminSecurityNotifications";
import SecurityDashboard from "@/components/SecurityDashboard";

interface Writeup {
  id: string;
  title: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  challenges: { title: string } | null;
  profiles: { username: string } | null;
}

interface CompetitionSettings {
  id: string;
  is_active: boolean;
  start_time: string | null;
  end_time: string | null;
  freeze_time: string | null;
  decay_enabled: boolean;
  decay_minimum: number;
  team_mode: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  is_active: boolean;
  created_at: string;
}

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  tier: "platinum" | "gold" | "silver" | "bronze";
  is_active: boolean;
  display_order: number;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

const Admin = () => {
  const { profile } = useAuth();
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
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    category: "web",
    difficulty: "easy",
    points: 100,
    flag: "",
    hints: "",
    hint_costs: "",
    files: [] as string[],
  });
  const [newAnnouncement, setNewAnnouncement] = useState<{
    title: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
  }>({
    title: "",
    content: "",
    priority: "normal",
  });
  const [newSponsor, setNewSponsor] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    tier: "bronze" as "platinum" | "gold" | "silver" | "bronze",
    display_order: 0,
  });

  const fetchData = async () => {
    const { data: c } = await supabase.from("challenges").select("*").order("created_at", { ascending: false });
    if (c) setChallenges(c);
    const { data: u } = await supabase.from("profiles").select("*").order("total_points", { ascending: false });
    if (u) setUsers(u);
    const { data: w } = await supabase
      .from("writeups")
      .select("*, challenges(title), profiles(username)")
      .order("created_at", { ascending: false });
    if (w) setWriteups(w as Writeup[]);
    const { data: cs } = await supabase.from("competition_settings").select("*").eq("name", "default").maybeSingle();
    if (cs) setCompetitionSettings(cs as CompetitionSettings);
    const { data: ann } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (ann) setAnnouncements(ann as Announcement[]);
    const { data: sp } = await supabase.from("sponsors").select("*").order("display_order", { ascending: true });
    if (sp) setSponsors(sp as Sponsor[]);
    const { data: cs2 } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    if (cs2) setContactSubmissions(cs2 as ContactSubmission[]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createChallenge = async () => {
    const hintsArray = newChallenge.hints.split("\n").filter((h) => h.trim());
    const costsArray = newChallenge.hint_costs
      .split(",")
      .map((c) => parseInt(c.trim()))
      .filter((c) => !isNaN(c));

    const { error } = await supabase.from("challenges").insert({
      title: newChallenge.title,
      description: newChallenge.description,
      category: newChallenge.category,
      difficulty: newChallenge.difficulty,
      points: newChallenge.points,
      flag: newChallenge.flag,
      hints: hintsArray,
      hint_costs: costsArray,
      files: newChallenge.files,
    } as any);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Challenge created!");
    setNewChallenge({
      title: "",
      description: "",
      category: "web",
      difficulty: "easy",
      points: 100,
      flag: "",
      hints: "",
      hint_costs: "",
      files: [],
    });
    fetchData();
  };

  const updateChallenge = async () => {
    if (!editingChallenge) return;
    
    const hintsArray = editingChallenge.hintsText?.split("\n").filter((h: string) => h.trim()) || editingChallenge.hints || [];
    const costsArray = editingChallenge.hintCostsText?.split(",").map((c: string) => parseInt(c.trim())).filter((c: number) => !isNaN(c)) || editingChallenge.hint_costs || [];

    const { error } = await supabase
      .from("challenges")
      .update({
        title: editingChallenge.title,
        description: editingChallenge.description,
        category: editingChallenge.category,
        difficulty: editingChallenge.difficulty,
        points: editingChallenge.points,
        flag: editingChallenge.flag,
        hints: hintsArray,
        hint_costs: costsArray,
        files: editingChallenge.files || [],
      })
      .eq("id", editingChallenge.id);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Challenge updated!");
    setEditingChallenge(null);
    fetchData();
  };

  const deleteChallenge = async (id: string) => {
    await supabase.from("challenges").delete().eq("id", id);
    toast.success("Deleted");
    fetchData();
  };

  const approveWriteup = async (id: string) => {
    await supabase.from("writeups").update({ is_approved: true }).eq("id", id);
    toast.success("Writeup approved!");
    fetchData();
  };

  const rejectWriteup = async (id: string) => {
    await supabase.from("writeups").delete().eq("id", id);
    toast.success("Writeup rejected");
    fetchData();
  };

  const confirmMakeAdmin = async () => {
    if (!promotingUserId) return;
    
    const { error } = await supabase.from("user_roles").upsert({ user_id: promotingUserId, role: "admin" as any });
    if (error) {
      toast.error(error.message);
      setPromotingUserId(null);
      return;
    }
    toast.success("User promoted to admin!");
    setPromotingUserId(null);
    fetchData();
  };

  const updateCompetitionSettings = async (updates: Partial<CompetitionSettings>) => {
    if (!competitionSettings) return;
    
    const { error } = await supabase
      .from("competition_settings")
      .update(updates)
      .eq("id", competitionSettings.id);

    if (error) {
      toast.error(error.message);
      return;
    }
    
    setCompetitionSettings({ ...competitionSettings, ...updates });
    toast.success("Settings updated!");
  };

  const pendingWriteups = writeups.filter((w) => !w.is_approved);
  const unresolvedContacts = contactSubmissions.filter((c) => !c.is_resolved);

  const toggleContactResolved = async (id: string, isResolved: boolean) => {
    await supabase.from("contact_submissions").update({ is_resolved: !isResolved }).eq("id", id);
    toast.success(isResolved ? "Marked as unresolved" : "Marked as resolved");
    fetchData();
  };

  const deleteContactSubmission = async (id: string) => {
    await supabase.from("contact_submissions").delete().eq("id", id);
    toast.success("Submission deleted");
    fetchData();
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Please fill in all fields");
      return;
    }

    const { error } = await supabase.from("announcements").insert({
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      priority: newAnnouncement.priority,
      author_id: profile?.id,
    } as any);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Announcement created!");
    setNewAnnouncement({ title: "", content: "", priority: "normal" });
    fetchData();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    toast.success("Announcement deleted");
    fetchData();
  };

  const toggleAnnouncementActive = async (id: string, isActive: boolean) => {
    await supabase.from("announcements").update({ is_active: !isActive }).eq("id", id);
    toast.success(isActive ? "Announcement hidden" : "Announcement visible");
    fetchData();
  };

  // Sponsor functions
  const createSponsor = async () => {
    if (!newSponsor.name || !newSponsor.logo_url) {
      toast.error("Please fill in name and logo URL");
      return;
    }

    const { error } = await supabase.from("sponsors").insert({
      name: newSponsor.name,
      logo_url: newSponsor.logo_url,
      website_url: newSponsor.website_url || null,
      tier: newSponsor.tier,
      display_order: newSponsor.display_order,
    });

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sponsor added!");
    setNewSponsor({ name: "", logo_url: "", website_url: "", tier: "bronze", display_order: 0 });
    fetchData();
  };

  const updateSponsor = async () => {
    if (!editingSponsor) return;

    const { error } = await supabase
      .from("sponsors")
      .update({
        name: editingSponsor.name,
        logo_url: editingSponsor.logo_url,
        website_url: editingSponsor.website_url,
        tier: editingSponsor.tier,
        display_order: editingSponsor.display_order,
      })
      .eq("id", editingSponsor.id);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sponsor updated!");
    setEditingSponsor(null);
    fetchData();
  };

  const deleteSponsor = async (id: string) => {
    await supabase.from("sponsors").delete().eq("id", id);
    toast.success("Sponsor deleted");
    fetchData();
  };

  const toggleSponsorActive = async (id: string, isActive: boolean) => {
    await supabase.from("sponsors").update({ is_active: !isActive }).eq("id", id);
    toast.success(isActive ? "Sponsor hidden" : "Sponsor visible");
    fetchData();
  };

  return (
    <DashboardLayout>
      <AdminSecurityNotifications />
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground font-mono text-sm">Manage the CTF platform</p>
        </motion.div>

        <Tabs defaultValue="challenges">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="challenges"><Target className="mr-2 h-4 w-4" />Challenges</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="announcements">
              <Megaphone className="mr-2 h-4 w-4" />Announcements
            </TabsTrigger>
            <TabsTrigger value="sponsors">
              <Award className="mr-2 h-4 w-4" />Sponsors
            </TabsTrigger>
            <TabsTrigger value="writeups" className="relative">
              <FileText className="mr-2 h-4 w-4" />Writeups
              {pendingWriteups.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                  {pendingWriteups.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="competition"><Trophy className="mr-2 h-4 w-4" />Competition</TabsTrigger>
            <TabsTrigger value="contacts" className="relative">
              <Mail className="mr-2 h-4 w-4" />Contacts
              {unresolvedContacts.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                  {unresolvedContacts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="security">
              <BarChart3 className="mr-2 h-4 w-4" />Security
            </TabsTrigger>
            <TabsTrigger value="audit-logs">
              <ShieldAlert className="mr-2 h-4 w-4" />Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-bold">All Challenges ({challenges.length})</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="hero"><Plus className="mr-2 h-4 w-4" />New Challenge</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Create Challenge</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={newChallenge.title} onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea className="min-h-[100px]" value={newChallenge.description} onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={newChallenge.category} onValueChange={(v) => setNewChallenge({ ...newChallenge, category: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{["web", "crypto", "reverse", "forensics", "pwn", "scripting", "misc"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Difficulty</Label>
                        <Select value={newChallenge.difficulty} onValueChange={(v) => setNewChallenge({ ...newChallenge, difficulty: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{["easy", "medium", "hard", "insane"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Points</Label>
                      <Input type="number" value={newChallenge.points} onChange={(e) => setNewChallenge({ ...newChallenge, points: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Flag</Label>
                      <Input value={newChallenge.flag} onChange={(e) => setNewChallenge({ ...newChallenge, flag: e.target.value })} placeholder="cyberops{...}" />
                    </div>
                    <div>
                      <Label>Hints (one per line)</Label>
                      <Textarea value={newChallenge.hints} onChange={(e) => setNewChallenge({ ...newChallenge, hints: e.target.value })} placeholder="First hint&#10;Second hint" />
                    </div>
                    <div>
                      <Label>Hint Costs (comma-separated, e.g., 10, 25)</Label>
                      <Input value={newChallenge.hint_costs} onChange={(e) => setNewChallenge({ ...newChallenge, hint_costs: e.target.value })} placeholder="10, 25" />
                    </div>
                    <Button onClick={createChallenge} variant="hero" className="w-full">Create Challenge</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Challenge Dialog */}
              <Dialog open={!!editingChallenge} onOpenChange={(open) => !open && setEditingChallenge(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Edit Challenge</DialogTitle></DialogHeader>
                  {editingChallenge && (
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input value={editingChallenge.title} onChange={(e) => setEditingChallenge({ ...editingChallenge, title: e.target.value })} />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea className="min-h-[100px]" value={editingChallenge.description} onChange={(e) => setEditingChallenge({ ...editingChallenge, description: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Category</Label>
                          <Select value={editingChallenge.category} onValueChange={(v) => setEditingChallenge({ ...editingChallenge, category: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{["web", "crypto", "reverse", "forensics", "pwn", "scripting", "misc"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Difficulty</Label>
                          <Select value={editingChallenge.difficulty} onValueChange={(v) => setEditingChallenge({ ...editingChallenge, difficulty: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{["easy", "medium", "hard", "insane"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Points</Label>
                        <Input type="number" value={editingChallenge.points} onChange={(e) => setEditingChallenge({ ...editingChallenge, points: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label>Flag</Label>
                        <Input value={editingChallenge.flag} onChange={(e) => setEditingChallenge({ ...editingChallenge, flag: e.target.value })} />
                      </div>
                      <div>
                        <Label>Hints (one per line)</Label>
                        <Textarea 
                          value={editingChallenge.hintsText ?? (editingChallenge.hints || []).join("\n")} 
                          onChange={(e) => setEditingChallenge({ ...editingChallenge, hintsText: e.target.value })} 
                        />
                      </div>
                      <div>
                        <Label>Hint Costs (comma-separated)</Label>
                        <Input 
                          value={editingChallenge.hintCostsText ?? (editingChallenge.hint_costs || []).join(", ")} 
                          onChange={(e) => setEditingChallenge({ ...editingChallenge, hintCostsText: e.target.value })} 
                        />
                      </div>
                      <div>
                        <Label>Challenge Files</Label>
                        <ChallengeFileUpload
                          challengeId={editingChallenge.id}
                          existingFiles={editingChallenge.files || []}
                          onFilesUpdated={(files) => setEditingChallenge({ ...editingChallenge, files })}
                        />
                      </div>
                      <Button onClick={updateChallenge} variant="hero" className="w-full">Update Challenge</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {challenges.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-mono">No challenges yet</div>
              ) : (
                <div className="divide-y divide-border">
                  {challenges.map((c) => (
                    <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-semibold flex items-center gap-2">
                          {c.title}
                          {c.files && c.files.length > 0 && (
                            <span className="text-xs text-primary font-normal">({c.files.length} files)</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{c.category} • {c.difficulty} • {c.points} pts • {c.solves} solves</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditingChallenge(c)}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteChallenge(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <h2 className="font-display text-xl font-bold mb-4">All Users ({users.length})</h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {users.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-mono">No users yet</div>
              ) : (
                <div className="divide-y divide-border">
                  {users.map((u) => (
                    <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-mono font-semibold">{u.username}</div>
                          <div className="text-xs text-muted-foreground">{u.challenges_solved} solved</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-primary">{u.total_points} pts</span>
                        <Button variant="ghost" size="sm" onClick={() => setPromotingUserId(u.user_id)} title="Make admin">
                          <ShieldCheck className="h-4 w-4 text-neon-cyan" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Writeups Tab */}
          <TabsContent value="writeups">
            <h2 className="font-display text-xl font-bold mb-4">Writeup Approvals</h2>
            {pendingWriteups.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground font-mono">
                No pending writeups
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {pendingWriteups.map((w) => (
                  <div key={w.id} className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground">{w.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Challenge: {w.challenges?.title} • By {w.profiles?.username}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => approveWriteup(w.id)} className="text-green-400 hover:text-green-300">
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => rejectWriteup(w.id)} className="text-red-400 hover:text-red-300">
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">{w.content}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-bold">Announcements ({announcements.length})</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="hero"><Plus className="mr-2 h-4 w-4" />New Announcement</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input 
                        value={newAnnouncement.title} 
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} 
                        placeholder="Important Update"
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea 
                        className="min-h-[100px]" 
                        value={newAnnouncement.content} 
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                        placeholder="Announcement details..."
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select 
                        value={newAnnouncement.priority} 
                        onValueChange={(v: "low" | "normal" | "high" | "urgent") => setNewAnnouncement({ ...newAnnouncement, priority: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={createAnnouncement} variant="hero" className="w-full">Create Announcement</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-mono">No announcements yet</div>
              ) : (
                <div className="divide-y divide-border">
                  {announcements.map((a) => (
                    <div key={a.id} className={`px-6 py-4 flex items-center justify-between ${!a.is_active ? 'opacity-50' : ''}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs rounded uppercase font-mono ${
                            a.priority === 'urgent' ? 'bg-destructive/20 text-destructive' :
                            a.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                            a.priority === 'normal' ? 'bg-primary/20 text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>{a.priority}</span>
                          <div className="font-mono font-semibold">{a.title}</div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{a.content}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={a.is_active} onCheckedChange={() => toggleAnnouncementActive(a.id, a.is_active)} />
                        <Button variant="ghost" size="sm" onClick={() => deleteAnnouncement(a.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-bold">Sponsors ({sponsors.length})</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="hero"><Plus className="mr-2 h-4 w-4" />Add Sponsor</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Add Sponsor</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input 
                        value={newSponsor.name} 
                        onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })} 
                        placeholder="Sponsor Name"
                      />
                    </div>
                    <div>
                      <Label>Logo URL</Label>
                      <Input 
                        value={newSponsor.logo_url} 
                        onChange={(e) => setNewSponsor({ ...newSponsor, logo_url: e.target.value })}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label>Website URL (optional)</Label>
                      <Input 
                        value={newSponsor.website_url} 
                        onChange={(e) => setNewSponsor({ ...newSponsor, website_url: e.target.value })}
                        placeholder="https://sponsor-website.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tier</Label>
                        <Select 
                          value={newSponsor.tier} 
                          onValueChange={(v: "platinum" | "gold" | "silver" | "bronze") => setNewSponsor({ ...newSponsor, tier: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                            <SelectItem value="bronze">Bronze</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Display Order</Label>
                        <Input 
                          type="number"
                          value={newSponsor.display_order} 
                          onChange={(e) => setNewSponsor({ ...newSponsor, display_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <Button onClick={createSponsor} variant="hero" className="w-full">Add Sponsor</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Sponsor Dialog */}
              <Dialog open={!!editingSponsor} onOpenChange={(open) => !open && setEditingSponsor(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Edit Sponsor</DialogTitle></DialogHeader>
                  {editingSponsor && (
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input 
                          value={editingSponsor.name} 
                          onChange={(e) => setEditingSponsor({ ...editingSponsor, name: e.target.value })} 
                        />
                      </div>
                      <div>
                        <Label>Logo URL</Label>
                        <Input 
                          value={editingSponsor.logo_url} 
                          onChange={(e) => setEditingSponsor({ ...editingSponsor, logo_url: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Website URL</Label>
                        <Input 
                          value={editingSponsor.website_url || ""} 
                          onChange={(e) => setEditingSponsor({ ...editingSponsor, website_url: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tier</Label>
                          <Select 
                            value={editingSponsor.tier} 
                            onValueChange={(v: "platinum" | "gold" | "silver" | "bronze") => setEditingSponsor({ ...editingSponsor, tier: v })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="platinum">Platinum</SelectItem>
                              <SelectItem value="gold">Gold</SelectItem>
                              <SelectItem value="silver">Silver</SelectItem>
                              <SelectItem value="bronze">Bronze</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Display Order</Label>
                          <Input 
                            type="number"
                            value={editingSponsor.display_order} 
                            onChange={(e) => setEditingSponsor({ ...editingSponsor, display_order: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <Button onClick={updateSponsor} variant="hero" className="w-full">Update Sponsor</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {sponsors.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-mono">No sponsors yet</div>
              ) : (
                <div className="divide-y divide-border">
                  {sponsors.map((s) => (
                    <div key={s.id} className={`px-6 py-4 flex items-center justify-between ${!s.is_active ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                          {s.logo_url ? (
                            <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <Image className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs rounded uppercase font-mono ${
                              s.tier === 'platinum' ? 'bg-neon-cyan/20 text-neon-cyan' :
                              s.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                              s.tier === 'silver' ? 'bg-gray-400/20 text-gray-300' :
                              'bg-orange-600/20 text-orange-400'
                            }`}>{s.tier}</span>
                            <span className="font-mono font-semibold">{s.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {s.website_url || "No website"} • Order: {s.display_order}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={s.is_active} onCheckedChange={() => toggleSponsorActive(s.id, s.is_active)} />
                        <Button variant="ghost" size="sm" onClick={() => setEditingSponsor(s)}>
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteSponsor(s.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Competition Tab */}
          <TabsContent value="competition">
            <div className="max-w-2xl">
              <h2 className="font-display text-xl font-bold mb-6">Competition Settings</h2>

              {competitionSettings && (
                <div className="space-y-6">
                  {/* Competition Active Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                    <div>
                      <div className="font-display font-bold text-foreground">Competition Mode</div>
                      <div className="text-sm text-muted-foreground">Enable timed competition with scoreboard freeze</div>
                    </div>
                    <Switch
                      checked={competitionSettings.is_active}
                      onCheckedChange={(checked) => updateCompetitionSettings({ is_active: checked })}
                    />
                  </div>

                  {/* Team Mode Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                    <div>
                      <div className="font-display font-bold text-foreground">Team Mode</div>
                      <div className="text-sm text-muted-foreground">Enable team-based scoring</div>
                    </div>
                    <Switch
                      checked={competitionSettings.team_mode}
                      onCheckedChange={(checked) => updateCompetitionSettings({ team_mode: checked })}
                    />
                  </div>

                  {/* Score Decay Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                    <div>
                      <div className="font-display font-bold text-foreground">Dynamic Scoring</div>
                      <div className="text-sm text-muted-foreground">Points decrease as more people solve</div>
                    </div>
                    <Switch
                      checked={competitionSettings.decay_enabled}
                      onCheckedChange={(checked) => updateCompetitionSettings({ decay_enabled: checked })}
                    />
                  </div>

                  {competitionSettings.decay_enabled && (
                    <div className="p-4 rounded-xl border border-border bg-card">
                      <Label className="text-xs font-mono uppercase text-muted-foreground">Minimum Points</Label>
                      <Input
                        type="number"
                        value={competitionSettings.decay_minimum}
                        onChange={(e) => updateCompetitionSettings({ decay_minimum: parseInt(e.target.value) || 50 })}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Challenges won't go below this point value</p>
                    </div>
                  )}

                  {/* Time Settings */}
                  {competitionSettings.is_active && (
                    <>
                      <div className="p-4 rounded-xl border border-border bg-card">
                        <Label className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" /> Start Time
                        </Label>
                        <Input
                          type="datetime-local"
                          value={competitionSettings.start_time?.slice(0, 16) || ""}
                          onChange={(e) => updateCompetitionSettings({ start_time: e.target.value ? new Date(e.target.value).toISOString() : null })}
                          className="mt-2"
                        />
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-card">
                        <Label className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" /> End Time
                        </Label>
                        <Input
                          type="datetime-local"
                          value={competitionSettings.end_time?.slice(0, 16) || ""}
                          onChange={(e) => updateCompetitionSettings({ end_time: e.target.value ? new Date(e.target.value).toISOString() : null })}
                          className="mt-2"
                        />
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-card">
                        <Label className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" /> Scoreboard Freeze Time
                        </Label>
                        <Input
                          type="datetime-local"
                          value={competitionSettings.freeze_time?.slice(0, 16) || ""}
                          onChange={(e) => updateCompetitionSettings({ freeze_time: e.target.value ? new Date(e.target.value).toISOString() : null })}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Public leaderboard freezes at this time</p>
                      </div>
                    </>
                  )}

                  {/* Status Indicator */}
                  <div className={`p-4 rounded-xl border ${competitionSettings.is_active ? "border-green-500/30 bg-green-500/5" : "border-border bg-card"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${competitionSettings.is_active ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
                      <span className="font-mono font-semibold">
                        {competitionSettings.is_active ? "Competition is LIVE" : "Competition is OFF"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-display text-xl font-bold">
                  Contact Submissions ({contactSubmissions.length})
                </h2>
                <div className="text-sm text-muted-foreground font-mono">
                  {unresolvedContacts.length} unresolved
                </div>
              </div>

              {contactSubmissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No contact submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className={`p-4 rounded-xl border ${
                        submission.is_resolved
                          ? "border-border/50 bg-card/30 opacity-60"
                          : "border-blue-500/30 bg-blue-500/5"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{submission.subject}</h3>
                            {submission.is_resolved && (
                              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                                Resolved
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {submission.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {submission.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(submission.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleContactResolved(submission.id, submission.is_resolved)}
                            className={submission.is_resolved ? "text-muted-foreground" : "text-green-400 hover:text-green-300"}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteContactSubmission(submission.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-lg border border-border/30">
                        {submission.message}
                      </p>
                      <div className="mt-3">
                        <a
                          href={`mailto:${submission.email}?subject=Re: ${encodeURIComponent(submission.subject)}`}
                          className="text-xs text-primary hover:underline font-mono"
                        >
                          Reply via email →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Security Dashboard Tab */}
          <TabsContent value="security">
            <SecurityDashboard />
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit-logs">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>

        {/* Admin Promotion Confirmation Dialog */}
        <AlertDialog open={!!promotingUserId} onOpenChange={(open) => !open && setPromotingUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Promote to Admin?</AlertDialogTitle>
              <AlertDialogDescription>
                This will grant <span className="font-semibold text-foreground">{users.find(u => u.user_id === promotingUserId)?.username}</span> full administrative privileges including the ability to manage challenges, users, and settings. This action cannot be easily undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmMakeAdmin}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirm Promotion
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Admin;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Users, Target, FileText, CheckCircle, XCircle, ShieldCheck, Clock, Trophy, Megaphone } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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

const Admin = () => {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [competitionSettings, setCompetitionSettings] = useState<CompetitionSettings | null>(null);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    category: "web",
    difficulty: "easy",
    points: 100,
    flag: "",
    hints: "",
    hint_costs: "",
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
    });
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

  const makeAdmin = async (userId: string) => {
    const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role: "admin" as any });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("User promoted to admin!");
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

  return (
    <DashboardLayout>
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
            <TabsTrigger value="writeups" className="relative">
              <FileText className="mr-2 h-4 w-4" />Writeups
              {pendingWriteups.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                  {pendingWriteups.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="competition"><Trophy className="mr-2 h-4 w-4" />Competition</TabsTrigger>
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
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {challenges.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-mono">No challenges yet</div>
              ) : (
                <div className="divide-y divide-border">
                  {challenges.map((c) => (
                    <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-semibold">{c.title}</div>
                        <div className="text-xs text-muted-foreground">{c.category} • {c.difficulty} • {c.points} pts • {c.solves} solves</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteChallenge(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
                        <Button variant="ghost" size="sm" onClick={() => makeAdmin(u.user_id)} title="Make admin">
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Admin;

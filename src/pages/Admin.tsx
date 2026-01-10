import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Users, Target, FileText, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Writeup {
  id: string;
  title: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  challenges: { title: string } | null;
  profiles: { username: string } | null;
}

const Admin = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [newChallenge, setNewChallenge] = useState({ title: "", description: "", category: "web", difficulty: "easy", points: 100, flag: "", hints: "" });

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
  };

  useEffect(() => { fetchData(); }, []);

  const createChallenge = async () => {
    const hintsArray = newChallenge.hints.split("\n").filter((h) => h.trim());
    const { error } = await supabase.from("challenges").insert({
      ...newChallenge,
      hints: hintsArray,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Challenge created!");
    setNewChallenge({ title: "", description: "", category: "web", difficulty: "easy", points: 100, flag: "", hints: "" });
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
    if (error) { toast.error(error.message); return; }
    toast.success("User promoted to admin!");
  };

  const pendingWriteups = writeups.filter((w) => !w.is_approved);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground font-mono text-sm">Manage challenges, users, writeups, and platform settings</p>
        </motion.div>

        <Tabs defaultValue="challenges">
          <TabsList className="mb-6">
            <TabsTrigger value="challenges"><Target className="mr-2 h-4 w-4" />Challenges</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="writeups" className="relative">
              <FileText className="mr-2 h-4 w-4" />Writeups
              {pendingWriteups.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                  {pendingWriteups.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-bold">All Challenges ({challenges.length})</h2>
              <Dialog>
                <DialogTrigger asChild><Button variant="hero"><Plus className="mr-2 h-4 w-4" />New Challenge</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Create Challenge</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Title</Label><Input value={newChallenge.title} onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })} /></div>
                    <div><Label>Description</Label><Textarea className="min-h-[100px]" value={newChallenge.description} onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Category</Label>
                        <Select value={newChallenge.category} onValueChange={(v) => setNewChallenge({ ...newChallenge, category: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{["web", "crypto", "reverse", "forensics", "pwn", "scripting", "misc"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Difficulty</Label>
                        <Select value={newChallenge.difficulty} onValueChange={(v) => setNewChallenge({ ...newChallenge, difficulty: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{["easy", "medium", "hard", "insane"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div><Label>Points</Label><Input type="number" value={newChallenge.points} onChange={(e) => setNewChallenge({ ...newChallenge, points: parseInt(e.target.value) || 0 })} /></div>
                    <div><Label>Flag</Label><Input value={newChallenge.flag} onChange={(e) => setNewChallenge({ ...newChallenge, flag: e.target.value })} placeholder="cyberops{...}" /></div>
                    <div><Label>Hints (one per line)</Label><Textarea value={newChallenge.hints} onChange={(e) => setNewChallenge({ ...newChallenge, hints: e.target.value })} placeholder="First hint&#10;Second hint" /></div>
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
                      <Button variant="ghost" size="sm" onClick={() => deleteChallenge(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

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
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{u.username?.[0]?.toUpperCase()}</div>
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

          <TabsContent value="writeups">
            <h2 className="font-display text-xl font-bold mb-4">Writeup Approvals</h2>
            {pendingWriteups.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground font-mono">
                No pending writeups
              </div>
            ) : (
              <div className="space-y-4">
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

            <h2 className="font-display text-xl font-bold mt-8 mb-4">All Writeups ({writeups.length})</h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {writeups.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-mono">No writeups yet</div>
              ) : (
                <div className="divide-y divide-border">
                  {writeups.map((w) => (
                    <div key={w.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-semibold">{w.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {w.challenges?.title} • By {w.profiles?.username}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${w.is_approved ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                          {w.is_approved ? "Approved" : "Pending"}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => rejectWriteup(w.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
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

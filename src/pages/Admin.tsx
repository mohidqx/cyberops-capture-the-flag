import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Users, Target, FileText } from "lucide-react";
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

const Admin = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newChallenge, setNewChallenge] = useState({ title: "", description: "", category: "web", difficulty: "easy", points: 100, flag: "" });

  const fetchData = async () => {
    const { data: c } = await supabase.from("challenges").select("*").order("created_at", { ascending: false });
    if (c) setChallenges(c);
    const { data: u } = await supabase.from("profiles").select("*").order("total_points", { ascending: false });
    if (u) setUsers(u);
  };

  useEffect(() => { fetchData(); }, []);

  const createChallenge = async () => {
    const { error } = await supabase.from("challenges").insert(newChallenge as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Challenge created!");
    setNewChallenge({ title: "", description: "", category: "web", difficulty: "easy", points: 100, flag: "" });
    fetchData();
  };

  const deleteChallenge = async (id: string) => {
    await supabase.from("challenges").delete().eq("id", id);
    toast.success("Deleted");
    fetchData();
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground font-mono text-sm">Manage challenges, users, and platform settings</p>
        </motion.div>

        <Tabs defaultValue="challenges">
          <TabsList className="mb-6">
            <TabsTrigger value="challenges"><Target className="mr-2 h-4 w-4" />Challenges</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-bold">All Challenges ({challenges.length})</h2>
              <Dialog>
                <DialogTrigger asChild><Button variant="hero"><Plus className="mr-2 h-4 w-4" />New Challenge</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Create Challenge</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Title</Label><Input value={newChallenge.title} onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })} /></div>
                    <div><Label>Description</Label><Textarea value={newChallenge.description} onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })} /></div>
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
                    <div><Label>Points</Label><Input type="number" value={newChallenge.points} onChange={(e) => setNewChallenge({ ...newChallenge, points: parseInt(e.target.value) })} /></div>
                    <div><Label>Flag</Label><Input value={newChallenge.flag} onChange={(e) => setNewChallenge({ ...newChallenge, flag: e.target.value })} placeholder="cyberops{...}" /></div>
                    <Button onClick={createChallenge} variant="hero" className="w-full">Create Challenge</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="divide-y divide-border">
                {challenges.map((c) => (
                  <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-semibold">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.category} • {c.difficulty} • {c.points} pts</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteChallenge(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <h2 className="font-display text-xl font-bold mb-4">All Users ({users.length})</h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                    <span className="font-display font-bold text-primary">{u.total_points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Admin;

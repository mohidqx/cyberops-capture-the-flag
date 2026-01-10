import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Copy, LogOut } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Teams = () => {
  const { profile, refreshProfile } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select("*").order("total_points", { ascending: false });
    if (data) setTeams(data);
    if (profile?.team_id) {
      const team = data?.find((t) => t.id === profile.team_id);
      setMyTeam(team);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTeams(); }, [profile]);

  const createTeam = async () => {
    if (!profile || !newTeamName.trim()) return;
    const { data, error } = await supabase.from("teams").insert({ name: newTeamName, captain_id: profile.id }).select().single();
    if (error) { toast.error(error.message); return; }
    await supabase.from("profiles").update({ team_id: data.id }).eq("id", profile.id);
    toast.success("Team created!");
    await refreshProfile();
    fetchTeams();
    setNewTeamName("");
  };

  const joinTeam = async () => {
    if (!profile || !joinCode.trim()) return;
    const { data: team } = await supabase.from("teams").select("id").eq("invite_code", joinCode).maybeSingle();
    if (!team) { toast.error("Invalid invite code"); return; }
    await supabase.from("profiles").update({ team_id: team.id }).eq("id", profile.id);
    toast.success("Joined team!");
    await refreshProfile();
    fetchTeams();
    setJoinCode("");
  };

  const leaveTeam = async () => {
    if (!profile) return;
    await supabase.from("profiles").update({ team_id: null }).eq("id", profile.id);
    toast.success("Left team");
    await refreshProfile();
    setMyTeam(null);
    fetchTeams();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Teams</h1>
          <p className="text-muted-foreground font-mono text-sm">Join forces with other hackers</p>
        </motion.div>

        {myTeam ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-foreground">Your Team: {myTeam.name}</h2>
              <Button variant="ghost" size="sm" onClick={leaveTeam}><LogOut className="mr-2 h-4 w-4" />Leave</Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">Invite Code:</span>
              <code className="px-3 py-1 rounded bg-muted font-mono text-primary">{myTeam.invite_code}</code>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(myTeam.invite_code); toast.success("Copied!"); }}><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Dialog>
              <DialogTrigger asChild><Button variant="hero" className="h-24"><Plus className="mr-2" />Create Team</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>Create a Team</DialogTitle></DialogHeader>
                <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Team name" className="mb-4" />
                <Button onClick={createTeam} variant="hero" className="w-full">Create</Button>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="h-24"><Users className="mr-2" />Join Team</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>Join a Team</DialogTitle></DialogHeader>
                <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Invite code" className="mb-4" />
                <Button onClick={joinTeam} variant="hero" className="w-full">Join</Button>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 font-mono text-xs uppercase tracking-wider text-muted-foreground">All Teams</div>
          {loading ? <div className="p-8 text-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
          : teams.length === 0 ? <div className="p-8 text-center text-muted-foreground font-mono">No teams yet</div>
          : <div className="divide-y divide-border">{teams.map((team) => (
            <div key={team.id} className="px-6 py-4 flex items-center justify-between">
              <span className="font-mono font-semibold">{team.name}</span>
              <span className="font-display font-bold text-primary">{team.total_points} pts</span>
            </div>
          ))}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Teams;

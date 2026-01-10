import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Copy, LogOut, Trophy, Target, Crown } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Team {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  captain_id: string | null;
  total_points: number;
}

interface TeamMember {
  id: string;
  username: string;
  total_points: number;
  challenges_solved: number;
}

const Teams = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const fetchTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("*")
      .order("total_points", { ascending: false });

    if (data) setTeams(data);

    if (profile?.team_id) {
      const team = data?.find((t) => t.id === profile.team_id);
      setMyTeam(team || null);

      // Fetch team members
      if (team) {
        const { data: members } = await supabase
          .from("profiles")
          .select("id, username, total_points, challenges_solved")
          .eq("team_id", team.id)
          .order("total_points", { ascending: false });

        if (members) setTeamMembers(members);
      }
    } else {
      setMyTeam(null);
      setTeamMembers([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, [profile]);

  const createTeam = async () => {
    if (!profile || !newTeamName.trim()) return;

    const { data, error } = await supabase
      .from("teams")
      .insert({
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || null,
        captain_id: profile.id,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    await supabase.from("profiles").update({ team_id: data.id }).eq("id", profile.id);
    toast.success("Team created!");
    await refreshProfile();
    fetchTeams();
    setNewTeamName("");
    setNewTeamDescription("");
    setCreateDialogOpen(false);
  };

  const joinTeam = async () => {
    if (!profile || !joinCode.trim()) return;

    const { data: team } = await supabase
      .from("teams")
      .select("id, name")
      .eq("invite_code", joinCode.trim())
      .maybeSingle();

    if (!team) {
      toast.error("Invalid invite code");
      return;
    }

    await supabase.from("profiles").update({ team_id: team.id }).eq("id", profile.id);
    toast.success(`Joined ${team.name}!`);
    await refreshProfile();
    fetchTeams();
    setJoinCode("");
    setJoinDialogOpen(false);
  };

  const leaveTeam = async () => {
    if (!profile) return;

    await supabase.from("profiles").update({ team_id: null }).eq("id", profile.id);
    toast.success("Left team");
    await refreshProfile();
    setMyTeam(null);
    setTeamMembers([]);
    fetchTeams();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Teams</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Join forces with other hackers for team competitions
          </p>
        </motion.div>

        {/* My Team Section */}
        {myTeam ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-6 mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {myTeam.name}
                  </h2>
                  {myTeam.captain_id === profile?.id && (
                    <Crown className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                {myTeam.description && (
                  <p className="text-sm text-muted-foreground">{myTeam.description}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={leaveTeam}>
                <LogOut className="mr-2 h-4 w-4" />
                Leave
              </Button>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-card border border-border">
                <Trophy className="h-5 w-5 text-yellow-400 mb-2" />
                <div className="font-display text-2xl font-bold text-primary">
                  {myTeam.total_points}
                </div>
                <div className="text-xs font-mono uppercase text-muted-foreground">
                  Team Points
                </div>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <Users className="h-5 w-5 text-neon-cyan mb-2" />
                <div className="font-display text-2xl font-bold text-neon-cyan">
                  {teamMembers.length}
                </div>
                <div className="text-xs font-mono uppercase text-muted-foreground">
                  Members
                </div>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <Target className="h-5 w-5 text-primary mb-2" />
                <div className="font-display text-2xl font-bold text-foreground">
                  {teamMembers.reduce((acc, m) => acc + m.challenges_solved, 0)}
                </div>
                <div className="text-xs font-mono uppercase text-muted-foreground">
                  Solved
                </div>
              </div>
            </div>

            {/* Invite Code */}
            <div className="p-4 rounded-lg bg-card border border-border mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    Invite Code
                  </span>
                  <code className="ml-3 px-3 py-1 rounded bg-muted font-mono text-primary text-lg">
                    {myTeam.invite_code}
                  </code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(myTeam.invite_code);
                    toast.success("Copied!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h3 className="font-display text-lg font-bold text-foreground mb-3">
                Team Members
              </h3>
              <div className="space-y-2">
                {teamMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {member.username[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-mono font-semibold">{member.username}</span>
                        {myTeam.captain_id === member.id && (
                          <Crown className="inline ml-2 h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-primary">
                        {member.total_points} pts
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.challenges_solved} solved
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" className="h-24">
                  <Plus className="mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Create a Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-xs font-mono uppercase text-muted-foreground">
                      Team Name
                    </Label>
                    <Input
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Elite Hackers"
                      className="mt-2"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-mono uppercase text-muted-foreground">
                      Description (optional)
                    </Label>
                    <Textarea
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                      placeholder="We break things..."
                      className="mt-2"
                      maxLength={200}
                    />
                  </div>
                  <Button onClick={createTeam} variant="hero" className="w-full">
                    Create Team
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-24">
                  <Users className="mr-2" />
                  Join Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Join a Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-xs font-mono uppercase text-muted-foreground">
                      Invite Code
                    </Label>
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="Enter invite code"
                      className="mt-2 font-mono"
                    />
                  </div>
                  <Button onClick={joinTeam} variant="hero" className="w-full">
                    Join Team
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* All Teams Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Team Leaderboard
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-muted/30 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <div className="col-span-1">Rank</div>
              <div className="col-span-8">Team</div>
              <div className="col-span-3 text-right">Points</div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : teams.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground font-mono">
                No teams yet. Be the first to create one!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {teams.map((team, index) => (
                  <div
                    key={team.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors ${
                      team.id === myTeam?.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="col-span-1">
                      {index < 3 ? (
                        <span
                          className={`font-display font-bold ${
                            index === 0
                              ? "text-yellow-400"
                              : index === 1
                              ? "text-gray-300"
                              : "text-amber-600"
                          }`}
                        >
                          #{index + 1}
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono">#{index + 1}</span>
                      )}
                    </div>
                    <div className="col-span-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center text-neon-cyan font-bold">
                        {team.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-mono font-semibold flex items-center gap-2">
                          {team.name}
                          {team.id === myTeam?.id && (
                            <span className="text-xs text-primary">(Your team)</span>
                          )}
                        </div>
                        {team.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {team.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-3 text-right font-display text-xl font-bold text-neon-cyan">
                      {team.total_points.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Teams;

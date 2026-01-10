import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, Users } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Player {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  country: string | null;
  total_points: number;
  challenges_solved: number;
}

interface Team {
  id: string;
  name: string;
  avatar_url: string | null;
  total_points: number;
  member_count?: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-400" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-300" />;
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return <span className="text-muted-foreground font-mono font-bold">#{rank}</span>;
  }
};

const LeaderboardPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Fetch players
      const { data: playersData } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, country, total_points, challenges_solved")
        .order("total_points", { ascending: false })
        .limit(100);

      if (playersData) {
        setPlayers(playersData);
      }

      // Fetch teams
      const { data: teamsData } = await supabase
        .from("teams")
        .select("id, name, avatar_url, total_points")
        .order("total_points", { ascending: false })
        .limit(50);

      if (teamsData) {
        setTeams(teamsData);
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Leaderboard
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Global rankings updated in real-time
          </p>
        </motion.div>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="players" className="font-mono uppercase tracking-wider">
              <TrendingUp className="mr-2 h-4 w-4" />
              Players
            </TabsTrigger>
            <TabsTrigger value="teams" className="font-mono uppercase tracking-wider">
              <Users className="mr-2 h-4 w-4" />
              Teams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-muted/30 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-3 text-center">Solved</div>
                <div className="col-span-3 text-right">Points</div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : players.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-mono">
                  No players yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors ${
                        index < 3 ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="col-span-1 flex justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                          {player.avatar_url ? (
                            <img
                              src={player.avatar_url}
                              alt={player.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            player.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono font-semibold truncate">
                            {player.username}
                          </div>
                          {player.country && (
                            <div className="text-xs text-muted-foreground">
                              {player.country}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-3 text-center font-mono text-muted-foreground">
                        {player.challenges_solved}
                      </div>
                      <div className="col-span-3 text-right font-display text-xl font-bold text-primary">
                        {player.total_points.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="teams">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-muted/30 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <div className="col-span-1">Rank</div>
                <div className="col-span-8">Team</div>
                <div className="col-span-3 text-right">Points</div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : teams.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-mono">
                  No teams yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {teams.map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors ${
                        index < 3 ? "bg-neon-cyan/5" : ""
                      }`}
                    >
                      <div className="col-span-1 flex justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="col-span-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center text-neon-cyan font-bold shrink-0">
                          {team.name[0].toUpperCase()}
                        </div>
                        <div className="font-mono font-semibold">
                          {team.name}
                        </div>
                      </div>
                      <div className="col-span-3 text-right font-display text-xl font-bold text-neon-cyan">
                        {team.total_points.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LeaderboardPage;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Medal, Award, TrendingUp, Users, Clock, Lock, Search, Crown,
  ChevronUp, ChevronDown, Filter, Flame, Target, Zap, Globe
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

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
}

interface CompetitionSettings {
  is_active: boolean;
  freeze_time: string | null;
  team_mode: boolean;
  end_time: string | null;
}

const getRankDisplay = (rank: number) => {
  switch (rank) {
    case 1:
      return (
        <div className="relative">
          <Crown className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_hsl(45_100%_60%/0.6)]" />
        </div>
      );
    case 2:
      return <Medal className="h-5 w-5 text-slate-300 drop-shadow-[0_0_6px_hsl(0_0%_80%/0.4)]" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-500 drop-shadow-[0_0_6px_hsl(30_100%_50%/0.4)]" />;
    default:
      return <span className="text-xs font-mono font-bold text-muted-foreground">#{rank}</span>;
  }
};

const formatTimeRemaining = (ms: number) => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const LeaderboardPage = () => {
  const { profile } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [competitionSettings, setCompetitionSettings] = useState<CompetitionSettings | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"points" | "solved">("points");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: settings } = await supabase
        .from("competition_settings")
        .select("is_active, freeze_time, team_mode, end_time")
        .eq("name", "default")
        .maybeSingle();

      if (settings) {
        setCompetitionSettings(settings);
        if (settings.freeze_time && new Date(settings.freeze_time) <= new Date()) {
          setIsFrozen(true);
        }
      }

      const { data: playersData } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, country, total_points, challenges_solved")
        .order("total_points", { ascending: false })
        .limit(100);

      if (playersData) setPlayers(playersData);

      const { data: teamsData } = await supabase
        .from("teams")
        .select("id, name, avatar_url, total_points")
        .order("total_points", { ascending: false })
        .limit(50);

      if (teamsData) setTeams(teamsData);
      setLoading(false);
    };

    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        if (!isFrozen) fetchLeaderboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isFrozen]);

  useEffect(() => {
    if (!competitionSettings?.is_active || !competitionSettings.end_time) {
      setTimeRemaining(null);
      return;
    }
    const update = () => {
      const remaining = Math.max(0, new Date(competitionSettings.end_time!).getTime() - Date.now());
      setTimeRemaining(remaining);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [competitionSettings]);

  const toggleSort = (field: "points" | "solved") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const filteredPlayers = players
    .filter(p => !searchQuery || p.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const val = sortField === "points"
        ? a.total_points - b.total_points
        : a.challenges_solved - b.challenges_solved;
      return sortAsc ? val : -val;
    });

  const filteredTeams = teams
    .filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Top 3 podium
  const top3 = filteredPlayers.slice(0, 3);
  const rest = filteredPlayers.slice(3);
  const myRank = filteredPlayers.findIndex(p => p.id === profile?.id) + 1;

  const defaultTab = competitionSettings?.team_mode ? "teams" : "players";
  const SortIcon = sortAsc ? ChevronUp : ChevronDown;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
              {isFrozen ? "Scoreboard Frozen" : "Live Rankings"}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Leaderboard
          </h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            {isFrozen ? "Rankings frozen — final results pending" : "Real-time global rankings"}
          </p>
        </motion.div>

        {/* Competition status bar */}
        {competitionSettings?.is_active && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs font-semibold text-foreground">COMPETITION LIVE</span>
                </div>
                {competitionSettings.team_mode && (
                  <span className="px-2 py-0.5 text-[9px] font-mono bg-secondary/10 text-secondary rounded border border-secondary/20">
                    TEAM MODE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {timeRemaining !== null && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono text-lg font-bold text-primary tabular-nums">
                      {formatTimeRemaining(timeRemaining)}
                    </span>
                  </div>
                )}
                {isFrozen && (
                  <div className="flex items-center gap-1.5 text-yellow-400">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-mono font-bold">FROZEN</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Your rank banner */}
        {myRank > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-6 p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                  {profile?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Your Position</p>
                  <p className="font-display text-lg font-bold text-foreground">{profile?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Rank</p>
                  <p className="font-display text-2xl font-black text-primary">#{myRank}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Points</p>
                  <p className="font-display text-2xl font-black text-foreground">{profile?.total_points?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search & filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search players or teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs font-mono bg-card/60 border-border/30 focus:border-primary/40"
            />
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border/30 bg-card/60">
            <Filter className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] font-mono text-muted-foreground">{filteredPlayers.length} players</span>
          </div>
        </motion.div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-5 bg-card/60 border border-border/20">
            <TabsTrigger value="players" className="font-mono text-[10px] uppercase tracking-wider">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
              Players
            </TabsTrigger>
            <TabsTrigger value="teams" className="font-mono text-[10px] uppercase tracking-wider">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Teams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players">
            {/* Podium for top 3 */}
            {top3.length >= 3 && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 grid grid-cols-3 gap-3"
              >
                {/* 2nd place */}
                <PodiumCard player={top3[1]} rank={2} />
                {/* 1st place */}
                <PodiumCard player={top3[0]} rank={1} featured />
                {/* 3rd place */}
                <PodiumCard player={top3[2]} rank={3} />
              </motion.div>
            )}

            {/* Table */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden"
            >
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border/20 bg-muted/10">
                <div className="col-span-1 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">#</div>
                <div className="col-span-5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Player</div>
                <div
                  className="col-span-3 text-center text-[9px] font-mono uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground flex items-center justify-center gap-1"
                  onClick={() => toggleSort("solved")}
                >
                  Solved
                  {sortField === "solved" && <SortIcon className="h-3 w-3" />}
                </div>
                <div
                  className="col-span-3 text-right text-[9px] font-mono uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground flex items-center justify-end gap-1"
                  onClick={() => toggleSort("points")}
                >
                  Points
                  {sortField === "points" && <SortIcon className="h-3 w-3" />}
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : rest.length === 0 && top3.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-mono text-xs">
                  No players yet
                </div>
              ) : (
                <div className="divide-y divide-border/10">
                  {(searchQuery ? filteredPlayers : rest).map((player, index) => {
                    const rank = searchQuery
                      ? filteredPlayers.indexOf(player) + 1
                      : index + 4;
                    const isMe = player.id === profile?.id;

                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.5) }}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors hover:bg-muted/10 ${
                          isMe ? "bg-primary/5 border-l-2 border-l-primary" : ""
                        }`}
                      >
                        <div className="col-span-1 flex justify-center">
                          {getRankDisplay(rank)}
                        </div>
                        <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isMe ? "bg-primary/20 text-primary border border-primary/20" : "bg-muted/30 text-muted-foreground border border-border/20"
                          }`}>
                            {player.avatar_url ? (
                              <img src={player.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              player.username[0]?.toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className={`font-mono text-xs font-semibold truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                              {player.username}
                              {isMe && <span className="text-[8px] ml-1 text-primary/60">(you)</span>}
                            </div>
                            {player.country && (
                              <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                                <Globe className="h-2.5 w-2.5" />
                                {player.country}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-span-3 text-center">
                          <span className="font-mono text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <Target className="h-3 w-3" />
                            {player.challenges_solved}
                          </span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="font-display text-sm font-bold text-foreground">
                            {player.total_points.toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="teams">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden"
            >
              <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border/20 bg-muted/10">
                <div className="col-span-1 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">#</div>
                <div className="col-span-8 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Team</div>
                <div className="col-span-3 text-right text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Points</div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-secondary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : filteredTeams.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-mono text-xs">
                  No teams yet
                </div>
              ) : (
                <div className="divide-y divide-border/10">
                  {filteredTeams.map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.5) }}
                      className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/10 transition-colors ${
                        index < 3 ? "bg-secondary/3" : ""
                      }`}
                    >
                      <div className="col-span-1 flex justify-center">
                        {getRankDisplay(index + 1)}
                      </div>
                      <div className="col-span-8 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary font-bold text-xs border border-secondary/15 flex-shrink-0">
                          {team.avatar_url ? (
                            <img src={team.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
                          ) : (
                            team.name[0]?.toUpperCase()
                          )}
                        </div>
                        <span className="font-mono text-xs font-semibold text-foreground">{team.name}</span>
                      </div>
                      <div className="col-span-3 text-right font-display text-sm font-bold text-secondary">
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

/* Podium Card Component */
const PodiumCard = ({ player, rank, featured = false }: { player: Player; rank: number; featured?: boolean }) => {
  const colors = {
    1: { border: "border-yellow-400/30", bg: "from-yellow-400/10 to-yellow-400/5", text: "text-yellow-400", glow: "shadow-[0_0_20px_hsl(45_100%_60%/0.1)]" },
    2: { border: "border-slate-300/20", bg: "from-slate-300/10 to-slate-300/5", text: "text-slate-300", glow: "shadow-[0_0_15px_hsl(0_0%_80%/0.08)]" },
    3: { border: "border-amber-500/20", bg: "from-amber-500/10 to-amber-500/5", text: "text-amber-500", glow: "shadow-[0_0_15px_hsl(30_100%_50%/0.08)]" },
  }[rank] || { border: "border-border/20", bg: "from-muted/10 to-muted/5", text: "text-muted-foreground", glow: "" };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`relative rounded-xl border ${colors.border} bg-gradient-to-b ${colors.bg} p-4 text-center backdrop-blur-sm ${colors.glow} ${
        featured ? "mt-0" : "mt-6"
      }`}
    >
      <div className="mb-2">{getRankDisplay(rank)}</div>
      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-sm border ${colors.border} bg-card/50 mb-2 ${colors.text}`}>
        {player.avatar_url ? (
          <img src={player.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          player.username[0]?.toUpperCase()
        )}
      </div>
      <p className="font-mono text-xs font-semibold text-foreground truncate">{player.username}</p>
      <p className={`font-display text-lg font-black ${colors.text} mt-1`}>
        {player.total_points.toLocaleString()}
      </p>
      <p className="text-[9px] font-mono text-muted-foreground mt-0.5">
        {player.challenges_solved} solved
      </p>
    </motion.div>
  );
};

export default LeaderboardPage;

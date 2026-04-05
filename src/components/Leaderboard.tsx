import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Player {
  id: string;
  username: string;
  country: string | null;
  total_points: number;
}

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1: return { icon: <Crown className="h-5 w-5 text-neon-orange" />, bg: "bg-neon-orange/5 border-neon-orange/20" };
    case 2: return { icon: <Medal className="h-5 w-5 text-muted-foreground" />, bg: "bg-muted/5 border-muted/10" };
    case 3: return { icon: <Award className="h-5 w-5 text-neon-orange" />, bg: "bg-neon-orange/5 border-neon-orange/10" };
    default: return { icon: <span className="text-muted-foreground font-mono text-sm">#{rank}</span>, bg: "border-border/30" };
  }
};

const Leaderboard = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase.from("profiles").select("id, username, country, total_points").order("total_points", { ascending: false }).limit(5);
      if (data) setPlayers(data);
      setLoading(false);
    };
    fetchLeaderboard();
    const channel = supabase.channel("home-leaderboard").on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchLeaderboard()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section id="leaderboard" className="py-28 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs font-mono uppercase tracking-[0.2em] text-secondary mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Global Rankings
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
              Climb the <span className="text-gradient">Ranks</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10 text-lg">
              Compete against hackers worldwide. Solve challenges, earn points, and prove you're among the elite.
            </p>
          </motion.div>

          {/* Leaderboard card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            viewport={{ once: true, margin: "-80px" }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border/20 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-neon-orange/80" />
                <div className="w-3 h-3 rounded-full bg-primary/80" />
              </div>
              <span className="ml-4 text-xs font-mono text-muted-foreground tracking-wider">leaderboard.exe</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-mono text-primary/60">LIVE</span>
              </div>
            </div>
            <div className="p-3">
              {loading ? (
                <div className="p-16 text-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
              ) : players.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground font-mono">No players yet. Be the first!</div>
              ) : (
                players.map((player, index) => {
                  const rankStyle = getRankStyle(index + 1);
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
                      viewport={{ once: true }}
                      className={`flex items-center justify-between p-4 rounded-xl border ${rankStyle.bg} mb-2 last:mb-0 hover:bg-primary/5 transition-colors duration-200`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center">{rankStyle.icon}</div>
                        <span className="text-xl">{player.country || "🌍"}</span>
                        <div>
                          <div className="font-mono font-bold text-foreground">{player.username}</div>
                          <div className="text-xs font-mono text-muted-foreground">{player.total_points?.toLocaleString() || 0} pts</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-mono text-primary">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;

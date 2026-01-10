import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Player {
  id: string;
  username: string;
  country: string | null;
  total_points: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-400" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-300" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-muted-foreground font-mono">#{rank}</span>;
  }
};

const Leaderboard = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ countries: 0, totalPlayers: 0 });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, country, total_points")
        .order("total_points", { ascending: false })
        .limit(5);

      if (data) {
        setPlayers(data);
        const uniqueCountries = new Set(data.map((p) => p.country).filter(Boolean));
        setStats({
          countries: uniqueCountries.size || 1,
          totalPlayers: data.length,
        });
      }
      setLoading(false);
    };

    fetchLeaderboard();

    // Real-time updates
    const channel = supabase
      .channel("home-leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="leaderboard" className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 text-xs font-mono uppercase tracking-widest text-neon-cyan mb-4">
              Global Rankings
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Climb the <span className="text-gradient">Ranks</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Compete against hackers worldwide. Solve challenges, earn points, and prove you're among the elite. Top performers win prizes and recognition.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <div className="font-display text-3xl font-bold text-primary mb-1">{stats.countries || 1}</div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Countries</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <div className="font-display text-3xl font-bold text-neon-cyan mb-1">24/7</div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Live Updates</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Leaderboard table */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-surface-dark">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="ml-4 text-xs font-mono text-muted-foreground">leaderboard.exe</span>
              </div>
            </div>

            {/* Table */}
            <div className="p-2">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : players.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-mono">
                  No players yet. Be the first!
                </div>
              ) : (
                players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-muted/30 ${
                      index === 0 ? "bg-primary/5 border border-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 flex justify-center">{getRankIcon(index + 1)}</div>
                      <span className="text-xl">{player.country || "🌍"}</span>
                      <div>
                        <div className="font-mono font-semibold text-foreground">{player.username}</div>
                        <div className="text-xs font-mono text-muted-foreground">{player.total_points?.toLocaleString() || 0} pts</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono text-green-400">
                      <TrendingUp className="h-3 w-3" />
                      +{Math.floor(Math.random() * 15) + 1}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;

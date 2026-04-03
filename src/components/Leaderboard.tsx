import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
    case 1: return { icon: <Crown className="h-5 w-5 text-neon-orange" style={{ filter: 'drop-shadow(0 0 6px hsl(var(--neon-orange) / 0.5))' }} />, bg: "bg-neon-orange/5 border-neon-orange/20" };
    case 2: return { icon: <Medal className="h-5 w-5 text-muted-foreground" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--muted-foreground) / 0.4))' }} />, bg: "bg-muted/5 border-muted/10" };
    case 3: return { icon: <Award className="h-5 w-5 text-neon-orange" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--neon-orange) / 0.4))' }} />, bg: "bg-neon-orange/5 border-neon-orange/10" };
    default: return { icon: <span className="text-muted-foreground font-mono text-sm">#{rank}</span>, bg: "border-border/30" };
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, x: 0, scale: 1,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }),
};

const Leaderboard = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ countries: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const leftX = useTransform(scrollYProgress, [0, 0.4], [-60, 0]);
  const rightX = useTransform(scrollYProgress, [0, 0.4], [60, 0]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.2], [0.3, 1]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase.from("profiles").select("id, username, country, total_points").order("total_points", { ascending: false }).limit(5);
      if (data) { setPlayers(data); setStats({ countries: new Set(data.map(p => p.country).filter(Boolean)).size || 1 }); }
      setLoading(false);
    };
    fetchLeaderboard();
    const channel = supabase.channel("home-leaderboard").on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchLeaderboard()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section ref={sectionRef} id="leaderboard" className="py-28 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[150px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      <motion.div className="container mx-auto px-4 relative z-10" style={{ opacity: sectionOpacity }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div style={{ x: leftX }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-100px" }}>
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
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.05, y: -4 }} className="glass-card rounded-xl p-5">
                <div className="font-display text-3xl font-black text-primary mb-1">{stats.countries || 1}</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">Countries</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -4 }} className="glass-card rounded-xl p-5">
                <div className="font-display text-3xl font-black text-secondary mb-1">24/7</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">Live Updates</div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div style={{ x: rightX }} className="glass-card rounded-2xl overflow-hidden">
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
                    <motion.div key={player.id} custom={index} variants={rowVariants} initial="hidden" whileInView="visible"
                      viewport={{ once: true }} whileHover={{ x: 6, scale: 1.02 }}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all border ${rankStyle.bg} mb-2 last:mb-0 hover:bg-primary/5`}>
                      <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center">{rankStyle.icon}</div>
                        <span className="text-xl">{player.country || "🌍"}</span>
                        <div>
                          <div className="font-mono font-bold text-foreground">{player.username}</div>
                          <div className="text-xs font-mono text-muted-foreground">{player.total_points?.toLocaleString() || 0} pts</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-mono text-primary">
                        <TrendingUp className="h-3 w-3" />+{Math.floor(Math.random() * 15) + 1}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Leaderboard;

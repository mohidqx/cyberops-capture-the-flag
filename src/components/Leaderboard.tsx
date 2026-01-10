import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

const topPlayers = [
  { rank: 1, name: "gh0st_hunter", points: 15420, country: "🇺🇸", trend: "+12" },
  { rank: 2, name: "binary_wizard", points: 14890, country: "🇩🇪", trend: "+8" },
  { rank: 3, name: "crypto_queen", points: 14350, country: "🇯🇵", trend: "+15" },
  { rank: 4, name: "pwn_master", points: 13920, country: "🇬🇧", trend: "-2" },
  { rank: 5, name: "shell_shock", points: 13450, country: "🇰🇷", trend: "+5" },
];

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
                <div className="font-display text-3xl font-bold text-primary mb-1">147</div>
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
              {topPlayers.map((player, index) => (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-muted/30 ${
                    player.rank === 1 ? "bg-primary/5 border border-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">{getRankIcon(player.rank)}</div>
                    <span className="text-xl">{player.country}</span>
                    <div>
                      <div className="font-mono font-semibold text-foreground">{player.name}</div>
                      <div className="text-xs font-mono text-muted-foreground">{player.points.toLocaleString()} pts</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-mono ${
                    player.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {player.trend}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;

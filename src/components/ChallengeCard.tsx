import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ChallengeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  points: number;
  solves: number;
  index: number;
}

const difficultyColors = {
  Easy: "text-green-400 border-green-400/30 bg-green-400/5",
  Medium: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  Hard: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  Insane: "text-red-400 border-red-400/30 bg-red-400/5",
};

const ChallengeCard = ({
  title,
  description,
  icon: Icon,
  difficulty,
  points,
  solves,
  index,
}: ChallengeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--neon-green)/0.1)]"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 group-hover:glow transition-all">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${difficultyColors[difficulty]}`}
          >
            {difficulty}
          </span>
        </div>

        {/* Content */}
        <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-gradient transition-all">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground">
              <span className="text-primary font-bold">{points}</span> pts
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              <span className="text-neon-cyan font-bold">{solves}</span> solves
            </span>
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Attempt →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeCard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Globe, Lock, Binary, Search, Skull, Code, HelpCircle,
  Target, Trophy, CheckCircle, TrendingUp
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CategoryStats {
  category: string;
  total: number;
  solved: number;
  points: number;
  solvedPoints: number;
  challenges: {
    id: string;
    title: string;
    difficulty: string;
    points: number;
    solved: boolean;
    solves: number;
  }[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  web: <Globe className="h-6 w-6" />,
  crypto: <Lock className="h-6 w-6" />,
  reverse: <Binary className="h-6 w-6" />,
  forensics: <Search className="h-6 w-6" />,
  pwn: <Skull className="h-6 w-6" />,
  scripting: <Code className="h-6 w-6" />,
  misc: <HelpCircle className="h-6 w-6" />,
};

const categoryDescriptions: Record<string, string> = {
  web: "Web application security, XSS, SQL injection, and more",
  crypto: "Cryptography, encoding, ciphers, and encryption challenges",
  reverse: "Reverse engineering binaries and understanding code",
  forensics: "Digital forensics, file analysis, and investigation",
  pwn: "Binary exploitation, buffer overflows, and memory corruption",
  scripting: "Programming challenges and automation tasks",
  misc: "Miscellaneous challenges that don't fit other categories",
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  web: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  crypto: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  reverse: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/30" },
  forensics: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/30" },
  pwn: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
  scripting: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  misc: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" },
};

const difficultyColors: Record<string, string> = {
  easy: "text-green-400 bg-green-500/10 border-green-500/30",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  hard: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  insane: "text-red-400 bg-red-500/10 border-red-500/30",
};

const Categories = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      // Use the secure public view that excludes flags
      const { data: challenges } = await supabase
        .from("challenges_public")
        .select("id, title, category, difficulty, points, solves");

      if (!challenges) {
        setLoading(false);
        return;
      }

      // Fetch user's solved challenges if logged in
      let solvedIds = new Set<string>();
      if (user) {
        const { data: submissions } = await supabase
          .from("submissions")
          .select("challenge_id")
          .eq("user_id", user.id)
          .eq("is_correct", true);

        if (submissions) {
          solvedIds = new Set(submissions.map((s) => s.challenge_id));
        }
      }

      // Group by category
      const categories = ["web", "crypto", "reverse", "forensics", "pwn", "scripting", "misc"];
      const stats: CategoryStats[] = categories.map((cat) => {
        const catChallenges = challenges.filter((c) => c.category === cat);
        const solvedChallenges = catChallenges.filter((c) => solvedIds.has(c.id));
        
        return {
          category: cat,
          total: catChallenges.length,
          solved: solvedChallenges.length,
          points: catChallenges.reduce((sum, c) => sum + c.points, 0),
          solvedPoints: solvedChallenges.reduce((sum, c) => sum + c.points, 0),
          challenges: catChallenges.map((c) => ({
            id: c.id,
            title: c.title,
            difficulty: c.difficulty,
            points: c.points,
            solved: solvedIds.has(c.id),
            solves: c.solves || 0,
          })).sort((a, b) => {
            const diffOrder = { easy: 0, medium: 1, hard: 2, insane: 3 };
            return (diffOrder[a.difficulty as keyof typeof diffOrder] || 0) - 
                   (diffOrder[b.difficulty as keyof typeof diffOrder] || 0);
          }),
        };
      }).filter((s) => s.total > 0);

      setCategoryStats(stats);
      setLoading(false);
    };

    fetchCategoryStats();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const totalChallenges = categoryStats.reduce((sum, s) => sum + s.total, 0);
  const totalSolved = categoryStats.reduce((sum, s) => sum + s.solved, 0);
  const totalPoints = categoryStats.reduce((sum, s) => sum + s.points, 0);
  const totalSolvedPoints = categoryStats.reduce((sum, s) => sum + s.solvedPoints, 0);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Challenge Categories</h1>
          <p className="text-muted-foreground font-mono text-sm">Track your progress across different challenge types</p>
        </motion.div>

        {/* Overall Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="font-display text-2xl font-bold text-foreground">{totalChallenges}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase">Total Challenges</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="font-display text-2xl font-bold text-green-400">{totalSolved}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase">Solved</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="font-display text-2xl font-bold text-yellow-400">{totalSolvedPoints}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div className="font-display text-2xl font-bold text-secondary">
                {totalChallenges > 0 ? Math.round((totalSolved / totalChallenges) * 100) : 0}%
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase">Completion</div>
            </div>
          </div>
          <div className="mt-6">
            <Progress value={totalChallenges > 0 ? (totalSolved / totalChallenges) * 100 : 0} className="h-2" />
          </div>
        </motion.div>

        {/* Category Cards */}
        <div className="grid gap-4">
          {categoryStats.map((stat, index) => {
            const colors = categoryColors[stat.category] || categoryColors.misc;
            const isExpanded = expandedCategory === stat.category;
            const percentage = stat.total > 0 ? Math.round((stat.solved / stat.total) * 100) : 0;

            return (
              <motion.div
                key={stat.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div
                  className={`rounded-xl border ${colors.border} ${colors.bg} transition-all cursor-pointer`}
                  onClick={() => setExpandedCategory(isExpanded ? null : stat.category)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`${colors.text}`}>
                          {categoryIcons[stat.category]}
                        </div>
                        <div>
                          <h3 className={`font-display text-xl font-bold ${colors.text} uppercase`}>
                            {stat.category}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {categoryDescriptions[stat.category]}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl font-bold text-foreground">
                          {stat.solved}/{stat.total}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {stat.solvedPoints}/{stat.points} pts
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-mono">Progress</span>
                        <span className={`font-mono ${colors.text}`}>{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>

                  {/* Expanded Challenge List */}
                  {isExpanded && (
                    <div className="border-t border-border/50 p-4 bg-background/50">
                      <div className="space-y-2">
                        {stat.challenges.map((challenge) => (
                          <div
                            key={challenge.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/challenges/${challenge.id}`);
                            }}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              challenge.solved
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-border bg-muted/30"
                            } hover:border-primary/50 transition-colors cursor-pointer`}
                          >
                            <div className="flex items-center gap-3">
                              {challenge.solved && (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              )}
                              <div>
                                <div className="font-mono font-semibold text-foreground">
                                  {challenge.title}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className={`px-2 py-0.5 rounded ${difficultyColors[challenge.difficulty]}`}>
                                    {challenge.difficulty}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {challenge.solves} solves
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="font-display font-bold text-primary">
                              {challenge.points} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {categoryStats.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">No Challenges Yet</h3>
            <p className="text-muted-foreground font-mono">Challenges will appear here once they're added.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Categories;

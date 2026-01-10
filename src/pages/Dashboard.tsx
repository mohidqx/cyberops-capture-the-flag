import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Trophy, Flame, TrendingUp, Clock, CheckCircle } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Submission {
  id: string;
  is_correct: boolean;
  points_awarded: number;
  created_at: string;
  challenges: {
    title: string;
    category: string;
  } | null;
}

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    solvedChallenges: 0,
    rank: 0,
    streak: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch recent submissions
      const { data: submissions } = await supabase
        .from("submissions")
        .select("id, is_correct, points_awarded, created_at, challenges(title, category)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (submissions) {
        setRecentSubmissions(submissions as Submission[]);
      }

      // Fetch challenge count
      const { count: totalCount } = await supabase
        .from("challenges")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Calculate rank
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, total_points")
        .order("total_points", { ascending: false });

      const userRank = allProfiles?.findIndex((p) => p.id === profile?.id) ?? -1;

      setStats({
        totalChallenges: totalCount || 0,
        solvedChallenges: profile?.challenges_solved || 0,
        rank: userRank + 1,
        streak: 7, // Placeholder
      });
    };

    fetchData();
  }, [user, profile]);

  const statCards = [
    {
      label: "Total Points",
      value: profile?.total_points || 0,
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      label: "Challenges Solved",
      value: `${stats.solvedChallenges}/${stats.totalChallenges}`,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Global Rank",
      value: stats.rank > 0 ? `#${stats.rank}` : "-",
      icon: TrendingUp,
      color: "text-neon-cyan",
      bgColor: "bg-neon-cyan/10",
    },
    {
      label: "Day Streak",
      value: stats.streak,
      icon: Flame,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Welcome back, <span className="text-gradient">{profile?.username || "Hacker"}</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Ready to hack some challenges?
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="font-display text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </h2>

            {recentSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-mono text-sm">
                  No submissions yet. Start hacking!
                </p>
                <Link
                  to="/challenges"
                  className="inline-block mt-4 text-primary hover:underline font-mono text-sm"
                >
                  View Challenges →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          submission.is_correct
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {submission.is_correct ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Target className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold">
                          {submission.challenges?.title || "Unknown Challenge"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {submission.challenges?.category}
                        </p>
                      </div>
                    </div>
                    {submission.is_correct && (
                      <span className="text-xs font-mono text-primary">
                        +{submission.points_awarded} pts
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/challenges"
                className="p-4 rounded-lg border border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <Target className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-display font-bold text-foreground">Challenges</h3>
                <p className="text-xs text-muted-foreground">Solve CTF challenges</p>
              </Link>
              <Link
                to="/leaderboard"
                className="p-4 rounded-lg border border-border bg-muted/30 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-colors group"
              >
                <Trophy className="h-8 w-8 text-neon-cyan mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-display font-bold text-foreground">Leaderboard</h3>
                <p className="text-xs text-muted-foreground">View global rankings</p>
              </Link>
              <Link
                to="/teams"
                className="p-4 rounded-lg border border-border bg-muted/30 hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors group"
              >
                <motion.div className="h-8 w-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform flex items-center justify-center font-display font-bold text-lg">
                  👥
                </motion.div>
                <h3 className="font-display font-bold text-foreground">Teams</h3>
                <p className="text-xs text-muted-foreground">Join or create a team</p>
              </Link>
              <Link
                to="/writeups"
                className="p-4 rounded-lg border border-border bg-muted/30 hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors group"
              >
                <motion.div className="h-8 w-8 text-orange-400 mb-2 group-hover:scale-110 transition-transform flex items-center justify-center font-display font-bold text-lg">
                  📝
                </motion.div>
                <h3 className="font-display font-bold text-foreground">Writeups</h3>
                <p className="text-xs text-muted-foreground">Share your solutions</p>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

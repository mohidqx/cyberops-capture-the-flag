import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Globe, Lock, Binary, Search as SearchIcon, Server, FileCode, Sparkles } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  solves: number;
  is_active: boolean;
}

const categoryIcons: Record<string, any> = {
  web: Globe,
  crypto: Lock,
  reverse: Binary,
  forensics: SearchIcon,
  pwn: Server,
  scripting: FileCode,
  misc: Sparkles,
};

const difficultyColors: Record<string, string> = {
  easy: "text-green-400 border-green-400/30 bg-green-400/5",
  medium: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  hard: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  insane: "text-red-400 border-red-400/30 bg-red-400/5",
};

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .order("points", { ascending: true });

      if (data) {
        setChallenges(data);
      }

      if (user) {
        const { data: submissions } = await supabase
          .from("submissions")
          .select("challenge_id")
          .eq("user_id", user.id)
          .eq("is_correct", true);

        if (submissions) {
          setSolvedIds(new Set(submissions.map((s) => s.challenge_id)));
        }
      }

      setLoading(false);
    };

    fetchChallenges();
  }, [user]);

  const categories = ["all", ...Array.from(new Set(challenges.map((c) => c.category)))];

  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Challenges
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Solve challenges to earn points and climb the leaderboard
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search challenges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <p className="text-muted-foreground font-mono">No challenges found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((challenge, index) => {
              const Icon = categoryIcons[challenge.category] || Sparkles;
              const isSolved = solvedIds.has(challenge.id);

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/challenges/${challenge.id}`}
                    className={`block p-6 rounded-xl border bg-card hover:border-primary/50 transition-all group ${
                      isSolved ? "border-green-500/30 bg-green-500/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${isSolved ? "bg-green-500/20" : "bg-primary/10"}`}>
                        <Icon className={`h-6 w-6 ${isSolved ? "text-green-400" : "text-primary"}`} />
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${
                          difficultyColors[challenge.difficulty]
                        }`}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-gradient transition-all">
                      {challenge.title}
                      {isSolved && <span className="ml-2 text-green-400">✓</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {challenge.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-xs font-mono text-muted-foreground capitalize">
                        {challenge.category}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono">
                          <span className="text-primary font-bold">{challenge.points}</span> pts
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {challenge.solves} solves
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Challenges;

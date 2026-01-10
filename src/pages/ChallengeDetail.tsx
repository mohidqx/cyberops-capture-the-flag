import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Flag, Lightbulb, Download, CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  flag: string;
  hints: string[];
  files: string[];
  solves: number;
}

const difficultyColors: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-orange-400",
  insane: "text-red-400",
};

const ChallengeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [showHints, setShowHints] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) return;

      const { data } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (data) {
        setChallenge(data);
        setShowHints(new Array(data.hints?.length || 0).fill(false));
      }

      if (user) {
        const { data: submission } = await supabase
          .from("submissions")
          .select("id")
          .eq("user_id", user.id)
          .eq("challenge_id", id)
          .eq("is_correct", true)
          .maybeSingle();

        if (submission) {
          setIsSolved(true);
        }
      }

      setLoading(false);
    };

    fetchChallenge();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !challenge || isSolved) return;

    setSubmitting(true);

    const isCorrect = flag.trim() === challenge.flag;

    // Record submission
    await supabase.from("submissions").insert({
      user_id: user.id,
      challenge_id: challenge.id,
      submitted_flag: flag,
      is_correct: isCorrect,
      points_awarded: isCorrect ? challenge.points : 0,
    });

    if (isCorrect) {
      // Update user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_points, challenges_solved")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            total_points: profile.total_points + challenge.points,
            challenges_solved: profile.challenges_solved + 1,
          })
          .eq("user_id", user.id);
      }

      // Update challenge solves
      await supabase
        .from("challenges")
        .update({ solves: challenge.solves + 1 })
        .eq("id", challenge.id);

      setIsSolved(true);
      toast.success(`Correct! +${challenge.points} points`);
      await refreshProfile();
    } else {
      toast.error("Incorrect flag. Try again!");
    }

    setFlag("");
    setSubmitting(false);
  };

  const toggleHint = (index: number) => {
    setShowHints((prev) => {
      const newHints = [...prev];
      newHints[index] = !newHints[index];
      return newHints;
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!challenge) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground font-mono">Challenge not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/challenges")}>
            Back to Challenges
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/challenges")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Challenges
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {challenge.category}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className={`text-xs font-mono uppercase tracking-wider ${difficultyColors[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                {challenge.title}
                {isSolved && <CheckCircle className="h-6 w-6 text-green-400" />}
              </h1>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold text-primary">
                {challenge.points}
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                points
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {challenge.description}
            </p>
          </div>

          {/* Files */}
          {challenge.files && challenge.files.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display text-lg font-bold text-foreground mb-3">
                Files
              </h3>
              <div className="flex flex-wrap gap-2">
                {challenge.files.map((file, index) => (
                  <a
                    key={index}
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted/30 hover:border-primary/50 transition-colors"
                  >
                    <Download className="h-4 w-4 text-primary" />
                    <span className="text-sm font-mono">File {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Hints */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display text-lg font-bold text-foreground mb-3">
                Hints
              </h3>
              <div className="space-y-2">
                {challenge.hints.map((hint, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-muted/30"
                  >
                    <button
                      onClick={() => toggleHint(index)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="flex items-center gap-2 text-sm font-mono">
                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                        Hint {index + 1}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {showHints[index] ? "Hide" : "Reveal"}
                      </span>
                    </button>
                    {showHints[index] && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground">
                        {hint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flag Submission */}
          {isSolved ? (
            <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h3 className="font-display text-xl font-bold text-green-400 mb-1">
                Challenge Completed!
              </h3>
              <p className="text-sm text-muted-foreground">
                You've already solved this challenge
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display text-lg font-bold text-foreground">
                Submit Flag
              </h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Flag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="cyberops{...}"
                    className="pl-10 bg-input border-border font-mono"
                    required
                  />
                </div>
                <Button type="submit" variant="hero" disabled={submitting}>
                  {submitting ? "Checking..." : "Submit"}
                </Button>
              </div>
            </form>
          )}

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-mono">{challenge.solves} solves</span>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ChallengeDetail;

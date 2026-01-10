import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Flag, Lightbulb, Download, CheckCircle, Lock, Coins } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  flag: string;
  hints: string[];
  hint_costs: number[];
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
  const { user, profile, refreshProfile } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState<Set<number>>(new Set());
  const [hintToUnlock, setHintToUnlock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChallenge = async () => {
    if (!id) return;

    const { data } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (data) {
      setChallenge(data as Challenge);
    }

    if (user) {
      // Check if solved
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

      // Get unlocked hints
      const { data: unlocks } = await supabase
        .from("hint_unlocks")
        .select("hint_index")
        .eq("user_id", user.id)
        .eq("challenge_id", id);

      if (unlocks) {
        setUnlockedHints(new Set(unlocks.map((u) => u.hint_index)));
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchChallenge();
  }, [id, user]);

  const handleUnlockHint = async (index: number) => {
    if (!user || !challenge || !profile) return;

    const cost = challenge.hint_costs?.[index] || 0;

    if (profile.total_points < cost) {
      toast.error(`Not enough points! You need ${cost} pts`);
      return;
    }

    // Deduct points
    await supabase
      .from("profiles")
      .update({ total_points: profile.total_points - cost })
      .eq("user_id", user.id);

    // Record unlock
    await supabase.from("hint_unlocks").insert({
      user_id: user.id,
      challenge_id: challenge.id,
      hint_index: index,
      points_spent: cost,
    });

    setUnlockedHints((prev) => new Set([...prev, index]));
    setHintToUnlock(null);
    await refreshProfile();
    toast.success(`Hint unlocked! -${cost} pts`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !challenge || isSolved) return;

    setSubmitting(true);

    const isCorrect = flag.trim() === challenge.flag;

    // Check for first blood
    let isFirstBlood = false;
    if (isCorrect) {
      const { count } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("challenge_id", challenge.id)
        .eq("is_correct", true);

      isFirstBlood = count === 0;
    }

    // Record submission
    await supabase.from("submissions").insert({
      user_id: user.id,
      challenge_id: challenge.id,
      submitted_flag: flag,
      is_correct: isCorrect,
      points_awarded: isCorrect ? challenge.points : 0,
      is_first_blood: isFirstBlood,
    });

    if (isCorrect) {
      // Update user profile
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("total_points, challenges_solved")
        .eq("user_id", user.id)
        .single();

      if (currentProfile) {
        await supabase
          .from("profiles")
          .update({
            total_points: currentProfile.total_points + challenge.points,
            challenges_solved: currentProfile.challenges_solved + 1,
          })
          .eq("user_id", user.id);
      }

      // Update challenge solves
      await supabase
        .from("challenges")
        .update({ solves: challenge.solves + 1 })
        .eq("id", challenge.id);

      setIsSolved(true);
      
      if (isFirstBlood) {
        toast.success(`🩸 FIRST BLOOD! +${challenge.points} points!`);
      } else {
        toast.success(`Correct! +${challenge.points} points`);
      }
      
      await refreshProfile();
    } else {
      toast.error("Incorrect flag. Try again!");
    }

    setFlag("");
    setSubmitting(false);
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
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/challenges")}>
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
            <p className="text-muted-foreground whitespace-pre-wrap">{challenge.description}</p>
          </div>

          {/* Files */}
          {challenge.files && challenge.files.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Files</h3>
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

          {/* Hints with point cost */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Hints
              </h3>
              <div className="space-y-2">
                {challenge.hints.map((hint, index) => {
                  const isUnlocked = unlockedHints.has(index) || isSolved;
                  const cost = challenge.hint_costs?.[index] || 0;

                  return (
                    <div
                      key={index}
                      className={`rounded-lg border ${
                        isUnlocked
                          ? "border-yellow-500/30 bg-yellow-500/5"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      {isUnlocked ? (
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2 text-yellow-400 text-sm font-mono">
                            <Lightbulb className="h-4 w-4" />
                            Hint {index + 1}
                          </div>
                          <p className="text-sm text-foreground">{hint}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setHintToUnlock(index)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                        >
                          <span className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            Hint {index + 1}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-mono text-primary">
                            <Coins className="h-3 w-3" />
                            {cost} pts to unlock
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
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
              <h3 className="font-display text-lg font-bold text-foreground">Submit Flag</h3>
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
            <span className="font-mono flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Your points: {profile?.total_points || 0}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Hint unlock confirmation dialog */}
      <AlertDialog open={hintToUnlock !== null} onOpenChange={() => setHintToUnlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Unlock Hint?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cost you{" "}
              <span className="text-primary font-bold">
                {hintToUnlock !== null ? challenge.hint_costs?.[hintToUnlock] || 0 : 0} points
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => hintToUnlock !== null && handleUnlockHint(hintToUnlock)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Unlock Hint
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default ChallengeDetail;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, CheckCircle, Clock, Eye } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Writeup {
  id: string;
  title: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  challenges: { title: string; category: string } | null;
  profiles: { username: string } | null;
}

interface SolvedChallenge {
  id: string;
  title: string;
  category: string;
}

const Writeups = () => {
  const { profile, user } = useAuth();
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [myWriteups, setMyWriteups] = useState<Writeup[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<SolvedChallenge[]>([]);
  const [selectedWriteup, setSelectedWriteup] = useState<Writeup | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [newWriteup, setNewWriteup] = useState({
    challenge_id: "",
    title: "",
    content: "",
  });

  const fetchData = async () => {
    // Fetch approved writeups
    const { data: approved } = await supabase
      .from("writeups")
      .select("*, challenges(title, category), profiles(username)")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (approved) setWriteups(approved as Writeup[]);

    // Fetch my writeups
    if (profile) {
      const { data: mine } = await supabase
        .from("writeups")
        .select("*, challenges(title, category), profiles(username)")
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false });

      if (mine) setMyWriteups(mine as Writeup[]);
    }

    // Fetch solved challenges for submission
    if (user) {
      const { data: submissions } = await supabase
        .from("submissions")
        .select("challenge_id, challenges(id, title, category)")
        .eq("user_id", user.id)
        .eq("is_correct", true);

      if (submissions) {
        const solved = submissions
          .filter((s) => s.challenges)
          .map((s) => ({
            id: s.challenges!.id,
            title: s.challenges!.title,
            category: s.challenges!.category,
          }));
        setSolvedChallenges(solved);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [profile, user]);

  const submitWriteup = async () => {
    if (!profile || !newWriteup.challenge_id || !newWriteup.title || !newWriteup.content) {
      toast.error("Please fill all fields");
      return;
    }

    const { error } = await supabase.from("writeups").insert({
      challenge_id: newWriteup.challenge_id,
      author_id: profile.id,
      title: newWriteup.title,
      content: newWriteup.content,
      is_approved: false,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Writeup submitted for review!");
    setNewWriteup({ challenge_id: "", title: "", content: "" });
    setDialogOpen(false);
    fetchData();
  };

  const WriteupCard = ({ writeup, showStatus = false }: { writeup: Writeup; showStatus?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
      onClick={() => setSelectedWriteup(writeup)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-2 py-1 rounded bg-muted">
            {writeup.challenges?.category}
          </span>
          {showStatus && (
            <span
              className={`text-xs font-mono uppercase tracking-wider px-2 py-1 rounded ${
                writeup.is_approved
                  ? "bg-green-500/10 text-green-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {writeup.is_approved ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Approved
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Pending
                </span>
              )}
            </span>
          )}
        </div>
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mb-2">{writeup.title}</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Challenge: {writeup.challenges?.title}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">By {writeup.profiles?.username}</span>
        <span>{new Date(writeup.created_at).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Writeups</h1>
            <p className="text-muted-foreground font-mono text-sm">
              Share and learn from challenge solutions
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" disabled={solvedChallenges.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Submit Writeup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">Submit a Writeup</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Challenge
                  </Label>
                  <Select
                    value={newWriteup.challenge_id}
                    onValueChange={(v) => setNewWriteup({ ...newWriteup, challenge_id: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a solved challenge" />
                    </SelectTrigger>
                    <SelectContent>
                      {solvedChallenges.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title} ({c.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Title
                  </Label>
                  <Input
                    className="mt-2"
                    value={newWriteup.title}
                    onChange={(e) => setNewWriteup({ ...newWriteup, title: e.target.value })}
                    placeholder="My approach to solving..."
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Content (Markdown supported)
                  </Label>
                  <Textarea
                    className="mt-2 min-h-[300px] font-mono text-sm"
                    value={newWriteup.content}
                    onChange={(e) => setNewWriteup({ ...newWriteup, content: e.target.value })}
                    placeholder="## Overview&#10;&#10;Describe your approach...&#10;&#10;## Solution&#10;&#10;```python&#10;# Your code here&#10;```&#10;&#10;## Flag&#10;&#10;`cyberops{...}`"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="hero" onClick={submitWriteup}>
                    Submit for Review
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <Tabs defaultValue="approved" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="approved" className="font-mono uppercase tracking-wider">
              <FileText className="mr-2 h-4 w-4" />
              Published ({writeups.length})
            </TabsTrigger>
            <TabsTrigger value="mine" className="font-mono uppercase tracking-wider">
              <Eye className="mr-2 h-4 w-4" />
              My Writeups ({myWriteups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approved">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : writeups.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-mono">
                  No published writeups yet. Be the first to share your solutions!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {writeups.map((writeup) => (
                  <WriteupCard key={writeup.id} writeup={writeup} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mine">
            {myWriteups.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground font-mono">
                  You haven't submitted any writeups yet.
                  {solvedChallenges.length > 0
                    ? " Share your solutions!"
                    : " Solve challenges first to submit writeups."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myWriteups.map((writeup) => (
                  <WriteupCard key={writeup.id} writeup={writeup} showStatus />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Writeup Detail Modal */}
        <Dialog open={!!selectedWriteup} onOpenChange={() => setSelectedWriteup(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedWriteup && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-2 py-1 rounded bg-muted">
                      {selectedWriteup.challenges?.category}
                    </span>
                  </div>
                  <DialogTitle className="font-display text-2xl">
                    {selectedWriteup.title}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Challenge: {selectedWriteup.challenges?.title} • By{" "}
                    {selectedWriteup.profiles?.username}
                  </p>
                </DialogHeader>
                <div className="mt-4 prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap font-mono text-sm text-foreground bg-muted/30 p-6 rounded-lg">
                    {selectedWriteup.content}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Writeups;

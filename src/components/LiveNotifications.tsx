import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, X, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: "solve" | "challenge";
  message: string;
  timestamp: Date;
}

const LiveNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;

    // Subscribe to new correct submissions
    const submissionsChannel = supabase
      .channel("live-solves")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: "is_correct=eq.true",
        },
        async (payload) => {
          const submission = payload.new as any;
          
          // Fetch user and challenge info
          const [{ data: profile }, { data: challenge }] = await Promise.all([
            supabase.from("profiles").select("username").eq("user_id", submission.user_id).single(),
            supabase.from("challenges").select("title, points").eq("id", submission.challenge_id).single(),
          ]);

          if (profile && challenge) {
            const notification: Notification = {
              id: crypto.randomUUID(),
              type: "solve",
              message: `🎯 ${profile.username} solved "${challenge.title}" for ${challenge.points} pts!`,
              timestamp: new Date(),
            };
            setNotifications((prev) => [notification, ...prev].slice(0, 5));
          }
        }
      )
      .subscribe();

    // Subscribe to new challenges
    const challengesChannel = supabase
      .channel("new-challenges")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "challenges",
        },
        (payload) => {
          const challenge = payload.new as any;
          const notification: Notification = {
            id: crypto.randomUUID(),
            type: "challenge",
            message: `🆕 New challenge: "${challenge.title}" (${challenge.points} pts)`,
            timestamp: new Date(),
          };
          setNotifications((prev) => [notification, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(challengesChannel);
    };
  }, [isEnabled]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    // Auto-remove notifications after 8 seconds
    const timer = setInterval(() => {
      setNotifications((prev) =>
        prev.filter((n) => Date.now() - n.timestamp.getTime() < 8000)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {/* Toggle button */}
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`self-end p-2 rounded-lg border transition-colors ${
          isEnabled
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-muted border-border text-muted-foreground"
        }`}
        title={isEnabled ? "Disable notifications" : "Enable notifications"}
      >
        <Bell className="h-4 w-4" />
      </button>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`relative p-4 rounded-xl border backdrop-blur-xl shadow-lg ${
              notification.type === "solve"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-primary/10 border-primary/30"
            }`}
          >
            <button
              onClick={() => removeNotification(notification.id)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="flex items-start gap-3 pr-4">
              <div
                className={`p-2 rounded-lg ${
                  notification.type === "solve"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-primary/20 text-primary"
                }`}
              >
                {notification.type === "solve" ? (
                  <Trophy className="h-4 w-4" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
              </div>
              <p className="text-sm font-mono text-foreground">
                {notification.message}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LiveNotifications;

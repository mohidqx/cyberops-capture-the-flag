import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, Clock, X, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SecurityNotification {
  id: string;
  type: "manipulation" | "rate_limit" | "admin_action";
  message: string;
  details: string;
  timestamp: Date;
  severity: "warning" | "critical";
}

const AdminSecurityNotifications = () => {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;

    // Subscribe to audit_logs for security events
    const channel = supabase
      .channel("admin-security-alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_logs",
        },
        async (payload) => {
          const log = payload.new as any;
          
          // Only alert on suspicious events
          if (!["SCORE_MANIPULATION_BLOCKED", "RATE_LIMIT_HIT", "ADMIN_SCORE_RESET"].includes(log.event_type)) {
            return;
          }

          // Fetch user info if available
          let username = "Unknown";
          if (log.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("user_id", log.user_id)
              .single();
            if (profile) username = profile.username;
          }

          let notification: SecurityNotification;
          const details = log.details || {};

          if (log.event_type === "SCORE_MANIPULATION_BLOCKED") {
            notification = {
              id: log.id,
              type: "manipulation",
              message: `⚠️ Score manipulation blocked for ${username}`,
              details: `Attempted: ${details.attempted_points}pts → Actual: ${details.actual_points}pts`,
              timestamp: new Date(),
              severity: "critical",
            };
            
            // Also show a persistent toast for critical events
            toast.error(`Score manipulation blocked!`, {
              description: `${username} tried to change their score from ${details.actual_points} to ${details.attempted_points}`,
              duration: 10000,
            });
          } else if (log.event_type === "RATE_LIMIT_HIT") {
            notification = {
              id: log.id,
              type: "rate_limit",
              message: `🚫 Rate limit triggered by ${username}`,
              details: `${details.attempts || "Multiple"} attempts blocked`,
              timestamp: new Date(),
              severity: "warning",
            };
          } else {
            // ADMIN_SCORE_RESET
            const targetUsername = details.username || "a user";
            notification = {
              id: log.id,
              type: "admin_action",
              message: `🔧 Admin reset scores for ${targetUsername}`,
              details: `${details.old_points}pts → ${details.new_points}pts`,
              timestamp: new Date(),
              severity: "warning",
            };
          }

          setNotifications((prev) => [notification, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isEnabled]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    // Auto-remove notifications after 15 seconds
    const timer = setInterval(() => {
      setNotifications((prev) =>
        prev.filter((n) => Date.now() - n.timestamp.getTime() < 15000)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getIcon = (type: SecurityNotification["type"]) => {
    switch (type) {
      case "manipulation":
        return AlertTriangle;
      case "rate_limit":
        return Clock;
      case "admin_action":
        return Shield;
      default:
        return ShieldAlert;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {/* Toggle button */}
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`self-end p-2 rounded-lg border transition-colors ${
          isEnabled
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-muted border-border text-muted-foreground"
        }`}
        title={isEnabled ? "Disable security alerts" : "Enable security alerts"}
      >
        <ShieldAlert className="h-4 w-4" />
      </button>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`relative p-4 rounded-xl border backdrop-blur-xl shadow-lg ${
                notification.severity === "critical"
                  ? "bg-red-500/15 border-red-500/40"
                  : "bg-yellow-500/10 border-yellow-500/30"
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
                    notification.severity === "critical"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {notification.details}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AdminSecurityNotifications;

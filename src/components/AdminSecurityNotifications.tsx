import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, Clock, X, ShieldAlert, Volume2, VolumeX, Bell, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SecurityNotification {
  id: string;
  type: "manipulation" | "rate_limit" | "admin_action" | "anomaly" | "banned_attempt";
  message: string;
  details: string;
  timestamp: Date;
  severity: "warning" | "critical";
}

const ALERT_SOUND_CRITICAL = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+LkpOQi4OAd3N4gImQk5CIgHdwcHiAipKTkYuEfHZ0d4CJkZKQiYN8dnR3f4iQkpCJg3x2dHd/";
const ALERT_SOUND_WARNING = "data:audio/wav;base64,UklGRl9vT19teleQUklGRl9vT19teleQUklGRl9vT19teleQ";

const AdminSecurityNotifications = () => {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopNotifEnabled, setDesktopNotifEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAlertSound = useCallback((severity: "warning" | "critical") => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (severity === "critical") {
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
      } else {
        oscillator.frequency.setValueAtTime(520, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio not available
    }
  }, [soundEnabled]);

  const sendDesktopNotification = useCallback((title: string, body: string, severity: "warning" | "critical") => {
    if (!desktopNotifEnabled || Notification.permission !== "granted") return;
    try {
      new Notification(title, {
        body,
        icon: severity === "critical" ? "🚨" : "⚠️",
        tag: "cyberops-security",
        requireInteraction: severity === "critical",
      });
    } catch (e) {}
  }, [desktopNotifEnabled]);

  const requestDesktopPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setDesktopNotifEnabled(permission === "granted");
      if (permission === "granted") {
        toast.success("Desktop notifications enabled");
      }
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setDesktopNotifEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    // Subscribe to audit_logs for security events
    const channel = supabase
      .channel("admin-security-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_logs" },
        async (payload) => {
          const log = payload.new as any;
          
          if (!["SCORE_MANIPULATION_BLOCKED", "RATE_LIMIT_HIT", "ADMIN_SCORE_RESET", "USER_BANNED", "BANNED_USER_ATTEMPT"].includes(log.event_type)) {
            return;
          }

          let username = "Unknown";
          if (log.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("user_id", log.user_id)
              .single();
            if (profile) username = profile.username;
          }

          const details = log.details || {};
          let notification: SecurityNotification;

          if (log.event_type === "SCORE_MANIPULATION_BLOCKED") {
            notification = {
              id: log.id,
              type: "manipulation",
              message: `Score manipulation blocked for ${username}`,
              details: `Attempted: ${details.attempted_points}pts → Actual: ${details.actual_points}pts`,
              timestamp: new Date(),
              severity: "critical",
            };
            toast.error(`🚨 Score manipulation blocked!`, {
              description: `${username} tried to change score from ${details.actual_points} to ${details.attempted_points}`,
              duration: 15000,
            });
          } else if (log.event_type === "BANNED_USER_ATTEMPT") {
            notification = {
              id: log.id,
              type: "banned_attempt",
              message: `Banned user ${username} attempted action`,
              details: `Action: ${details.action || 'unknown'}`,
              timestamp: new Date(),
              severity: "critical",
            };
          } else if (log.event_type === "RATE_LIMIT_HIT") {
            notification = {
              id: log.id,
              type: "rate_limit",
              message: `Rate limit triggered by ${username}`,
              details: `${details.attempts || "Multiple"} attempts blocked`,
              timestamp: new Date(),
              severity: "warning",
            };
          } else if (log.event_type === "USER_BANNED") {
            notification = {
              id: log.id,
              type: "admin_action",
              message: `User ${details.username || 'unknown'} has been banned`,
              details: details.reason || "No reason provided",
              timestamp: new Date(),
              severity: "critical",
            };
          } else {
            const targetUsername = details.username || "a user";
            notification = {
              id: log.id,
              type: "admin_action",
              message: `Admin reset scores for ${targetUsername}`,
              details: `${details.old_points}pts → ${details.new_points}pts`,
              timestamp: new Date(),
              severity: "warning",
            };
          }

          playAlertSound(notification.severity);
          sendDesktopNotification(
            `CyberOps Security: ${notification.severity === 'critical' ? '🚨' : '⚠️'}`,
            notification.message,
            notification.severity
          );

          setNotifications((prev) => [notification, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    // Also subscribe to anomaly-like events from user_sessions
    const sessionChannel = supabase
      .channel("admin-session-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_sessions" },
        async (payload) => {
          const session = payload.new as any;
          if (!session.country_name) return;

          // Check if this is from an unusual country for this user
          const { data: recentSessions } = await supabase
            .from("user_sessions")
            .select("country_name")
            .eq("user_id", session.user_id)
            .order("created_at", { ascending: false })
            .limit(20);

          if (!recentSessions || recentSessions.length < 3) return;

          const countryFreq: Record<string, number> = {};
          recentSessions.forEach(s => {
            if (s.country_name) countryFreq[s.country_name] = (countryFreq[s.country_name] || 0) + 1;
          });

          const usualCountries = Object.entries(countryFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([c]) => c);

          if (usualCountries.length >= 2 && !usualCountries.includes(session.country_name)) {
            let username = "Unknown";
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("user_id", session.user_id)
              .single();
            if (profile) username = profile.username;

            const notification: SecurityNotification = {
              id: session.id,
              type: "anomaly",
              message: `Anomalous login detected: ${username}`,
              details: `From ${session.city || session.country_name} — unusual location`,
              timestamp: new Date(),
              severity: "critical",
            };

            playAlertSound("critical");
            sendDesktopNotification(
              "🚨 CyberOps: Anomalous Login",
              `${username} logged in from ${session.country_name}`,
              "critical"
            );
            
            toast.error(`🌍 Anomalous login: ${username}`, {
              description: `From ${session.city || ''}, ${session.country_name}`,
              duration: 15000,
            });

            setNotifications((prev) => [notification, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(sessionChannel);
    };
  }, [isEnabled, playAlertSound, sendDesktopNotification]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications((prev) => prev.filter((n) => Date.now() - n.timestamp.getTime() < 20000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getIcon = (type: SecurityNotification["type"]) => {
    switch (type) {
      case "manipulation": return AlertTriangle;
      case "rate_limit": return Clock;
      case "admin_action": return Shield;
      case "anomaly": return MapPin;
      case "banned_attempt": return ShieldAlert;
      default: return ShieldAlert;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {/* Controls */}
      <div className="self-end flex items-center gap-1.5">
        {!desktopNotifEnabled && "Notification" in window && (
          <button
            onClick={requestDesktopPermission}
            className="p-2 rounded-lg glass border-border/30 text-muted-foreground hover:text-primary transition-colors"
            title="Enable desktop notifications"
          >
            <Bell className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg glass border-border/30 transition-colors ${
            soundEnabled ? "text-primary" : "text-muted-foreground"
          }`}
          title={soundEnabled ? "Mute alerts" : "Unmute alerts"}
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`p-2 rounded-lg glass transition-colors ${
            isEnabled
              ? "border-destructive/30 text-destructive"
              : "border-border/30 text-muted-foreground"
          }`}
          title={isEnabled ? "Disable security alerts" : "Enable security alerts"}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
        </button>
      </div>

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
              className={`relative p-4 rounded-xl glass shadow-elevated ${
                notification.severity === "critical"
                  ? "border-destructive/40 shadow-[0_0_20px_hsl(var(--destructive)/0.15)]"
                  : "border-neon-orange/30"
              }`}
            >
              <button
                onClick={() => removeNotification(notification.id)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="flex items-start gap-3 pr-4">
                <div className={`p-2 rounded-lg ${
                  notification.severity === "critical"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-neon-orange/15 text-neon-orange"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {notification.severity === "critical" ? "🚨 " : "⚠️ "}
                    {notification.message}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-1 truncate">
                    {notification.details}
                  </p>
                </div>
              </div>
              {/* Progress bar showing auto-dismiss */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 20, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-[2px] rounded-b-xl ${
                  notification.severity === "critical" ? "bg-destructive/50" : "bg-neon-orange/50"
                }`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AdminSecurityNotifications;

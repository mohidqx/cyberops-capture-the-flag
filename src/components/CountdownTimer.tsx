import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CompetitionSettings {
  name: string;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean | null;
}

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [status, setStatus] = useState<"upcoming" | "active" | "ended">("upcoming");
  const [settings, setSettings] = useState<CompetitionSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("competition_settings")
        .select("name, start_time, end_time, is_active")
        .limit(1)
        .single();

      if (data) {
        setSettings(data);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const startTime = settings.start_time ? new Date(settings.start_time).getTime() : null;
      const endTime = settings.end_time ? new Date(settings.end_time).getTime() : null;

      // Determine status and target time
      if (startTime && now < startTime) {
        // Competition hasn't started
        setStatus("upcoming");
        const difference = startTime - now;
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
      } else if (endTime && now < endTime) {
        // Competition is active
        setStatus("active");
        const difference = endTime - now;
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
      } else {
        // Competition has ended
        setStatus("ended");
        return null;
      }
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [settings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4 animate-pulse" />
        <span className="font-mono text-sm">Loading...</span>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  const statusConfig = {
    upcoming: {
      icon: Clock,
      label: "Competition Starts In",
      color: "text-neon-cyan",
      bgColor: "bg-neon-cyan/10",
      borderColor: "border-neon-cyan/30",
    },
    active: {
      icon: Flame,
      label: "Competition Ends In",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    ended: {
      icon: CheckCircle,
      label: "Competition Ended",
      color: "text-muted-foreground",
      bgColor: "bg-muted/10",
      borderColor: "border-border",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`inline-flex flex-col items-center gap-3 px-6 py-4 rounded-xl border ${config.borderColor} ${config.bgColor} backdrop-blur-sm`}
    >
      <div className={`flex items-center gap-2 ${config.color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-mono uppercase tracking-widest">
          {config.label}
        </span>
      </div>

      {timeLeft ? (
        <div className="flex items-center gap-3">
          {[
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hrs" },
            { value: timeLeft.minutes, label: "Min" },
            { value: timeLeft.seconds, label: "Sec" },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <motion.div
                key={item.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={`font-display text-2xl md:text-3xl font-bold ${config.color}`}
              >
                {String(item.value).padStart(2, "0")}
              </motion.div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="font-display text-xl font-bold text-muted-foreground">
          Thank you for participating!
        </div>
      )}

      {settings.name && (
        <div className="text-xs font-mono text-muted-foreground">
          {settings.name}
        </div>
      )}
    </motion.div>
  );
};

export default CountdownTimer;

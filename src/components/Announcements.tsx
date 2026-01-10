import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, AlertTriangle, Info, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
}

const priorityConfig = {
  low: {
    icon: Info,
    bg: "bg-muted/50",
    border: "border-muted",
    text: "text-muted-foreground",
  },
  normal: {
    icon: Megaphone,
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
  },
  high: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
  },
  urgent: {
    icon: AlertTriangle,
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
  },
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      setAnnouncements(data as Announcement[]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel("announcements-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => fetchAnnouncements()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dismissAnnouncement = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedIds.has(a.id)
  );

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      <AnimatePresence mode="popLayout">
        {visibleAnnouncements.map((announcement) => {
          const config = priorityConfig[announcement.priority];
          const Icon = config.icon;

          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className={`relative p-4 rounded-xl border ${config.bg} ${config.border}`}
            >
              <button
                onClick={() => dismissAnnouncement(announcement.id)}
                className="absolute top-2 right-2 p-1 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="flex items-start gap-3 pr-8">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`h-5 w-5 ${config.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-display font-bold ${config.text}`}>
                    {announcement.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {announcement.content}
                  </p>
                  <span className="text-xs text-muted-foreground/60 mt-2 block">
                    {new Date(announcement.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Announcements;

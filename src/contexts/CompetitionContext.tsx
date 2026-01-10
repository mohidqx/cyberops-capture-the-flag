import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CompetitionSettings {
  id: string;
  name: string;
  is_active: boolean;
  start_time: string | null;
  end_time: string | null;
  freeze_time: string | null;
  decay_enabled: boolean;
  decay_minimum: number;
  team_mode: boolean;
}

interface CompetitionContextType {
  settings: CompetitionSettings | null;
  isCompetitionActive: boolean;
  isScoreboardFrozen: boolean;
  timeRemaining: number | null;
  refreshSettings: () => Promise<void>;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export const CompetitionProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<CompetitionSettings | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("competition_settings")
      .select("*")
      .eq("name", "default")
      .maybeSingle();

    if (data) {
      setSettings(data as CompetitionSettings);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to changes
    const channel = supabase
      .channel("competition-settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "competition_settings" },
        () => fetchSettings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update time remaining
  useEffect(() => {
    if (!settings?.is_active || !settings.end_time) {
      setTimeRemaining(null);
      return;
    }

    const updateTime = () => {
      const end = new Date(settings.end_time!).getTime();
      const now = Date.now();
      const remaining = Math.max(0, end - now);
      setTimeRemaining(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  const isCompetitionActive = Boolean(
    settings?.is_active &&
    (!settings.start_time || new Date(settings.start_time) <= new Date()) &&
    (!settings.end_time || new Date(settings.end_time) > new Date())
  );

  const isScoreboardFrozen = Boolean(
    settings?.is_active &&
    settings.freeze_time &&
    new Date(settings.freeze_time) <= new Date()
  );

  return (
    <CompetitionContext.Provider
      value={{
        settings,
        isCompetitionActive,
        isScoreboardFrozen,
        timeRemaining,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = () => {
  const context = useContext(CompetitionContext);
  if (context === undefined) {
    throw new Error("useCompetition must be used within a CompetitionProvider");
  }
  return context;
};

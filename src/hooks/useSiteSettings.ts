import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  maintenance_mode: { enabled: boolean; message: string };
  feature_toggles: { registration: boolean; leaderboard: boolean; writeups: boolean; teams: boolean; contact_form: boolean };
  branding: { site_name: string; tagline: string; footer_text: string };
}

const DEFAULT_SETTINGS: SiteSettings = {
  maintenance_mode: { enabled: false, message: "" },
  feature_toggles: { registration: true, leaderboard: true, writeups: true, teams: true, contact_form: true },
  branding: { site_name: "CyberOps CTF", tagline: "", footer_text: "" },
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const mapped: Record<string, any> = {};
        data.forEach((row: any) => { mapped[row.key] = row.value; });
        setSettings({
          maintenance_mode: mapped.maintenance_mode || DEFAULT_SETTINGS.maintenance_mode,
          feature_toggles: mapped.feature_toggles || DEFAULT_SETTINGS.feature_toggles,
          branding: mapped.branding || DEFAULT_SETTINGS.branding,
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { settings, loading };
};

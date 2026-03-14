import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Shield, Power, Eye, EyeOff, Users, Trophy, FileText,
  Mail, Globe, Palette, Save, RefreshCw, AlertTriangle, CheckCircle,
  Type, MessageSquare
} from "lucide-react";
import { C2Panel, SectionLabel } from "./C2Shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SiteSettings {
  maintenance_mode: { enabled: boolean; message: string };
  feature_toggles: { registration: boolean; leaderboard: boolean; writeups: boolean; teams: boolean; contact_form: boolean };
  branding: { site_name: string; tagline: string; footer_text: string };
}

export const SiteSettingsModule = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    maintenance_mode: { enabled: false, message: "" },
    feature_toggles: { registration: true, leaderboard: true, writeups: true, teams: true, contact_form: true },
    branding: { site_name: "CyberOps CTF", tagline: "", footer_text: "" },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("toggles");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*");
    if (data) {
      const mapped: any = {};
      data.forEach((row: any) => { mapped[row.key] = row.value; });
      setSettings({
        maintenance_mode: mapped.maintenance_mode || settings.maintenance_mode,
        feature_toggles: mapped.feature_toggles || settings.feature_toggles,
        branding: mapped.branding || settings.branding,
      });
    }
    setLoading(false);
  };

  const saveSetting = async (key: string, value: any) => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error) { toast.error(error.message); }
    else { toast.success(`${key.replace("_", " ")} updated`); }
    setSaving(false);
  };

  const tabs = [
    { id: "toggles", label: "Feature Toggles", icon: Power },
    { id: "maintenance", label: "Maintenance", icon: AlertTriangle },
    { id: "branding", label: "Branding", icon: Palette },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground font-mono text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 rounded-lg border border-border/20 bg-card/20 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "toggles" && (
        <C2Panel title="FEATURE TOGGLES" icon={Power} color="text-primary">
          <div className="p-4 space-y-3">
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs font-mono text-primary">
              <Shield className="w-4 h-4 inline mr-2" />
              Toggle site features on/off. Changes take effect immediately.
            </div>
            {[
              { key: "registration", label: "User Registration", desc: "Allow new users to create accounts", icon: Users },
              { key: "leaderboard", label: "Leaderboard", desc: "Show public leaderboard rankings", icon: Trophy },
              { key: "writeups", label: "Writeups", desc: "Allow users to submit challenge writeups", icon: FileText },
              { key: "teams", label: "Team System", desc: "Enable team creation and management", icon: Users },
              { key: "contact_form", label: "Contact Form", desc: "Show contact form on public site", icon: Mail },
            ].map(feature => (
              <div key={feature.key} className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-background/40 hover:bg-background/50 transition-colors">
                <div className="flex items-center gap-3">
                  <feature.icon className={`w-4 h-4 ${(settings.feature_toggles as any)[feature.key] ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <div className="font-mono text-sm font-semibold">{feature.label}</div>
                    <div className="text-[10px] text-muted-foreground">{feature.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${(settings.feature_toggles as any)[feature.key] ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                  <Switch
                    checked={(settings.feature_toggles as any)[feature.key]}
                    onCheckedChange={(checked) => {
                      const updated = { ...settings.feature_toggles, [feature.key]: checked };
                      setSettings({ ...settings, feature_toggles: updated });
                      saveSetting("feature_toggles", updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "maintenance" && (
        <C2Panel title="MAINTENANCE MODE" icon={AlertTriangle} color="text-neon-orange">
          <div className="p-4 space-y-4">
            <div className={`p-4 rounded-lg border ${settings.maintenance_mode.enabled ? "border-destructive/30 bg-destructive/10" : "border-primary/20 bg-primary/5"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${settings.maintenance_mode.enabled ? "bg-destructive animate-pulse" : "bg-primary"}`} />
                  <span className="font-mono text-sm font-bold">
                    {settings.maintenance_mode.enabled ? "⚠️ MAINTENANCE MODE ACTIVE" : "✅ SITE OPERATIONAL"}
                  </span>
                </div>
                <Switch
                  checked={settings.maintenance_mode.enabled}
                  onCheckedChange={(checked) => {
                    const updated = { ...settings.maintenance_mode, enabled: checked };
                    setSettings({ ...settings, maintenance_mode: updated });
                    saveSetting("maintenance_mode", updated);
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">
                {settings.maintenance_mode.enabled
                  ? "Non-admin users will see the maintenance page instead of the site."
                  : "All users can access the site normally."
                }
              </p>
            </div>

            <div>
              <Label className="text-xs font-mono">Maintenance Message</Label>
              <Textarea
                value={settings.maintenance_mode.message}
                onChange={e => setSettings({ ...settings, maintenance_mode: { ...settings.maintenance_mode, message: e.target.value } })}
                placeholder="We're performing scheduled maintenance..."
                className="min-h-[80px] mt-1"
              />
              <Button
                size="sm"
                className="mt-2 text-xs font-mono"
                disabled={saving}
                onClick={() => saveSetting("maintenance_mode", settings.maintenance_mode)}
              >
                <Save className="w-3 h-3 mr-1" />Save Message
              </Button>
            </div>
          </div>
        </C2Panel>
      )}

      {activeTab === "branding" && (
        <C2Panel title="BRANDING & IDENTITY" icon={Palette} color="text-secondary">
          <div className="p-4 space-y-4">
            <div>
              <Label className="text-xs font-mono">Site Name</Label>
              <Input
                value={settings.branding.site_name}
                onChange={e => setSettings({ ...settings, branding: { ...settings.branding, site_name: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-mono">Tagline</Label>
              <Input
                value={settings.branding.tagline}
                onChange={e => setSettings({ ...settings, branding: { ...settings.branding, tagline: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-mono">Footer Text</Label>
              <Input
                value={settings.branding.footer_text}
                onChange={e => setSettings({ ...settings, branding: { ...settings.branding, footer_text: e.target.value } })}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full text-xs font-mono"
              disabled={saving}
              onClick={() => saveSetting("branding", settings.branding)}
            >
              <Save className="w-3.5 h-3.5 mr-2" />Save Branding
            </Button>
          </div>
        </C2Panel>
      )}
    </div>
  );
};

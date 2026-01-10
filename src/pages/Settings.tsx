import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [country, setCountry] = useState(profile?.country || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ display_name: displayName, bio, country }).eq("user_id", user.id);
    await refreshProfile();
    toast.success("Profile updated!");
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Settings</h1>
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Username</Label>
              <Input value={profile?.username || ""} disabled className="mt-2 bg-muted" />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Display Name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Bio</Label>
              <Input value={bio} onChange={(e) => setBio(e.target.value)} className="mt-2" placeholder="Tell us about yourself..." />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Country</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-2" placeholder="🇺🇸 USA" />
            </div>
            <Button variant="hero" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

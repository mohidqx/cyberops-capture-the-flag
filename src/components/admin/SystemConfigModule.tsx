import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Shield, Lock, Eye, Bell, Palette, Globe, Clock, Zap, Server,
  Database, Wifi, Key, FileText, Mail, Users, Target, AlertTriangle,
  Monitor, Cpu, HardDrive, RefreshCw, Power, Radio, Terminal, Hash,
  Fingerprint, BarChart3, Gauge, Network, Bug, Layers, Bookmark, Save,
  ChevronRight, CheckCircle2, Search, X, Loader2
} from "lucide-react";
import { C2Panel, ConfigToggle, ConfigInput, SectionLabel, ActionBtn } from "./C2Shared";
import { c2Toast, playSound } from "@/lib/adminSounds";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const TABS = [
  { id: "general", label: "General", icon: Settings, color: "text-primary" },
  { id: "security", label: "Security", icon: Shield, color: "text-destructive" },
  { id: "rate", label: "Rate Limits", icon: Gauge, color: "text-neon-orange" },
  { id: "notifications", label: "Notifications", icon: Bell, color: "text-secondary" },
  { id: "scoring", label: "Scoring", icon: Target, color: "text-primary" },
  { id: "challenges", label: "Challenges", icon: Layers, color: "text-neon-cyan" },
  { id: "display", label: "Display", icon: Palette, color: "text-neon-purple" },
  { id: "monitoring", label: "Monitoring", icon: Eye, color: "text-secondary" },
  { id: "storage", label: "Storage", icon: HardDrive, color: "text-neon-orange" },
  { id: "api", label: "API", icon: Network, color: "text-neon-cyan" },
  { id: "backup", label: "Backup", icon: RefreshCw, color: "text-primary" },
  { id: "advanced", label: "Advanced", icon: Bug, color: "text-destructive" },
] as const;

type TabId = typeof TABS[number]["id"];

// Define all settings with metadata for search
interface SettingDef {
  key: string;
  label: string;
  desc: string;
  tab: TabId;
  type: "toggle" | "input";
  inputType?: string;
  color?: string;
  section?: string;
}

const ALL_SETTINGS: SettingDef[] = [
  // General
  { key: "siteName", label: "Site Name", desc: "Platform display name", tab: "general", type: "input" },
  { key: "siteDescription", label: "Site Description", desc: "SEO meta description", tab: "general", type: "input" },
  { key: "maintenanceMode", label: "Maintenance Mode", desc: "Disable public access during maintenance", tab: "general", type: "toggle", color: "destructive" },
  { key: "registrationOpen", label: "Open Registration", desc: "Allow new user sign-ups", tab: "general", type: "toggle" },
  { key: "maxUsersPerTeam", label: "Max Users Per Team", desc: "Maximum team members allowed", tab: "general", type: "input", inputType: "number" },
  { key: "maxTeams", label: "Max Teams", desc: "Maximum number of teams", tab: "general", type: "input", inputType: "number" },
  { key: "defaultTimezone", label: "Default Timezone", desc: "Server timezone for timestamps", tab: "general", type: "input" },
  { key: "defaultLanguage", label: "Default Language", desc: "Platform language code", tab: "general", type: "input" },
  // Security
  { key: "enforceRLS", label: "Enforce RLS", desc: "Row-Level Security on all tables", tab: "security", type: "toggle", color: "destructive", section: "Authentication" },
  { key: "enable2FA", label: "Two-Factor Authentication", desc: "Require 2FA for all users", tab: "security", type: "toggle", section: "Authentication" },
  { key: "enforceStrongPasswords", label: "Strong Passwords", desc: "Enforce minimum complexity", tab: "security", type: "toggle", section: "Authentication" },
  { key: "minPasswordLength", label: "Min Password Length", desc: "Minimum characters required", tab: "security", type: "input", inputType: "number", section: "Authentication" },
  { key: "maxLoginAttempts", label: "Max Login Attempts", desc: "Before account lockout", tab: "security", type: "input", inputType: "number", section: "Authentication" },
  { key: "lockoutDuration", label: "Lockout Duration (min)", desc: "Minutes before unlock", tab: "security", type: "input", inputType: "number", section: "Authentication" },
  { key: "sessionTimeout", label: "Session Timeout (sec)", desc: "Idle timeout before logout", tab: "security", type: "input", inputType: "number", section: "Authentication" },
  { key: "enableCaptcha", label: "CAPTCHA", desc: "Enable CAPTCHA on login/register", tab: "security", type: "toggle", section: "Protection" },
  { key: "enableCSRFProtection", label: "CSRF Protection", desc: "Cross-Site Request Forgery guard", tab: "security", type: "toggle", section: "Protection" },
  { key: "enableXSSProtection", label: "XSS Protection", desc: "Cross-Site Scripting filter", tab: "security", type: "toggle", section: "Protection" },
  { key: "enableSQLInjectionProtection", label: "SQL Injection Guard", desc: "Parameterized query enforcement", tab: "security", type: "toggle", section: "Protection" },
  { key: "contentSecurityPolicy", label: "Content Security Policy", desc: "CSP header value", tab: "security", type: "input", section: "Protection" },
  { key: "corsOrigins", label: "CORS Origins", desc: "Allowed origins (comma-separated)", tab: "security", type: "input", section: "Protection" },
  { key: "ipWhitelistEnabled", label: "IP Whitelist", desc: "Only allow whitelisted IPs", tab: "security", type: "toggle", section: "Geo-Blocking" },
  { key: "geoBlockingEnabled", label: "Geo-Blocking", desc: "Block logins from specific countries", tab: "security", type: "toggle", section: "Geo-Blocking" },
  { key: "blockedCountries", label: "Blocked Countries", desc: "Country codes (comma-separated)", tab: "security", type: "input", section: "Geo-Blocking" },
  // Rate Limiting
  { key: "enableRateLimiting", label: "Enable Rate Limiting", desc: "Global rate limit enforcement", tab: "rate", type: "toggle" },
  { key: "flagSubmitRate", label: "Flag Submit Rate", desc: "Max attempts per window", tab: "rate", type: "input", inputType: "number", section: "Flag Submissions" },
  { key: "flagSubmitWindow", label: "Flag Submit Window (min)", desc: "Time window", tab: "rate", type: "input", inputType: "number", section: "Flag Submissions" },
  { key: "apiRateLimit", label: "API Rate Limit", desc: "Max API calls per window", tab: "rate", type: "input", inputType: "number", section: "API" },
  { key: "apiRateWindow", label: "API Rate Window (sec)", desc: "Time window", tab: "rate", type: "input", inputType: "number", section: "API" },
  { key: "loginRateLimit", label: "Login Rate Limit", desc: "Max login attempts per window", tab: "rate", type: "input", inputType: "number", section: "Authentication" },
  { key: "loginRateWindow", label: "Login Rate Window (min)", desc: "Time window", tab: "rate", type: "input", inputType: "number", section: "Authentication" },
  { key: "registrationRateLimit", label: "Registration Rate", desc: "Max signups per window", tab: "rate", type: "input", inputType: "number", section: "Authentication" },
  { key: "registrationRateWindow", label: "Registration Window (min)", desc: "Time window", tab: "rate", type: "input", inputType: "number", section: "Authentication" },
  // Notifications
  { key: "enableEmailNotifications", label: "Email Notifications", desc: "Send alerts via email", tab: "notifications", type: "toggle", section: "Channels" },
  { key: "enablePushNotifications", label: "Push Notifications", desc: "Browser push notifications", tab: "notifications", type: "toggle", section: "Channels" },
  { key: "enableWebhookNotifications", label: "Webhook Notifications", desc: "POST to external URL", tab: "notifications", type: "toggle", section: "Channels" },
  { key: "webhookUrl", label: "Webhook URL", desc: "POST endpoint", tab: "notifications", type: "input", section: "Channels" },
  { key: "slackWebhookUrl", label: "Slack Webhook", desc: "Slack incoming webhook URL", tab: "notifications", type: "input", section: "Channels" },
  { key: "discordWebhookUrl", label: "Discord Webhook", desc: "Discord webhook URL", tab: "notifications", type: "input", section: "Channels" },
  { key: "notifyOnNewUser", label: "New User", desc: "Alert on sign-ups", tab: "notifications", type: "toggle", section: "Triggers" },
  { key: "notifyOnFlagSubmit", label: "Flag Submit", desc: "Alert on attempts", tab: "notifications", type: "toggle", section: "Triggers" },
  { key: "notifyOnFirstBlood", label: "First Blood", desc: "Alert on first solve", tab: "notifications", type: "toggle", section: "Triggers" },
  { key: "notifyOnBan", label: "User Ban", desc: "Alert on ban", tab: "notifications", type: "toggle", section: "Triggers" },
  { key: "notifyOnAnomaly", label: "Anomaly", desc: "Suspicious login", tab: "notifications", type: "toggle", section: "Triggers" },
  { key: "notifyOnRateLimit", label: "Rate Limit", desc: "Rate breach", tab: "notifications", type: "toggle", section: "Triggers" },
  { key: "emailFromAddress", label: "From Address", desc: "Sender email", tab: "notifications", type: "input", section: "Email Config" },
  { key: "smtpHost", label: "SMTP Host", desc: "Mail server hostname", tab: "notifications", type: "input", section: "Email Config" },
  { key: "smtpPort", label: "SMTP Port", desc: "Mail server port", tab: "notifications", type: "input", inputType: "number", section: "Email Config" },
  // Scoring
  { key: "enableDynamicScoring", label: "Dynamic Scoring", desc: "Points decay as more solve", tab: "scoring", type: "toggle" },
  { key: "dynamicScoringDecay", label: "Decay Rate", desc: "Points lost per solve", tab: "scoring", type: "input", inputType: "number" },
  { key: "dynamicScoringMinimum", label: "Min Points", desc: "Floor for scoring", tab: "scoring", type: "input", inputType: "number" },
  { key: "enableFirstBloodBonus", label: "First Blood Bonus", desc: "Extra points for first solver", tab: "scoring", type: "toggle" },
  { key: "firstBloodBonusPercent", label: "Bonus %", desc: "Percentage bonus", tab: "scoring", type: "input", inputType: "number" },
  { key: "enableHintSystem", label: "Hint System", desc: "Allow hint purchases", tab: "scoring", type: "toggle" },
  { key: "maxHintsPerChallenge", label: "Max Hints", desc: "Per challenge", tab: "scoring", type: "input", inputType: "number" },
  { key: "enableWriteupBonus", label: "Writeup Bonus", desc: "Award points for writeups", tab: "scoring", type: "toggle" },
  { key: "writeupBonusPoints", label: "Writeup Points", desc: "Points per writeup", tab: "scoring", type: "input", inputType: "number" },
  { key: "enableStreakBonus", label: "Streak Bonus", desc: "Bonus for consecutive solves", tab: "scoring", type: "toggle" },
  { key: "streakThreshold", label: "Streak Threshold", desc: "Consecutive solves needed", tab: "scoring", type: "input", inputType: "number" },
  { key: "streakBonusPercent", label: "Streak Bonus %", desc: "Percentage bonus", tab: "scoring", type: "input", inputType: "number" },
  // Challenges
  { key: "enableChallengeCategories", label: "Categories", desc: "Enable categorization", tab: "challenges", type: "toggle" },
  { key: "enableChallengeDifficulty", label: "Difficulty Levels", desc: "Show difficulty ratings", tab: "challenges", type: "toggle" },
  { key: "enableChallengeFiles", label: "File Attachments", desc: "Allow file uploads", tab: "challenges", type: "toggle" },
  { key: "maxFileSize", label: "Max File Size (MB)", desc: "Per file limit", tab: "challenges", type: "input", inputType: "number" },
  { key: "allowedFileTypes", label: "Allowed Types", desc: "Extensions", tab: "challenges", type: "input" },
  { key: "enableFlagFormat", label: "Enforce Format", desc: "Require flag prefix/suffix", tab: "challenges", type: "toggle", section: "Flag Format" },
  { key: "flagPrefix", label: "Prefix", desc: "Flag start", tab: "challenges", type: "input", section: "Flag Format" },
  { key: "flagSuffix", label: "Suffix", desc: "Flag end", tab: "challenges", type: "input", section: "Flag Format" },
  { key: "caseSensitiveFlags", label: "Case Sensitive", desc: "Exact case match required", tab: "challenges", type: "toggle" },
  { key: "enableChallengeTimer", label: "Challenge Timer", desc: "Time-limited challenges", tab: "challenges", type: "toggle" },
  { key: "defaultChallengeTimeout", label: "Default Timeout (sec)", desc: "0 = no limit", tab: "challenges", type: "input", inputType: "number" },
  // Display
  { key: "enableDarkMode", label: "Dark Mode", desc: "Enable dark theme", tab: "display", type: "toggle", section: "Theme" },
  { key: "enableAnimations", label: "Animations", desc: "UI animations", tab: "display", type: "toggle", section: "Theme" },
  { key: "enableScanlines", label: "Scanlines", desc: "CRT scanline overlay", tab: "display", type: "toggle", section: "Theme" },
  { key: "enableGlowEffects", label: "Glow Effects", desc: "Neon glow on elements", tab: "display", type: "toggle", section: "Theme" },
  { key: "enableMatrixRain", label: "Matrix Rain", desc: "Background animation", tab: "display", type: "toggle", section: "Theme" },
  { key: "showLeaderboard", label: "Show Leaderboard", desc: "Public leaderboard visible", tab: "display", type: "toggle", section: "Leaderboard" },
  { key: "leaderboardSize", label: "Max Entries", desc: "Leaderboard size", tab: "display", type: "input", inputType: "number", section: "Leaderboard" },
  { key: "showSolveCount", label: "Solve Count", desc: "Display solves", tab: "display", type: "toggle", section: "Leaderboard" },
  { key: "showFirstBlood", label: "First Blood", desc: "Highlight first", tab: "display", type: "toggle", section: "Leaderboard" },
  { key: "showCountryFlags", label: "Country Flags", desc: "User flags", tab: "display", type: "toggle", section: "Leaderboard" },
  { key: "showOnlineStatus", label: "Online Status", desc: "Show online", tab: "display", type: "toggle", section: "Leaderboard" },
  { key: "enableProfileCustomization", label: "Profiles", desc: "Custom profiles", tab: "display", type: "toggle", section: "User Features" },
  { key: "enableTeamAvatars", label: "Team Avatars", desc: "Avatar uploads", tab: "display", type: "toggle", section: "User Features" },
  { key: "enableBadges", label: "Achievement Badges", desc: "Enable badge system", tab: "display", type: "toggle", section: "User Features" },
  // Monitoring
  { key: "enableAuditLogging", label: "Audit Logging", desc: "Track admin actions", tab: "monitoring", type: "toggle", section: "Tracking" },
  { key: "enableVisitorTracking", label: "Visitors", desc: "Fingerprint visitors", tab: "monitoring", type: "toggle", section: "Tracking" },
  { key: "enableSessionTracking", label: "Sessions", desc: "Log user sessions", tab: "monitoring", type: "toggle", section: "Tracking" },
  { key: "enableAnomalyDetection", label: "Anomalies", desc: "Detect suspicious", tab: "monitoring", type: "toggle", section: "Tracking" },
  { key: "enablePerformanceMonitoring", label: "Performance", desc: "API response times", tab: "monitoring", type: "toggle", section: "Tracking" },
  { key: "enableErrorTracking", label: "Errors", desc: "Client-side errors", tab: "monitoring", type: "toggle", section: "Tracking" },
  { key: "logRetentionDays", label: "Log Retention (days)", desc: "Auto-delete", tab: "monitoring", type: "input", inputType: "number", section: "Retention" },
  { key: "sessionRetentionDays", label: "Session Retention (days)", desc: "Retention", tab: "monitoring", type: "input", inputType: "number", section: "Retention" },
  { key: "visitorRetentionDays", label: "Visitor Retention (days)", desc: "Retention", tab: "monitoring", type: "input", inputType: "number", section: "Retention" },
  { key: "enableRealTimeAlerts", label: "Real-Time Alerts", desc: "Live notifications", tab: "monitoring", type: "toggle", section: "Alerts" },
  { key: "alertSoundEnabled", label: "Alert Sound", desc: "Alert sounds", tab: "monitoring", type: "toggle", section: "Alerts" },
  { key: "alertDesktopNotifications", label: "Desktop Notifications", desc: "Browser popups", tab: "monitoring", type: "toggle", section: "Alerts" },
  // Storage
  { key: "storageProvider", label: "Storage Provider", desc: "Backend storage type", tab: "storage", type: "input" },
  { key: "maxStoragePerUser", label: "Max Storage/User (MB)", desc: "Per-user storage limit", tab: "storage", type: "input", inputType: "number" },
  { key: "enableCDN", label: "CDN Enabled", desc: "Use CDN for static assets", tab: "storage", type: "toggle" },
  { key: "cdnUrl", label: "CDN URL", desc: "CDN base URL", tab: "storage", type: "input" },
  { key: "enableImageOptimization", label: "Image Optimization", desc: "Auto-compress uploads", tab: "storage", type: "toggle" },
  { key: "thumbnailSize", label: "Thumbnail Size (px)", desc: "Generated thumbnail dimensions", tab: "storage", type: "input", inputType: "number" },
  // API
  { key: "enablePublicAPI", label: "Public API", desc: "Expose REST API", tab: "api", type: "toggle" },
  { key: "apiKeyRequired", label: "API Key Required", desc: "Require auth", tab: "api", type: "toggle" },
  { key: "enableGraphQL", label: "GraphQL", desc: "GraphQL endpoint", tab: "api", type: "toggle" },
  { key: "enableWebSocket", label: "WebSocket", desc: "Realtime WS", tab: "api", type: "toggle" },
  { key: "wsHeartbeatInterval", label: "WS Heartbeat (ms)", desc: "WebSocket heartbeat interval", tab: "api", type: "input", inputType: "number" },
  { key: "enableCaching", label: "Response Caching", desc: "Cache API responses", tab: "api", type: "toggle" },
  { key: "cacheTTL", label: "Cache TTL (sec)", desc: "Cache time-to-live", tab: "api", type: "input", inputType: "number" },
  { key: "enableCompression", label: "Compression", desc: "Gzip response compression", tab: "api", type: "toggle" },
  // Backup
  { key: "enableAutoBackup", label: "Auto Backup", desc: "Scheduled database backups", tab: "backup", type: "toggle" },
  { key: "backupInterval", label: "Backup Interval (hours)", desc: "Between backups", tab: "backup", type: "input", inputType: "number" },
  { key: "backupRetention", label: "Backup Retention (days)", desc: "Keep for N days", tab: "backup", type: "input", inputType: "number" },
  { key: "backupEncryption", label: "Backup Encryption", desc: "Encrypt backup files", tab: "backup", type: "toggle" },
  // Advanced
  { key: "debugMode", label: "Debug Mode", desc: "Enable debug logging (INSECURE)", tab: "advanced", type: "toggle", color: "destructive" },
  { key: "verboseLogging", label: "Verbose Logging", desc: "Log all queries and responses", tab: "advanced", type: "toggle" },
  { key: "enableBetaFeatures", label: "Beta Features", desc: "Enable experimental features", tab: "advanced", type: "toggle" },
  { key: "enableAnalytics", label: "Analytics", desc: "Third-party analytics", tab: "advanced", type: "toggle" },
  { key: "analyticsId", label: "Analytics ID", desc: "Tracking code", tab: "advanced", type: "input" },
];

const DEFAULT_CONFIG: Record<string, any> = {
  siteName: "CyberOps CTF", siteDescription: "Capture The Flag Competition Platform",
  maintenanceMode: false, registrationOpen: true, maxUsersPerTeam: 4, maxTeams: 100,
  defaultTimezone: "UTC", defaultLanguage: "en",
  enforceRLS: true, enableRateLimiting: true, maxLoginAttempts: 5, lockoutDuration: 15,
  sessionTimeout: 3600, enable2FA: false, enforceStrongPasswords: true, minPasswordLength: 8,
  enableCaptcha: false, ipWhitelistEnabled: false, geoBlockingEnabled: false, blockedCountries: "",
  enableCSRFProtection: true, enableXSSProtection: true, enableSQLInjectionProtection: true,
  contentSecurityPolicy: "default-src 'self'", corsOrigins: "*",
  flagSubmitRate: 10, flagSubmitWindow: 5, apiRateLimit: 100, apiRateWindow: 60,
  loginRateLimit: 5, loginRateWindow: 15, registrationRateLimit: 3, registrationRateWindow: 60,
  enableEmailNotifications: false, enablePushNotifications: false, enableWebhookNotifications: false,
  webhookUrl: "", slackWebhookUrl: "", discordWebhookUrl: "",
  notifyOnNewUser: true, notifyOnFlagSubmit: false, notifyOnFirstBlood: true, notifyOnBan: true,
  notifyOnAnomaly: true, notifyOnRateLimit: false, emailFromAddress: "noreply@cyberops.ctf",
  smtpHost: "", smtpPort: 587,
  enableDynamicScoring: false, dynamicScoringDecay: 10, dynamicScoringMinimum: 50,
  enableFirstBloodBonus: true, firstBloodBonusPercent: 10, enableHintSystem: true,
  maxHintsPerChallenge: 3, enableWriteupBonus: false, writeupBonusPoints: 25,
  enableStreakBonus: false, streakThreshold: 3, streakBonusPercent: 5,
  enableChallengeCategories: true, enableChallengeDifficulty: true, enableChallengeFiles: true,
  maxFileSize: 50, allowedFileTypes: ".zip,.tar.gz,.pdf,.py,.c,.txt", enableFlagFormat: true,
  flagPrefix: "cyberops{", flagSuffix: "}", caseSensitiveFlags: true,
  enableChallengeTimer: false, defaultChallengeTimeout: 0,
  enableDarkMode: true, enableAnimations: true, enableScanlines: true, enableGlowEffects: true,
  enableMatrixRain: true, showLeaderboard: true, leaderboardSize: 100, showSolveCount: true,
  showFirstBlood: true, showCountryFlags: true, enableProfileCustomization: true,
  enableTeamAvatars: true, enableBadges: false, showOnlineStatus: false,
  enableAuditLogging: true, enableVisitorTracking: true, enableSessionTracking: true,
  enableAnomalyDetection: true, enablePerformanceMonitoring: false, enableErrorTracking: true,
  logRetentionDays: 90, sessionRetentionDays: 30, visitorRetentionDays: 60,
  enableRealTimeAlerts: true, alertSoundEnabled: true, alertDesktopNotifications: true,
  storageProvider: "supabase", maxStoragePerUser: 100, enableCDN: false, cdnUrl: "",
  enableImageOptimization: false, thumbnailSize: 128,
  enablePublicAPI: false, apiKeyRequired: true, enableGraphQL: false, enableWebSocket: true,
  wsHeartbeatInterval: 50, enableCaching: true, cacheTTL: 300, enableCompression: true,
  enableAutoBackup: false, backupInterval: 24, backupRetention: 7, backupEncryption: true,
  debugMode: false, verboseLogging: false, enableBetaFeatures: false,
  customCSS: "", customJS: "", enableAnalytics: false, analyticsId: "",
};

export const SystemConfigModule = ({ onAction }: { onAction?: (action: string) => void }) => {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [config, setConfig] = useState<Record<string, any>>({ ...DEFAULT_CONFIG });

  // Load config from DB
  useEffect(() => {
    const loadConfig = async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("key", "system_config");
      if (data && data.length > 0) {
        const saved = data[0].value as Record<string, any>;
        setConfig(prev => ({ ...prev, ...saved }));
      }
      setLoading(false);
    };
    loadConfig();
  }, []);

  const toggle = (key: string) => setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  const setVal = (key: string, val: any) => setConfig(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    playSound("deploy");
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "system_config", value: config as any, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) {
      c2Toast.error("Failed to save: " + error.message);
    } else {
      c2Toast.success("System configuration saved to database");
    }
    setSaving(false);
  };

  // Search filtering
  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return ALL_SETTINGS.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.key.toLowerCase().includes(q) ||
      s.tab.toLowerCase().includes(q) ||
      (s.section && s.section.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TABS.forEach(t => { counts[t.id] = ALL_SETTINGS.filter(s => s.tab === t.id).length; });
    return counts;
  }, []);

  const currentTab = TABS.find(t => t.id === activeTab)!;

  const renderSetting = (s: SettingDef) => {
    if (s.type === "toggle") {
      return (
        <ConfigToggle
          key={s.key}
          label={s.label}
          desc={s.desc}
          checked={!!config[s.key]}
          onChange={() => toggle(s.key)}
          color={s.color || "primary"}
        />
      );
    }
    return (
      <ConfigInput
        key={s.key}
        label={s.label}
        desc={s.desc}
        value={config[s.key] ?? ""}
        onChange={v => setVal(s.key, s.inputType === "number" ? (v === "" ? "" : Number(v)) : v)}
        type={s.inputType || "text"}
      />
    );
  };

  const renderTabContent = () => {
    const settings = ALL_SETTINGS.filter(s => s.tab === activeTab);
    const sections = new Map<string, SettingDef[]>();
    const noSection: SettingDef[] = [];
    settings.forEach(s => {
      if (s.section) {
        if (!sections.has(s.section)) sections.set(s.section, []);
        sections.get(s.section)!.push(s);
      } else {
        noSection.push(s);
      }
    });

    const tabColor = currentTab.color.replace("text-", "");

    return (
      <div className="space-y-3">
        {noSection.map(renderSetting)}
        {Array.from(sections.entries()).map(([section, items]) => (
          <div key={section}>
            <SectionLabel label={section} color={tabColor} />
            <div className="space-y-2 mt-2">
              {items.map(renderSetting)}
            </div>
          </div>
        ))}
        {activeTab === "backup" && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <ActionBtn icon={Database} label="Backup Now" color="primary" onClick={() => onAction?.("Backup DB")} />
            <ActionBtn icon={RefreshCw} label="Restore" color="neon-orange" onClick={() => onAction?.("Restore")} />
          </div>
        )}
        {activeTab === "advanced" && (
          <>
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="font-mono text-xs font-bold text-destructive uppercase">Danger Zone</span>
              </div>
              <p className="text-[10px] text-muted-foreground">These settings can affect platform stability.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <ActionBtn icon={RefreshCw} label="Clear Cache" color="neon-orange" onClick={() => onAction?.("Purge Cache")} />
              <ActionBtn icon={Database} label="Reset DB" color="destructive" onClick={() => onAction?.("Reset DB")} />
              <ActionBtn icon={Power} label="Restart" color="destructive" onClick={() => onAction?.("Restart Services")} />
              <ActionBtn icon={Terminal} label="Console" color="neon-cyan" onClick={() => onAction?.("SQL Console")} />
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (!filteredSettings) return null;
    const grouped = new Map<TabId, SettingDef[]>();
    filteredSettings.forEach(s => {
      if (!grouped.has(s.tab)) grouped.set(s.tab, []);
      grouped.get(s.tab)!.push(s);
    });

    if (filteredSettings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Search className="w-8 h-8 mb-2 opacity-30" />
          <p className="font-mono text-sm">No settings found for "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-[10px] font-mono text-muted-foreground">
          Found {filteredSettings.length} settings matching "{searchQuery}"
        </div>
        {Array.from(grouped.entries()).map(([tabId, items]) => {
          const tab = TABS.find(t => t.id === tabId)!;
          return (
            <div key={tabId}>
              <div className="flex items-center gap-2 mb-2">
                <tab.icon className={`w-3.5 h-3.5 ${tab.color}`} />
                <span className={`font-mono text-xs uppercase tracking-wider ${tab.color}`}>{tab.label}</span>
                <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">{items.length}</Badge>
              </div>
              <div className="space-y-2 ml-5">
                {items.map(renderSetting)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground font-mono text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading system configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 h-full">
      {/* Sidebar */}
      <div className="w-48 shrink-0 space-y-0.5 border-r border-border/20 pr-3">
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <Settings className="w-4 h-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">Config</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            className="w-full h-7 pl-7 pr-7 rounded-md border border-border/30 bg-background/60 text-[10px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { playSound("click"); setActiveTab(tab.id); setSearchQuery(""); }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-all duration-200 ${
              !searchQuery && activeTab === tab.id
                ? `bg-${tab.color.replace("text-", "")}/10 ${tab.color} border border-${tab.color.replace("text-", "")}/20`
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent"
            }`}
          >
            <tab.icon className={`w-3.5 h-3.5 shrink-0 ${!searchQuery && activeTab === tab.id ? tab.color : ""}`} />
            <span className="text-[10px] font-mono uppercase tracking-wider truncate">{tab.label}</span>
            <Badge variant="outline" className={`ml-auto text-[8px] px-1 py-0 h-4 ${!searchQuery && activeTab === tab.id ? "border-current/30" : "border-border/30 text-muted-foreground/50"}`}>
              {tabCounts[tab.id]}
            </Badge>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/20">
          <div className="flex items-center gap-3">
            {searchQuery ? (
              <>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider">Search Results</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">{filteredSettings?.length ?? 0} matches</p>
                </div>
              </>
            ) : (
              <>
                <div className={`p-2 rounded-lg bg-${currentTab.color.replace("text-", "")}/10`}>
                  <currentTab.icon className={`w-5 h-5 ${currentTab.color}`} />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider">{currentTab.label} Settings</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">{tabCounts[currentTab.id]} configurable options</p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-300 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 hover:border-primary/40 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : "Save Config"}
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={searchQuery ? "search" : activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {searchQuery ? renderSearchResults() : renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

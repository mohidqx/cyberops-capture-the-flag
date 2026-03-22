import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Shield, Lock, Eye, Bell, Palette, Globe, Clock, Zap, Server,
  Database, Wifi, Key, FileText, Mail, Users, Target, AlertTriangle,
  Monitor, Cpu, HardDrive, RefreshCw, Power, Radio, Terminal, Hash,
  Fingerprint, BarChart3, Gauge, Network, Bug, Layers, Bookmark, Save,
  ChevronRight, CheckCircle2
} from "lucide-react";
import { C2Panel, ConfigToggle, ConfigInput, SectionLabel, ActionBtn } from "./C2Shared";
import { c2Toast, playSound } from "@/lib/adminSounds";
import { Badge } from "@/components/ui/badge";

const TABS = [
  { id: "general", label: "General", icon: Settings, color: "text-primary", count: 8 },
  { id: "security", label: "Security", icon: Shield, color: "text-destructive", count: 16 },
  { id: "rate", label: "Rate Limits", icon: Gauge, color: "text-neon-orange", count: 8 },
  { id: "notifications", label: "Notifications", icon: Bell, color: "text-secondary", count: 15 },
  { id: "scoring", label: "Scoring", icon: Target, color: "text-primary", count: 10 },
  { id: "challenges", label: "Challenges", icon: Layers, color: "text-neon-cyan", count: 10 },
  { id: "display", label: "Display", icon: Palette, color: "text-neon-purple", count: 13 },
  { id: "monitoring", label: "Monitoring", icon: Eye, color: "text-secondary", count: 12 },
  { id: "storage", label: "Storage", icon: HardDrive, color: "text-neon-orange", count: 6 },
  { id: "api", label: "API", icon: Network, color: "text-neon-cyan", count: 8 },
  { id: "backup", label: "Backup", icon: RefreshCw, color: "text-primary", count: 4 },
  { id: "advanced", label: "Advanced", icon: Bug, color: "text-destructive", count: 6 },
] as const;

type TabId = typeof TABS[number]["id"];

export const SystemConfigModule = ({ onAction }: { onAction?: (action: string) => void }) => {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
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
  });

  const toggle = (key: string) => setConfig(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  const setVal = (key: string, val: any) => setConfig(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    playSound("deploy");
    setSaved(true);
    c2Toast.success("Configuration saved successfully");
    setTimeout(() => setSaved(false), 2000);
  };

  const currentTab = TABS.find(t => t.id === activeTab)!;

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-3">
            <ConfigInput label="Site Name" desc="Platform display name" value={config.siteName} onChange={v => setVal("siteName", v)} />
            <ConfigInput label="Site Description" desc="SEO meta description" value={config.siteDescription} onChange={v => setVal("siteDescription", v)} />
            <ConfigToggle label="Maintenance Mode" desc="Disable public access during maintenance" checked={config.maintenanceMode} onChange={() => toggle("maintenanceMode")} color="destructive" />
            <ConfigToggle label="Open Registration" desc="Allow new user sign-ups" checked={config.registrationOpen} onChange={() => toggle("registrationOpen")} />
            <ConfigInput label="Max Users Per Team" desc="Maximum team members allowed" value={config.maxUsersPerTeam} onChange={v => setVal("maxUsersPerTeam", v)} type="number" />
            <ConfigInput label="Max Teams" desc="Maximum number of teams" value={config.maxTeams} onChange={v => setVal("maxTeams", v)} type="number" />
            <ConfigInput label="Default Timezone" desc="Server timezone for timestamps" value={config.defaultTimezone} onChange={v => setVal("defaultTimezone", v)} />
            <ConfigInput label="Default Language" desc="Platform language code" value={config.defaultLanguage} onChange={v => setVal("defaultLanguage", v)} />
          </div>
        );

      case "security":
        return (
          <div className="space-y-3">
            <SectionLabel label="Authentication" color="destructive" />
            <ConfigToggle label="Enforce RLS" desc="Row-Level Security on all tables" checked={config.enforceRLS} onChange={() => toggle("enforceRLS")} color="destructive" />
            <ConfigToggle label="Two-Factor Authentication" desc="Require 2FA for all users" checked={config.enable2FA} onChange={() => toggle("enable2FA")} />
            <ConfigToggle label="Strong Passwords" desc="Enforce minimum complexity" checked={config.enforceStrongPasswords} onChange={() => toggle("enforceStrongPasswords")} />
            <ConfigInput label="Min Password Length" desc="Minimum characters required" value={config.minPasswordLength} onChange={v => setVal("minPasswordLength", v)} type="number" />
            <ConfigInput label="Max Login Attempts" desc="Before account lockout" value={config.maxLoginAttempts} onChange={v => setVal("maxLoginAttempts", v)} type="number" />
            <ConfigInput label="Lockout Duration (min)" desc="Minutes before unlock" value={config.lockoutDuration} onChange={v => setVal("lockoutDuration", v)} type="number" />
            <ConfigInput label="Session Timeout (sec)" desc="Idle timeout before logout" value={config.sessionTimeout} onChange={v => setVal("sessionTimeout", v)} type="number" />
            <SectionLabel label="Protection" color="destructive" />
            <ConfigToggle label="CAPTCHA" desc="Enable CAPTCHA on login/register" checked={config.enableCaptcha} onChange={() => toggle("enableCaptcha")} />
            <ConfigToggle label="CSRF Protection" desc="Cross-Site Request Forgery guard" checked={config.enableCSRFProtection} onChange={() => toggle("enableCSRFProtection")} />
            <ConfigToggle label="XSS Protection" desc="Cross-Site Scripting filter" checked={config.enableXSSProtection} onChange={() => toggle("enableXSSProtection")} />
            <ConfigToggle label="SQL Injection Guard" desc="Parameterized query enforcement" checked={config.enableSQLInjectionProtection} onChange={() => toggle("enableSQLInjectionProtection")} />
            <ConfigInput label="Content Security Policy" desc="CSP header value" value={config.contentSecurityPolicy} onChange={v => setVal("contentSecurityPolicy", v)} />
            <ConfigInput label="CORS Origins" desc="Allowed origins (comma-separated)" value={config.corsOrigins} onChange={v => setVal("corsOrigins", v)} />
            <SectionLabel label="Geo-Blocking" color="destructive" />
            <ConfigToggle label="IP Whitelist" desc="Only allow whitelisted IPs" checked={config.ipWhitelistEnabled} onChange={() => toggle("ipWhitelistEnabled")} />
            <ConfigToggle label="Geo-Blocking" desc="Block logins from specific countries" checked={config.geoBlockingEnabled} onChange={() => toggle("geoBlockingEnabled")} />
            {config.geoBlockingEnabled && (
              <ConfigInput label="Blocked Countries" desc="Country codes (comma-separated)" value={config.blockedCountries} onChange={v => setVal("blockedCountries", v)} placeholder="CN,RU,KP" />
            )}
          </div>
        );

      case "rate":
        return (
          <div className="space-y-3">
            <ConfigToggle label="Enable Rate Limiting" desc="Global rate limit enforcement" checked={config.enableRateLimiting} onChange={() => toggle("enableRateLimiting")} />
            <SectionLabel label="Flag Submissions" color="neon-orange" />
            <div className="grid grid-cols-2 gap-3">
              <ConfigInput label="Max Attempts" desc="Per window" value={config.flagSubmitRate} onChange={v => setVal("flagSubmitRate", v)} type="number" />
              <ConfigInput label="Window (min)" desc="Time window" value={config.flagSubmitWindow} onChange={v => setVal("flagSubmitWindow", v)} type="number" />
            </div>
            <SectionLabel label="API" color="neon-orange" />
            <div className="grid grid-cols-2 gap-3">
              <ConfigInput label="Max Calls" desc="Per window" value={config.apiRateLimit} onChange={v => setVal("apiRateLimit", v)} type="number" />
              <ConfigInput label="Window (sec)" desc="Time window" value={config.apiRateWindow} onChange={v => setVal("apiRateWindow", v)} type="number" />
            </div>
            <SectionLabel label="Authentication" color="neon-orange" />
            <div className="grid grid-cols-2 gap-3">
              <ConfigInput label="Login Attempts" desc="Max per window" value={config.loginRateLimit} onChange={v => setVal("loginRateLimit", v)} type="number" />
              <ConfigInput label="Window (min)" desc="Time window" value={config.loginRateWindow} onChange={v => setVal("loginRateWindow", v)} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ConfigInput label="Signups" desc="Max per window" value={config.registrationRateLimit} onChange={v => setVal("registrationRateLimit", v)} type="number" />
              <ConfigInput label="Window (min)" desc="Time window" value={config.registrationRateWindow} onChange={v => setVal("registrationRateWindow", v)} type="number" />
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-3">
            <SectionLabel label="Channels" color="secondary" />
            <ConfigToggle label="Email Notifications" desc="Send alerts via email" checked={config.enableEmailNotifications} onChange={() => toggle("enableEmailNotifications")} />
            <ConfigToggle label="Push Notifications" desc="Browser push notifications" checked={config.enablePushNotifications} onChange={() => toggle("enablePushNotifications")} />
            <ConfigToggle label="Webhook Notifications" desc="POST to external URL" checked={config.enableWebhookNotifications} onChange={() => toggle("enableWebhookNotifications")} />
            {config.enableWebhookNotifications && (
              <ConfigInput label="Webhook URL" desc="POST endpoint" value={config.webhookUrl} onChange={v => setVal("webhookUrl", v)} placeholder="https://..." />
            )}
            <ConfigInput label="Slack Webhook" desc="Slack incoming webhook URL" value={config.slackWebhookUrl} onChange={v => setVal("slackWebhookUrl", v)} placeholder="https://hooks.slack.com/..." />
            <ConfigInput label="Discord Webhook" desc="Discord webhook URL" value={config.discordWebhookUrl} onChange={v => setVal("discordWebhookUrl", v)} placeholder="https://discord.com/api/webhooks/..." />
            <SectionLabel label="Triggers" color="secondary" />
            <div className="grid grid-cols-2 gap-3">
              <ConfigToggle label="New User" desc="Alert on sign-ups" checked={config.notifyOnNewUser} onChange={() => toggle("notifyOnNewUser")} />
              <ConfigToggle label="Flag Submit" desc="Alert on attempts" checked={config.notifyOnFlagSubmit} onChange={() => toggle("notifyOnFlagSubmit")} />
              <ConfigToggle label="First Blood" desc="Alert on first solve" checked={config.notifyOnFirstBlood} onChange={() => toggle("notifyOnFirstBlood")} />
              <ConfigToggle label="User Ban" desc="Alert on ban" checked={config.notifyOnBan} onChange={() => toggle("notifyOnBan")} />
              <ConfigToggle label="Anomaly" desc="Suspicious login" checked={config.notifyOnAnomaly} onChange={() => toggle("notifyOnAnomaly")} />
              <ConfigToggle label="Rate Limit" desc="Rate breach" checked={config.notifyOnRateLimit} onChange={() => toggle("notifyOnRateLimit")} />
            </div>
            <SectionLabel label="Email Config" color="secondary" />
            <ConfigInput label="From Address" desc="Sender email" value={config.emailFromAddress} onChange={v => setVal("emailFromAddress", v)} />
            <div className="grid grid-cols-2 gap-3">
              <ConfigInput label="SMTP Host" desc="Mail server hostname" value={config.smtpHost} onChange={v => setVal("smtpHost", v)} />
              <ConfigInput label="SMTP Port" desc="Mail server port" value={config.smtpPort} onChange={v => setVal("smtpPort", v)} type="number" />
            </div>
          </div>
        );

      case "scoring":
        return (
          <div className="space-y-3">
            <ConfigToggle label="Dynamic Scoring" desc="Points decay as more solve" checked={config.enableDynamicScoring} onChange={() => toggle("enableDynamicScoring")} />
            {config.enableDynamicScoring && (
              <div className="grid grid-cols-2 gap-3">
                <ConfigInput label="Decay Rate" desc="Points lost per solve" value={config.dynamicScoringDecay} onChange={v => setVal("dynamicScoringDecay", v)} type="number" />
                <ConfigInput label="Min Points" desc="Floor for scoring" value={config.dynamicScoringMinimum} onChange={v => setVal("dynamicScoringMinimum", v)} type="number" />
              </div>
            )}
            <ConfigToggle label="First Blood Bonus" desc="Extra points for first solver" checked={config.enableFirstBloodBonus} onChange={() => toggle("enableFirstBloodBonus")} />
            {config.enableFirstBloodBonus && (
              <ConfigInput label="Bonus %" desc="Percentage bonus" value={config.firstBloodBonusPercent} onChange={v => setVal("firstBloodBonusPercent", v)} type="number" />
            )}
            <ConfigToggle label="Hint System" desc="Allow hint purchases" checked={config.enableHintSystem} onChange={() => toggle("enableHintSystem")} />
            <ConfigInput label="Max Hints" desc="Per challenge" value={config.maxHintsPerChallenge} onChange={v => setVal("maxHintsPerChallenge", v)} type="number" />
            <ConfigToggle label="Writeup Bonus" desc="Award points for writeups" checked={config.enableWriteupBonus} onChange={() => toggle("enableWriteupBonus")} />
            {config.enableWriteupBonus && (
              <ConfigInput label="Writeup Points" desc="Points per writeup" value={config.writeupBonusPoints} onChange={v => setVal("writeupBonusPoints", v)} type="number" />
            )}
            <ConfigToggle label="Streak Bonus" desc="Bonus for consecutive solves" checked={config.enableStreakBonus} onChange={() => toggle("enableStreakBonus")} />
            {config.enableStreakBonus && (
              <div className="grid grid-cols-2 gap-3">
                <ConfigInput label="Streak Threshold" desc="Consecutive solves needed" value={config.streakThreshold} onChange={v => setVal("streakThreshold", v)} type="number" />
                <ConfigInput label="Streak Bonus %" desc="Percentage bonus" value={config.streakBonusPercent} onChange={v => setVal("streakBonusPercent", v)} type="number" />
              </div>
            )}
          </div>
        );

      case "challenges":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ConfigToggle label="Categories" desc="Enable categorization" checked={config.enableChallengeCategories} onChange={() => toggle("enableChallengeCategories")} />
              <ConfigToggle label="Difficulty Levels" desc="Show difficulty ratings" checked={config.enableChallengeDifficulty} onChange={() => toggle("enableChallengeDifficulty")} />
            </div>
            <ConfigToggle label="File Attachments" desc="Allow file uploads to challenges" checked={config.enableChallengeFiles} onChange={() => toggle("enableChallengeFiles")} />
            <div className="grid grid-cols-2 gap-3">
              <ConfigInput label="Max File Size (MB)" desc="Per file limit" value={config.maxFileSize} onChange={v => setVal("maxFileSize", v)} type="number" />
              <ConfigInput label="Allowed Types" desc="Extensions" value={config.allowedFileTypes} onChange={v => setVal("allowedFileTypes", v)} />
            </div>
            <SectionLabel label="Flag Format" color="neon-cyan" />
            <ConfigToggle label="Enforce Format" desc="Require flag prefix/suffix" checked={config.enableFlagFormat} onChange={() => toggle("enableFlagFormat")} />
            {config.enableFlagFormat && (
              <div className="grid grid-cols-2 gap-3">
                <ConfigInput label="Prefix" desc="Flag start" value={config.flagPrefix} onChange={v => setVal("flagPrefix", v)} />
                <ConfigInput label="Suffix" desc="Flag end" value={config.flagSuffix} onChange={v => setVal("flagSuffix", v)} />
              </div>
            )}
            <ConfigToggle label="Case Sensitive" desc="Exact case match required" checked={config.caseSensitiveFlags} onChange={() => toggle("caseSensitiveFlags")} />
            <ConfigToggle label="Challenge Timer" desc="Time-limited challenges" checked={config.enableChallengeTimer} onChange={() => toggle("enableChallengeTimer")} />
            {config.enableChallengeTimer && (
              <ConfigInput label="Default Timeout (sec)" desc="0 = no limit" value={config.defaultChallengeTimeout} onChange={v => setVal("defaultChallengeTimeout", v)} type="number" />
            )}
          </div>
        );

      case "display":
        return (
          <div className="space-y-3">
            <SectionLabel label="Theme" color="neon-purple" />
            <div className="grid grid-cols-2 gap-3">
              <ConfigToggle label="Dark Mode" desc="Enable dark theme" checked={config.enableDarkMode} onChange={() => toggle("enableDarkMode")} />
              <ConfigToggle label="Animations" desc="UI animations" checked={config.enableAnimations} onChange={() => toggle("enableAnimations")} />
              <ConfigToggle label="Scanlines" desc="CRT scanline overlay" checked={config.enableScanlines} onChange={() => toggle("enableScanlines")} />
              <ConfigToggle label="Glow Effects" desc="Neon glow on elements" checked={config.enableGlowEffects} onChange={() => toggle("enableGlowEffects")} />
            </div>
            <ConfigToggle label="Matrix Rain" desc="Background matrix animation" checked={config.enableMatrixRain} onChange={() => toggle("enableMatrixRain")} />
            <SectionLabel label="Leaderboard" color="neon-purple" />
            <ConfigToggle label="Show Leaderboard" desc="Public leaderboard visible" checked={config.showLeaderboard} onChange={() => toggle("showLeaderboard")} />
            <ConfigInput label="Max Entries" desc="Leaderboard size" value={config.leaderboardSize} onChange={v => setVal("leaderboardSize", v)} type="number" />
            <div className="grid grid-cols-2 gap-3">
              <ConfigToggle label="Solve Count" desc="Display solves" checked={config.showSolveCount} onChange={() => toggle("showSolveCount")} />
              <ConfigToggle label="First Blood" desc="Highlight first" checked={config.showFirstBlood} onChange={() => toggle("showFirstBlood")} />
              <ConfigToggle label="Country Flags" desc="User flags" checked={config.showCountryFlags} onChange={() => toggle("showCountryFlags")} />
              <ConfigToggle label="Online Status" desc="Show online" checked={config.showOnlineStatus} onChange={() => toggle("showOnlineStatus")} />
            </div>
            <SectionLabel label="User Features" color="neon-purple" />
            <div className="grid grid-cols-2 gap-3">
              <ConfigToggle label="Profiles" desc="Custom profiles" checked={config.enableProfileCustomization} onChange={() => toggle("enableProfileCustomization")} />
              <ConfigToggle label="Team Avatars" desc="Avatar uploads" checked={config.enableTeamAvatars} onChange={() => toggle("enableTeamAvatars")} />
            </div>
            <ConfigToggle label="Achievement Badges" desc="Enable badge system" checked={config.enableBadges} onChange={() => toggle("enableBadges")} />
          </div>
        );

      case "monitoring":
        return (
          <div className="space-y-3">
            <SectionLabel label="Tracking" color="secondary" />
            <div className="grid grid-cols-2 gap-3">
              <ConfigToggle label="Audit Logging" desc="Track admin actions" checked={config.enableAuditLogging} onChange={() => toggle("enableAuditLogging")} />
              <ConfigToggle label="Visitors" desc="Fingerprint visitors" checked={config.enableVisitorTracking} onChange={() => toggle("enableVisitorTracking")} />
              <ConfigToggle label="Sessions" desc="Log user sessions" checked={config.enableSessionTracking} onChange={() => toggle("enableSessionTracking")} />
              <ConfigToggle label="Anomalies" desc="Detect suspicious" checked={config.enableAnomalyDetection} onChange={() => toggle("enableAnomalyDetection")} />
              <ConfigToggle label="Performance" desc="API response times" checked={config.enablePerformanceMonitoring} onChange={() => toggle("enablePerformanceMonitoring")} />
              <ConfigToggle label="Errors" desc="Client-side errors" checked={config.enableErrorTracking} onChange={() => toggle("enableErrorTracking")} />
            </div>
            <SectionLabel label="Retention" color="secondary" />
            <div className="grid grid-cols-3 gap-3">
              <ConfigInput label="Logs (days)" desc="Auto-delete" value={config.logRetentionDays} onChange={v => setVal("logRetentionDays", v)} type="number" />
              <ConfigInput label="Sessions (days)" desc="Retention" value={config.sessionRetentionDays} onChange={v => setVal("sessionRetentionDays", v)} type="number" />
              <ConfigInput label="Visitors (days)" desc="Retention" value={config.visitorRetentionDays} onChange={v => setVal("visitorRetentionDays", v)} type="number" />
            </div>
            <SectionLabel label="Alerts" color="secondary" />
            <div className="grid grid-cols-2 gap-3">
              <ConfigToggle label="Real-Time" desc="Live notifications" checked={config.enableRealTimeAlerts} onChange={() => toggle("enableRealTimeAlerts")} />
              <ConfigToggle label="Sound" desc="Alert sounds" checked={config.alertSoundEnabled} onChange={() => toggle("alertSoundEnabled")} />
            </div>
            <ConfigToggle label="Desktop Notifications" desc="Browser notification popups" checked={config.alertDesktopNotifications} onChange={() => toggle("alertDesktopNotifications")} />
          </div>
        );

      case "storage":
        return (
          <div className="space-y-3">
            <ConfigInput label="Storage Provider" desc="Backend storage type" value={config.storageProvider} onChange={v => setVal("storageProvider", v)} />
            <ConfigInput label="Max Storage/User (MB)" desc="Per-user storage limit" value={config.maxStoragePerUser} onChange={v => setVal("maxStoragePerUser", v)} type="number" />
            <ConfigToggle label="CDN Enabled" desc="Use CDN for static assets" checked={config.enableCDN} onChange={() => toggle("enableCDN")} />
            {config.enableCDN && <ConfigInput label="CDN URL" desc="CDN base URL" value={config.cdnUrl} onChange={v => setVal("cdnUrl", v)} />}
            <ConfigToggle label="Image Optimization" desc="Auto-compress uploads" checked={config.enableImageOptimization} onChange={() => toggle("enableImageOptimization")} />
            <ConfigInput label="Thumbnail Size (px)" desc="Generated thumbnail dimensions" value={config.thumbnailSize} onChange={v => setVal("thumbnailSize", v)} type="number" />
          </div>
        );

      case "api":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ConfigToggle label="Public API" desc="Expose REST API" checked={config.enablePublicAPI} onChange={() => toggle("enablePublicAPI")} />
              <ConfigToggle label="API Key Required" desc="Require auth" checked={config.apiKeyRequired} onChange={() => toggle("apiKeyRequired")} />
              <ConfigToggle label="GraphQL" desc="GraphQL endpoint" checked={config.enableGraphQL} onChange={() => toggle("enableGraphQL")} />
              <ConfigToggle label="WebSocket" desc="Realtime WS" checked={config.enableWebSocket} onChange={() => toggle("enableWebSocket")} />
            </div>
            <ConfigInput label="WS Heartbeat (ms)" desc="WebSocket heartbeat interval" value={config.wsHeartbeatInterval} onChange={v => setVal("wsHeartbeatInterval", v)} type="number" />
            <ConfigToggle label="Response Caching" desc="Cache API responses" checked={config.enableCaching} onChange={() => toggle("enableCaching")} />
            <ConfigInput label="Cache TTL (sec)" desc="Cache time-to-live" value={config.cacheTTL} onChange={v => setVal("cacheTTL", v)} type="number" />
            <ConfigToggle label="Compression" desc="Gzip response compression" checked={config.enableCompression} onChange={() => toggle("enableCompression")} />
          </div>
        );

      case "backup":
        return (
          <div className="space-y-3">
            <ConfigToggle label="Auto Backup" desc="Scheduled database backups" checked={config.enableAutoBackup} onChange={() => toggle("enableAutoBackup")} />
            <div className="grid grid-cols-2 gap-3">
              <ConfigInput label="Interval (hours)" desc="Between backups" value={config.backupInterval} onChange={v => setVal("backupInterval", v)} type="number" />
              <ConfigInput label="Retention (days)" desc="Keep for N days" value={config.backupRetention} onChange={v => setVal("backupRetention", v)} type="number" />
            </div>
            <ConfigToggle label="Backup Encryption" desc="Encrypt backup files" checked={config.backupEncryption} onChange={() => toggle("backupEncryption")} />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <ActionBtn icon={Database} label="Backup Now" color="primary" onClick={() => onAction?.("Backup DB")} />
              <ActionBtn icon={RefreshCw} label="Restore" color="neon-orange" onClick={() => onAction?.("Restore")} />
            </div>
          </div>
        );

      case "advanced":
        return (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="font-mono text-xs font-bold text-destructive uppercase">Danger Zone</span>
              </div>
              <p className="text-[10px] text-muted-foreground">These settings can affect platform stability. Proceed with caution.</p>
            </div>
            <ConfigToggle label="Debug Mode" desc="Enable debug logging (INSECURE)" checked={config.debugMode} onChange={() => toggle("debugMode")} color="destructive" />
            <ConfigToggle label="Verbose Logging" desc="Log all queries and responses" checked={config.verboseLogging} onChange={() => toggle("verboseLogging")} />
            <ConfigToggle label="Beta Features" desc="Enable experimental features" checked={config.enableBetaFeatures} onChange={() => toggle("enableBetaFeatures")} />
            <ConfigToggle label="Analytics" desc="Third-party analytics" checked={config.enableAnalytics} onChange={() => toggle("enableAnalytics")} />
            {config.enableAnalytics && <ConfigInput label="Analytics ID" desc="Tracking code" value={config.analyticsId} onChange={v => setVal("analyticsId", v)} />}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <ActionBtn icon={RefreshCw} label="Clear Cache" color="neon-orange" onClick={() => onAction?.("Purge Cache")} />
              <ActionBtn icon={Database} label="Reset DB" color="destructive" onClick={() => onAction?.("Reset DB")} />
              <ActionBtn icon={Power} label="Restart" color="destructive" onClick={() => onAction?.("Restart Services")} />
              <ActionBtn icon={Terminal} label="Console" color="neon-cyan" onClick={() => onAction?.("SQL Console")} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex gap-3 h-full">
      {/* Sidebar Navigation */}
      <div className="w-48 shrink-0 space-y-0.5 border-r border-border/20 pr-3">
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <Settings className="w-4 h-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">Config</span>
        </div>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { playSound("click"); setActiveTab(tab.id); }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-all duration-200 group ${
              activeTab === tab.id
                ? `bg-${tab.color.replace("text-", "")}/10 ${tab.color} border border-${tab.color.replace("text-", "")}/20`
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent"
            }`}
          >
            <tab.icon className={`w-3.5 h-3.5 shrink-0 ${activeTab === tab.id ? tab.color : ""}`} />
            <span className="text-[10px] font-mono uppercase tracking-wider truncate">{tab.label}</span>
            <Badge variant="outline" className={`ml-auto text-[8px] px-1 py-0 h-4 ${activeTab === tab.id ? "border-current/30" : "border-border/30 text-muted-foreground/50"}`}>
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        {/* Tab Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${currentTab.color.replace("text-", "")}/10`}>
              <currentTab.icon className={`w-5 h-5 ${currentTab.color}`} />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">{currentTab.label} Settings</h3>
              <p className="text-[10px] text-muted-foreground font-mono">{currentTab.count} configurable options</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
              saved
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 hover:border-primary/40"
            }`}
          >
            {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Saved!" : "Save Config"}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

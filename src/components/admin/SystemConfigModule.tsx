import { useState } from "react";
import {
  Settings, Shield, Lock, Eye, Bell, Palette, Globe, Clock, Zap, Server,
  Database, Wifi, Key, FileText, Mail, Users, Target, AlertTriangle,
  Monitor, Cpu, HardDrive, RefreshCw, Power, Radio, Terminal, Hash,
  Fingerprint, BarChart3, Gauge, Network, Bug, Layers, Bookmark
} from "lucide-react";
import { C2Panel, ConfigToggle, ConfigInput, SectionLabel, ActionBtn } from "./C2Shared";
import { Switch } from "@/components/ui/switch";

export const SystemConfigModule = ({ onAction }: { onAction?: (action: string) => void }) => {
  const [config, setConfig] = useState({
    // General
    siteName: "CyberOps CTF",
    siteDescription: "Capture The Flag Competition Platform",
    maintenanceMode: false,
    registrationOpen: true,
    maxUsersPerTeam: 4,
    maxTeams: 100,
    defaultTimezone: "UTC",
    defaultLanguage: "en",

    // Security
    enforceRLS: true,
    enableRateLimiting: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    sessionTimeout: 3600,
    enable2FA: false,
    enforceStrongPasswords: true,
    minPasswordLength: 8,
    enableCaptcha: false,
    ipWhitelistEnabled: false,
    geoBlockingEnabled: false,
    blockedCountries: "",
    enableCSRFProtection: true,
    enableXSSProtection: true,
    enableSQLInjectionProtection: true,
    contentSecurityPolicy: "default-src 'self'",
    corsOrigins: "*",

    // Rate Limiting
    flagSubmitRate: 10,
    flagSubmitWindow: 5,
    apiRateLimit: 100,
    apiRateWindow: 60,
    loginRateLimit: 5,
    loginRateWindow: 15,
    registrationRateLimit: 3,
    registrationRateWindow: 60,

    // Notifications
    enableEmailNotifications: false,
    enablePushNotifications: false,
    enableWebhookNotifications: false,
    webhookUrl: "",
    slackWebhookUrl: "",
    discordWebhookUrl: "",
    notifyOnNewUser: true,
    notifyOnFlagSubmit: false,
    notifyOnFirstBlood: true,
    notifyOnBan: true,
    notifyOnAnomaly: true,
    notifyOnRateLimit: false,
    emailFromAddress: "noreply@cyberops.ctf",
    smtpHost: "",
    smtpPort: 587,

    // Scoring
    enableDynamicScoring: false,
    dynamicScoringDecay: 10,
    dynamicScoringMinimum: 50,
    enableFirstBloodBonus: true,
    firstBloodBonusPercent: 10,
    enableHintSystem: true,
    maxHintsPerChallenge: 3,
    enableWriteupBonus: false,
    writeupBonusPoints: 25,
    enableStreakBonus: false,
    streakThreshold: 3,
    streakBonusPercent: 5,

    // Challenge Settings
    enableChallengeCategories: true,
    enableChallengeDifficulty: true,
    enableChallengeFiles: true,
    maxFileSize: 50,
    allowedFileTypes: ".zip,.tar.gz,.pdf,.py,.c,.txt",
    enableFlagFormat: true,
    flagPrefix: "cyberops{",
    flagSuffix: "}",
    caseSensitiveFlags: true,
    enableChallengeTimer: false,
    defaultChallengeTimeout: 0,

    // Display
    enableDarkMode: true,
    enableAnimations: true,
    enableScanlines: true,
    enableGlowEffects: true,
    enableMatrixRain: true,
    showLeaderboard: true,
    leaderboardSize: 100,
    showSolveCount: true,
    showFirstBlood: true,
    showCountryFlags: true,
    enableProfileCustomization: true,
    enableTeamAvatars: true,
    enableBadges: false,
    showOnlineStatus: false,

    // Monitoring
    enableAuditLogging: true,
    enableVisitorTracking: true,
    enableSessionTracking: true,
    enableAnomalyDetection: true,
    enablePerformanceMonitoring: false,
    enableErrorTracking: true,
    logRetentionDays: 90,
    sessionRetentionDays: 30,
    visitorRetentionDays: 60,
    enableRealTimeAlerts: true,
    alertSoundEnabled: true,
    alertDesktopNotifications: true,

    // Storage
    storageProvider: "supabase",
    maxStoragePerUser: 100,
    enableCDN: false,
    cdnUrl: "",
    enableImageOptimization: false,
    thumbnailSize: 128,

    // API
    enablePublicAPI: false,
    apiKeyRequired: true,
    enableGraphQL: false,
    enableWebSocket: true,
    wsHeartbeatInterval: 50,
    enableCaching: true,
    cacheTTL: 300,
    enableCompression: true,

    // Backup
    enableAutoBackup: false,
    backupInterval: 24,
    backupRetention: 7,
    backupEncryption: true,

    // Advanced
    debugMode: false,
    verboseLogging: false,
    enableBetaFeatures: false,
    customCSS: "",
    customJS: "",
    enableAnalytics: false,
    analyticsId: "",
  });

  const toggle = (key: string) => setConfig(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  const setVal = (key: string, val: any) => setConfig(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-3">
      {/* General Settings */}
      <C2Panel title="GENERAL CONFIGURATION" icon={Settings} color="text-primary">
        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
          <ConfigInput label="Site Name" desc="Platform display name" value={config.siteName} onChange={v => setVal("siteName", v)} />
          <ConfigInput label="Site Description" desc="SEO meta description" value={config.siteDescription} onChange={v => setVal("siteDescription", v)} />
          <ConfigToggle label="Maintenance Mode" desc="Disable public access during maintenance" checked={config.maintenanceMode} onChange={() => toggle("maintenanceMode")} color="destructive" />
          <ConfigToggle label="Open Registration" desc="Allow new user sign-ups" checked={config.registrationOpen} onChange={() => toggle("registrationOpen")} />
          <ConfigInput label="Max Users Per Team" desc="Maximum team members allowed" value={config.maxUsersPerTeam} onChange={v => setVal("maxUsersPerTeam", v)} type="number" />
          <ConfigInput label="Max Teams" desc="Maximum number of teams" value={config.maxTeams} onChange={v => setVal("maxTeams", v)} type="number" />
          <ConfigInput label="Default Timezone" desc="Server timezone for timestamps" value={config.defaultTimezone} onChange={v => setVal("defaultTimezone", v)} />
          <ConfigInput label="Default Language" desc="Platform language code" value={config.defaultLanguage} onChange={v => setVal("defaultLanguage", v)} />
        </div>
      </C2Panel>

      {/* Security Settings */}
      <C2Panel title="SECURITY HARDENING" icon={Shield} color="text-destructive">
        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
          <SectionLabel label="Authentication" color="destructive" />
          <ConfigToggle label="Enforce RLS" desc="Row-Level Security on all tables" checked={config.enforceRLS} onChange={() => toggle("enforceRLS")} color="destructive" />
          <ConfigToggle label="Two-Factor Authentication" desc="Require 2FA for all users" checked={config.enable2FA} onChange={() => toggle("enable2FA")} />
          <ConfigToggle label="Strong Passwords" desc="Enforce minimum complexity requirements" checked={config.enforceStrongPasswords} onChange={() => toggle("enforceStrongPasswords")} />
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
      </C2Panel>

      {/* Rate Limiting */}
      <C2Panel title="RATE LIMITING" icon={Gauge} color="text-neon-orange">
        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          <ConfigToggle label="Enable Rate Limiting" desc="Global rate limit enforcement" checked={config.enableRateLimiting} onChange={() => toggle("enableRateLimiting")} />
          <ConfigInput label="Flag Submit Rate" desc="Max attempts per window" value={config.flagSubmitRate} onChange={v => setVal("flagSubmitRate", v)} type="number" />
          <ConfigInput label="Flag Submit Window (min)" desc="Time window for rate limit" value={config.flagSubmitWindow} onChange={v => setVal("flagSubmitWindow", v)} type="number" />
          <ConfigInput label="API Rate Limit" desc="Max API calls per window" value={config.apiRateLimit} onChange={v => setVal("apiRateLimit", v)} type="number" />
          <ConfigInput label="API Rate Window (sec)" desc="API rate limit window" value={config.apiRateWindow} onChange={v => setVal("apiRateWindow", v)} type="number" />
          <ConfigInput label="Login Rate Limit" desc="Max login attempts per window" value={config.loginRateLimit} onChange={v => setVal("loginRateLimit", v)} type="number" />
          <ConfigInput label="Login Rate Window (min)" desc="Login rate limit window" value={config.loginRateWindow} onChange={v => setVal("loginRateWindow", v)} type="number" />
          <ConfigInput label="Registration Rate" desc="Max signups per window" value={config.registrationRateLimit} onChange={v => setVal("registrationRateLimit", v)} type="number" />
        </div>
      </C2Panel>

      {/* Notification Settings */}
      <C2Panel title="NOTIFICATION CENTER" icon={Bell} color="text-secondary">
        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
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
          <ConfigToggle label="New User Registration" desc="Alert on new sign-ups" checked={config.notifyOnNewUser} onChange={() => toggle("notifyOnNewUser")} />
          <ConfigToggle label="Flag Submission" desc="Alert on every flag attempt" checked={config.notifyOnFlagSubmit} onChange={() => toggle("notifyOnFlagSubmit")} />
          <ConfigToggle label="First Blood" desc="Alert on first solve" checked={config.notifyOnFirstBlood} onChange={() => toggle("notifyOnFirstBlood")} />
          <ConfigToggle label="User Ban" desc="Alert when user is banned" checked={config.notifyOnBan} onChange={() => toggle("notifyOnBan")} />
          <ConfigToggle label="Login Anomaly" desc="Alert on suspicious login" checked={config.notifyOnAnomaly} onChange={() => toggle("notifyOnAnomaly")} />
          <ConfigToggle label="Rate Limit Hit" desc="Alert on rate limit breach" checked={config.notifyOnRateLimit} onChange={() => toggle("notifyOnRateLimit")} />

          <SectionLabel label="Email Config" color="secondary" />
          <ConfigInput label="From Address" desc="Sender email" value={config.emailFromAddress} onChange={v => setVal("emailFromAddress", v)} />
          <ConfigInput label="SMTP Host" desc="Mail server hostname" value={config.smtpHost} onChange={v => setVal("smtpHost", v)} />
          <ConfigInput label="SMTP Port" desc="Mail server port" value={config.smtpPort} onChange={v => setVal("smtpPort", v)} type="number" />
        </div>
      </C2Panel>

      {/* Scoring */}
      <C2Panel title="SCORING ENGINE" icon={Target} color="text-primary">
        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
          <ConfigToggle label="Dynamic Scoring" desc="Points decay as more solve" checked={config.enableDynamicScoring} onChange={() => toggle("enableDynamicScoring")} />
          {config.enableDynamicScoring && (
            <>
              <ConfigInput label="Decay Rate" desc="Points lost per solve" value={config.dynamicScoringDecay} onChange={v => setVal("dynamicScoringDecay", v)} type="number" />
              <ConfigInput label="Minimum Points" desc="Floor for dynamic scoring" value={config.dynamicScoringMinimum} onChange={v => setVal("dynamicScoringMinimum", v)} type="number" />
            </>
          )}
          <ConfigToggle label="First Blood Bonus" desc="Extra points for first solver" checked={config.enableFirstBloodBonus} onChange={() => toggle("enableFirstBloodBonus")} />
          {config.enableFirstBloodBonus && (
            <ConfigInput label="Bonus %" desc="Percentage bonus for first blood" value={config.firstBloodBonusPercent} onChange={v => setVal("firstBloodBonusPercent", v)} type="number" />
          )}
          <ConfigToggle label="Hint System" desc="Allow hint purchases" checked={config.enableHintSystem} onChange={() => toggle("enableHintSystem")} />
          <ConfigInput label="Max Hints" desc="Per challenge" value={config.maxHintsPerChallenge} onChange={v => setVal("maxHintsPerChallenge", v)} type="number" />
          <ConfigToggle label="Writeup Bonus" desc="Award points for writeups" checked={config.enableWriteupBonus} onChange={() => toggle("enableWriteupBonus")} />
          <ConfigToggle label="Streak Bonus" desc="Bonus for consecutive solves" checked={config.enableStreakBonus} onChange={() => toggle("enableStreakBonus")} />
        </div>
      </C2Panel>

      {/* Challenge Settings */}
      <C2Panel title="CHALLENGE CONFIGURATION" icon={Layers} color="text-neon-cyan">
        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          <ConfigToggle label="Categories" desc="Enable challenge categorization" checked={config.enableChallengeCategories} onChange={() => toggle("enableChallengeCategories")} />
          <ConfigToggle label="Difficulty Levels" desc="Show difficulty ratings" checked={config.enableChallengeDifficulty} onChange={() => toggle("enableChallengeDifficulty")} />
          <ConfigToggle label="File Attachments" desc="Allow file uploads to challenges" checked={config.enableChallengeFiles} onChange={() => toggle("enableChallengeFiles")} />
          <ConfigInput label="Max File Size (MB)" desc="Per file limit" value={config.maxFileSize} onChange={v => setVal("maxFileSize", v)} type="number" />
          <ConfigInput label="Allowed File Types" desc="Comma-separated extensions" value={config.allowedFileTypes} onChange={v => setVal("allowedFileTypes", v)} />
          <ConfigToggle label="Flag Format" desc="Enforce flag prefix/suffix" checked={config.enableFlagFormat} onChange={() => toggle("enableFlagFormat")} />
          <ConfigInput label="Flag Prefix" desc="Required flag start" value={config.flagPrefix} onChange={v => setVal("flagPrefix", v)} />
          <ConfigInput label="Flag Suffix" desc="Required flag end" value={config.flagSuffix} onChange={v => setVal("flagSuffix", v)} />
          <ConfigToggle label="Case Sensitive Flags" desc="Exact case match required" checked={config.caseSensitiveFlags} onChange={() => toggle("caseSensitiveFlags")} />
          <ConfigToggle label="Challenge Timer" desc="Time-limited challenges" checked={config.enableChallengeTimer} onChange={() => toggle("enableChallengeTimer")} />
        </div>
      </C2Panel>

      {/* Display Settings */}
      <C2Panel title="DISPLAY & THEMING" icon={Palette} color="text-neon-purple">
        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          <ConfigToggle label="Dark Mode" desc="Enable dark theme" checked={config.enableDarkMode} onChange={() => toggle("enableDarkMode")} />
          <ConfigToggle label="Animations" desc="Enable UI animations" checked={config.enableAnimations} onChange={() => toggle("enableAnimations")} />
          <ConfigToggle label="Scanline Effect" desc="CRT scanline overlay" checked={config.enableScanlines} onChange={() => toggle("enableScanlines")} />
          <ConfigToggle label="Glow Effects" desc="Neon glow on elements" checked={config.enableGlowEffects} onChange={() => toggle("enableGlowEffects")} />
          <ConfigToggle label="Matrix Rain" desc="Background matrix animation" checked={config.enableMatrixRain} onChange={() => toggle("enableMatrixRain")} />
          <ConfigToggle label="Show Leaderboard" desc="Public leaderboard visible" checked={config.showLeaderboard} onChange={() => toggle("showLeaderboard")} />
          <ConfigInput label="Leaderboard Size" desc="Max entries shown" value={config.leaderboardSize} onChange={v => setVal("leaderboardSize", v)} type="number" />
          <ConfigToggle label="Show Solve Count" desc="Display solve numbers" checked={config.showSolveCount} onChange={() => toggle("showSolveCount")} />
          <ConfigToggle label="Show First Blood" desc="Highlight first solvers" checked={config.showFirstBlood} onChange={() => toggle("showFirstBlood")} />
          <ConfigToggle label="Country Flags" desc="Show user country flags" checked={config.showCountryFlags} onChange={() => toggle("showCountryFlags")} />
          <ConfigToggle label="Profile Customization" desc="Let users customize profiles" checked={config.enableProfileCustomization} onChange={() => toggle("enableProfileCustomization")} />
          <ConfigToggle label="Team Avatars" desc="Allow team avatar uploads" checked={config.enableTeamAvatars} onChange={() => toggle("enableTeamAvatars")} />
          <ConfigToggle label="Achievement Badges" desc="Enable badge system" checked={config.enableBadges} onChange={() => toggle("enableBadges")} />
          <ConfigToggle label="Online Status" desc="Show user online/offline" checked={config.showOnlineStatus} onChange={() => toggle("showOnlineStatus")} />
        </div>
      </C2Panel>

      {/* Monitoring */}
      <C2Panel title="MONITORING & LOGGING" icon={Eye} color="text-secondary">
        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          <ConfigToggle label="Audit Logging" desc="Track all admin actions" checked={config.enableAuditLogging} onChange={() => toggle("enableAuditLogging")} />
          <ConfigToggle label="Visitor Tracking" desc="Fingerprint visitors" checked={config.enableVisitorTracking} onChange={() => toggle("enableVisitorTracking")} />
          <ConfigToggle label="Session Tracking" desc="Log user sessions/IPs" checked={config.enableSessionTracking} onChange={() => toggle("enableSessionTracking")} />
          <ConfigToggle label="Anomaly Detection" desc="Detect suspicious patterns" checked={config.enableAnomalyDetection} onChange={() => toggle("enableAnomalyDetection")} />
          <ConfigToggle label="Performance Monitor" desc="Track API response times" checked={config.enablePerformanceMonitoring} onChange={() => toggle("enablePerformanceMonitoring")} />
          <ConfigToggle label="Error Tracking" desc="Log client-side errors" checked={config.enableErrorTracking} onChange={() => toggle("enableErrorTracking")} />
          <ConfigInput label="Log Retention (days)" desc="Auto-delete after N days" value={config.logRetentionDays} onChange={v => setVal("logRetentionDays", v)} type="number" />
          <ConfigInput label="Session Retention (days)" desc="Session log retention" value={config.sessionRetentionDays} onChange={v => setVal("sessionRetentionDays", v)} type="number" />
          <ConfigInput label="Visitor Retention (days)" desc="Visitor log retention" value={config.visitorRetentionDays} onChange={v => setVal("visitorRetentionDays", v)} type="number" />
          <ConfigToggle label="Real-Time Alerts" desc="Live security notifications" checked={config.enableRealTimeAlerts} onChange={() => toggle("enableRealTimeAlerts")} />
          <ConfigToggle label="Alert Sound" desc="Play sound on alerts" checked={config.alertSoundEnabled} onChange={() => toggle("alertSoundEnabled")} />
          <ConfigToggle label="Desktop Notifications" desc="Browser notification popups" checked={config.alertDesktopNotifications} onChange={() => toggle("alertDesktopNotifications")} />
        </div>
      </C2Panel>

      {/* Storage */}
      <C2Panel title="STORAGE & CDN" icon={HardDrive} color="text-neon-orange">
        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          <ConfigInput label="Storage Provider" desc="Backend storage type" value={config.storageProvider} onChange={v => setVal("storageProvider", v)} />
          <ConfigInput label="Max Storage/User (MB)" desc="Per-user storage limit" value={config.maxStoragePerUser} onChange={v => setVal("maxStoragePerUser", v)} type="number" />
          <ConfigToggle label="CDN Enabled" desc="Use CDN for static assets" checked={config.enableCDN} onChange={() => toggle("enableCDN")} />
          {config.enableCDN && <ConfigInput label="CDN URL" desc="CDN base URL" value={config.cdnUrl} onChange={v => setVal("cdnUrl", v)} />}
          <ConfigToggle label="Image Optimization" desc="Auto-compress uploads" checked={config.enableImageOptimization} onChange={() => toggle("enableImageOptimization")} />
          <ConfigInput label="Thumbnail Size (px)" desc="Generated thumbnail dimensions" value={config.thumbnailSize} onChange={v => setVal("thumbnailSize", v)} type="number" />
        </div>
      </C2Panel>

      {/* API Settings */}
      <C2Panel title="API & NETWORKING" icon={Network} color="text-neon-cyan">
        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          <ConfigToggle label="Public API" desc="Expose REST API publicly" checked={config.enablePublicAPI} onChange={() => toggle("enablePublicAPI")} />
          <ConfigToggle label="API Key Required" desc="Require auth for API" checked={config.apiKeyRequired} onChange={() => toggle("apiKeyRequired")} />
          <ConfigToggle label="GraphQL" desc="Enable GraphQL endpoint" checked={config.enableGraphQL} onChange={() => toggle("enableGraphQL")} />
          <ConfigToggle label="WebSocket" desc="Enable realtime WebSocket" checked={config.enableWebSocket} onChange={() => toggle("enableWebSocket")} />
          <ConfigInput label="WS Heartbeat (ms)" desc="WebSocket heartbeat interval" value={config.wsHeartbeatInterval} onChange={v => setVal("wsHeartbeatInterval", v)} type="number" />
          <ConfigToggle label="Response Caching" desc="Cache API responses" checked={config.enableCaching} onChange={() => toggle("enableCaching")} />
          <ConfigInput label="Cache TTL (sec)" desc="Cache time-to-live" value={config.cacheTTL} onChange={v => setVal("cacheTTL", v)} type="number" />
          <ConfigToggle label="Compression" desc="Gzip response compression" checked={config.enableCompression} onChange={() => toggle("enableCompression")} />
        </div>
      </C2Panel>

      {/* Backup */}
      <C2Panel title="BACKUP & RECOVERY" icon={RefreshCw} color="text-primary">
        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          <ConfigToggle label="Auto Backup" desc="Scheduled database backups" checked={config.enableAutoBackup} onChange={() => toggle("enableAutoBackup")} />
          <ConfigInput label="Backup Interval (hours)" desc="Time between backups" value={config.backupInterval} onChange={v => setVal("backupInterval", v)} type="number" />
          <ConfigInput label="Backup Retention (days)" desc="Keep backups for N days" value={config.backupRetention} onChange={v => setVal("backupRetention", v)} type="number" />
          <ConfigToggle label="Backup Encryption" desc="Encrypt backup files" checked={config.backupEncryption} onChange={() => toggle("backupEncryption")} />
          <div className="grid grid-cols-2 gap-2 pt-2">
            <ActionBtn icon={Database} label="Backup Now" color="primary" />
            <ActionBtn icon={RefreshCw} label="Restore" color="neon-orange" />
          </div>
        </div>
      </C2Panel>

      {/* Advanced */}
      <C2Panel title="ADVANCED / DANGEROUS" icon={Bug} color="text-destructive">
        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          <ConfigToggle label="Debug Mode" desc="Enable debug logging (INSECURE)" checked={config.debugMode} onChange={() => toggle("debugMode")} color="destructive" />
          <ConfigToggle label="Verbose Logging" desc="Log all queries and responses" checked={config.verboseLogging} onChange={() => toggle("verboseLogging")} />
          <ConfigToggle label="Beta Features" desc="Enable experimental features" checked={config.enableBetaFeatures} onChange={() => toggle("enableBetaFeatures")} />
          <ConfigToggle label="Analytics" desc="Third-party analytics" checked={config.enableAnalytics} onChange={() => toggle("enableAnalytics")} />
          {config.enableAnalytics && <ConfigInput label="Analytics ID" desc="Tracking code" value={config.analyticsId} onChange={v => setVal("analyticsId", v)} />}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <ActionBtn icon={RefreshCw} label="Clear Cache" color="neon-orange" />
            <ActionBtn icon={Database} label="Reset DB" color="destructive" />
            <ActionBtn icon={Power} label="Restart" color="destructive" />
            <ActionBtn icon={Terminal} label="Console" color="neon-cyan" />
          </div>
        </div>
      </C2Panel>
    </div>
  );
};

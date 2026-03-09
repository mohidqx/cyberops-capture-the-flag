import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Network, Globe, Shield, Ban, Eye, Wifi, Server, AlertTriangle,
  Search, Clock, MapPin, Monitor, Hash, Lock, Unlock, Plus, Trash2,
  Download, RefreshCw, Activity, Zap, BarChart3, TrendingUp
} from "lucide-react";
import { C2Panel, ActionBtn, SectionLabel, ConfigToggle, ConfigInput } from "./C2Shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const NetworkOpsModule = ({ onAction }: { onAction?: (action: string) => void }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchIp, setSearchIp] = useState("");
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [newIp, setNewIp] = useState("");
  const [activeTab, setActiveTab] = useState("sessions");

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase.from("user_sessions").select("*").order("created_at", { ascending: false }).limit(100);
      if (data) setSessions(data);
    };
    fetchSessions();
  }, []);

  const tabs = [
    { id: "sessions", label: "Live Sessions", icon: Wifi },
    { id: "blacklist", label: "IP Blacklist", icon: Ban },
    { id: "geoblock", label: "Geo-Block", icon: Globe },
    { id: "dns", label: "DNS / CDN", icon: Server },
    { id: "firewall", label: "Firewall Rules", icon: Shield },
    { id: "traffic", label: "Traffic Analysis", icon: BarChart3 },
  ];

  const filteredSessions = sessions.filter(s => 
    !searchIp || s.ip_address?.toString().includes(searchIp) || s.country_name?.toLowerCase().includes(searchIp.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Tab Bar */}
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

      {activeTab === "sessions" && (
        <C2Panel title="LIVE SESSION MONITOR" icon={Wifi} color="text-primary">
          <div className="p-3 border-b border-border/20">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="pl-8 h-8 text-xs font-mono" placeholder="Search by IP or country..." value={searchIp} onChange={e => setSearchIp(e.target.value)} />
              </div>
              <Button size="sm" variant="outline" className="h-8 text-[10px] font-mono"><RefreshCw className="w-3 h-3 mr-1" />Refresh</Button>
              <Button size="sm" variant="outline" className="h-8 text-[10px] font-mono"><Download className="w-3 h-3 mr-1" />Export</Button>
            </div>
            <div className="flex gap-4 mt-2 text-[10px] font-mono text-muted-foreground">
              <span>Total: <span className="text-primary">{sessions.length}</span></span>
              <span>Unique IPs: <span className="text-secondary">{new Set(sessions.map(s => s.ip_address)).size}</span></span>
              <span>Countries: <span className="text-neon-cyan">{new Set(sessions.filter(s => s.country_name).map(s => s.country_name)).size}</span></span>
            </div>
          </div>
          <div className="divide-y divide-border/10 max-h-[500px] overflow-y-auto">
            {filteredSessions.slice(0, 50).map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-primary/3 transition-colors group text-xs font-mono"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary font-semibold">{s.ip_address || "Unknown"}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-secondary">{s.country_name || "?"}</span>
                  <span className="text-muted-foreground">{s.city || ""}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{new Date(s.created_at).toLocaleString()}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                    <Ban className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "blacklist" && (
        <C2Panel title="IP BLACKLIST" icon={Ban} color="text-destructive">
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <Input className="h-8 text-xs font-mono flex-1" placeholder="Enter IP or CIDR range..." value={newIp} onChange={e => setNewIp(e.target.value)} />
              <Button size="sm" className="h-8 text-[10px] font-mono" onClick={() => { if (newIp) { setBlacklist([...blacklist, newIp]); setNewIp(""); } }}>
                <Plus className="w-3 h-3 mr-1" />Block
              </Button>
            </div>
            <div className="space-y-1">
              {blacklist.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground font-mono text-sm">No blocked IPs</div>
              ) : blacklist.map((ip, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <Ban className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-destructive font-semibold">{ip}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setBlacklist(blacklist.filter((_, j) => j !== i))}>
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <ActionBtn icon={Download} label="Export List" color="secondary" />
              <ActionBtn icon={RefreshCw} label="Import List" color="neon-cyan" />
            </div>
          </div>
        </C2Panel>
      )}

      {activeTab === "geoblock" && (
        <C2Panel title="GEO-BLOCKING RULES" icon={Globe} color="text-neon-cyan">
          <div className="p-4 space-y-2">
            <ConfigToggle label="Enable Geo-Blocking" desc="Block access from specific countries" checked={false} onChange={() => {}} />
            <SectionLabel label="Blocked Regions" color="neon-cyan" />
            {["North Korea (KP)", "Iran (IR)", "Syria (SY)", "Cuba (CU)"].map(country => (
              <div key={country} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/20 bg-background/40">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Globe className="w-3 h-3 text-destructive" />
                  <span>{country}</span>
                </div>
                <Badge variant="outline" className="text-[9px] border-destructive/20 text-destructive">BLOCKED</Badge>
              </div>
            ))}
            <ConfigInput label="Custom Block List" desc="Country codes (comma-separated)" value="" onChange={() => {}} placeholder="RU,CN,..." />
            <ConfigToggle label="Allow VPN Detection" desc="Detect and flag VPN usage" checked={true} onChange={() => {}} />
            <ConfigToggle label="Block TOR Exit Nodes" desc="Block known TOR IPs" checked={false} onChange={() => {}} />
            <ConfigToggle label="Block Known Proxies" desc="Block datacenter IPs" checked={false} onChange={() => {}} />
          </div>
        </C2Panel>
      )}

      {activeTab === "dns" && (
        <C2Panel title="DNS & CDN CONFIGURATION" icon={Server} color="text-secondary">
          <div className="p-4 space-y-2">
            <ConfigInput label="Primary Domain" desc="Main domain name" value="cyberops-ctf.lovable.app" onChange={() => {}} />
            <ConfigInput label="Custom Domain" desc="CNAME target" value="" onChange={() => {}} placeholder="ctf.yourdomain.com" />
            <ConfigToggle label="HTTPS Only" desc="Force SSL/TLS encryption" checked={true} onChange={() => {}} />
            <ConfigToggle label="HSTS Enabled" desc="HTTP Strict Transport Security" checked={true} onChange={() => {}} />
            <ConfigInput label="SSL Certificate" desc="Certificate status" value="Let's Encrypt (Auto-renew)" onChange={() => {}} />
            <ConfigToggle label="CDN Acceleration" desc="Edge caching for static assets" checked={false} onChange={() => {}} />
            <ConfigInput label="DNS TTL (sec)" desc="DNS cache duration" value="300" onChange={() => {}} type="number" />
            <SectionLabel label="DNS Records" color="secondary" />
            {[
              { type: "A", name: "@", value: "76.76.21.21" },
              { type: "CNAME", name: "www", value: "cyberops-ctf.lovable.app" },
              { type: "TXT", name: "@", value: "v=spf1 include:_spf.google.com ~all" },
              { type: "MX", name: "@", value: "10 mail.cyberops.ctf" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/20 bg-background/40 font-mono text-xs">
                <Badge variant="outline" className="text-[9px] w-14 justify-center">{r.type}</Badge>
                <span className="text-primary w-12">{r.name}</span>
                <span className="text-muted-foreground flex-1 truncate">{r.value}</span>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "firewall" && (
        <C2Panel title="FIREWALL RULES" icon={Shield} color="text-destructive">
          <div className="p-4 space-y-2">
            <ConfigToggle label="Web Application Firewall" desc="Enable WAF protection" checked={true} onChange={() => {}} />
            <ConfigToggle label="DDoS Protection" desc="Rate-based DDoS mitigation" checked={true} onChange={() => {}} />
            <ConfigToggle label="Bot Detection" desc="Block automated requests" checked={false} onChange={() => {}} />
            <ConfigToggle label="SQL Injection Filter" desc="Block SQL injection patterns" checked={true} onChange={() => {}} />
            <ConfigToggle label="XSS Filter" desc="Block cross-site scripting" checked={true} onChange={() => {}} />
            <ConfigToggle label="Path Traversal Guard" desc="Block directory traversal" checked={true} onChange={() => {}} />
            <ConfigToggle label="File Upload Scanner" desc="Scan uploads for malware" checked={false} onChange={() => {}} />
            <ConfigInput label="Max Request Size (KB)" desc="Limit request body size" value="1024" onChange={() => {}} type="number" />
            <ConfigInput label="Max Headers" desc="Limit number of headers" value="50" onChange={() => {}} type="number" />
            <SectionLabel label="Custom Rules" color="destructive" />
            {[
              { rule: "Block User-Agent: sqlmap", action: "DENY", hits: 42 },
              { rule: "Block /wp-admin/* paths", action: "DENY", hits: 156 },
              { rule: "Block /phpmyadmin/* paths", action: "DENY", hits: 89 },
              { rule: "Rate limit /api/* 100/min", action: "LIMIT", hits: 12 },
              { rule: "Block empty referrer on POST", action: "LOG", hits: 234 },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/20 bg-background/40 font-mono text-xs">
                <span className="text-foreground flex-1">{r.rule}</span>
                <Badge variant="outline" className={`text-[9px] ${r.action === "DENY" ? "border-destructive/20 text-destructive" : r.action === "LIMIT" ? "border-neon-orange/20 text-neon-orange" : "border-secondary/20 text-secondary"}`}>{r.action}</Badge>
                <span className="text-muted-foreground ml-2 w-12 text-right">{r.hits}</span>
              </div>
            ))}
          </div>
        </C2Panel>
      )}

      {activeTab === "traffic" && (
        <C2Panel title="TRAFFIC ANALYSIS" icon={BarChart3} color="text-neon-orange">
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Requests/min", value: "142", color: "primary" },
                { label: "Bandwidth", value: "2.4 GB/h", color: "secondary" },
                { label: "Error Rate", value: "0.3%", color: "primary" },
                { label: "Avg Latency", value: "42ms", color: "neon-cyan" },
                { label: "4xx Errors", value: "12", color: "neon-orange" },
                { label: "5xx Errors", value: "0", color: "primary" },
                { label: "Cache Hit Rate", value: "87%", color: "primary" },
                { label: "Unique Visitors", value: "234", color: "secondary" },
              ].map(s => (
                <div key={s.label} className="p-2.5 rounded-lg border border-border/20 bg-background/40">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">{s.label}</div>
                  <div className={`text-sm font-display font-bold text-${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
            <SectionLabel label="Top Endpoints" color="neon-orange" />
            {[
              { path: "/api/challenges", reqs: 1240, avg: "23ms" },
              { path: "/api/submissions", reqs: 890, avg: "45ms" },
              { path: "/api/leaderboard", reqs: 567, avg: "12ms" },
              { path: "/api/profiles", reqs: 445, avg: "18ms" },
              { path: "/api/auth/session", reqs: 334, avg: "8ms" },
            ].map(e => (
              <div key={e.path} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/20 bg-background/40 font-mono text-xs">
                <span className="text-primary">{e.path}</span>
                <div className="flex gap-4 text-muted-foreground">
                  <span>{e.reqs} reqs</span>
                  <span>{e.avg}</span>
                </div>
              </div>
            ))}
          </div>
        </C2Panel>
      )}
    </div>
  );
};

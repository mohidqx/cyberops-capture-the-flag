import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, Cpu, HardDrive, Wifi, Clock, Gauge, Server, Database,
  TrendingUp, BarChart3, Zap, AlertTriangle, RefreshCw, Eye,
  Globe, Network, Monitor, Terminal, Hash, ThermometerSun
} from "lucide-react";
import { C2Panel, SectionLabel, ActionBtn } from "./C2Shared";

export const PerformanceModule = ({ onAction }: { onAction?: (action: string) => void }) => {
  const [metrics, setMetrics] = useState({
    cpuUsage: 12, memoryUsage: 34, diskUsage: 24, networkIn: 1.2, networkOut: 0.8,
    dbConnections: 15, dbPoolSize: 50, queryAvg: 42, cacheHitRate: 87,
    activeWebsockets: 8, requestsPerMin: 142, errorRate: 0.3,
    p50Latency: 23, p95Latency: 89, p99Latency: 234,
  });

  const [history, setHistory] = useState<number[]>(Array(30).fill(0).map(() => Math.random() * 50 + 10));

  useEffect(() => {
    const t = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 8)),
        memoryUsage: Math.max(20, Math.min(80, prev.memoryUsage + (Math.random() - 0.5) * 4)),
        requestsPerMin: Math.max(50, Math.min(500, prev.requestsPerMin + Math.floor((Math.random() - 0.5) * 30))),
        dbConnections: Math.max(5, Math.min(45, prev.dbConnections + Math.floor((Math.random() - 0.5) * 4))),
        activeWebsockets: Math.max(1, Math.min(30, prev.activeWebsockets + Math.floor((Math.random() - 0.5) * 3))),
        queryAvg: Math.max(10, Math.min(200, prev.queryAvg + Math.floor((Math.random() - 0.5) * 15))),
      }));
      setHistory(prev => [...prev.slice(1), Math.random() * 50 + 10]);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const MetricGauge = ({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) => {
    const pct = (value / max) * 100;
    const gaugeColor = pct > 80 ? "destructive" : pct > 60 ? "neon-orange" : color;
    return (
      <div className="p-3 rounded-lg border border-border/20 bg-background/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">{label}</span>
          <span className={`text-sm font-display font-bold text-${gaugeColor}`}>{typeof value === "number" ? value.toFixed(1) : value}{unit}</span>
        </div>
        <div className="h-2 rounded-full bg-border/30 overflow-hidden">
          <motion.div className={`h-full rounded-full bg-${gaugeColor}`}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  };

  const MiniChart = ({ data, color = "primary" }: { data: number[]; color?: string }) => {
    const max = Math.max(...data); const min = Math.min(...data);
    const range = max - min || 1;
    return (
      <div className="flex items-end gap-0.5 h-8">
        {data.map((v, i) => (
          <div key={i} className={`flex-1 rounded-t-sm bg-${color}/60 min-w-[2px]`}
            style={{ height: `${((v - min) / range) * 100}%` }} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Real-time Gauges */}
      <C2Panel title="SYSTEM RESOURCES" icon={Cpu} color="text-primary">
        <div className="p-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
          <MetricGauge label="CPU Usage" value={metrics.cpuUsage} max={100} unit="%" color="primary" />
          <MetricGauge label="Memory Usage" value={metrics.memoryUsage} max={100} unit="%" color="secondary" />
          <MetricGauge label="Disk Usage" value={metrics.diskUsage} max={100} unit="%" color="neon-cyan" />
          <MetricGauge label="DB Connections" value={metrics.dbConnections} max={metrics.dbPoolSize} unit={`/${metrics.dbPoolSize}`} color="primary" />
          <MetricGauge label="Cache Hit Rate" value={metrics.cacheHitRate} max={100} unit="%" color="primary" />
          <MetricGauge label="Error Rate" value={metrics.errorRate} max={10} unit="%" color="primary" />
        </div>
      </C2Panel>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { icon: Activity, label: "Req/min", value: metrics.requestsPerMin, color: "primary" },
          { icon: Clock, label: "Avg Query", value: `${metrics.queryAvg}ms`, color: "secondary" },
          { icon: Wifi, label: "WebSockets", value: metrics.activeWebsockets, color: "neon-cyan" },
          { icon: Network, label: "Net In", value: `${metrics.networkIn} MB/s`, color: "primary" },
          { icon: Network, label: "Net Out", value: `${metrics.networkOut} MB/s`, color: "neon-orange" },
          { icon: Database, label: "DB Pool", value: `${metrics.dbConnections}/${metrics.dbPoolSize}`, color: "secondary" },
        ].map(m => (
          <div key={m.label} className="p-2.5 rounded-lg border border-border/20 bg-background/40">
            <div className="flex items-center gap-1.5 mb-1">
              <m.icon className={`w-3 h-3 text-${m.color}`} />
              <span className="text-[9px] font-mono text-muted-foreground uppercase">{m.label}</span>
            </div>
            <div className={`text-sm font-display font-bold text-${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Latency Distribution */}
      <C2Panel title="LATENCY DISTRIBUTION" icon={Gauge} color="text-neon-orange">
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "P50", value: `${metrics.p50Latency}ms`, color: "primary" },
              { label: "P95", value: `${metrics.p95Latency}ms`, color: "neon-orange" },
              { label: "P99", value: `${metrics.p99Latency}ms`, color: "destructive" },
            ].map(p => (
              <div key={p.label} className="text-center p-3 rounded-lg border border-border/20 bg-background/40">
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">{p.label}</div>
                <div className={`text-lg font-display font-bold text-${p.color}`}>{p.value}</div>
              </div>
            ))}
          </div>
          <SectionLabel label="Request Rate (30s)" color="neon-orange" />
          <div className="p-3 rounded-lg border border-border/20 bg-background/40">
            <MiniChart data={history} color="primary" />
          </div>
        </div>
      </C2Panel>

      {/* Database Performance */}
      <C2Panel title="DATABASE PERFORMANCE" icon={Database} color="text-secondary">
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Active Queries", value: "3", color: "primary" },
              { label: "Slow Queries", value: "0", color: "primary" },
              { label: "Dead Tuples", value: "1.2K", color: "neon-orange" },
              { label: "Table Bloat", value: "2.1%", color: "primary" },
              { label: "Index Usage", value: "94%", color: "primary" },
              { label: "Seq Scans", value: "12/min", color: "secondary" },
              { label: "Cache Ratio", value: "99.2%", color: "primary" },
              { label: "Temp Files", value: "0", color: "primary" },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-lg border border-border/20 bg-background/40">
                <div className="text-[9px] font-mono text-muted-foreground uppercase">{s.label}</div>
                <div className={`text-sm font-display font-bold text-${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
          <SectionLabel label="Top Slow Queries" color="secondary" />
          {[
            { query: "SELECT * FROM submissions WHERE ...", time: "234ms", calls: 45 },
            { query: "SELECT * FROM profiles ORDER BY total_points", time: "156ms", calls: 120 },
            { query: "INSERT INTO audit_logs ...", time: "89ms", calls: 890 },
          ].map((q, i) => (
            <div key={i} className="px-3 py-2 rounded-lg border border-border/20 bg-background/40 font-mono text-xs">
              <div className="text-foreground truncate">{q.query}</div>
              <div className="flex gap-4 mt-1 text-muted-foreground">
                <span>Avg: <span className="text-neon-orange">{q.time}</span></span>
                <span>Calls: <span className="text-secondary">{q.calls}</span></span>
              </div>
            </div>
          ))}
        </div>
      </C2Panel>

      {/* Edge Function Performance */}
      <C2Panel title="EDGE FUNCTION METRICS" icon={Zap} color="text-neon-purple">
        <div className="p-4 space-y-2">
          {[
            { name: "track-visitor", invocations: 1240, avgMs: 45, errors: 2, status: "healthy" },
            { name: "track-session", invocations: 890, avgMs: 32, errors: 0, status: "healthy" },
          ].map(fn => (
            <div key={fn.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/20 bg-background/40">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-neon-purple" />
                <div>
                  <div className="font-mono text-xs font-semibold">{fn.name}</div>
                  <div className="text-[9px] text-muted-foreground">{fn.invocations} calls • {fn.avgMs}ms avg • {fn.errors} errors</div>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${fn.status === "healthy" ? "bg-primary" : "bg-destructive"} animate-pulse`} />
            </div>
          ))}
        </div>
      </C2Panel>

      {/* Quick Actions */}
      <C2Panel title="PERFORMANCE ACTIONS" icon={RefreshCw} color="text-primary">
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <ActionBtn icon={RefreshCw} label="Clear Cache" color="primary" />
          <ActionBtn icon={Database} label="VACUUM" color="secondary" />
          <ActionBtn icon={Activity} label="ANALYZE" color="neon-cyan" />
          <ActionBtn icon={Terminal} label="pg_stat" color="neon-purple" />
          <ActionBtn icon={Gauge} label="Reindex" color="neon-orange" />
          <ActionBtn icon={Server} label="Restart Pool" color="destructive" />
          <ActionBtn icon={Eye} label="Long Queries" color="secondary" />
          <ActionBtn icon={AlertTriangle} label="Kill Query" color="destructive" />
        </div>
      </C2Panel>
    </div>
  );
};

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  event_type: string;
  user_id: string | null;
  target_user_id: string | null;
  challenge_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  user_profile?: { username: string } | null;
  target_profile?: { username: string } | null;
  challenge?: { title: string } | null;
}

const EVENT_TYPE_CONFIG: Record<string, { icon: typeof Shield; color: string; label: string; severity: "info" | "warn" | "error" }> = {
  FLAG_CORRECT: { icon: CheckCircle, color: "text-green-400", label: "Correct Flag", severity: "info" },
  FLAG_INCORRECT: { icon: XCircle, color: "text-muted-foreground", label: "Incorrect Flag", severity: "info" },
  RATE_LIMIT_HIT: { icon: Clock, color: "text-yellow-400", label: "Rate Limited", severity: "warn" },
  SCORE_MANIPULATION_BLOCKED: { icon: AlertTriangle, color: "text-red-400", label: "Score Manipulation Blocked", severity: "error" },
  ADMIN_SCORE_RESET: { icon: Shield, color: "text-blue-400", label: "Admin Score Reset", severity: "warn" },
};

const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const fetchLogs = async () => {
    setLoading(true);
    
    // Fetch logs with profile info
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching audit logs:", error);
      setLoading(false);
      return;
    }

    // Fetch related profiles and challenges
    const userIds = [...new Set([
      ...data.map(l => l.user_id).filter((id): id is string => Boolean(id)),
      ...data.map(l => l.target_user_id).filter((id): id is string => Boolean(id))
    ])];
    const challengeIds = [...new Set(data.map(l => l.challenge_id).filter((id): id is string => Boolean(id)))];

    const [{ data: profiles }, { data: challenges }] = await Promise.all([
      userIds.length > 0 
        ? supabase.from("profiles").select("user_id, username").in("user_id", userIds)
        : Promise.resolve({ data: [] as { user_id: string; username: string }[] }),
      challengeIds.length > 0
        ? supabase.from("challenges").select("id, title").in("id", challengeIds)
        : Promise.resolve({ data: [] as { id: string; title: string }[] })
    ]);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p] as const));
    const challengeMap = new Map((challenges || []).map(c => [c.id, c] as const));

    const enrichedLogs: AuditLog[] = data.map(log => ({
      id: log.id,
      event_type: log.event_type,
      user_id: log.user_id,
      target_user_id: log.target_user_id,
      challenge_id: log.challenge_id,
      details: log.details as Record<string, any> | null,
      ip_address: log.ip_address,
      created_at: log.created_at || new Date().toISOString(),
      user_profile: log.user_id ? profileMap.get(log.user_id) || null : null,
      target_profile: log.target_user_id ? profileMap.get(log.target_user_id) || null : null,
      challenge: log.challenge_id ? challengeMap.get(log.challenge_id) || null : null,
    }));

    setLogs(enrichedLogs);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();

    // Subscribe to new audit logs in real-time
    const channel = supabase
      .channel("audit-logs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_logs" },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLogs = logs.filter(log => {
    const config = EVENT_TYPE_CONFIG[log.event_type];
    
    // Filter by type
    if (filterType !== "all" && log.event_type !== filterType) return false;
    
    // Filter by severity
    if (filterSeverity !== "all" && config?.severity !== filterSeverity) return false;
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesUser = log.user_profile?.username?.toLowerCase().includes(search);
      const matchesTarget = log.target_profile?.username?.toLowerCase().includes(search);
      const matchesChallenge = log.challenge?.title?.toLowerCase().includes(search);
      const matchesType = log.event_type.toLowerCase().includes(search);
      const matchesDetails = JSON.stringify(log.details || {}).toLowerCase().includes(search);
      
      if (!matchesUser && !matchesTarget && !matchesChallenge && !matchesType && !matchesDetails) {
        return false;
      }
    }
    
    return true;
  });

  const suspiciousCount = logs.filter(l => 
    l.event_type === "SCORE_MANIPULATION_BLOCKED" || l.event_type === "RATE_LIMIT_HIT"
  ).length;

  const getEventConfig = (type: string) => {
    return EVENT_TYPE_CONFIG[type] || { 
      icon: Shield, 
      color: "text-muted-foreground", 
      label: type, 
      severity: "info" 
    };
  };

  const renderDetails = (log: AuditLog) => {
    if (!log.details) return null;
    
    const details = log.details;
    
    if (log.event_type === "SCORE_MANIPULATION_BLOCKED") {
      return (
        <div className="text-xs font-mono space-y-1">
          <div>Attempted: <span className="text-red-400">{details.attempted_points} pts</span></div>
          <div>Actual: <span className="text-green-400">{details.actual_points} pts</span></div>
        </div>
      );
    }
    
    if (log.event_type === "ADMIN_SCORE_RESET") {
      return (
        <div className="text-xs font-mono space-y-1">
          <div>Old: {details.old_points} pts ({details.old_solves} solves)</div>
          <div>New: {details.new_points} pts ({details.new_solves} solves)</div>
        </div>
      );
    }
    
    if (log.event_type === "FLAG_CORRECT") {
      return (
        <div className="text-xs font-mono">
          +{details.points_awarded} pts
          {details.first_blood && <Badge variant="outline" className="ml-2 text-yellow-400 border-yellow-400/30">First Blood</Badge>}
        </div>
      );
    }

    if (log.event_type === "RATE_LIMIT_HIT") {
      return (
        <div className="text-xs font-mono text-yellow-400">
          {details.attempts} attempts blocked
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-xl font-bold">Audit Logs</h2>
          {suspiciousCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {suspiciousCount} suspicious events
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
              <SelectItem key={type} value={type}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="error">Critical</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[180px]">Time</TableHead>
              <TableHead className="w-[200px]">Event</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Target/Challenge</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading audit logs...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No logs found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log, index) => {
                const config = getEventConfig(log.event_type);
                const Icon = config.icon;
                
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b border-border/50 ${
                      config.severity === "error" ? "bg-red-500/5" : 
                      config.severity === "warn" ? "bg-yellow-500/5" : ""
                    }`}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.user_profile?.username || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.target_profile?.username && (
                        <span className="text-muted-foreground">→ {log.target_profile.username}</span>
                      )}
                      {log.challenge?.title && (
                        <span className="text-primary">{log.challenge.title}</span>
                      )}
                      {!log.target_profile && !log.challenge && "-"}
                    </TableCell>
                    <TableCell>
                      {renderDetails(log)}
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Showing {filteredLogs.length} of {logs.length} logs (last 200)
      </p>
    </div>
  );
};

export default AuditLogViewer;

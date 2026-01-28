import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, TrendingUp, Clock, Activity, Users, Ban, Globe, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval, eachHourOfInterval, subHours } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditLog {
  id: string;
  event_type: string;
  created_at: string;
  details: Record<string, any> | null;
}

interface SubmissionData {
  created_at: string;
  is_correct: boolean;
}

interface UserSession {
  id: string;
  user_id: string;
  ip_address: string | null;
  country_code: string | null;
  country_name: string | null;
  city: string | null;
  created_at: string;
  profile?: { username: string } | null;
}

const CHART_COLORS = {
  primary: "hsl(142, 100%, 50%)",
  secondary: "hsl(185, 100%, 50%)",
  warning: "hsl(45, 100%, 50%)",
  danger: "hsl(0, 84%, 60%)",
  muted: "hsl(220, 15%, 40%)",
};

const SecurityDashboard = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [bannedCount, setBannedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [logsResult, submissionsResult, bannedResult, sessionsResult] = await Promise.all([
      supabase
        .from("audit_logs")
        .select("id, event_type, created_at, details")
        .gte("created_at", subDays(new Date(), 7).toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("submissions")
        .select("created_at, is_correct")
        .gte("created_at", subDays(new Date(), 7).toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .eq("is_banned", true),
      supabase
        .from("user_sessions")
        .select("*")
        .gte("created_at", subDays(new Date(), 7).toISOString())
        .order("created_at", { ascending: false })
        .limit(100)
    ]);

    if (logsResult.data) setAuditLogs(logsResult.data as AuditLog[]);
    if (submissionsResult.data) setSubmissions(submissionsResult.data);
    if (bannedResult.count !== null) setBannedCount(bannedResult.count);
    
    // Fetch profiles for sessions
    if (sessionsResult.data && sessionsResult.data.length > 0) {
      const userIds = [...new Set(sessionsResult.data.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const enrichedSessions = sessionsResult.data.map(s => ({
        ...s,
        profile: profileMap.get(s.user_id) || null
      }));
      
      setSessions(enrichedSessions as UserSession[]);
    }
    
    setLoading(false);
  };

  // Calculate statistics
  const stats = {
    totalSubmissions: submissions.length,
    correctSubmissions: submissions.filter(s => s.is_correct).length,
    rateLimitHits: auditLogs.filter(l => l.event_type === "RATE_LIMIT_HIT").length,
    manipulationBlocks: auditLogs.filter(l => l.event_type === "SCORE_MANIPULATION_BLOCKED").length,
    bannedUsers: bannedCount,
    uniqueCountries: new Set(sessions.filter(s => s.country_code).map(s => s.country_code)).size,
  };

  // Prepare submission trends (hourly for last 24h)
  const last24Hours = eachHourOfInterval({
    start: subHours(new Date(), 24),
    end: new Date()
  });

  const submissionTrends = last24Hours.map(hour => {
    const hourStr = format(hour, "yyyy-MM-dd'T'HH");
    const hourSubmissions = submissions.filter(s => 
      s.created_at.startsWith(hourStr)
    );
    return {
      time: format(hour, "HH:mm"),
      correct: hourSubmissions.filter(s => s.is_correct).length,
      incorrect: hourSubmissions.filter(s => !s.is_correct).length,
      total: hourSubmissions.length,
    };
  });

  // Prepare daily security events
  const last7Days = eachDayOfInterval({
    start: subDays(startOfDay(new Date()), 6),
    end: startOfDay(new Date())
  });

  const securityTrends = last7Days.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayLogs = auditLogs.filter(l => l.created_at.startsWith(dayStr));
    return {
      date: format(day, "MMM dd"),
      rateLimits: dayLogs.filter(l => l.event_type === "RATE_LIMIT_HIT").length,
      manipulations: dayLogs.filter(l => l.event_type === "SCORE_MANIPULATION_BLOCKED").length,
      bans: dayLogs.filter(l => l.event_type === "USER_BANNED").length,
    };
  });

  // Event type distribution
  const eventDistribution = [
    { name: "Correct Flags", value: auditLogs.filter(l => l.event_type === "FLAG_CORRECT").length, color: CHART_COLORS.primary },
    { name: "Incorrect Flags", value: auditLogs.filter(l => l.event_type === "FLAG_INCORRECT").length, color: CHART_COLORS.muted },
    { name: "Rate Limits", value: stats.rateLimitHits, color: CHART_COLORS.warning },
    { name: "Blocked Manipulations", value: stats.manipulationBlocks, color: CHART_COLORS.danger },
  ].filter(e => e.value > 0);

  // Rate limit trend (hourly)
  const rateLimitTrends = last24Hours.map(hour => {
    const hourStr = format(hour, "yyyy-MM-dd'T'HH");
    const hourLogs = auditLogs.filter(l => 
      l.event_type === "RATE_LIMIT_HIT" && l.created_at.startsWith(hourStr)
    );
    return {
      time: format(hour, "HH:mm"),
      count: hourLogs.length,
    };
  });

  // Country distribution from sessions
  const countryDistribution = Object.entries(
    sessions.reduce((acc, s) => {
      const country = s.country_name || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value], index) => ({ 
      name, 
      value, 
      color: [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.muted][index % 5]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const chartConfig = {
    correct: { label: "Correct", color: CHART_COLORS.primary },
    incorrect: { label: "Incorrect", color: CHART_COLORS.muted },
    total: { label: "Total", color: CHART_COLORS.secondary },
    rateLimits: { label: "Rate Limits", color: CHART_COLORS.warning },
    manipulations: { label: "Manipulations", color: CHART_COLORS.danger },
    bans: { label: "Bans", color: CHART_COLORS.danger },
    count: { label: "Count", color: CHART_COLORS.warning },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading security data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submissions (7d)</p>
                  <p className="text-2xl font-display font-bold">{stats.totalSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-display font-bold">
                    {stats.totalSubmissions > 0 
                      ? Math.round((stats.correctSubmissions / stats.totalSubmissions) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rate Limits (7d)</p>
                  <p className="text-2xl font-display font-bold text-yellow-400">{stats.rateLimitHits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Blocked (7d)</p>
                  <p className="text-2xl font-display font-bold text-destructive">{stats.manipulationBlocks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Ban className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Banned Users</p>
                  <p className="text-2xl font-display font-bold text-destructive">{stats.bannedUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Submission Trends */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Submission Activity (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={submissionTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIncorrect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.muted} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.muted} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(160, 20%, 60%)" 
                    fontSize={10}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="hsl(160, 20%, 60%)" fontSize={10} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="correct" 
                    stroke={CHART_COLORS.primary} 
                    fillOpacity={1} 
                    fill="url(#colorCorrect)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="incorrect" 
                    stroke={CHART_COLORS.muted} 
                    fillOpacity={1} 
                    fill="url(#colorIncorrect)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Events */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Security Events (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={securityTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(160, 20%, 60%)" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis stroke="hsl(160, 20%, 60%)" fontSize={10} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="rateLimits" fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="manipulations" fill={CHART_COLORS.danger} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bans" fill="hsl(280, 100%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Event Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Event Distribution (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center">
                {eventDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {eventDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm">No events in the last 7 days</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rate Limit Trends */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                Rate Limit Activity (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={rateLimitTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(160, 20%, 60%)" 
                    fontSize={10}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="hsl(160, 20%, 60%)" fontSize={10} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={CHART_COLORS.warning} 
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.warning, strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: CHART_COLORS.warning }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 3 - Geo & Sessions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Country Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Globe className="h-4 w-4 text-secondary" />
                Login Locations (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center">
                {countryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={countryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name} (${value})`}
                        labelLine={false}
                      >
                        {countryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center">
                    <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No session data yet</p>
                    <p className="text-xs text-muted-foreground/60">Sessions are tracked on user login</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Recent Sessions
                {stats.uniqueCountries > 0 && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {stats.uniqueCountries} countries
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                {sessions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20">
                        <TableHead className="text-xs">User</TableHead>
                        <TableHead className="text-xs">Location</TableHead>
                        <TableHead className="text-xs">IP</TableHead>
                        <TableHead className="text-xs">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.slice(0, 20).map((session) => (
                        <TableRow key={session.id} className="text-xs">
                          <TableCell className="font-mono py-2">
                            {session.profile?.username || "Unknown"}
                          </TableCell>
                          <TableCell className="py-2">
                            {session.city && session.country_code 
                              ? `${session.city}, ${session.country_code}`
                              : session.country_name || "—"
                            }
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground py-2">
                            {session.ip_address || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-2">
                            {format(new Date(session.created_at), "MMM d, HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No sessions recorded</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SecurityDashboard;

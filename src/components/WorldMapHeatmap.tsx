import { useEffect, useState, useMemo, Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { Globe, MapPin, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GeoPoint {
  lat: number;
  lng: number;
  count: number;
  city: string | null;
  country: string | null;
}

// Error boundary to prevent crashes
class MapErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center h-[350px] gap-3">
          <AlertTriangle className="w-8 h-8 text-neon-orange" />
          <span className="text-muted-foreground text-sm font-mono">Map failed to render</span>
          <button onClick={() => this.setState({ hasError: false })} className="text-xs text-primary hover:underline font-mono">Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const projectPoint = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

const MapContent = () => {
  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<GeoPoint | null>(null);

  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 400;

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const { data: sessions } = await supabase
          .from("user_sessions")
          .select("latitude, longitude, city, country_name")
          .not("latitude", "is", null)
          .not("longitude", "is", null);

        if (sessions) {
          const pointMap = new Map<string, GeoPoint>();
          sessions.forEach(s => {
            if (s.latitude == null || s.longitude == null) return;
            const lat = Number(s.latitude);
            const lng = Number(s.longitude);
            if (isNaN(lat) || isNaN(lng)) return;
            const key = `${Math.round(lat)}:${Math.round(lng)}`;
            const existing = pointMap.get(key);
            if (existing) {
              existing.count += 1;
            } else {
              pointMap.set(key, { lat, lng, count: 1, city: s.city, country: s.country_name });
            }
          });
          setGeoPoints(Array.from(pointMap.values()));
        }
      } catch (e) {
        console.error("Failed to fetch geo data:", e);
      }
      setLoading(false);
    };
    fetchGeoData();
  }, []);

  const maxCount = useMemo(() => Math.max(1, ...geoPoints.map(p => p.count)), [geoPoints]);

  const getHeatColor = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return { fill: "hsl(var(--destructive))", opacity: 0.9 };
    if (ratio > 0.4) return { fill: "hsl(var(--neon-orange))", opacity: 0.8 };
    if (ratio > 0.2) return { fill: "hsl(var(--secondary))", opacity: 0.7 };
    return { fill: "hsl(var(--primary))", opacity: 0.6 };
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 flex items-center justify-center h-[350px]">
        <div className="text-muted-foreground text-sm font-mono flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading map data...
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-secondary" />
          <span className="font-display text-sm font-bold">Login Heatmap</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" />Low</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-secondary" />Medium</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-neon-orange" />High</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive" />Critical</div>
        </div>
      </div>

      <div className="relative p-4">
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="w-full h-auto" style={{ maxHeight: '300px' }}>
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="hsl(var(--background))" rx="8" />
          
          {/* Grid */}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * (MAP_HEIGHT / 6)} x2={MAP_WIDTH} y2={i * (MAP_HEIGHT / 6)} stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.15" />
          ))}
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * (MAP_WIDTH / 12)} y1="0" x2={i * (MAP_WIDTH / 12)} y2={MAP_HEIGHT} stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.15" />
          ))}

          {/* Continents */}
          <path d="M100,80 L130,60 L170,55 L190,70 L195,100 L185,130 L160,140 L130,130 L110,115 L100,95 Z" fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />
          <path d="M160,160 L175,150 L190,165 L195,200 L185,240 L170,260 L155,250 L150,220 L145,190 Z" fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />
          <path d="M380,60 L420,55 L440,65 L445,80 L435,95 L410,100 L390,90 L380,75 Z" fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />
          <path d="M390,120 L430,110 L460,130 L465,180 L450,230 L420,250 L400,240 L385,200 L380,160 Z" fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />
          <path d="M450,50 L550,40 L620,55 L660,80 L650,120 L610,140 L560,130 L520,110 L480,100 L460,80 Z" fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />
          <path d="M620,220 L680,210 L710,230 L700,260 L660,270 L630,255 Z" fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />

          {/* Heat points */}
          {geoPoints.map((point, i) => {
            const { x, y } = projectPoint(point.lat, point.lng, MAP_WIDTH, MAP_HEIGHT);
            const heat = getHeatColor(point.count);
            const radius = Math.min(4 + point.count * 2, 20);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={radius * 2.5} fill={heat.fill} opacity={heat.opacity * 0.15} />
                <circle cx={x} cy={y} r={radius * 1.5} fill={heat.fill} opacity={heat.opacity * 0.25} />
                <circle cx={x} cy={y} r={radius} fill={heat.fill} opacity={heat.opacity} className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(point)} onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle cx={x} cy={y} r={2} fill="white" opacity="0.8" />
              </g>
            );
          })}

          {geoPoints.length === 0 && (
            <text x={MAP_WIDTH / 2} y={MAP_HEIGHT / 2} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="14" fontFamily="var(--font-mono)">
              No geo data available — sessions are tracked on login
            </text>
          )}
        </svg>

        {hoveredPoint && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 glass rounded-lg px-4 py-2 text-xs font-mono flex items-center gap-2 pointer-events-none"
          >
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-foreground font-semibold">
              {hoveredPoint.city ? `${hoveredPoint.city}, ` : ''}{hoveredPoint.country || 'Unknown'}
            </span>
            <span className="text-muted-foreground">— {hoveredPoint.count} login{hoveredPoint.count !== 1 ? 's' : ''}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const WorldMapHeatmap = () => (
  <MapErrorBoundary>
    <MapContent />
  </MapErrorBoundary>
);

export default WorldMapHeatmap;

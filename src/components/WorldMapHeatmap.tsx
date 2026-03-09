import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Globe, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GeoPoint {
  lat: number;
  lng: number;
  count: number;
  city: string | null;
  country: string | null;
}

// Simple equirectangular projection
const projectPoint = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

// Simplified world map SVG paths (continents outline)
const WORLD_PATH = "M171,78l-2,1l-1,2l2,1l2,-1l1,-2l-2,-1z M180,75l-3,1l-1,3l1,2l3,-1l1,-3l-1,-2z M48,95l5,3l3,-2l-1,-4l-5,-1l-3,2l1,2z M85,65l-8,2l-3,5l2,4l6,1l5,-3l1,-5l-3,-4z M100,55l-3,2l1,4l3,2l3,-2l-1,-4l-3,-2z M140,50l-4,1l-2,3l1,3l4,1l3,-2l1,-3l-3,-3z M155,80l-10,3l-4,6l2,5l8,2l7,-4l2,-6l-5,-6z M135,90l-6,2l-3,4l1,4l6,1l4,-3l1,-4l-3,-4z M175,95l-4,2l-2,3l1,3l4,1l3,-2l1,-3l-3,-4z";

const WorldMapHeatmap = () => {
  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<GeoPoint | null>(null);

  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 400;

  useEffect(() => {
    const fetchGeoData = async () => {
      const { data: sessions } = await supabase
        .from("user_sessions")
        .select("latitude, longitude, city, country_name")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (sessions) {
        // Aggregate points by approximate location
        const pointMap = new Map<string, GeoPoint>();
        sessions.forEach(s => {
          if (s.latitude == null || s.longitude == null) return;
          const key = `${Math.round(s.latitude)}:${Math.round(s.longitude)}`;
          const existing = pointMap.get(key);
          if (existing) {
            existing.count += 1;
          } else {
            pointMap.set(key, {
              lat: Number(s.latitude),
              lng: Number(s.longitude),
              count: 1,
              city: s.city,
              country: s.country_name,
            });
          }
        });
        setGeoPoints(Array.from(pointMap.values()));
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
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Low
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            Medium
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-neon-orange" />
            High
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            Critical
          </div>
        </div>
      </div>

      <div className="relative p-4">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="w-full h-auto"
          style={{ maxHeight: '300px' }}
        >
          {/* Background */}
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="hsl(var(--background))" rx="8" />
          
          {/* Grid lines */}
          {Array.from({ length: 7 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0" y1={i * (MAP_HEIGHT / 6)}
              x2={MAP_WIDTH} y2={i * (MAP_HEIGHT / 6)}
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.15"
            />
          ))}
          {Array.from({ length: 13 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * (MAP_WIDTH / 12)} y1="0"
              x2={i * (MAP_WIDTH / 12)} y2={MAP_HEIGHT}
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.15"
            />
          ))}

          {/* Simplified continent outlines */}
          {/* North America */}
          <path d="M100,80 L130,60 L170,55 L190,70 L195,100 L185,130 L160,140 L130,130 L110,115 L100,95 Z" 
            fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />
          {/* South America */}
          <path d="M160,160 L175,150 L190,165 L195,200 L185,240 L170,260 L155,250 L150,220 L145,190 Z" 
            fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />
          {/* Europe */}
          <path d="M380,60 L420,55 L440,65 L445,80 L435,95 L410,100 L390,90 L380,75 Z" 
            fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />
          {/* Africa */}
          <path d="M390,120 L430,110 L460,130 L465,180 L450,230 L420,250 L400,240 L385,200 L380,160 Z" 
            fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />
          {/* Asia */}
          <path d="M450,50 L550,40 L620,55 L660,80 L650,120 L610,140 L560,130 L520,110 L480,100 L460,80 Z" 
            fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />
          {/* Australia */}
          <path d="M620,220 L680,210 L710,230 L700,260 L660,270 L630,255 Z" 
            fill="hsl(var(--muted))" opacity="0.15" stroke="hsl(var(--border))" strokeWidth="0.5" />

          {/* Heat points with glow */}
          {geoPoints.map((point, i) => {
            const { x, y } = projectPoint(point.lat, point.lng, MAP_WIDTH, MAP_HEIGHT);
            const heat = getHeatColor(point.count);
            const radius = Math.min(4 + point.count * 2, 20);
            
            return (
              <g key={i}>
                {/* Glow */}
                <circle
                  cx={x} cy={y} r={radius * 2.5}
                  fill={heat.fill}
                  opacity={heat.opacity * 0.15}
                />
                <circle
                  cx={x} cy={y} r={radius * 1.5}
                  fill={heat.fill}
                  opacity={heat.opacity * 0.25}
                />
                {/* Core point */}
                <circle
                  cx={x} cy={y} r={radius}
                  fill={heat.fill}
                  opacity={heat.opacity}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <animate
                    attributeName="opacity"
                    values={`${heat.opacity};${heat.opacity * 0.5};${heat.opacity}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Center dot */}
                <circle cx={x} cy={y} r={2} fill="white" opacity="0.8" />
              </g>
            );
          })}

          {/* No data message */}
          {geoPoints.length === 0 && (
            <text x={MAP_WIDTH / 2} y={MAP_HEIGHT / 2} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="14" fontFamily="var(--font-mono)">
              No geo data available — sessions are tracked on login
            </text>
          )}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
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

export default WorldMapHeatmap;

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GeoData {
  ip: string;
  country_code?: string;
  country_name?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

async function getGeoLocation(ip: string): Promise<GeoData> {
  try {
    // Using ip-api.com (free, no API key needed, 45 requests/minute)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,lat,lon`);
    const data = await response.json();
    
    if (data.status === "success") {
      return {
        ip,
        country_code: data.countryCode,
        country_name: data.country,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
      };
    }
  } catch (error) {
    console.error("Geolocation lookup failed:", error);
  }
  
  return { ip };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP from headers (Supabase Edge Functions provide this)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || req.headers.get("x-real-ip")
      || "unknown";
    
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Skip geolocation for local/private IPs
    const isPrivateIp = clientIp === "unknown" 
      || clientIp.startsWith("10.") 
      || clientIp.startsWith("192.168.") 
      || clientIp.startsWith("172.") 
      || clientIp === "127.0.0.1"
      || clientIp === "::1";

    let geoData: GeoData = { ip: clientIp };
    
    if (!isPrivateIp) {
      geoData = await getGeoLocation(clientIp);
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Log the session
    const { data, error } = await supabase.rpc("log_user_session", {
      _ip_address: geoData.ip,
      _country_code: geoData.country_code || null,
      _country_name: geoData.country_name || null,
      _city: geoData.city || null,
      _latitude: geoData.latitude || null,
      _longitude: geoData.longitude || null,
      _user_agent: userAgent,
    });

    if (error) {
      console.error("Failed to log session:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        geo: {
          country: geoData.country_name,
          city: geoData.city,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

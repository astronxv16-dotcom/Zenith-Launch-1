import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, MapPin, AlertCircle } from "lucide-react";

interface WeatherData {
  temp: number;
  feels_like: number;
  desc: string;
  humidity: number;
  wind: number;
  city: string;
}

const CONDITION_ICONS: Record<string, typeof Sun> = {
  sunny: Sun,
  clear: Sun,
  cloud: Cloud,
  overcast: Cloud,
  rain: CloudRain,
  drizzle: CloudRain,
  thunder: CloudLightning,
  snow: CloudSnow,
  blizzard: CloudSnow,
  wind: Wind,
  fog: Cloud,
  mist: Cloud,
};

function getWeatherIcon(desc: string): typeof Sun {
  const lower = desc.toLowerCase();
  for (const [key, Icon] of Object.entries(CONDITION_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return Cloud;
}

const glassStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '20px',
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async (lat: number, lon: number, city: string) => {
      try {
        const res = await fetch(
          `https://wttr.in/${lat},${lon}?format=j1`,
          { headers: { 'Accept': 'application/json' } }
        );
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        const cc = data.current_condition[0];
        if (!cancelled) {
          setWeather({
            temp: parseInt(cc.temp_C),
            feels_like: parseInt(cc.FeelsLikeC),
            desc: cc.weatherDesc[0].value,
            humidity: parseInt(cc.humidity),
            wind: Math.round(parseInt(cc.windspeedKmph)),
            city,
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Weather unavailable");
          setLoading(false);
        }
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude.toFixed(2);
          const lon = pos.coords.longitude.toFixed(2);
          fetchWeather(parseFloat(lat), parseFloat(lon), "Your Location");
        },
        () => {
          fetchWeather(0, 0, "");
        },
        { timeout: 8000 }
      );
    } else {
      setError("Location not available");
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div style={glassStyle} className="px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/8 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-20 rounded-full bg-white/8 animate-pulse" />
          <div className="h-2 w-14 rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div style={glassStyle} className="px-4 py-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-white/20 flex-none" />
        <span className="text-sm font-light text-white/25">{error || "Weather unavailable"}</span>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.desc);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={glassStyle}
      className="px-4 py-4"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <WeatherIcon className="w-6 h-6 text-white/55" strokeWidth={1.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-thin text-white/80" style={{ letterSpacing: '-0.02em' }}>
              {weather.temp}°
            </span>
            <span className="text-sm font-light text-white/35">C</span>
          </div>
          <p className="text-xs font-light text-white/40 mt-0.5 truncate">{weather.desc}</p>
        </div>
        <div className="text-right space-y-1">
          <div className="flex items-center gap-1 justify-end">
            <Droplets className="w-3 h-3 text-white/25" />
            <span className="text-[11px] font-light text-white/30">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Wind className="w-3 h-3 text-white/25" />
            <span className="text-[11px] font-light text-white/30">{weather.wind} km/h</span>
          </div>
        </div>
      </div>
      {weather.city && (
        <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <MapPin className="w-3 h-3 text-white/20 flex-none" />
          <span className="text-[10px] font-light tracking-wide text-white/22">
            {weather.city} · Feels {weather.feels_like}°C
          </span>
        </div>
      )}
    </motion.div>
  );
}

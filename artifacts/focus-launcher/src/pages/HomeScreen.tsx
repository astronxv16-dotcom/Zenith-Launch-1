import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { useToast } from "@/hooks/use-toast";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

const ALIGN_FLEX: Record<string, string> = {
  left: 'items-start',
  center: 'items-center',
  right: 'items-end',
};

const ALIGN_TEXT: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

// Thin frosted glass styles
const thinGlass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(18px) saturate(160%)',
  WebkitBackdropFilter: 'blur(18px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '20px',
};

const clockGlass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(22px) saturate(180%)',
  WebkitBackdropFilter: 'blur(22px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '28px',
};

export function HomeScreen() {
  const { state } = useLauncherStore();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const favorites = state.apps.filter(a => a.isFavorite && !a.isHidden);
  const align = state.favoritesAlign || 'left';

  const handleFavoriteClick = (app: typeof favorites[0]) => {
    if (app.isBlocked) { toast({ title: "App blocked", description: "Stay focused." }); return; }
    toast({ title: `Opening ${app.name}...` });
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" data-testid="home-screen">

      {/* Clock + Date — aesthetic frosted glass card at top */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-5 mt-14 mb-0"
        style={clockGlass}
      >
        <div className="flex flex-col items-center py-7 px-6">
          <p className="text-[10px] font-light tracking-[0.25em] uppercase text-white/30 mb-3">
            {getGreeting()}
          </p>
          <h1
            className="font-thin leading-none text-white/90 tabular-nums"
            style={{ fontSize: 'clamp(5rem, 22vw, 8rem)', letterSpacing: '-0.02em' }}
            data-testid="text-time"
          >
            {formatTime(now)}
          </h1>
          <p className="mt-3 text-sm font-light tracking-widest text-white/35" data-testid="text-date">
            {formatDate(now)}
          </p>
        </div>
      </motion.div>

      <div className="flex-1" />

      {/* Swipe indicators */}
      <div className="flex justify-center gap-1.5 mb-4">
        <span className="w-5 h-[1.5px] rounded-full bg-white/15" />
        <span className="w-2 h-[1.5px] rounded-full bg-white/35" />
        <span className="w-5 h-[1.5px] rounded-full bg-white/15" />
      </div>

      {/* Favorites — thin frosted glass */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mx-5 mb-10"
          style={thinGlass}
        >
          <div className={`flex flex-col ${ALIGN_FLEX[align]} py-2 px-2`}>
            {favorites.slice(0, 6).map((app) => (
              <button
                key={app.id}
                onClick={() => handleFavoriteClick(app)}
                className={`py-2.5 px-3 rounded-xl active:bg-white/6 transition-colors w-full ${ALIGN_TEXT[align]}`}
                data-testid={`fav-${app.id}`}
              >
                <span className="text-sm font-light text-white/65 tracking-wide">{app.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

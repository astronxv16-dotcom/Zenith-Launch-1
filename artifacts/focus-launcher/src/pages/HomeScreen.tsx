import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { WallpaperPicker, WALLPAPER_GRADIENTS } from "@/components/WallpaperPicker";
import { SettingsModal } from "@/components/SettingsModal";
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

const ALIGN_CLASS: Record<string, string> = {
  left: 'items-start',
  center: 'items-center',
  right: 'items-end',
};

const TEXT_ALIGN_CLASS: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function HomeScreen() {
  const { state } = useLauncherStore();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const favorites = state.apps.filter(a => a.isFavorite && !a.isHidden);

  const bgStyle: React.CSSProperties = state.wallpaperImage
    ? {
        backgroundImage: `url(${state.wallpaperImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: WALLPAPER_GRADIENTS[state.wallpaper] ?? WALLPAPER_GRADIENTS['none'],
      };

  const handleFavoriteClick = (app: typeof favorites[0]) => {
    if (app.isBlocked) {
      toast({ title: "App blocked", description: "Stay focused." });
      return;
    }
    toast({ title: `Opening ${app.name}...` });
  };

  const align = state.favoritesAlign || 'left';

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={bgStyle}
      data-testid="home-screen"
    >
      {/* Dark overlay for readability when using photo wallpaper */}
      {state.wallpaperImage && (
        <div className="absolute inset-0 bg-black/35 pointer-events-none" />
      )}

      {/* Settings button — top right */}
      <div className="absolute top-12 right-5 z-20">
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full glass-panel"
          data-testid="btn-home-settings"
        >
          <Settings className="w-4 h-4 opacity-40" />
        </button>
      </div>

      {/* Date + Time — top center */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center pt-14 px-6"
      >
        <p className="text-[11px] font-light tracking-widest uppercase opacity-35 mb-2">
          {getGreeting()}
        </p>
        <h1
          className="font-extralight leading-none tracking-tight text-white/80"
          style={{ fontSize: 'clamp(4.5rem, 20vw, 7.5rem)' }}
          data-testid="text-time"
        >
          {formatTime(now)}
        </h1>
        <p
          className="mt-2 text-sm font-light tracking-wide text-white/40"
          data-testid="text-date"
        >
          {formatDate(now)}
        </p>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Swipe hint */}
      <div className="flex justify-center gap-2 mb-5 relative z-10">
        <span className="w-6 h-[2px] rounded-full bg-white/12" />
        <span className="w-2 h-[2px] rounded-full bg-white/28" />
        <span className="w-6 h-[2px] rounded-full bg-white/12" />
      </div>

      {/* Favorites — vertical list */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative z-10 mx-5 mb-10 glass-panel rounded-3xl px-5 py-4"
        >
          <div className={`flex flex-col ${ALIGN_CLASS[align]} gap-1`}>
            {favorites.slice(0, 6).map((app) => (
              <button
                key={app.id}
                onClick={() => handleFavoriteClick(app)}
                className={`py-2 px-3 rounded-xl active:scale-[0.97] transition-transform w-full ${TEXT_ALIGN_CLASS[align]}`}
                data-testid={`fav-${app.id}`}
              >
                <span className="text-sm font-light text-white/65 tracking-wide">
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <WallpaperPicker isOpen={showWallpaper} onClose={() => setShowWallpaper(false)} />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenWallpaper={() => setShowWallpaper(true)}
      />
    </div>
  );
}

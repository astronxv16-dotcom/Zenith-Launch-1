import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { WallpaperPicker } from "@/components/WallpaperPicker";
import { useToast } from "@/hooks/use-toast";

const WALLPAPERS: Record<string, string> = {
  'misty-lavender': 'linear-gradient(160deg, #ddd6fe 0%, #e0e7ff 40%, #f0f4ff 100%)',
  'warm-sand': 'linear-gradient(160deg, #fde68a 0%, #fef3c7 40%, #fffbeb 100%)',
  'ocean-fog': 'linear-gradient(160deg, #bae6fd 0%, #e0f2fe 40%, #f0f9ff 100%)',
  'forest-morning': 'linear-gradient(160deg, #bbf7d0 0%, #d1fae5 40%, #f0fdf4 100%)',
  'rose-dusk': 'linear-gradient(160deg, #fecdd3 0%, #ffe4e6 40%, #fff1f2 100%)',
};

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

export function HomeScreen() {
  const { state } = useLauncherStore();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());
  const [showWallpaper, setShowWallpaper] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const favorites = state.apps.filter(a => a.isFavorite && !a.isHidden);
  const wallpaperGradient = WALLPAPERS[state.wallpaper] || WALLPAPERS['misty-lavender'];

  const handleFavoriteClick = (app: typeof favorites[0]) => {
    if (app.isBlocked) {
      toast({ title: "App is blocked", description: "Take a breath and stay focused." });
      return;
    }
    toast({ title: `Opening ${app.name}...`, description: "Launching app" });
  };

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: wallpaperGradient }}
      data-testid="home-screen"
    >
      {/* Settings button */}
      <div className="absolute top-12 right-6 z-10">
        <button
          onClick={() => setShowWallpaper(true)}
          className="p-2 rounded-full glass-panel"
          data-testid="btn-home-menu"
        >
          <MoreHorizontal className="w-5 h-5 opacity-50" />
        </button>
      </div>

      {/* Main content — time + date */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <p className="text-sm font-light tracking-widest uppercase opacity-50 mb-3">
            {getGreeting()}
          </p>
          <h1
            className="font-extralight leading-none tracking-tight"
            style={{ fontSize: 'clamp(5rem, 22vw, 8rem)', color: 'rgba(30,20,60,0.75)' }}
            data-testid="text-time"
          >
            {formatTime(now)}
          </h1>
          <p
            className="mt-4 text-base font-light tracking-wide"
            style={{ color: 'rgba(30,20,60,0.5)' }}
            data-testid="text-date"
          >
            {formatDate(now)}
          </p>
        </motion.div>
      </div>

      {/* Swipe hint indicators */}
      <div className="flex justify-center gap-2 mb-6">
        <span className="w-8 h-[2px] rounded-full bg-black/10" />
        <span className="w-2 h-[2px] rounded-full bg-black/20" />
        <span className="w-8 h-[2px] rounded-full bg-black/10" />
      </div>

      {/* Favorites row */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-4 mb-10 glass-panel rounded-3xl px-6 py-4"
        >
          <div className="flex items-center justify-around">
            {favorites.slice(0, 5).map((app) => (
              <button
                key={app.id}
                onClick={() => handleFavoriteClick(app)}
                className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl active:scale-95 transition-transform"
                data-testid={`fav-${app.id}`}
              >
                <span
                  className="text-xs font-light tracking-wide opacity-70 max-w-[56px] text-center leading-tight"
                  style={{ color: 'rgba(30,20,60,0.8)' }}
                >
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <WallpaperPicker isOpen={showWallpaper} onClose={() => setShowWallpaper(false)} />
    </div>
  );
}

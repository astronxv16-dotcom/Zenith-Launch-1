import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { WallpaperPicker } from "@/components/WallpaperPicker";
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
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

interface HomeScreenProps {
  onModalChange?: (open: boolean) => void;
}

export function HomeScreen({ onModalChange }: HomeScreenProps) {
  const { state } = useLauncherStore();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const openModal = (open: boolean) => {
    onModalChange?.(open);
    if (!open) { setShowWallpaper(false); setShowSettings(false); }
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const favorites = state.apps.filter(a => a.isFavorite && !a.isHidden);
  const align = state.favoritesAlign || 'left';

  const handleFavoriteClick = (app: typeof favorites[0]) => {
    if (app.isBlocked) {
      toast({ title: "App blocked", description: "Stay focused." });
      return;
    }
    toast({ title: `Opening ${app.name}...` });
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" data-testid="home-screen">
      {/* Settings button — top right */}
      <div className="absolute top-12 right-5 z-20">
        <button
          onClick={() => { setShowSettings(true); onModalChange?.(true); }}
          className="p-2 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          data-testid="btn-home-settings"
        >
          <Settings className="w-4 h-4 text-white/50" />
        </button>
      </div>

      {/* Date + Time — top center */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center pt-14 px-6"
      >
        <p className="text-[11px] font-light tracking-widest uppercase text-white/35 mb-2">
          {getGreeting()}
        </p>
        <h1
          className="font-extralight leading-none tracking-tight text-white/85"
          style={{ fontSize: 'clamp(4.5rem, 20vw, 7.5rem)' }}
          data-testid="text-time"
        >
          {formatTime(now)}
        </h1>
        <p className="mt-2 text-sm font-light tracking-wide text-white/40" data-testid="text-date">
          {formatDate(now)}
        </p>
      </motion.div>

      <div className="flex-1" />

      {/* Swipe hint */}
      <div className="flex justify-center gap-2 mb-5 relative z-10">
        <span className="w-6 h-[2px] rounded-full bg-white/12" />
        <span className="w-2 h-[2px] rounded-full bg-white/30" />
        <span className="w-6 h-[2px] rounded-full bg-white/12" />
      </div>

      {/* Favorites — vertical list, near-transparent frosted glass */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 mx-5 mb-10"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '24px',
            padding: '10px 8px',
          }}
        >
          <div className={`flex flex-col ${ALIGN_CLASS[align]} gap-0`}>
            {favorites.slice(0, 6).map((app) => (
              <button
                key={app.id}
                onClick={() => handleFavoriteClick(app)}
                className="py-2.5 px-4 rounded-xl active:bg-white/8 transition-colors w-full"
                data-testid={`fav-${app.id}`}
              >
                <span className="text-sm font-light text-white/70 tracking-wide">
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modals — stop propagation so swipe doesn't trigger */}
      {showWallpaper && (
        <div onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          <WallpaperPicker isOpen={showWallpaper} onClose={() => openModal(false)} />
        </div>
      )}
      {showSettings && (
        <div onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          <SettingsModal
            isOpen={showSettings}
            onClose={() => openModal(false)}
            onOpenWallpaper={() => { setShowSettings(false); setShowWallpaper(true); }}
          />
        </div>
      )}
    </div>
  );
}

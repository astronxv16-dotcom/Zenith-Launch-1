import { useState, useEffect, useRef, useCallback } from "react";
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

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(d: Date) {
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

const ALIGN_FLEX: Record<string, string> = { left: 'items-start', center: 'items-center', right: 'items-end' };
const ALIGN_TEXT: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };

interface HomeScreenProps {
  onLock?: () => void;
}

export function HomeScreen({ onLock }: HomeScreenProps) {
  const { state } = useLauncherStore();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const favorites = state.apps.filter(a => a.isFavorite && !a.isHidden);
  const align = state.favoritesAlign || 'left';

  const openClock = useCallback(() => {
    const intents = [
      'intent://com.android.deskclock#Intent;scheme=android-app;end',
      'android-app://com.android.deskclock/',
      'clock://',
    ];
    let opened = false;
    for (const intent of intents) {
      try {
        window.location.href = intent;
        opened = true;
        break;
      } catch { /* try next */ }
    }
    if (!opened) toast({ title: "Opening Clock..." });
  }, [toast]);

  const handleClockTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const delta = now - lastTapRef.current;
    if (delta < 350 && delta > 0) {
      onLock?.();
    } else {
      lastTapRef.current = now;
      const timer = setTimeout(() => {
        if (Date.now() - lastTapRef.current >= 340) {
          openClock();
        }
      }, 360);
      return () => clearTimeout(timer);
    }
  }, [openClock, onLock]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" data-testid="home-screen">

      {/* 3D Clock */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center pt-14 px-6"
        style={{ perspective: '600px' }}
      >
        <p
          className="text-[10px] font-light tracking-[0.28em] uppercase mb-3 select-none"
          style={{ color: 'rgba(255,255,255,0.45)', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
        >
          {getGreeting()}
        </p>

        {/* 3D Time display */}
        <div
          className="relative cursor-pointer select-none active:scale-95 transition-transform"
          onClick={handleClockTap}
          onTouchEnd={handleClockTap}
          title="Tap to open Clock · Double-tap to lock"
        >
          {/* Shadow layer (depth) */}
          <h1
            aria-hidden
            className="font-thin leading-none tabular-nums absolute inset-0 pointer-events-none"
            style={{
              fontSize: 'clamp(5rem, 22vw, 8rem)',
              letterSpacing: '-0.02em',
              color: 'transparent',
              transform: 'translateY(4px) translateZ(-8px) rotateX(4deg)',
              textShadow:
                '0 6px 24px rgba(0,0,0,0.9), 0 12px 40px rgba(0,0,0,0.7)',
              userSelect: 'none',
            }}
          >
            {formatTime(now)}
          </h1>

          {/* Main clock face */}
          <h1
            className="font-thin leading-none tabular-nums relative"
            style={{
              fontSize: 'clamp(5rem, 22vw, 8rem)',
              letterSpacing: '-0.02em',
              color: 'rgba(255,255,255,0.95)',
              transform: 'rotateX(6deg)',
              transformStyle: 'preserve-3d',
              textShadow: `
                0 1px 0 rgba(255,255,255,0.15),
                0 -1px 0 rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.4),
                0 4px 12px rgba(0,0,0,0.55),
                0 8px 28px rgba(0,0,0,0.5)
              `,
              background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(200,210,230,0.85) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              userSelect: 'none',
            }}
            data-testid="text-time"
          >
            {formatTime(now)}
          </h1>
        </div>

        {/* Double-tap hint */}
        <p
          className="mt-2 text-[9px] font-light tracking-[0.18em] uppercase select-none"
          style={{ color: 'rgba(255,255,255,0.18)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
        >
          double-tap to lock
        </p>

        <p
          className="mt-2 text-sm font-light tracking-wide select-none"
          style={{ color: 'rgba(255,255,255,0.40)', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
          data-testid="text-date"
        >
          {formatDate(now)}
        </p>
      </motion.div>

      <div className="flex-1" />

      {/* Favorites */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-6 mb-12"
        >
          <div className={`flex flex-col ${ALIGN_FLEX[align]}`}>
            {favorites.slice(0, 6).map(app => (
              <button
                key={app.id}
                onClick={() => {
                  if (app.isBlocked) { toast({ title: "App blocked", description: "Stay focused." }); return; }
                  toast({ title: `Opening ${app.name}...` });
                }}
                className={`py-1.5 rounded-lg active:opacity-60 transition-opacity w-full ${ALIGN_TEXT[align]}`}
                data-testid={`fav-${app.id}`}
              >
                <span
                  className="text-base font-light tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.80)', textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}
                >
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Swipe dot hints */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
        <span className="w-5 h-[1.5px] rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
        <span className="w-2 h-[1.5px] rounded-full" style={{ background: 'rgba(255,255,255,0.38)' }} />
        <span className="w-5 h-[1.5px] rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
      </div>
    </div>
  );
}

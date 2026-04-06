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
  onOpenPlanner?: () => void;
}

export function HomeScreen({ onLock, onOpenPlanner }: HomeScreenProps) {
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
    window.location.href = 'intent://com.android.deskclock#Intent;scheme=android-app;end';
    setTimeout(() => toast({ title: "Opening Clock..." }), 300);
  }, [toast]);

  const handleClockTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const ts = Date.now();
    const delta = ts - lastTapRef.current;
    if (delta < 340 && delta > 0) {
      onLock?.();
    } else {
      lastTapRef.current = ts;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= 330) openClock();
      }, 350);
    }
  }, [openClock, onLock]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" data-testid="home-screen">

      {/* 3D Clock — frosted glass card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center pt-14 px-6"
        style={{ perspective: '600px' }}
      >
        <p
          className="text-[10px] font-light tracking-[0.28em] uppercase mb-4 select-none"
          style={{ color: 'rgba(255,255,255,0.40)', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
        >
          {getGreeting()}
        </p>

        {/* Frosted glass card behind clock */}
        <div
          className="relative cursor-pointer select-none active:scale-[0.97] transition-transform duration-150 px-6 py-4 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px) saturate(140%)',
            WebkitBackdropFilter: 'blur(24px) saturate(140%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
          onClick={handleClockTap}
          onTouchEnd={handleClockTap}
        >
          {/* Shadow layer (depth) */}
          <h1
            aria-hidden
            className="font-thin leading-none tabular-nums absolute inset-x-6 top-4 pointer-events-none"
            style={{
              fontSize: 'clamp(4.5rem, 20vw, 7.5rem)',
              letterSpacing: '-0.02em',
              color: 'transparent',
              transform: 'translateY(5px) translateZ(-8px)',
              textShadow: '0 8px 32px rgba(0,0,0,0.9), 0 16px 48px rgba(0,0,0,0.6)',
              userSelect: 'none',
            }}
          >
            {formatTime(now)}
          </h1>

          {/* Main clock */}
          <h1
            className="font-thin leading-none tabular-nums relative"
            style={{
              fontSize: 'clamp(4.5rem, 20vw, 7.5rem)',
              letterSpacing: '-0.02em',
              transform: 'rotateX(5deg)',
              transformStyle: 'preserve-3d',
              backgroundImage: 'linear-gradient(175deg, rgba(255,255,255,0.88) 0%, rgba(180,195,225,0.65) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
              userSelect: 'none',
            }}
            data-testid="text-time"
          >
            {formatTime(now)}
          </h1>

          {/* Bottom shimmer line */}
          <div className="absolute bottom-0 left-6 right-6 h-px rounded-full" style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)',
          }} />
        </div>

        <p
          className="mt-3 text-sm font-light tracking-wide select-none"
          style={{ color: 'rgba(255,255,255,0.35)', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
          data-testid="text-date"
        >
          {formatDate(now)}
        </p>

        {/* Subtle planner pull indicator */}
        {onOpenPlanner && (
          <button
            onClick={e => { e.stopPropagation(); onOpenPlanner(); }}
            className="mt-6 flex flex-col items-center gap-1 active:opacity-60 transition-opacity"
          >
            <span className="text-[9px] font-light tracking-[0.25em] uppercase select-none"
              style={{ color: 'rgba(255,255,255,0.18)' }}>
              Plan
            </span>
            <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
              <path d="M2 2L8 6L14 2" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
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
                  style={{ color: 'rgba(255,255,255,0.78)', textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}
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
        <span className="w-5 h-[1.5px] rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <span className="w-2 h-[1.5px] rounded-full" style={{ background: 'rgba(255,255,255,0.35)' }} />
        <span className="w-5 h-[1.5px] rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { HomeScreen } from "@/pages/HomeScreen";
import { AppDrawer } from "@/pages/AppDrawer";
import { FocusPanel } from "@/pages/FocusPanel";
import { LauncherProvider, useLauncherStore } from "@/hooks/useLauncherStore";
import { WALLPAPER_GRADIENTS } from "@/components/WallpaperPicker";
import { motion, AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();
const HOME_INDEX = 1;
const PANEL_COUNT = 3;
const SWIPE_THRESHOLD = 55;

function WallpaperBackground() {
  const { state } = useLauncherStore();
  const style: React.CSSProperties = state.wallpaperImage
    ? { backgroundImage: `url(${state.wallpaperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: WALLPAPER_GRADIENTS[state.wallpaper] ?? WALLPAPER_GRADIENTS['none'] };
  return <div className="fixed inset-0 z-0" style={style} />;
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { state } = useLauncherStore();
  const [now] = useState(new Date());

  const bg: React.CSSProperties = state.wallpaperImage
    ? { backgroundImage: `url(${state.wallpaperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: WALLPAPER_GRADIENTS[state.wallpaper] ?? WALLPAPER_GRADIENTS['none'] };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex flex-col items-center justify-between pb-20 pt-24"
      style={{ ...bg }}
      onClick={onUnlock}
      onTouchEnd={onUnlock}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
      <div className="relative z-10 flex flex-col items-center">
        <h1
          className="font-thin tabular-nums leading-none"
          style={{
            fontSize: 'clamp(5.5rem, 24vw, 9rem)',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(200,210,235,0.85) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            transform: 'rotateX(6deg)',
            perspective: '600px',
          }}
        >
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </h1>
        <p className="mt-3 text-sm font-light tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="text-[11px] font-light text-white/30 tracking-widest uppercase">Tap to unlock</p>
      </div>
    </motion.div>
  );
}

function LauncherApp() {
  const [currentPanel, setCurrentPanel] = useState(HOME_INDEX);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDisabled, setSwipeDisabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);

  const canGoLeft = currentPanel < PANEL_COUNT - 1;
  const canGoRight = currentPanel > 0;

  const startDrag = useCallback((x: number, y: number) => {
    if (swipeDisabled) return;
    startXRef.current = x;
    startYRef.current = y;
    setIsDragging(false);
    setDragOffset(0);
  }, [swipeDisabled]);

  const doDrag = useCallback((x: number, y: number) => {
    if (startXRef.current === null || startYRef.current === null) return;
    const diffX = x - startXRef.current;
    const diffY = y - (startYRef.current ?? 0);

    // Only handle horizontal swipes — let vertical ones pass through for notification panel
    if (!isDragging && Math.abs(diffY) > Math.abs(diffX) + 8) {
      startXRef.current = null;
      return;
    }
    if (!isDragging && Math.abs(diffX) < 8) return;

    setIsDragging(true);
    const rubber = (diffX > 0 && !canGoRight) || (diffX < 0 && !canGoLeft);
    setDragOffset(rubber ? diffX * 0.07 : diffX);
  }, [isDragging, canGoRight, canGoLeft]);

  const endDrag = useCallback((x: number) => {
    if (!isDragging || startXRef.current === null) {
      startXRef.current = null;
      startYRef.current = null;
      return;
    }
    const diff = x - startXRef.current;
    if (diff > SWIPE_THRESHOLD && canGoRight) setCurrentPanel(p => p - 1);
    else if (diff < -SWIPE_THRESHOLD && canGoLeft) setCurrentPanel(p => p + 1);
    startXRef.current = null;
    startYRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, canGoRight, canGoLeft]);

  const translateX = -(currentPanel * 100) + (dragOffset / window.innerWidth) * 100;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ width: '100vw', height: '100dvh', touchAction: 'pan-y' }}
      onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={e => doDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={e => endDrag(e.changedTouches[0]?.clientX ?? 0)}
      onMouseDown={e => startDrag(e.clientX, e.clientY)}
      onMouseMove={e => isDragging && doDrag(e.clientX, e.clientY)}
      onMouseUp={e => endDrag(e.clientX)}
      onMouseLeave={e => isDragging && endDrag(e.clientX)}
    >
      <WallpaperBackground />
      {/* Dark scrim */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: 'rgba(0,0,0,0.35)' }} />

      {/* Panel track */}
      <div
        className="relative z-10"
        style={{
          display: 'flex',
          width: '300%',
          height: '100%',
          transform: `translateX(${translateX / 3}%)`,
          transition: isDragging ? 'none' : 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
      >
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0, overflowY: 'auto' }}>
          <FocusPanel onModalChange={setSwipeDisabled} />
        </div>
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0 }}>
          <HomeScreen onLock={() => setIsLocked(true)} />
        </div>
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0, overflowY: 'auto' }}>
          <AppDrawer onModalChange={setSwipeDisabled} />
        </div>
      </div>

      {/* Panel dots */}
      <div className="fixed bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
        {Array.from({ length: PANEL_COUNT }).map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300" style={{
            width: i === currentPanel ? '18px' : '5px',
            height: '5px',
            background: i === currentPanel ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)',
          }} />
        ))}
      </div>

      {/* Lock screen */}
      <AnimatePresence>
        {isLocked && (
          <LockScreen onUnlock={() => setIsLocked(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LauncherProvider>
        <LauncherApp />
        <Toaster />
      </LauncherProvider>
    </QueryClientProvider>
  );
}

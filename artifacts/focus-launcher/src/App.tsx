import { useState, useRef, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { HomeScreen } from "@/pages/HomeScreen";
import { AppDrawer } from "@/pages/AppDrawer";
import { FocusPanel } from "@/pages/FocusPanel";
import { LauncherProvider, useLauncherStore } from "@/hooks/useLauncherStore";
import { WALLPAPER_GRADIENTS } from "@/components/WallpaperPicker";

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

function LauncherApp() {
  const [currentPanel, setCurrentPanel] = useState(HOME_INDEX);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDisabled, setSwipeDisabled] = useState(false);
  const startXRef = useRef<number | null>(null);

  const canGoLeft = currentPanel < PANEL_COUNT - 1;
  const canGoRight = currentPanel > 0;

  const startDrag = useCallback((x: number) => {
    if (swipeDisabled) return;
    startXRef.current = x;
    setIsDragging(true);
    setDragOffset(0);
  }, [swipeDisabled]);

  const doDrag = useCallback((x: number) => {
    if (!isDragging || startXRef.current === null) return;
    const diff = x - startXRef.current;
    const rubber = (diff > 0 && !canGoRight) || (diff < 0 && !canGoLeft);
    setDragOffset(rubber ? diff * 0.07 : diff);
  }, [isDragging, canGoRight, canGoLeft]);

  const endDrag = useCallback((x: number) => {
    if (!isDragging || startXRef.current === null) return;
    const diff = x - startXRef.current;
    if (diff > SWIPE_THRESHOLD && canGoRight) setCurrentPanel(p => p - 1);
    else if (diff < -SWIPE_THRESHOLD && canGoLeft) setCurrentPanel(p => p + 1);
    startXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, canGoRight, canGoLeft]);

  const translateX = -(currentPanel * 100) + (dragOffset / window.innerWidth) * 100;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ width: '100vw', height: '100dvh', touchAction: 'none' }}
      onTouchStart={e => startDrag(e.touches[0].clientX)}
      onTouchMove={e => doDrag(e.touches[0].clientX)}
      onTouchEnd={e => endDrag(e.changedTouches[0]?.clientX ?? 0)}
      onMouseDown={e => startDrag(e.clientX)}
      onMouseMove={e => isDragging && doDrag(e.clientX)}
      onMouseUp={e => endDrag(e.clientX)}
      onMouseLeave={e => isDragging && endDrag(e.clientX)}
    >
      <WallpaperBackground />
      {/* Dark scrim */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: 'rgba(0,0,0,0.35)' }} />

      {/* Panel track — no motion blur (user preference) */}
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
          <HomeScreen />
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

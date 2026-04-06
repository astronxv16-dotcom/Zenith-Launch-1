import { useState, useRef, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { HomeScreen } from "@/pages/HomeScreen";
import { AppDrawer } from "@/pages/AppDrawer";
import { FocusPanel } from "@/pages/FocusPanel";
import { LauncherProvider, useLauncherStore } from "@/hooks/useLauncherStore";
import { WALLPAPER_GRADIENTS } from "@/components/WallpaperPicker";

const queryClient = new QueryClient();

// Panel order: 0 = Focus/Todo (swipe right), 1 = Home, 2 = App Drawer (swipe left)
const HOME_INDEX = 1;
const PANEL_COUNT = 3;
const SWIPE_THRESHOLD = 70;

function WallpaperBackground() {
  const { state } = useLauncherStore();
  const style: React.CSSProperties = state.wallpaperImage
    ? {
        backgroundImage: `url(${state.wallpaperImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: WALLPAPER_GRADIENTS[state.wallpaper] ?? WALLPAPER_GRADIENTS['none'],
      };
  return (
    <div
      className="fixed inset-0 z-0 transition-all duration-700"
      style={style}
    />
  );
}

function LauncherApp() {
  const [currentPanel, setCurrentPanel] = useState(HOME_INDEX);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  // Track if a modal/sheet is open to disable swipe
  const [swipeDisabled, setSwipeDisabled] = useState(false);

  const canGoLeft = currentPanel < PANEL_COUNT - 1;
  const canGoRight = currentPanel > 0;

  const onDragStart = useCallback((clientX: number) => {
    if (swipeDisabled) return;
    startXRef.current = clientX;
    setIsDragging(true);
    setDragOffset(0);
  }, [swipeDisabled]);

  const onDragMove = useCallback((clientX: number) => {
    if (!isDragging || startXRef.current === null) return;
    const diff = clientX - startXRef.current;
    if ((diff > 0 && !canGoRight) || (diff < 0 && !canGoLeft)) {
      setDragOffset(diff * 0.10);
    } else {
      setDragOffset(diff);
    }
  }, [isDragging, canGoRight, canGoLeft]);

  const onDragEnd = useCallback((clientX?: number) => {
    if (!isDragging || startXRef.current === null) return;
    const diff = (clientX ?? 0) - startXRef.current;
    if (diff > SWIPE_THRESHOLD && canGoRight) {
      setCurrentPanel(p => p - 1);
    } else if (diff < -SWIPE_THRESHOLD && canGoLeft) {
      setCurrentPanel(p => p + 1);
    }
    startXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, canGoRight, canGoLeft]);

  const translateX = -(currentPanel * 100) + (dragOffset / window.innerWidth) * 100;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ width: '100vw', height: '100dvh', touchAction: 'none' }}
      onTouchStart={(e) => { if (swipeDisabled) return; onDragStart(e.touches[0].clientX); }}
      onTouchMove={(e) => { if (!isDragging) return; const diff = e.touches[0].clientX - (startXRef.current ?? e.touches[0].clientX); if ((diff > 0 && !canGoRight) || (diff < 0 && !canGoLeft)) { setDragOffset(diff * 0.10); } else { setDragOffset(diff); } }}
      onTouchEnd={(e) => onDragEnd(e.changedTouches[0]?.clientX)}
      onMouseDown={(e) => { if (swipeDisabled) return; onDragStart(e.clientX); }}
      onMouseMove={(e) => { if (!isDragging) return; onDragMove(e.clientX); }}
      onMouseUp={(e) => onDragEnd(e.clientX)}
      onMouseLeave={(e) => onDragEnd(e.clientX)}
    >
      {/* Fixed wallpaper background — shared across all panels */}
      <WallpaperBackground />

      {/* Dark base overlay so text is always readable */}
      <div className="fixed inset-0 z-[1] bg-black/45 pointer-events-none" />

      {/* Three-panel track */}
      <div
        className="relative z-10"
        style={{
          display: 'flex',
          width: '300%',
          height: '100%',
          transform: `translateX(${translateX / 3}%)`,
          transition: isDragging ? 'none' : 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      >
        {/* Panel 0: Focus / Todo */}
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0 }}>
          <FocusPanel onModalChange={setSwipeDisabled} />
        </div>
        {/* Panel 1: Home Screen */}
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0 }}>
          <HomeScreen onModalChange={setSwipeDisabled} />
        </div>
        {/* Panel 2: App Drawer */}
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0 }}>
          <AppDrawer onModalChange={setSwipeDisabled} />
        </div>
      </div>

      {/* Panel dot indicators */}
      <div className="fixed bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
        {Array.from({ length: PANEL_COUNT }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentPanel ? '20px' : '6px',
              height: '6px',
              background: i === currentPanel ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LauncherProvider>
        <LauncherApp />
        <Toaster />
      </LauncherProvider>
    </QueryClientProvider>
  );
}

export default App;

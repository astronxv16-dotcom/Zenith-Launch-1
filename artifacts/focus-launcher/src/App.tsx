import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { HomeScreen } from "@/pages/HomeScreen";
import { AppDrawer } from "@/pages/AppDrawer";
import { FocusPanel } from "@/pages/FocusPanel";
import { LauncherProvider } from "@/hooks/useLauncherStore";

const queryClient = new QueryClient();

// Panel indices: 0 = App Drawer (right), 1 = Home, 2 = Focus Panel (left)
const PANELS = ['drawer', 'home', 'focus'] as const;
const HOME_INDEX = 1;
const SWIPE_THRESHOLD = 70;

function LauncherApp() {
  const [currentPanel, setCurrentPanel] = useState(HOME_INDEX);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);

  const canGoLeft = currentPanel < PANELS.length - 1;
  const canGoRight = currentPanel > 0;

  const onDragStart = useCallback((clientX: number) => {
    startXRef.current = clientX;
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const onDragMove = useCallback((clientX: number) => {
    if (startXRef.current === null || !isDragging) return;
    const diff = clientX - startXRef.current;
    // Resist at edges
    if ((diff > 0 && !canGoRight) || (diff < 0 && !canGoLeft)) {
      setDragOffset(diff * 0.15);
    } else {
      setDragOffset(diff);
    }
  }, [isDragging, canGoRight, canGoLeft]);

  const onDragEnd = useCallback(() => {
    if (startXRef.current === null) return;
    if (dragOffset > SWIPE_THRESHOLD && canGoRight) {
      setCurrentPanel(p => p - 1);
    } else if (dragOffset < -SWIPE_THRESHOLD && canGoLeft) {
      setCurrentPanel(p => p + 1);
    }
    startXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }, [dragOffset, canGoRight, canGoLeft]);

  const touchHandlers = {
    onTouchStart: (e: React.TouchEvent) => onDragStart(e.touches[0].clientX),
    onTouchMove: (e: React.TouchEvent) => onDragMove(e.touches[0].clientX),
    onTouchEnd: onDragEnd,
  };

  const mouseHandlers = {
    onMouseDown: (e: React.MouseEvent) => onDragStart(e.clientX),
    onMouseMove: (e: React.MouseEvent) => { if (isDragging) onDragMove(e.clientX); },
    onMouseUp: onDragEnd,
    onMouseLeave: onDragEnd,
  };

  const translateX = -(currentPanel * 100) + (dragOffset / window.innerWidth) * 100;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ width: '100vw', height: '100dvh', touchAction: 'none' }}
      {...touchHandlers}
      {...mouseHandlers}
    >
      {/* Three-panel track */}
      <div
        style={{
          display: 'flex',
          width: '300%',
          height: '100%',
          transform: `translateX(${translateX / 3}%)`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
        }}
      >
        {/* Panel 0: App Drawer */}
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0 }}>
          <AppDrawer />
        </div>
        {/* Panel 1: Home Screen */}
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0 }}>
          <HomeScreen />
        </div>
        {/* Panel 2: Focus Panel */}
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0 }}>
          <FocusPanel />
        </div>
      </div>

      {/* Panel dot indicators */}
      <div className="fixed bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
        {PANELS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentPanel ? '20px' : '6px',
              height: '6px',
              background: i === currentPanel ? 'rgba(80,50,120,0.4)' : 'rgba(80,50,120,0.15)',
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

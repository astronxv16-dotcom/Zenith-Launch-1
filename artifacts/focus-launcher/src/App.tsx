import { useState, useRef, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { HomeScreen } from "@/pages/HomeScreen";
import { AppDrawer } from "@/pages/AppDrawer";
import { FocusPanel } from "@/pages/FocusPanel";
import { LauncherProvider } from "@/hooks/useLauncherStore";

const queryClient = new QueryClient();

// Panel order: 0 = Focus/Todo (left swipe), 1 = Home, 2 = App Drawer (right swipe)
const HOME_INDEX = 1;
const PANEL_COUNT = 3;
const SWIPE_THRESHOLD = 70;

function LauncherApp() {
  const [currentPanel, setCurrentPanel] = useState(HOME_INDEX);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);

  const canGoLeft = currentPanel < PANEL_COUNT - 1;
  const canGoRight = currentPanel > 0;

  const onDragStart = useCallback((clientX: number) => {
    startXRef.current = clientX;
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const onDragMove = useCallback((clientX: number, dragging: boolean) => {
    if (!dragging || startXRef.current === null) return;
    const diff = clientX - startXRef.current;
    if ((diff > 0 && !canGoRight) || (diff < 0 && !canGoLeft)) {
      setDragOffset(diff * 0.12);
    } else {
      setDragOffset(diff);
    }
  }, [canGoRight, canGoLeft]);

  const onDragEnd = useCallback((offset: number) => {
    if (offset > SWIPE_THRESHOLD && canGoRight) {
      setCurrentPanel(p => p - 1);
    } else if (offset < -SWIPE_THRESHOLD && canGoLeft) {
      setCurrentPanel(p => p + 1);
    }
    startXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }, [canGoRight, canGoLeft]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    onDragStart(e.touches[0].clientX);
  }, [onDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const diff = e.touches[0].clientX - startXRef.current;
    if ((diff > 0 && !canGoRight) || (diff < 0 && !canGoLeft)) {
      setDragOffset(diff * 0.12);
    } else {
      setDragOffset(diff);
    }
  }, [canGoRight, canGoLeft]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const diff = (e.changedTouches[0]?.clientX ?? 0) - startXRef.current;
    onDragEnd(diff);
  }, [onDragEnd]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    onDragStart(e.clientX);
  }, [onDragStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || startXRef.current === null) return;
    onDragMove(e.clientX, isDragging);
  }, [isDragging, onDragMove]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging || startXRef.current === null) return;
    const diff = e.clientX - startXRef.current;
    onDragEnd(diff);
  }, [isDragging, onDragEnd]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (!isDragging || startXRef.current === null) return;
    const diff = e.clientX - startXRef.current;
    onDragEnd(diff);
  }, [isDragging, onDragEnd]);

  const translateX = -(currentPanel * 100) + (dragOffset / window.innerWidth) * 100;

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-background"
      style={{ width: '100vw', height: '100dvh', touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Three-panel track */}
      <div
        style={{
          display: 'flex',
          width: '300%',
          height: '100%',
          transform: `translateX(${translateX / 3}%)`,
          transition: isDragging ? 'none' : 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      >
        {/* Panel 0: Focus / Todo (swipe right from home → go left on track) */}
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0 }}>
          <FocusPanel />
        </div>
        {/* Panel 1: Home Screen */}
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0 }}>
          <HomeScreen />
        </div>
        {/* Panel 2: App Drawer (swipe left from home → go right on track) */}
        <div style={{ width: '33.333%', height: '100%', flexShrink: 0 }}>
          <AppDrawer />
        </div>
      </div>

      {/* Panel indicator dots */}
      <div className="fixed bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
        {Array.from({ length: PANEL_COUNT }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentPanel ? '20px' : '6px',
              height: '6px',
              background: i === currentPanel ? 'rgba(200,210,230,0.5)' : 'rgba(200,210,230,0.18)',
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

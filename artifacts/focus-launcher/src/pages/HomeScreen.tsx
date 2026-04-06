import { useState, useEffect, useRef, useCallback } from "react";
import { useLauncherStore } from "@/hooks/useLauncherStore";

function formatTime(d: Date, hour12: boolean): { main: string; period?: string } {
  if (hour12) {
    const str = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const match = str.match(/^(\d+:\d+)\s?(AM|PM)$/i);
    if (match) return { main: match[1], period: match[2].toUpperCase() };
    return { main: str };
  }
  return { main: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) };
}

function formatDate(d: Date) {
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

const APP_PACKAGE_MAP: Record<string, string> = {
  gmail: 'com.google.android.gm',
  chrome: 'com.android.chrome',
  maps: 'com.google.android.apps.maps',
  camera: 'com.google.android.GoogleCamera',
  gallery: 'com.google.android.apps.photos',
  photos: 'com.google.android.apps.photos',
  settings: 'com.android.settings',
  calculator: 'com.android.calculator2',
  clock: 'com.android.deskclock',
  notes: 'com.google.android.keep',
  keep: 'com.google.android.keep',
  calendar: 'com.google.android.calendar',
  messages: 'com.google.android.apps.messaging',
  youtube: 'com.google.android.youtube',
  files: 'com.android.documentsui',
  phone: 'com.android.dialer',
  contacts: 'com.android.contacts',
  spotify: 'com.spotify.music',
  whatsapp: 'com.whatsapp',
  instagram: 'com.instagram.android',
  twitter: 'com.twitter.android',
  x: 'com.twitter.android',
  drive: 'com.google.android.apps.docs',
  docs: 'com.google.android.apps.docs.editors.docs',
  sheets: 'com.google.android.apps.docs.editors.sheets',
  slides: 'com.google.android.apps.docs.editors.slides',
  meet: 'com.google.android.apps.meetings',
  notion: 'notion.id',
  browser: 'com.android.browser',
};

function launchApp(id: string, name: string) {
  const key = (id || name).toLowerCase().replace(/\s+/g, '');
  const pkg = APP_PACKAGE_MAP[key] || APP_PACKAGE_MAP[name.toLowerCase()];
  if (pkg) {
    window.location.href = `intent://open#Intent;scheme=android-app;package=${pkg};end`;
  }
}

const ALIGN_FLEX: Record<string, string> = { left: 'items-start', center: 'items-center', right: 'items-end' };
const ALIGN_TEXT: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };

interface HomeScreenProps {
  onLock?: () => void;
}

export function HomeScreen({ onLock }: HomeScreenProps) {
  const { state } = useLauncherStore();
  const [now, setNow] = useState(new Date());
  const is12h = (state.clockFormat ?? '12h') === '12h';
  const lastTapRef = useRef<number>(0);

  // Update clock on minute boundary — battery friendly
  useEffect(() => {
    const syncToMinute = () => {
      setNow(new Date());
      const msToNextMinute = 60000 - (Date.now() % 60000);
      const id = setTimeout(() => {
        setNow(new Date());
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
      }, msToNextMinute);
      return id;
    };
    const id = syncToMinute();
    return () => clearTimeout(id);
  }, []);

  const timeDisplay = formatTime(now, is12h);
  const favorites = state.apps.filter(a => a.isFavorite && !a.isHidden);
  const align = state.favoritesAlign || 'left';

  const handleClockTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const ts = Date.now();
    const delta = ts - lastTapRef.current;
    if (delta < 340 && delta > 0) {
      onLock?.();
    } else {
      lastTapRef.current = ts;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= 330) {
          launchApp('clock', 'Clock');
        }
      }, 350);
    }
  }, [onLock]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none" data-testid="home-screen">

      {/* Clock — pure, clean, no effects */}
      <div className="flex flex-col items-center pt-16 px-6">
        <div
          className="cursor-pointer active:opacity-70 transition-opacity duration-100 flex items-start gap-2"
          onClick={handleClockTap}
          onTouchEnd={handleClockTap}
        >
          <h1
            className="leading-none tabular-nums"
            style={{
              fontSize: 'clamp(4.2rem, 19vw, 7rem)',
              fontWeight: 100,
              letterSpacing: '0.02em',
              color: 'rgba(210,218,228,0.62)',
              textShadow: '0 2px 20px rgba(0,0,0,0.35)',
            }}
            data-testid="text-time"
          >
            {timeDisplay.main}
          </h1>
          {timeDisplay.period && (
            <span
              className="font-extralight leading-none mt-2 select-none"
              style={{
                fontSize: 'clamp(0.75rem, 3vw, 1.1rem)',
                letterSpacing: '0.06em',
                color: 'rgba(210,218,228,0.38)',
              }}
            >
              {timeDisplay.period}
            </span>
          )}
        </div>

        <p
          className="mt-3 text-sm font-light tracking-wide"
          style={{ color: 'rgba(200,210,222,0.42)', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
          data-testid="text-date"
        >
          {formatDate(now)}
        </p>
      </div>

      <div className="flex-1" />

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="mx-6 mb-12">
          <div className={`flex flex-col ${ALIGN_FLEX[align]}`}>
            {favorites.slice(0, 6).map(app => (
              <button
                key={app.id}
                onClick={() => {
                  if (app.isBlocked) { navigator.vibrate?.(180); return; }
                  launchApp(app.id, app.name);
                }}
                className={`py-2.5 active:opacity-50 transition-opacity duration-100 w-full ${ALIGN_TEXT[align]}`}
                data-testid={`fav-${app.id}`}
              >
                <span
                  className="text-[15px] font-light tracking-wide"
                  style={{ color: 'rgba(210,218,228,0.75)', textShadow: '0 1px 10px rgba(0,0,0,0.6)' }}
                >
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

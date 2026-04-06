import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppData = {
  id: string;
  name: string;
  folderId?: string | null;
  isHidden?: boolean;
  isBlocked?: boolean;
  isFavorite?: boolean;
};

export type FolderData = {
  id: string;
  name: string;
};

export type TodoData = {
  id: string;
  text: string;
  isCompleted: boolean;
};

export type HabitData = {
  id: string;
  text: string;
  isCompleted: boolean;
};

export type FavoritesAlign = 'left' | 'center' | 'right';

// calendarEvents: { "2026-04-06": "Doctor appt" }
export type CalendarEvents = Record<string, string>;

export type LauncherState = {
  apps: AppData[];
  folders: FolderData[];
  todos: TodoData[];
  habits: HabitData[];
  quickNotes: string;
  wallpaper: string;
  wallpaperImage: string | null;
  favoritesAlign: FavoritesAlign;
  lastHabitResetDate: string;
  calendarEvents: CalendarEvents;
};

const DEFAULT_APPS: AppData[] = [
  { id: 'gmail', name: 'Gmail', isFavorite: true },
  { id: 'chrome', name: 'Chrome', isFavorite: true },
  { id: 'maps', name: 'Maps', isFavorite: true },
  { id: 'music', name: 'Music' },
  { id: 'camera', name: 'Camera', isFavorite: true },
  { id: 'gallery', name: 'Gallery' },
  { id: 'settings', name: 'Settings' },
  { id: 'calculator', name: 'Calculator' },
  { id: 'clock', name: 'Clock' },
  { id: 'notes', name: 'Notes' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'messages', name: 'Messages', isFavorite: true },
  { id: 'weather', name: 'Weather' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'files', name: 'Files' },
];

const DEFAULT_HABITS: HabitData[] = [
  { id: 'h1', text: 'Read 10 pages', isCompleted: false },
  { id: 'h2', text: 'Drink water', isCompleted: false },
  { id: 'h3', text: 'Meditate', isCompleted: false },
];

const DEFAULT_STATE: LauncherState = {
  apps: DEFAULT_APPS,
  folders: [],
  todos: [],
  habits: DEFAULT_HABITS,
  quickNotes: '',
  wallpaper: 'none',
  wallpaperImage: null,
  favoritesAlign: 'left',
  lastHabitResetDate: new Date().toISOString().split('T')[0],
  calendarEvents: {},
};

type LauncherContextType = {
  state: LauncherState;
  updateState: (updates: Partial<LauncherState> | ((prev: LauncherState) => LauncherState)) => void;
  updateApp: (id: string, updates: Partial<AppData>) => void;
  toggleFavorite: (id: string) => void;
  setWallpaper: (theme: string) => void;
  setWallpaperImage: (dataUrl: string | null) => void;
  setFavoritesAlign: (align: FavoritesAlign) => void;
  moveAppToFolder: (appId: string, folderId: string | null) => void;
  renameFolder: (folderId: string, name: string) => void;
  setCalendarEvent: (dateKey: string, text: string) => void;
  deleteCalendarEvent: (dateKey: string) => void;
};

const LauncherContext = createContext<LauncherContextType | null>(null);

export function LauncherProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LauncherState>(() => {
    try {
      const stored = localStorage.getItem('focus_launcher_state_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastHabitResetDate !== today) {
          parsed.habits = (parsed.habits || DEFAULT_HABITS).map((h: HabitData) => ({ ...h, isCompleted: false }));
          parsed.lastHabitResetDate = today;
        }
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch { /* ignore */ }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('focus_launcher_state_v3', JSON.stringify(state));
    } catch {
      const { wallpaperImage: _img, ...rest } = state;
      localStorage.setItem('focus_launcher_state_v3', JSON.stringify(rest));
    }
  }, [state]);

  const updateState = (updates: Partial<LauncherState> | ((prev: LauncherState) => LauncherState)) =>
    setState(prev => typeof updates === 'function' ? updates(prev) : { ...prev, ...updates });

  const updateApp = (id: string, updates: Partial<AppData>) =>
    setState(prev => ({ ...prev, apps: prev.apps.map(a => a.id === id ? { ...a, ...updates } : a) }));

  const toggleFavorite = (id: string) =>
    setState(prev => ({ ...prev, apps: prev.apps.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a) }));

  const moveAppToFolder = (appId: string, folderId: string | null) =>
    setState(prev => ({ ...prev, apps: prev.apps.map(a => a.id === appId ? { ...a, folderId } : a) }));

  const renameFolder = (folderId: string, name: string) =>
    setState(prev => ({ ...prev, folders: prev.folders.map(f => f.id === folderId ? { ...f, name } : f) }));

  const setCalendarEvent = (dateKey: string, text: string) =>
    setState(prev => ({ ...prev, calendarEvents: { ...prev.calendarEvents, [dateKey]: text } }));

  const deleteCalendarEvent = (dateKey: string) =>
    setState(prev => {
      const events = { ...prev.calendarEvents };
      delete events[dateKey];
      return { ...prev, calendarEvents: events };
    });

  const setWallpaper = (wallpaper: string) => updateState({ wallpaper, wallpaperImage: null });
  const setWallpaperImage = (dataUrl: string | null) => updateState({ wallpaperImage: dataUrl, wallpaper: dataUrl ? 'custom' : 'none' });
  const setFavoritesAlign = (favoritesAlign: FavoritesAlign) => updateState({ favoritesAlign });

  return (
    <LauncherContext.Provider value={{
      state, updateState, updateApp, toggleFavorite,
      setWallpaper, setWallpaperImage, setFavoritesAlign,
      moveAppToFolder, renameFolder, setCalendarEvent, deleteCalendarEvent,
    }}>
      {children}
    </LauncherContext.Provider>
  );
}

export function useLauncherStore() {
  const ctx = useContext(LauncherContext);
  if (!ctx) throw new Error("useLauncherStore must be used within LauncherProvider");
  return ctx;
}

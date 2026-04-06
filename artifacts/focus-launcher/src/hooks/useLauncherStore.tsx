import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppData = {
  id: string;
  name: string;
  folderId?: string | null;
  isHidden?: boolean;
  isBlocked?: boolean;
  blockUntil?: number | null;
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

export type LauncherState = {
  apps: AppData[];
  folders: FolderData[];
  todos: TodoData[];
  habits: HabitData[];
  quickNotes: string;
  wallpaper: string;
  lastHabitResetDate: string;
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
  wallpaper: 'misty-lavender',
  lastHabitResetDate: new Date().toISOString().split('T')[0],
};

type LauncherContextType = {
  state: LauncherState;
  updateState: (updates: Partial<LauncherState> | ((prev: LauncherState) => LauncherState)) => void;
  updateApp: (id: string, updates: Partial<AppData>) => void;
  toggleFavorite: (id: string) => void;
  setWallpaper: (theme: string) => void;
};

const LauncherContext = createContext<LauncherContextType | null>(null);

export function LauncherProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LauncherState>(() => {
    try {
      const stored = localStorage.getItem('focus_launcher_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Check habit reset
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastHabitResetDate !== today) {
          parsed.habits = parsed.habits.map((h: HabitData) => ({ ...h, isCompleted: false }));
          parsed.lastHabitResetDate = today;
        }
        
        // merge with defaults for new fields
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem('focus_launcher_state', JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<LauncherState> | ((prev: LauncherState) => LauncherState)) => {
    setState(prev => typeof updates === 'function' ? updates(prev) : { ...prev, ...updates });
  };

  const updateApp = (id: string, updates: Partial<AppData>) => {
    setState(prev => ({
      ...prev,
      apps: prev.apps.map(app => app.id === id ? { ...app, ...updates } : app)
    }));
  };

  const toggleFavorite = (id: string) => {
    setState(prev => ({
      ...prev,
      apps: prev.apps.map(app => app.id === id ? { ...app, isFavorite: !app.isFavorite } : app)
    }));
  };

  const setWallpaper = (wallpaper: string) => {
    updateState({ wallpaper });
  };

  return (
    <LauncherContext.Provider value={{ state, updateState, updateApp, toggleFavorite, setWallpaper }}>
      {children}
    </LauncherContext.Provider>
  );
}

export function useLauncherStore() {
  const context = useContext(LauncherContext);
  if (!context) throw new Error("useLauncherStore must be used within LauncherProvider");
  return context;
}

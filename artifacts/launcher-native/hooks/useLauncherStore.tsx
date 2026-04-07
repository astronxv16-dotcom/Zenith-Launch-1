import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'launcher_state_v1';

export type FavoritesAlign = 'left' | 'center' | 'right';
export type ClockFormat = '12h' | '24h';

export type FavoriteApp = {
  id: string;
  name: string;
  packageName: string;
};

export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

export type PlannerSlot = {
  id: string;
  label: string;
  plan: string;
};

export type LauncherState = {
  favorites: FavoriteApp[];
  todos: TodoItem[];
  quickNote: string;
  clockFormat: ClockFormat;
  favoritesAlign: FavoritesAlign;
  plannerSlots: Record<string, PlannerSlot[]>; // keyed by YYYY-MM-DD
};

const DEFAULT_STATE: LauncherState = {
  favorites: [
    { id: '1', name: 'Gmail', packageName: 'com.google.android.gm' },
    { id: '2', name: 'Chrome', packageName: 'com.android.chrome' },
    { id: '3', name: 'Maps', packageName: 'com.google.android.apps.maps' },
    { id: '4', name: 'Messages', packageName: 'com.google.android.apps.messaging' },
    { id: '5', name: 'Camera', packageName: 'com.google.android.GoogleCamera' },
  ],
  todos: [],
  quickNote: '',
  clockFormat: '12h',
  favoritesAlign: 'left',
  plannerSlots: {},
};

type ContextType = {
  state: LauncherState;
  setFavorites: (favs: FavoriteApp[]) => void;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setQuickNote: (note: string) => void;
  setClockFormat: (fmt: ClockFormat) => void;
  setFavoritesAlign: (align: FavoritesAlign) => void;
  setPlannerSlots: (date: string, slots: PlannerSlot[]) => void;
};

const LauncherContext = createContext<ContextType | null>(null);

export function LauncherProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<LauncherState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setStateRaw(s => ({ ...s, ...parsed }));
        } catch { /* ignore */ }
      }
      setLoaded(true);
    });
  }, []);

  const setState = (updater: (prev: LauncherState) => LauncherState) => {
    setStateRaw(prev => {
      const next = updater(prev);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const setFavorites = (favorites: FavoriteApp[]) =>
    setState(s => ({ ...s, favorites }));

  const addTodo = (text: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    setState(s => ({ ...s, todos: [...s.todos, { id, text, done: false }] }));
  };

  const toggleTodo = (id: string) =>
    setState(s => ({ ...s, todos: s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }));

  const deleteTodo = (id: string) =>
    setState(s => ({ ...s, todos: s.todos.filter(t => t.id !== id) }));

  const setQuickNote = (quickNote: string) =>
    setState(s => ({ ...s, quickNote }));

  const setClockFormat = (clockFormat: ClockFormat) =>
    setState(s => ({ ...s, clockFormat }));

  const setFavoritesAlign = (favoritesAlign: FavoritesAlign) =>
    setState(s => ({ ...s, favoritesAlign }));

  const setPlannerSlots = (date: string, slots: PlannerSlot[]) =>
    setState(s => ({ ...s, plannerSlots: { ...s.plannerSlots, [date]: slots } }));

  if (!loaded) return null;

  return (
    <LauncherContext.Provider value={{
      state,
      setFavorites, addTodo, toggleTodo, deleteTodo,
      setQuickNote, setClockFormat, setFavoritesAlign, setPlannerSlots,
    }}>
      {children}
    </LauncherContext.Provider>
  );
}

export function useLauncherStore() {
  const ctx = useContext(LauncherContext);
  if (!ctx) throw new Error('useLauncherStore must be used inside LauncherProvider');
  return ctx;
}

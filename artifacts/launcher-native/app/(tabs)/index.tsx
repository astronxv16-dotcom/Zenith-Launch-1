import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDrawer } from '@/components/AppDrawer';
import { FocusPanel } from '@/components/FocusPanel';
import { SettingsSheet } from '@/components/SettingsSheet';
import colors from '@/constants/colors';
import { FavoriteApp, useLauncherStore } from '@/hooks/useLauncherStore';

const { width: SCREEN_W } = Dimensions.get('window');
const PANELS = 3;
const HOME = 1; // center panel index

// ──────── Clock ────────────────────────────────────────
function formatClock(d: Date, is12h: boolean): { main: string; period?: string } {
  if (is12h) {
    const str = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const m = str.match(/^(\d+:\d+)\s?(AM|PM)$/i);
    if (m) return { main: m[1], period: m[2].toUpperCase() };
    return { main: str };
  }
  return { main: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) };
}

function formatDate(d: Date) {
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function Clock({ is12h, onDoubleTap }: { is12h: boolean; onDoubleTap?: () => void }) {
  const [now, setNow] = useState(new Date());
  const lastTap = useRef(0);

  // Battery-friendly: sync to minute boundary
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    const msUntilNextMinute = 60000 - (Date.now() % 60000);
    timeout = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), 60000);
    }, msUntilNextMinute);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);

  const handlePress = () => {
    const now_ = Date.now();
    if (now_ - lastTap.current < 350) {
      onDoubleTap?.();
    } else {
      lastTap.current = now_;
      setTimeout(() => {
        if (Date.now() - lastTap.current >= 340) {
          // Single tap — open system clock
          if (Platform.OS === 'android') {
            Linking.sendIntent('android.intent.action.SHOW_ALARMS').catch(() => {});
          }
        }
      }, 360);
    }
  };

  const time = formatClock(now, is12h);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={clockStyles.container}>
      <View style={clockStyles.timeRow}>
        <Text style={clockStyles.time}>{time.main}</Text>
        {time.period && <Text style={clockStyles.period}>{time.period}</Text>}
      </View>
      <Text style={clockStyles.date}>{formatDate(now)}</Text>
    </TouchableOpacity>
  );
}

const clockStyles = StyleSheet.create({
  container: { alignItems: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  time: {
    color: colors.clockText,
    fontSize: 72,
    fontWeight: '100' as const,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  period: {
    color: 'rgba(210,218,228,0.38)',
    fontSize: 16,
    fontWeight: '200' as const,
    letterSpacing: 1,
    marginTop: 14,
  },
  date: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '300' as const,
    letterSpacing: 0.3,
    marginTop: 8,
  },
});

// ──────── Home Panel ────────────────────────────────────
function HomePanel({
  onOpenSettings,
  onAddFavoriteFromDrawer,
}: {
  onOpenSettings: () => void;
  onAddFavoriteFromDrawer: (app: FavoriteApp) => void;
}) {
  const insets = useSafeAreaInsets();
  const { state, setFavorites } = useLauncherStore();
  const { favorites, clockFormat, favoritesAlign } = state;

  const alignStyle = favoritesAlign === 'center'
    ? { alignItems: 'center' as const }
    : favoritesAlign === 'right'
    ? { alignItems: 'flex-end' as const }
    : { alignItems: 'flex-start' as const };

  const launchFavorite = async (pkg: string) => {
    if (Platform.OS !== 'android') return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { LauncherKit } = require('react-native-launcher-kit') as {
        LauncherKit: { launchApplication: (p: string) => Promise<void> };
      };
      await LauncherKit.launchApplication(pkg);
    } catch {
      // Not available in Expo Go
    }
  };

  return (
    <View style={[homePanelStyles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>

      {/* Settings button */}
      <TouchableOpacity
        style={homePanelStyles.settingsBtn}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onOpenSettings(); }}
        activeOpacity={0.6}
      >
        <Feather name="settings" size={16} color="rgba(255,255,255,0.22)" />
      </TouchableOpacity>

      {/* Clock */}
      <Clock is12h={clockFormat === '12h'} />

      <View style={{ flex: 1 }} />

      {/* Favorites */}
      {favorites.length > 0 && (
        <View style={[homePanelStyles.favorites, alignStyle]}>
          {favorites.map((fav: FavoriteApp) => (
            <TouchableOpacity
              key={fav.id}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); launchFavorite(fav.packageName); }}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setFavorites(favorites.filter((f: FavoriteApp) => f.id !== fav.id));
              }}
              style={homePanelStyles.favBtn}
              activeOpacity={0.5}
            >
              <Text style={homePanelStyles.favText}>{fav.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const homePanelStyles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, position: 'relative' },
  settingsBtn: {
    position: 'absolute',
    top: 0,
    right: 20,
    padding: 12,
    zIndex: 10,
  },
  favorites: { gap: 0, paddingBottom: 32, width: '100%' },
  favBtn: { paddingVertical: 10 },
  favText: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: '300' as const,
    letterSpacing: 0.2,
  },
});

// ──────── Panel Indicators ─────────────────────────────
function PanelDots({ active }: { active: number }) {
  return (
    <View style={dotsStyles.row} pointerEvents="none">
      {Array.from({ length: PANELS }).map((_, i) => (
        <View
          key={i}
          style={[
            dotsStyles.dot,
            i === active ? dotsStyles.dotActive : dotsStyles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const dotsStyles = StyleSheet.create({
  row: { position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 7, zIndex: 100 },
  dot: { height: 5, borderRadius: 3 },
  dotActive: { width: 18, backgroundColor: colors.dotActive },
  dotInactive: { width: 5, backgroundColor: colors.dotInactive },
});

// ──────── Main Launcher Screen ─────────────────────────
export default function LauncherScreen() {
  const [activePanel, setActivePanel] = useState(HOME);
  const [showSettings, setShowSettings] = useState(false);
  const translateX = useRef(new Animated.Value(-HOME * SCREEN_W)).current;
  const currentPanel = useRef(HOME);
  const { setFavorites, state } = useLauncherStore();

  const snapTo = useCallback(
    (panel: number, velocity = 0) => {
      const clamped = Math.max(0, Math.min(PANELS - 1, panel));
      currentPanel.current = clamped;
      setActivePanel(clamped);
      Animated.spring(translateX, {
        toValue: -clamped * SCREEN_W,
        velocity: velocity * SCREEN_W,
        tension: 68,
        friction: 12,
        useNativeDriver: true,
      }).start();
    },
    [translateX]
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        const base = -currentPanel.current * SCREEN_W;
        const atLeft = currentPanel.current === 0 && g.dx > 0;
        const atRight = currentPanel.current === PANELS - 1 && g.dx < 0;
        const rubber = atLeft || atRight;
        translateX.setValue(base + (rubber ? g.dx * 0.1 : g.dx));
      },
      onPanResponderRelease: (_, g) => {
        const threshold = SCREEN_W * 0.28;
        if (g.dx < -threshold || (g.vx < -0.5 && Math.abs(g.dx) > 20)) {
          snapTo(currentPanel.current + 1, -g.vx);
        } else if (g.dx > threshold || (g.vx > 0.5 && Math.abs(g.dx) > 20)) {
          snapTo(currentPanel.current - 1, -g.vx);
        } else {
          snapTo(currentPanel.current);
        }
      },
      onPanResponderTerminate: () => snapTo(currentPanel.current),
    })
  ).current;

  const handleAddFavorite = useCallback(
    (app: FavoriteApp) => {
      if (!state.favorites.some(f => f.packageName === app.packageName)) {
        setFavorites([...state.favorites, app]);
      }
    },
    [state.favorites, setFavorites]
  );

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      {/* Dark overlay */}
      <View style={styles.scrim} pointerEvents="none" />

      {/* Panel track */}
      <Animated.View
        style={[styles.track, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* Left — Focus Panel */}
        <View style={styles.panel}>
          <FocusPanel />
        </View>

        {/* Center — Home */}
        <View style={styles.panel}>
          <HomePanel
            onOpenSettings={() => setShowSettings(true)}
            onAddFavoriteFromDrawer={handleAddFavorite}
          />
        </View>

        {/* Right — App Drawer */}
        <View style={styles.panel}>
          <AppDrawer onAddFavorite={handleAddFavorite} />
        </View>
      </Animated.View>

      {/* Panel indicators */}
      <PanelDots active={activePanel} />

      {/* Settings sheet */}
      <SettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
    zIndex: 0,
  },
  track: {
    flexDirection: 'row',
    width: SCREEN_W * PANELS,
    height: '100%',
    zIndex: 1,
  },
  panel: {
    width: SCREEN_W,
    height: '100%',
    overflow: 'hidden',
  },
});

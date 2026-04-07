import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/constants/colors';
import { FavoriteApp, useLauncherStore } from '@/hooks/useLauncherStore';

type AppInfo = {
  packageName: string;
  appName: string;
  icon?: string;
};

const MOCK_APPS: AppInfo[] = [
  { packageName: 'com.google.android.gm', appName: 'Gmail' },
  { packageName: 'com.android.chrome', appName: 'Chrome' },
  { packageName: 'com.google.android.apps.maps', appName: 'Maps' },
  { packageName: 'com.google.android.GoogleCamera', appName: 'Camera' },
  { packageName: 'com.google.android.apps.messaging', appName: 'Messages' },
  { packageName: 'com.google.android.apps.photos', appName: 'Photos' },
  { packageName: 'com.android.settings', appName: 'Settings' },
  { packageName: 'com.android.calculator2', appName: 'Calculator' },
  { packageName: 'com.android.deskclock', appName: 'Clock' },
  { packageName: 'com.google.android.keep', appName: 'Keep Notes' },
  { packageName: 'com.google.android.calendar', appName: 'Calendar' },
  { packageName: 'com.google.android.youtube', appName: 'YouTube' },
  { packageName: 'com.google.android.apps.docs', appName: 'Drive' },
  { packageName: 'com.spotify.music', appName: 'Spotify' },
  { packageName: 'com.whatsapp', appName: 'WhatsApp' },
  { packageName: 'com.instagram.android', appName: 'Instagram' },
];

async function getInstalledApps(): Promise<AppInfo[]> {
  if (Platform.OS !== 'android') return MOCK_APPS;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { LauncherKit } = require('react-native-launcher-kit') as {
      LauncherKit: { getApps: (includeSystem: boolean) => Promise<AppInfo[]> };
    };
    const apps = await LauncherKit.getApps(false);
    return apps.sort((a, b) => a.appName.localeCompare(b.appName));
  } catch {
    return MOCK_APPS;
  }
}

async function launchPackage(packageName: string): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { LauncherKit } = require('react-native-launcher-kit') as {
      LauncherKit: { launchApplication: (pkg: string) => Promise<void> };
    };
    await LauncherKit.launchApplication(packageName);
  } catch {
    // Not available in Expo Go
  }
}

async function openDefaultAppsSettings(): Promise<void> {
  if (Platform.OS !== 'android') {
    Alert.alert('Android only', 'This feature is only available on Android devices.');
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IntentLauncher = require('expo-intent-launcher') as {
      startActivityAsync: (action: string) => Promise<void>;
    };
    await IntentLauncher.startActivityAsync('android.settings.MANAGE_DEFAULT_APPS_SETTINGS');
  } catch {
    Alert.alert('Error', 'Could not open Default Apps settings.');
  }
}

interface AppDrawerProps {
  onAddFavorite?: (app: FavoriteApp) => void;
}

export function AppDrawer({ onAddFavorite }: AppDrawerProps) {
  const insets = useSafeAreaInsets();
  const { state } = useLauncherStore();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    getInstalledApps().then(result => {
      setApps(result);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return apps;
    const q = query.toLowerCase();
    return apps.filter(a => a.appName.toLowerCase().includes(q));
  }, [apps, query]);

  const isFavorite = useCallback(
    (pkg: string) => state.favorites.some(f => f.packageName === pkg),
    [state.favorites]
  );

  const handleLaunch = useCallback(async (app: AppInfo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await launchPackage(app.packageName);
  }, []);

  const handleLongPress = useCallback(
    (app: AppInfo) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (!isFavorite(app.packageName) && onAddFavorite) {
        Alert.alert(
          `Add to favorites?`,
          `"${app.appName}" will appear on your home screen.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add',
              onPress: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onAddFavorite({
                  id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                  name: app.appName,
                  packageName: app.packageName,
                });
              },
            },
          ]
        );
      }
    },
    [isFavorite, onAddFavorite]
  );

  const renderItem = useCallback(
    ({ item }: { item: AppInfo }) => (
      <TouchableOpacity
        style={styles.appRow}
        onPress={() => handleLaunch(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.55}
      >
        {item.icon ? (
          <Image
            source={{ uri: `data:image/png;base64,${item.icon}` }}
            style={styles.appIcon}
          />
        ) : (
          <View style={styles.appIconPlaceholder}>
            <Text style={styles.appIconText}>{item.appName.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.appName} numberOfLines={1}>
          {item.appName}
        </Text>
        {isFavorite(item.packageName) && (
          <View style={styles.favDot} />
        )}
      </TouchableOpacity>
    ),
    [handleLaunch, handleLongPress, isFavorite]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={14} color="rgba(255,255,255,0.28)" style={styles.searchIcon} />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder="Search apps..."
            placeholderTextColor="rgba(255,255,255,0.22)"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={14} color="rgba(255,255,255,0.28)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* App list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="rgba(255,255,255,0.30)" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.packageName}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No apps found</Text>
            </View>
          }
        />
      )}

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.defaultBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDefaultAppsSettings();
          }}
          activeOpacity={0.7}
        >
          <Feather name="home" size={14} color="rgba(255,255,255,0.40)" />
          <Text style={styles.defaultBtnText}>Set as Default Launcher</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  searchRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontWeight: '300' as const,
    height: 40,
  },
  list: {
    paddingHorizontal: 16,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 12,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  appIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 16,
    fontWeight: '300' as const,
  },
  appName: {
    flex: 1,
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '300' as const,
    letterSpacing: 0.1,
  },
  favDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(180,200,255,0.5)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.20)',
    fontSize: 14,
    fontWeight: '300' as const,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(7,9,15,0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  defaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  defaultBtnText: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 13,
    fontWeight: '300' as const,
    letterSpacing: 0.3,
  },
});

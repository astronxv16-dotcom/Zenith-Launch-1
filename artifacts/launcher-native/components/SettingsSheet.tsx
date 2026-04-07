import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/constants/colors';
import { ClockFormat, FavoritesAlign, useLauncherStore } from '@/hooks/useLauncherStore';

async function openDefaultAppsSettings() {
  if (Platform.OS !== 'android') {
    Alert.alert('Android only', 'This is only available on Android devices.');
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

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsSheet({ visible, onClose }: SettingsSheetProps) {
  const insets = useSafeAreaInsets();
  const { state, setClockFormat, setFavoritesAlign } = useLauncherStore();

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );

  const ToggleGroup = <T extends string>({
    options,
    value,
    onSelect,
  }: {
    options: { value: T; label: string }[];
    value: T;
    onSelect: (v: T) => void;
  }) => (
    <View style={styles.toggleGroup}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.toggleBtn, value === opt.value && styles.toggleBtnActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSelect(opt.value); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, value === opt.value && styles.toggleTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top || 24 }]}>

        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={16} color="rgba(255,255,255,0.38)" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.body}>

          <Row label="Clock Format">
            <ToggleGroup<ClockFormat>
              options={[
                { value: '12h', label: '12h  AM/PM' },
                { value: '24h', label: '24h' },
              ]}
              value={state.clockFormat}
              onSelect={setClockFormat}
            />
          </Row>

          <Row label="Favorites Alignment">
            <ToggleGroup<FavoritesAlign>
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
              ]}
              value={state.favoritesAlign}
              onSelect={setFavoritesAlign}
            />
          </Row>

          <Row label="Default Launcher">
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                openDefaultAppsSettings();
              }}
              activeOpacity={0.7}
            >
              <Feather name="home" size={15} color="rgba(255,255,255,0.38)" />
              <Text style={styles.actionBtnText}>Open Default Apps Settings</Text>
              <Feather name="external-link" size={13} color="rgba(255,255,255,0.22)" />
            </TouchableOpacity>
            <Text style={styles.actionHint}>
              Set Focus Launcher as your Android home screen. You can always remove it from the same screen.
            </Text>
          </Row>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0B14' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 },
  title: { color: 'rgba(255,255,255,0.70)', fontSize: 18, fontWeight: '200' as const, letterSpacing: 0.3 },
  closeBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 24 },
  body: { padding: 24, gap: 8 },
  section: { marginBottom: 24 },
  sectionLabel: { color: colors.mutedText, fontSize: 10, fontWeight: '300' as const, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  toggleGroup: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  toggleBtnActive: { backgroundColor: 'rgba(255,255,255,0.09)', borderColor: 'rgba(255,255,255,0.14)' },
  toggleText: { color: 'rgba(255,255,255,0.28)', fontSize: 13, fontWeight: '300' as const },
  toggleTextActive: { color: 'rgba(255,255,255,0.68)' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    marginBottom: 10,
  },
  actionBtnText: { flex: 1, color: 'rgba(255,255,255,0.50)', fontSize: 14, fontWeight: '300' as const },
  actionHint: { color: 'rgba(255,255,255,0.22)', fontSize: 12, fontWeight: '300' as const, lineHeight: 17 },
});

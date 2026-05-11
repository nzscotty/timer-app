import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { Divider, Text, Icon, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TimerHistoryEntry } from '../../hooks/useTimerHistory';
import { formatDuration } from '../../utils/parseDuration';
import SettingsScreen from './SettingsScreen';

interface Props {
  visible: boolean;
  onClose: () => void;
  entries: TimerHistoryEntry[];
  onSelect: (durationSeconds: number) => void;
  onRemove: (id: string) => void;
}

const COLLAPSED_WIDTH = 80;

export default function TimerDrawer({
  visible,
  onClose,
  entries,
  onSelect,
  onRemove,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [deleteMode, setDeleteMode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-COLLAPSED_WIDTH)).current;
  const scrimAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
  }, [visible]);

  useEffect(() => {
    if (mounted && visible) {
      slideAnim.setValue(-COLLAPSED_WIDTH);
      scrimAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scrimAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted && !visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -COLLAPSED_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scrimAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [mounted, visible]);

  const handleSelect = (seconds: number) => {
    setDeleteMode(null);
    onSelect(seconds);
    onClose();
  };

  const handleLongPress = (id: string) => {
    setDeleteMode((prev) => (prev === id ? null : id));
  };

  const handleRemove = (id: string) => {
    onRemove(id);
    setDeleteMode(null);
  };

  if (!mounted) return null;

  return (
    <View style={styles.overlay}>
      {/* Scrim */}
      <Animated.View style={[styles.scrim, { opacity: scrimAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => { setDeleteMode(null); onClose(); }} />
      </Animated.View>

      {/* Collapsed drawer rail */}
      <Animated.View
        style={[
          styles.rail,
          {
            width: COLLAPSED_WIDTH,
            backgroundColor: theme.colors.surface,
            paddingTop: insets.top + 8,
            transform: [{ translateX: slideAnim }],
          },
        ]}
        >
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {entries.length === 0 && (
              <View style={styles.emptyRail}>
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
                >
                  No timers
                </Text>
              </View>
            )}
            {entries.map((entry, index) => (
              <View key={entry.id}>
                {index > 0 && (
                  <Divider style={{ marginHorizontal: 0, backgroundColor: theme.colors.outline }} />
                )}
                <Pressable
                  onPress={() => deleteMode === entry.id
                    ? handleRemove(entry.id)
                    : handleSelect(entry.durationSeconds)
                  }
                  onLongPress={() => handleLongPress(entry.id)}
                  delayLongPress={400}
                  android_ripple={{ color: theme.colors.primaryContainer }}
                  style={({ pressed }) => [
                    styles.drawerItem,
                    {
                      backgroundColor: pressed
                        ? theme.colors.primaryContainer
                        : 'transparent',
                    },
                  ]}
                >
                  <Icon
                    source={deleteMode === entry.id ? 'close-circle' : 'timer-outline'}
                    size={24}
                    color={deleteMode === entry.id ? theme.colors.error : theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="labelMedium"
                    numberOfLines={1}
                    style={{ color: theme.colors.onSurface, marginTop: 4 }}
                  >
                    {formatDuration(entry.durationSeconds)}
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          {/* Settings button pinned to bottom */}
          <Pressable
            onPress={() => setSettingsVisible(true)}
            android_ripple={{ color: theme.colors.primaryContainer, borderless: true }}
            style={({ pressed }) => ([
              styles.drawerItem,
              { backgroundColor: pressed ? theme.colors.primaryContainer : 'transparent', marginBottom: insets.bottom + 4 },
            ])}
          >
            <Icon source="cog-outline" size={24} color={theme.colors.onSurfaceVariant} />
          </Pressable>

          <SettingsScreen visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
        </Animated.View>
      </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 100,
    elevation: 100,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  rail: {
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    alignItems: 'center',
    paddingBottom: 0,
  },
  emptyRail: {
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  collapsedItem: {
    position: 'relative',
    alignItems: 'center',
  },
  drawerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  deleteBtn: {
    position: 'absolute',
    bottom: 0,
  },
});
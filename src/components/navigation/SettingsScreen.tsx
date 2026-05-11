import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { Appbar, Text, RadioButton, Divider, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { ALARM_SOUNDS, AlarmSoundId } from '../../utils/alarmSounds';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  visible: boolean;
  onClose: () => void;
  alarmSoundId: AlarmSoundId;
  onAlarmSoundChange: (id: AlarmSoundId) => Promise<void>;
}

export default function SettingsScreen({ visible, onClose, alarmSoundId, onAlarmSoundChange }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const scrimAnim = useRef(new Animated.Value(0)).current;
  const previewRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  const stopPreview = useCallback(() => {
    if (previewRef.current) {
      try { previewRef.current.pause(); previewRef.current.remove(); } catch (e) {
        console.warn('[Preview] stopPreview error:', e);
      }
      previewRef.current = null;
    }
  }, []);

  const handleSelect = useCallback(async (id: AlarmSoundId) => {
    try {
      onAlarmSoundChange(id).catch((e) => console.warn('[useAlarmSound] save failed:', e));
      stopPreview();

      const sound = ALARM_SOUNDS.find((s) => s.id === id);
      if (!sound) return;

      await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
      const player = createAudioPlayer(sound.source);
      player.loop = true;  // loop so short clips are audible
      previewRef.current = player;
      const hasPlayed = { value: false };

      player.addListener('playbackStatusUpdate', (status) => {
        if (status.isLoaded && !hasPlayed.value) {
          hasPlayed.value = true;
          try { player.play(); } catch (e) { console.warn('[Preview] play() error:', e); }
        }
      });
    } catch (e) {
      console.warn('[Preview] error:', e);
    }
  }, [onAlarmSoundChange, stopPreview]);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  useEffect(() => {
    if (mounted && visible) {
      slideAnim.setValue(-SCREEN_WIDTH);
      scrimAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(scrimAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else if (mounted && !visible) {
      stopPreview();
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH, duration: 200, useNativeDriver: true }),
        Animated.timing(scrimAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [mounted, visible]);

  // Clean up on unmount
  useEffect(() => () => stopPreview(), [stopPreview]);

  if (!mounted) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.scrim, { opacity: scrimAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => { stopPreview(); onClose(); }} />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Appbar.Header style={{ backgroundColor: theme.colors.background }} elevated={false}>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title="Settings" />
        </Appbar.Header>

        <Pressable style={styles.body} onPress={stopPreview}>
          <Text
            variant="labelLarge"
            style={[styles.sectionLabel, { color: theme.colors.primary }]}
          >
            Alarm Sound
          </Text>
          <Divider />
          {ALARM_SOUNDS.map((sound) => (
            <Pressable
              key={sound.id}
              onPress={() => handleSelect(sound.id)}
              android_ripple={{ color: theme.colors.primaryContainer }}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: pressed ? theme.colors.primaryContainer : 'transparent' },
              ]}
            >
              <RadioButton
                value={sound.id}
                status={alarmSoundId === sound.id ? 'checked' : 'unchecked'}
                onPress={() => handleSelect(sound.id)}
                color={theme.colors.primary}
              />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, flex: 1 }}>
                {sound.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 200,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  body: {
    flex: 1,
    paddingTop: 8,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});



import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsScreen({ visible, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const scrimAnim = useRef(new Animated.Value(0)).current;

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
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH, duration: 200, useNativeDriver: true }),
        Animated.timing(scrimAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [mounted, visible]);

  if (!mounted) return null;

  return (
    <View style={styles.overlay}>
      {/* Scrim */}
      <Animated.View style={[styles.scrim, { opacity: scrimAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Panel sliding in from the left */}
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

        {/* Settings content goes here */}
        <View style={styles.body} />
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
  },
});


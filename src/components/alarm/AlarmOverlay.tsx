import React, { useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, Animated, Easing } from 'react-native';
import { Text, Button, Icon, useTheme } from 'react-native-paper';

interface AlarmOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  onAddMinute: () => void;
}

export default function AlarmOverlay({ visible, onDismiss, onAddMinute }: AlarmOverlayProps) {
  const theme = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      pulse.setValue(1);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [visible, pulse]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.92)' }]}>
        <Animated.View style={{ transform: [{ scale: pulse }], marginBottom: 8 }}>
          <Icon source="bell-ring" size={72} color={theme.colors.error} />
        </Animated.View>

        <Text style={styles.title}>
          Time's up!
        </Text>

        <Animated.View style={[styles.dismissWrapper, { transform: [{ scale: pulse }] }]}>
          <Button
            mode="contained"
            onPress={onDismiss}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            buttonColor={theme.colors.error}
            textColor="#fff"
            style={styles.button}
          >
            Dismiss
          </Button>
        </Animated.View>

        <Button
          mode="outlined"
          onPress={onAddMinute}
          contentStyle={styles.addMinuteContent}
          labelStyle={styles.addMinuteLabel}
          textColor="rgba(255,255,255,0.75)"
          style={styles.addMinuteButton}
        >
          +1 Minute
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: '200',
    letterSpacing: -1,
    color: '#fff',
  },
  dismissWrapper: {
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  button: {
    borderRadius: 100,
    minWidth: 220,
  },
  buttonContent: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  buttonLabel: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addMinuteButton: {
    borderRadius: 100,
    minWidth: 180,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addMinuteContent: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addMinuteLabel: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

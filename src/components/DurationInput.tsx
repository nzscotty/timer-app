import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';

interface Props {
  onDurationChange: (seconds: number) => void;
  onStart: () => void;
  onClose: () => void;
  disabled?: boolean;
  /** When true, resets digits to empty */
  resetKey?: number;
}

/** Max 6 raw digits: HHMMSS */
const MAX_DIGITS = 6;

function digitsToDuration(digits: string) {
  const padded = digits.padStart(6, '0');
  const h = parseInt(padded.slice(0, 2), 10);
  const m = parseInt(padded.slice(2, 4), 10);
  const s = parseInt(padded.slice(4, 6), 10);
  return { h, m, s, totalSeconds: h * 3600 + m * 60 + s };
}

export default function DurationInput({ onDurationChange, onStart, onClose, disabled, resetKey }: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [digits, setDigits] = useState('');

  // Reset digits when resetKey changes (i.e. when sheet opens)
  useEffect(() => {
    setDigits('');
  }, [resetKey]);

  const { totalSeconds } = digitsToDuration(digits);

  useEffect(() => {
    if (totalSeconds > 0) {
      onDurationChange(totalSeconds);
    }
  }, [totalSeconds]);

  const appendDigit = (d: string) => {
    if (disabled) return;
    setDigits((prev) => {
      const next = prev + d;
      const trimmed = next.replace(/^0+/, '') || '';
      return trimmed.length <= MAX_DIGITS ? trimmed : prev;
    });
  };

  const backspace = () => {
    if (disabled) return;
    setDigits((prev) => prev.slice(0, -1));
  };

  const hasValue = digits.length > 0;

  const btnSize = Math.min(Math.floor((width - 80) / 3), 96);
  const gap = 16;

  const padded = digits.padStart(6, '0');
  const hStr = padded.slice(0, 2);
  const mStr = padded.slice(2, 4);
  const sStr = padded.slice(4, 6);

  const digitColor = hasValue ? theme.colors.onSurface : theme.colors.onSurfaceVariant;
  const labelColor = theme.colors.onSurfaceVariant;

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['00', '0', 'backspace'],
  ];

  return (
    <View style={styles.container}>
      {/* Duration display */}
      <View style={styles.display}>
        <Text style={[styles.digitText, { color: digitColor }]}>{hStr}</Text>
        <Text style={[styles.unitLabel, { color: labelColor }]}>h</Text>
        <Text style={styles.spacer}> </Text>
        <Text style={[styles.digitText, { color: digitColor }]}>{mStr}</Text>
        <Text style={[styles.unitLabel, { color: labelColor }]}>m</Text>
        <Text style={styles.spacer}> </Text>
        <Text style={[styles.digitText, { color: digitColor }]}>{sStr}</Text>
        <Text style={[styles.unitLabel, { color: labelColor }]}>s</Text>
      </View>

      {/* Numpad */}
      <View style={[styles.pad, { gap }]}>
        {keys.map((row, ri) => (
          <View key={ri} style={[styles.row, { gap }]}>
            {row.map((key) => {
              const isBackspace = key === 'backspace';
              return (
                <Pressable
                  key={key}
                  onPress={() => (isBackspace ? backspace() : appendDigit(key))}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.key,
                    {
                      width: btnSize,
                      height: btnSize,
                      borderRadius: btnSize / 2,
                      backgroundColor: pressed
                        ? theme.colors.surfaceVariant
                        : isBackspace
                        ? `${theme.colors.surfaceVariant}cc`
                        : `${theme.colors.surfaceVariant}88`,
                    },
                  ]}
                >
                  {isBackspace ? (
                    <Text style={{ fontSize: 24, color: theme.colors.onSurface }}>
                      ⌫
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.keyText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {key}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Start button */}
      <Pressable
        onPress={() => {
          if (totalSeconds > 0) {
            onDurationChange(totalSeconds);
            onStart();
            onClose();
          }
        }}
        disabled={totalSeconds === 0}
        style={({ pressed }) => [
          styles.startBtn,
          {
            backgroundColor: totalSeconds > 0
              ? pressed
                ? theme.colors.primaryContainer
                : theme.colors.primary
              : `${theme.colors.surfaceVariant}88`,
          },
        ]}
      >
        <Text
          style={[
            styles.startBtnText,
            {
              color: totalSeconds > 0
                ? theme.colors.onPrimary
                : theme.colors.onSurfaceVariant,
            },
          ]}
        >
          Start
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 8,
  },
  display: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
  },
  digitText: {
    fontSize: 48,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 2,
  },
  spacer: {
    width: 12,
  },
  pad: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  key: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '400',
  },
  startBtn: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 28,
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

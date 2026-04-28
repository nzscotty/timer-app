import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { formatDuration } from '../utils/parseDuration';
import ScrollPicker from './ScrollPicker';

interface Props {
  onDurationChange: (seconds: number) => void;
  onStart: () => void;
  onClose: () => void;
  disabled?: boolean;
}

function padTwo(n: number): string {
  return n.toString().padStart(2, '0');
}

type ClockPhase = 'hour' | 'minute';

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES_60 = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

// Scroll picker data: hours 1-12 (sequential), minutes 0-59
const HOUR_ITEMS = Array.from({ length: 12 }, (_, i) => padTwo(i + 1));
const MINUTE_ITEMS = Array.from({ length: 60 }, (_, i) => padTwo(i));

// Map 12-hour display value to scroll index (1=0, 2=1, ..., 12=11)
function hourToScrollIndex(h12: number): number {
  return h12 - 1;
}
function scrollIndexToHour(idx: number): number {
  return idx + 1;
}

export default function TimePickerMode({ onDurationChange, onStart, onClose, disabled }: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const now = new Date();
  const currentH12 = now.getHours() % 12 || 12;
  const currentMin = Math.ceil(now.getMinutes() / 5) * 5 % 60;
  const currentIsPM = now.getHours() >= 12;

  const [selectedHour, setSelectedHour] = useState(currentH12);
  const [selectedMinute, setSelectedMinute] = useState(currentMin);
  const [isPM, setIsPM] = useState(currentIsPM);
  const [phase, setPhase] = useState<ClockPhase>('hour');
  const [inputMode, setInputMode] = useState<'clock' | 'keyboard'>('clock');

  // Keyboard entry state
  const [kbHour, setKbHour] = useState(padTwo(currentH12));
  const [kbMinute, setKbMinute] = useState(padTwo(currentMin));

  const get24Hour = useCallback(
    (h12: number, pm: boolean) => {
      let h = h12 % 12;
      if (pm) h += 12;
      return h;
    },
    []
  );

  const effectiveHour = inputMode === 'clock' ? selectedHour : (parseInt(kbHour, 10) || 12);
  const effectiveMinute = inputMode === 'clock' ? selectedMinute : (parseInt(kbMinute, 10) || 0);

  const deltaSeconds = useMemo(() => {
    const target = new Date();
    target.setHours(get24Hour(effectiveHour, isPM), effectiveMinute, 0, 0);
    let diff = (target.getTime() - Date.now()) / 1000;
    if (diff <= 0) diff += 24 * 3600;
    return Math.round(diff);
  }, [effectiveHour, effectiveMinute, isPM, get24Hour]);

  React.useEffect(() => {
    if (deltaSeconds > 0) {
      onDurationChange(deltaSeconds);
    }
  }, [deltaSeconds]);

  // Clock face sizing
  const clockSize = Math.min(width - 64, 280);
  const clockRadius = clockSize / 2;
  const numberRadius = clockRadius - 32;
  const center = clockRadius;

  const handleClockPress = (e: GestureResponderEvent) => {
    if (disabled) return;
    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - center;
    const dy = locationY - center;
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    if (phase === 'hour') {
      const hourIndex = Math.round(angle / 30) % 12;
      const hour = HOURS_12[hourIndex];
      setSelectedHour(hour);
      setTimeout(() => setPhase('minute'), 300);
    } else {
      const minuteIndex = Math.round(angle / 30) % 12;
      const minute = MINUTES_60[minuteIndex];
      setSelectedMinute(minute);
    }
  };

  // Compute hand angle
  const handAngle =
    phase === 'hour'
      ? ((selectedHour % 12) / 12) * 360
      : (selectedMinute / 60) * 360;

  const handLength = numberRadius;
  const handEndX = center + handLength * Math.sin((handAngle * Math.PI) / 180);
  const handEndY = center - handLength * Math.cos((handAngle * Math.PI) / 180);

  const switchToKeyboard = () => {
    setKbHour(padTwo(selectedHour));
    setKbMinute(padTwo(selectedMinute));
    setInputMode('keyboard');
  };

  const switchToClock = () => {
    const h = Math.max(1, Math.min(12, parseInt(kbHour, 10) || 12));
    const m = Math.max(0, Math.min(59, parseInt(kbMinute, 10) || 0));
    setSelectedHour(h);
    setSelectedMinute(m);
    setPhase('hour');
    setInputMode('clock');
  };

  return (
    <View style={styles.container}>
      {/* Time display header */}
      <View style={styles.headerRow}>
        <View style={styles.timeDisplay}>
          <Pressable
            onPress={() => { setPhase('hour'); if (inputMode === 'keyboard') switchToClock(); }}
            style={[
              styles.timeBox,
              {
                backgroundColor:
                  (inputMode === 'clock' && phase === 'hour')
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.timeText,
                {
                  color:
                    (inputMode === 'clock' && phase === 'hour')
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {inputMode === 'clock' ? padTwo(selectedHour) : kbHour.padStart(2, '0')}
            </Text>
          </Pressable>

          <Text style={[styles.colonText, { color: theme.colors.onSurface }]}>:</Text>

          <Pressable
            onPress={() => { setPhase('minute'); if (inputMode === 'keyboard') switchToClock(); }}
            style={[
              styles.timeBox,
              {
                backgroundColor:
                  (inputMode === 'clock' && phase === 'minute')
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.timeText,
                {
                  color:
                    (inputMode === 'clock' && phase === 'minute')
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {inputMode === 'clock' ? padTwo(selectedMinute) : kbMinute.padStart(2, '0')}
            </Text>
          </Pressable>

          {/* AM/PM toggle */}
          <View style={styles.ampmColumn}>
            <Pressable
              onPress={() => setIsPM(false)}
              disabled={disabled}
              style={[
                styles.ampmBtn,
                styles.ampmTop,
                {
                  backgroundColor: !isPM
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
                },
              ]}
            >
              <Text
                style={[
                  styles.ampmText,
                  {
                    color: !isPM
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                AM
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setIsPM(true)}
              disabled={disabled}
              style={[
                styles.ampmBtn,
                styles.ampmBottom,
                {
                  backgroundColor: isPM
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
                },
              ]}
            >
              <Text
                style={[
                  styles.ampmText,
                  {
                    color: isPM
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                PM
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Clock face or Keyboard entry */}
      {inputMode === 'clock' ? (
        <View style={[styles.clockOuter, { width: clockSize, height: clockSize }]}>
          <Pressable
            onPress={handleClockPress}
            style={[
              styles.clockFace,
              {
                width: clockSize,
                height: clockSize,
                borderRadius: clockRadius,
                backgroundColor: theme.colors.surfaceVariant,
              },
            ]}
          >
            {/* Center dot */}
            <View style={[styles.centerDot, { left: center - 4, top: center - 4, backgroundColor: theme.colors.primary }]} />

            {/* Clock hand */}
            <View
              style={[
                styles.hand,
                {
                  width: 2,
                  height: handLength,
                  backgroundColor: theme.colors.primary,
                  left: center - 1,
                  top: center - handLength,
                  transformOrigin: 'bottom',
                  transform: [{ rotate: `${handAngle}deg` }],
                },
              ]}
            />

            {/* Hand end dot */}
            <View
              style={[
                styles.handDot,
                {
                  left: handEndX - 18,
                  top: handEndY - 18,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />

            {/* Numbers */}
            {(phase === 'hour' ? HOURS_12 : MINUTES_60).map((num, i) => {
              const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
              const x = center + numberRadius * Math.cos(a) - 16;
              const y = center + numberRadius * Math.sin(a) - 12;
              const isSelected =
                phase === 'hour' ? num === selectedHour : num === selectedMinute;
              return (
                <View
                  key={num}
                  pointerEvents="none"
                  style={[
                    styles.clockNumberWrap,
                    {
                      left: x,
                      top: y,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.clockNumber,
                      {
                        color: isSelected
                          ? theme.colors.onPrimary
                          : theme.colors.onSurface,
                        fontWeight: isSelected ? '700' : '400',
                      },
                    ]}
                  >
                    {phase === 'minute' ? padTwo(num) : num}
                  </Text>
                </View>
              );
            })}
          </Pressable>
        </View>
      ) : (
        /* Keyboard entry with scroll wheels */
        <View style={styles.kbContainer}>
          <View style={styles.kbRow}>
            {/* Hour column: scroll wheel with editable center */}
            <View style={styles.kbField}>
              <ScrollPicker
                items={HOUR_ITEMS}
                selectedIndex={hourToScrollIndex(parseInt(kbHour, 10) || 12)}
                onSelect={(idx) => setKbHour(padTwo(scrollIndexToHour(idx)))}
                editableValue={kbHour}
                onEditChange={(t) => {
                  const cleaned = t.replace(/[^0-9]/g, '').slice(0, 2);
                  setKbHour(cleaned);
                }}
              />
            </View>

            <Text style={[styles.kbColon, { color: theme.colors.onSurface }]}>:</Text>

            {/* Minute column: scroll wheel with editable center */}
            <View style={styles.kbField}>
              <ScrollPicker
                items={MINUTE_ITEMS}
                selectedIndex={Math.max(0, Math.min(59, parseInt(kbMinute, 10) || 0))}
                onSelect={(idx) => setKbMinute(padTwo(idx))}
                editableValue={kbMinute}
                onEditChange={(t) => {
                  const cleaned = t.replace(/[^0-9]/g, '').slice(0, 2);
                  setKbMinute(cleaned);
                }}
              />
            </View>

            {/* AM/PM toggle */}
            <View style={styles.ampmColumn}>
              <Pressable
                onPress={() => setIsPM(false)}
                disabled={disabled}
                style={[
                  styles.ampmBtn,
                  styles.ampmTop,
                  {
                    backgroundColor: !isPM
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.ampmText,
                    {
                      color: !isPM
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  AM
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsPM(true)}
                disabled={disabled}
                style={[
                  styles.ampmBtn,
                  styles.ampmBottom,
                  {
                    backgroundColor: isPM
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.ampmText,
                    {
                      color: isPM
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  PM
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Bottom row: mode toggle + delta info */}
      <View style={styles.bottomRow}>
        <Pressable onPress={inputMode === 'clock' ? switchToKeyboard : switchToClock} hitSlop={8}>
          <Text style={{ fontSize: 22, color: theme.colors.onSurfaceVariant }}>
            {inputMode === 'clock' ? '⌨' : '🕐'}
          </Text>
        </Pressable>

        <Text style={[styles.deltaText, { color: theme.colors.onSurfaceVariant }]}>
          {formatDuration(deltaSeconds)} from now
          {deltaSeconds > 12 * 3600 ? ' (tomorrow)' : ''}
        </Text>
      </View>

      {/* Start button */}
      <Pressable
        onPress={() => {
          onDurationChange(deltaSeconds);
          onStart();
          onClose();
        }}
        style={({ pressed }) => [
          styles.startBtn,
          {
            backgroundColor: pressed
              ? theme.colors.primaryContainer
              : theme.colors.primary,
          },
        ]}
      >
        <Text style={[styles.startBtnText, { color: theme.colors.onPrimary }]}>
          Start
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  headerRow: {
    marginBottom: 16,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 44,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  colonText: {
    fontSize: 40,
    fontWeight: '400',
    marginHorizontal: 4,
  },
  ampmColumn: {
    marginLeft: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  ampmBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ampmTop: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  ampmBottom: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  ampmText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  clockOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  clockFace: {
    position: 'relative',
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hand: {
    position: 'absolute',
  },
  handDot: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  clockNumberWrap: {
    position: 'absolute',
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockNumber: {
    fontSize: 16,
    textAlign: 'center',
  },
  kbContainer: {
    marginVertical: 12,
  },
  kbRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kbField: {
    alignItems: 'center',
    gap: 8,
  },
  kbLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  kbInput: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    width: 64,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    fontVariant: ['tabular-nums'],
  },
  kbColon: {
    fontSize: 28,
    marginHorizontal: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 4,
  },
  deltaText: {
    fontSize: 14,
  },
  startBtn: {
    marginTop: 16,
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

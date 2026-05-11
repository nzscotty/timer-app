import React, { useState, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import tw from 'twrnc';

interface Props {
  durationSeconds: number;
  onDurationChange: (seconds: number) => void;
  disabled?: boolean;
}

function decompose(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h, m, s };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  primaryColor: string;
  trackColor: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, disabled, primaryColor, trackColor, onChange }: SliderRowProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
      <View style={tw`flex-row justify-between items-baseline px-1`}>
        <Text variant="labelMedium" style={{ color: primaryColor, fontWeight: '600' }}>
          {label}
        </Text>
        <Text variant="titleMedium" style={{ color: primaryColor, fontVariant: ['tabular-nums'] as any }}>
          {pad(value)}
        </Text>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={1}
        onValueChange={(v) => onChange(Math.round(v))}
        onSlidingComplete={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={primaryColor}
        maximumTrackTintColor={trackColor}
        thumbTintColor={primaryColor}
        disabled={disabled}
        style={{ height: 40, transform: [{ scaleY: 1.5 }], marginVertical: -6 }}
      />
      <View style={tw`flex-row justify-between px-1`}>
        <Text variant="labelSmall" style={{ color: trackColor }}>{pad(min)}</Text>
        <Text variant="labelSmall" style={{ color: trackColor }}>{pad(max)}</Text>
      </View>
    </View>
  );
}

export default function SliderStepper({ durationSeconds, onDurationChange, disabled }: Props) {
  const theme = useTheme();
  const [h, setH] = useState(0);
  const [m, setM] = useState(0);
  const [s, setS] = useState(0);

  // Sync from parent
  useEffect(() => {
    const d = decompose(Math.max(0, durationSeconds));
    setH(d.h);
    setM(d.m);
    setS(d.s);
  }, [durationSeconds]);

  const commit = useCallback(
    (hours: number, mins: number, secs: number) => {
      onDurationChange(hours * 3600 + mins * 60 + secs);
    },
    [onDurationChange]
  );

  const handleSeconds = useCallback((v: number) => { setS(v); commit(h, m, v); }, [h, m, commit]);
  const handleMinutes = useCallback((v: number) => { setM(v); commit(h, v, s); }, [h, s, commit]);
  const handleHours   = useCallback((v: number) => { setH(v); commit(v, m, s); }, [m, s, commit]);

  const total = h * 3600 + m * 60 + s;
  const totalLabel = [
    h > 0 ? `${h}h` : null,
    m > 0 || h > 0 ? `${pad(m)}m` : null,
    `${pad(s)}s`,
  ].filter(Boolean).join(' ');

  return (
    <View style={{ flex: 1 }}>
      {/* Total display */}
      <View style={tw`items-center py-2`}>
        <Text
          variant="headlineMedium"
          style={[tw`font-light`, { color: theme.colors.onSurface, fontVariant: ['tabular-nums'] as any }]}
        >
          {total === 0 ? '00s' : totalLabel}
        </Text>
      </View>

      <SliderRow label="Seconds" value={s} min={0} max={59} disabled={disabled}
        primaryColor={theme.colors.primary} trackColor={theme.colors.surfaceVariant}
        onChange={handleSeconds} />

      <SliderRow label="Minutes" value={m} min={0} max={59} disabled={disabled}
        primaryColor={theme.colors.primary} trackColor={theme.colors.surfaceVariant}
        onChange={handleMinutes} />

      <SliderRow label="Hours" value={h} min={0} max={23} disabled={disabled}
        primaryColor={theme.colors.primary} trackColor={theme.colors.surfaceVariant}
        onChange={handleHours} />
    </View>
  );
}


interface Props {
  durationSeconds: number;
  onDurationChange: (seconds: number) => void;
  disabled?: boolean;
}

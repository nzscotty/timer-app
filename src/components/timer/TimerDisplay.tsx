import React from 'react';
import { View } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import tw from 'twrnc';
import Svg, { Circle } from 'react-native-svg';
import { TimerStatus } from '../../hooks/useTimer';
import { formatCountdown, formatDuration, getEndTime } from '../../utils/parseDuration';

interface Props {
  durationSeconds: number;
  remainingSeconds: number;
  status: TimerStatus;
  endTimestamp: number | null;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onCancel: () => void;
}

const RING_SIZE = 220;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TimerDisplay({
  durationSeconds,
  remainingSeconds,
  status,
  endTimestamp,
  onStart,
  onPause,
  onReset,
  onCancel,
}: Props) {
  const theme = useTheme();
  const progress =
    durationSeconds > 0 ? remainingSeconds / durationSeconds : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const isIdle = status === 'idle';
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const hasTime = durationSeconds > 0;

  // Show what time the timer will end
  const endTimeLabel =
    isRunning && endTimestamp
      ? getEndTime(Math.round((endTimestamp - Date.now()) / 1000))
      : hasTime && isIdle
      ? getEndTime(durationSeconds)
      : null;

  return (
    <View
      style={tw`mx-4 mt-2 mb-3 items-center pt-4 pb-5 px-4`}
    >
      {/* Progress ring with time */}
      <View style={tw`items-center justify-center`}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          {/* Background ring */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={theme.colors.surfaceVariant}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Progress ring */}
          {hasTime && (
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={theme.colors.primary}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          )}
        </Svg>

        {/* Centered text over SVG */}
        <View
          style={[
            tw`absolute items-center justify-center`,
            { width: RING_SIZE, height: RING_SIZE },
          ]}
        >
          <Text
            variant="displayMedium"
            style={[
              tw`font-light`,
              { color: theme.colors.onSurface, fontVariant: ['tabular-nums'] },
            ]}
          >
            {isIdle && !hasTime
              ? '00:00'
              : isIdle
              ? formatCountdown(durationSeconds)
              : formatCountdown(remainingSeconds)}
          </Text>
          {isPaused && (
            <IconButton
              icon="restart"
              mode="contained-tonal"
              size={28}
              onPress={onReset}
              style={{ position: 'absolute', bottom: 24 }}
            />
          )}
        </View>
      </View>

      {/* End-time label — always visible, greyed when no time set */}
      <Text
        variant="bodySmall"
        style={[tw`mt-1`, { color: endTimeLabel ? theme.colors.onSurfaceVariant : theme.colors.outline, opacity: endTimeLabel ? 1 : 0.4 }]}
      >
        {isRunning ? 'Rings at ' : 'Will ring at '}
        {endTimeLabel ?? '--:--'}
      </Text>

      {/* Controls */}
      <View style={tw`flex-row items-center justify-center gap-4 mt-3`}>
        {isIdle && (
          <>
            <IconButton
              icon="close"
              mode="contained"
              size={28}
              onPress={onCancel}
              disabled={!hasTime}
              iconColor={hasTime ? '#FFFFFF' : theme.colors.outline}
              containerColor={hasTime ? '#D93025' : theme.colors.surfaceVariant}
              style={{ opacity: hasTime ? 1 : 0.45 }}
            />
            <IconButton
              icon="play"
              mode="contained"
              size={32}
              onPress={onStart}
              disabled={!hasTime}
              iconColor={hasTime ? theme.colors.onPrimary : theme.colors.outline}
              containerColor={hasTime ? theme.colors.primary : theme.colors.surfaceVariant}
              style={{ opacity: hasTime ? 1 : 0.45 }}
            />
          </>
        )}
        {isRunning && (
          <>
            <IconButton
              icon="stop"
              mode="contained"
              size={28}
              onPress={onCancel}
              iconColor="#FFFFFF"
              containerColor="#D93025"
            />
            <IconButton
              icon="pause"
              mode="contained"
              size={32}
              onPress={onPause}
              iconColor={theme.colors.onPrimary}
              containerColor={theme.colors.primary}
            />
          </>
        )}
        {isPaused && (
          <>
            <IconButton
              icon="stop"
              mode="contained"
              size={28}
              onPress={onCancel}
              iconColor="#FFFFFF"
              containerColor="#D93025"
            />
            <IconButton
              icon="play"
              mode="contained"
              size={32}
              onPress={onStart}
              iconColor={theme.colors.onPrimary}
              containerColor={theme.colors.primary}
            />
          </>
        )}
      </View>
    </View>
  );
}

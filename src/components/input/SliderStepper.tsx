import React, { useState, useCallback, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import tw from 'twrnc';
import { formatDuration } from '../../utils/parseDuration';

interface Props {
  durationSeconds: number;
  onDurationChange: (seconds: number) => void;
  disabled?: boolean;
}

/**
 * Adaptive step sizing based on current duration.
 * Smaller durations get finer control, larger durations get coarser steps.
 */
function getStepInfo(_minutes: number): { step: number; label: string } {
  return { step: 5, label: '5 min' };
}

/** Snap a minute value to the nearest increment boundary */
function snapToStep(minutes: number): number {
  const { step } = getStepInfo(minutes);
  return Math.max(1, Math.round(minutes / step) * step);
}

const MIN_MINUTES = 5;
const MAX_MINUTES = 120;

export default function SliderStepper({
  durationSeconds,
  onDurationChange,
  disabled,
}: Props) {
  const theme = useTheme();
  const [localMinutes, setLocalMinutes] = useState(
    durationSeconds > 0 ? Math.round(durationSeconds / 60) : 10
  );

  // Sync from parent when changed externally (e.g. quick pick chips)
  useEffect(() => {
    if (durationSeconds > 0) {
      setLocalMinutes(Math.round(durationSeconds / 60));
    } else {
      setLocalMinutes(10);
    }
  }, [durationSeconds]);

  const currentStep = getStepInfo(localMinutes);

  const updateMinutes = useCallback(
    (mins: number) => {
      const clamped = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, mins));
      setLocalMinutes(clamped);
      onDurationChange(clamped * 60);
    },
    [onDurationChange]
  );

  const handleSliderChange = useCallback(
    (value: number) => {
      const snapped = snapToStep(Math.round(value));
      setLocalMinutes(snapped);
    },
    []
  );

  const handleSliderComplete = useCallback(
    (value: number) => {
      const snapped = snapToStep(Math.round(value));
      updateMinutes(snapped);
    },
    [updateMinutes]
  );

  const decrement = () => {
    const newVal = localMinutes - currentStep.step;
    updateMinutes(snapToStep(Math.max(MIN_MINUTES, newVal)));
  };

  const increment = () => {
    const newVal = localMinutes + currentStep.step;
    updateMinutes(snapToStep(Math.min(MAX_MINUTES, newVal)));
  };

  return (
    <View style={tw`px-4`}>
      {/* Large duration display */}
      <View style={tw`items-center mb-4`}>
        <Text
          variant="displayMedium"
          style={[
            tw`font-light`,
            { color: theme.colors.onSurface, fontVariant: ['tabular-nums'] },
          ]}
        >
          {formatDuration(localMinutes * 60)}
        </Text>
      </View>

      {/* Slider */}
      <View style={tw`mb-2`}>
        <Slider
          value={localMinutes}
          minimumValue={MIN_MINUTES}
          maximumValue={MAX_MINUTES}
          step={5}
          onValueChange={handleSliderChange}
          onSlidingComplete={handleSliderComplete}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.surfaceVariant}
          thumbTintColor={theme.colors.primary}
          disabled={disabled}
          style={[tw`h-10`, { transform: [{ scaleY: 2 }] }]}
        />
        {/* Min/max labels */}
        <View style={tw`flex-row justify-between px-1`}>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            5 min
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            2 hrs
          </Text>
        </View>
      </View>
    </View>
  );
}

import React from 'react';
import { View } from 'react-native';
import { SegmentedButtons, useTheme } from 'react-native-paper';
import tw from 'twrnc';

export type InputMode = 'duration' | 'slider' | 'time';

interface Props {
  value: InputMode;
  onChange: (mode: InputMode) => void;
}

export default function ModeSelector({ value, onChange }: Props) {
  const theme = useTheme();

  return (
    <View style={tw`px-4 mb-3`}>
      <SegmentedButtons
        value={value}
        onValueChange={(v) => onChange(v as InputMode)}
        buttons={[
          { value: 'duration', label: 'Duration', icon: 'keyboard' },
          { value: 'slider', label: 'Slider', icon: 'tune-variant' },
          { value: 'time', label: 'Time', icon: 'clock-outline' },
        ]}
        style={{ backgroundColor: theme.colors.surface }}
      />
    </View>
  );
}

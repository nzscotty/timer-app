import React from 'react';
import { View, ScrollView } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import tw from 'twrnc';

interface Props {
  onSelect: (seconds: number) => void;
  disabled?: boolean;
}

const PRESETS = [
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '15m', seconds: 900 },
  { label: '25m', seconds: 1500 },
  { label: '30m', seconds: 1800 },
  { label: '45m', seconds: 2700 },
  { label: '1h', seconds: 3600 },
  { label: '90m', seconds: 5400 },
  { label: '2h', seconds: 7200 },
];

export default function QuickPickChips({ onSelect, disabled }: Props) {
  const theme = useTheme();

  return (
    <View style={tw`px-2 mb-2`}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-2 gap-2`}
      >
        {PRESETS.map((p) => (
          <Chip
            key={p.label}
            mode="outlined"
            onPress={() => onSelect(p.seconds)}
            disabled={disabled}
            compact
            style={tw`mr-0`}
          >
            {p.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

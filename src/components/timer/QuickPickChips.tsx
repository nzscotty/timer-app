import React from "react";
import { View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import tw from "twrnc";

interface Props {
  currentSeconds: number;
  onSelect: (seconds: number) => void;
  disabled?: boolean;
}

const DELTAS = [
  { label: "-1", minutes: -1 },
  { label: "-5", minutes: -5 },
  { label: "-10", minutes: -10 },
  { label: "+10", minutes: 10 },
  { label: "+5", minutes: 5 },
  { label: "+1", minutes: 1 },
];

export default function QuickPickChips({
  currentSeconds,
  onSelect,
  disabled,
}: Props) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 8, marginBottom: 8, gap: 5 }}>
      {DELTAS.map((d) => {
        const newValue = currentSeconds + d.minutes * 60;
        const isDisabled = disabled || newValue < 0;
        return (
          <View key={d.label} style={{ flex: 1, alignItems: 'center' }}>
            <Chip
              mode="outlined"
              onPress={() => onSelect(Math.max(0, newValue))}
              disabled={isDisabled}
              compact
            >
              {d.label}
            </Chip>
          </View>
        );
      })}
    </View>
  );
}

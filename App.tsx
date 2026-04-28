import React, { useState, useCallback } from 'react';
import { ScrollView, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { lightTheme, darkTheme } from './src/theme';
import { useTimer } from './src/hooks/useTimer';
import TimerDisplay from './src/components/TimerDisplay';
import ModeSelector, { InputMode } from './src/components/ModeSelector';
import BottomSheet from './src/components/BottomSheet';
import DurationInput from './src/components/DurationInput';
import SliderStepper from './src/components/SliderStepper';
import TimePickerMode from './src/components/TimePickerMode';
import QuickPickChips from './src/components/QuickPickChips';

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const [timerState, timerActions] = useTimer();
  const [mode, setMode] = useState<InputMode>('slider');
  const [sheetOpenCount, setSheetOpenCount] = useState(0);

  const isInteractive = timerState.status === 'idle';

  const handleDurationChange = useCallback(
    (seconds: number) => {
      if (isInteractive) {
        timerActions.setDuration(seconds);
      }
    },
    [isInteractive, timerActions]
  );

  const closeSheet = useCallback(() => setMode('slider'), []);

  const handleModeChange = useCallback((m: InputMode) => {
    setMode(m);
    if (m === 'duration' || m === 'time') {
      setSheetOpenCount((c) => c + 1);
    }
  }, []);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          edges={['top', 'left', 'right']}
        >
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Always-visible timer display */}
            <TimerDisplay
              durationSeconds={timerState.durationSeconds}
              remainingSeconds={timerState.remainingSeconds}
              status={timerState.status}
              endTimestamp={timerState.endTimestamp}
              onStart={timerActions.start}
              onPause={timerActions.pause}
              onReset={timerActions.reset}
              onCancel={timerActions.cancel}
            />

            {/* Quick pick chips */}
            <QuickPickChips
              onSelect={handleDurationChange}
              disabled={!isInteractive}
            />
            {/* Mode selector */}
            <ModeSelector value={mode} onChange={handleModeChange} />

            {/* Slider is inline, others are bottom sheets */}
            {mode === 'slider' && (
              <SliderStepper
                durationSeconds={timerState.durationSeconds}
                onDurationChange={handleDurationChange}
                disabled={!isInteractive}
              />
            )}
          </ScrollView>

          {/* Duration numpad bottom sheet */}
          <BottomSheet
            visible={mode === 'duration'}
            onClose={closeSheet}
            title="Set duration"
          >
            <DurationInput
              onDurationChange={handleDurationChange}
              onStart={timerActions.start}
              onClose={closeSheet}
              disabled={!isInteractive}
              resetKey={sheetOpenCount}
            />
          </BottomSheet>

          {/* Time picker bottom sheet */}
          <BottomSheet
            visible={mode === 'time'}
            onClose={closeSheet}
            title="Set time"
          >
            <TimePickerMode
              onDurationChange={handleDurationChange}
              onStart={timerActions.start}
              onClose={closeSheet}
              disabled={!isInteractive}
            />
          </BottomSheet>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

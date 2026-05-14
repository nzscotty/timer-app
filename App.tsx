import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { PaperProvider, Appbar } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useThemeToggle } from './src/hooks/useThemeToggle';
import { useTimer } from './src/hooks/useTimer';
import { useAlarm } from './src/hooks/useAlarm';
import { useAlarmSound } from './src/hooks/useAlarmSound';
import { useVibrateEnabled } from './src/hooks/useVibrateEnabled';
import { useTimerHistory } from './src/hooks/useTimerHistory';
import { getSoundById } from './src/utils/alarmSounds';
import TimerDisplay from './src/components/timer/TimerDisplay';
import ModeSelector, { InputMode } from './src/components/timer/ModeSelector';
import BottomSheet from './src/components/navigation/BottomSheet';
import DurationInput from './src/components/input/DurationInput';
import SliderStepper from './src/components/input/SliderStepper';
import TimePickerMode from './src/components/input/time/TimePickerMode';
import QuickPickChips from './src/components/timer/QuickPickChips';
import TimerDrawer from './src/components/navigation/TimerDrawer';
import AlarmOverlay from './src/components/alarm/AlarmOverlay';
import SettingsScreen from './src/components/navigation/SettingsScreen';

export default function App() {
  const [fontsLoaded] = useFonts(MaterialCommunityIcons.font);
  const { theme, icon: themeIcon, statusBarStyle, toggle: toggleTheme } = useThemeToggle();
  const [alarmSoundId, setAlarmSoundId] = useAlarmSound();
  const [vibrateEnabled, setVibrateEnabled] = useVibrateEnabled();
  const { triggerAlarm, dismissAlarm, isAlarming } = useAlarm(getSoundById(alarmSoundId).source, vibrateEnabled);
  const [timerState, timerActions] = useTimer(triggerAlarm);
  const [history, historyActions] = useTimerHistory();
  const [mode, setMode] = useState<InputMode>('slider');
  const [sheetOpenCount, setSheetOpenCount] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

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

  const handleStart = useCallback(() => {
    if (timerState.durationSeconds > 0) {
      historyActions.add(timerState.durationSeconds);
    }
    timerActions.start();
  }, [timerState.durationSeconds, timerActions, historyActions]);

  const handleDrawerSelect = useCallback(
    (seconds: number) => {
      timerActions.setDuration(seconds);
    },
    [timerActions]
  );

  const handleModeChange = useCallback((m: InputMode) => {
    setMode(m);
    if (m === 'duration' || m === 'time') {
      setSheetOpenCount((c) => c + 1);
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <PaperProvider theme={theme} settings={{ rippleEffectEnabled: true }}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          edges={['left', 'right']}
        >
          <StatusBar style={statusBarStyle} />

          {/* App bar */}
          <Appbar.Header elevated={false} style={{ backgroundColor: theme.colors.background }}>
            <Appbar.Action icon="menu" onPress={() => { setDrawerVisible(true); }} />
            <Appbar.Content title="" />
            <Appbar.Action icon={themeIcon} onPress={toggleTheme} />
          </Appbar.Header>

          {/* Always-visible top content — fixed, never scrolls */}
          <TimerDisplay
            durationSeconds={timerState.durationSeconds}
            remainingSeconds={timerState.remainingSeconds}
            status={timerState.status}
            endTimestamp={timerState.endTimestamp}
            onStart={handleStart}
            onPause={timerActions.pause}
            onReset={timerActions.reset}
            onCancel={timerActions.cancel}
          />

          {/* Quick pick chips */}
          <QuickPickChips
            currentSeconds={timerState.durationSeconds}
            onSelect={(seconds) => {
              const delta = seconds - timerState.durationSeconds;
              timerActions.adjustDuration(delta);
            }}
          />

          {/* Mode selector */}
          <ModeSelector value={mode} onChange={handleModeChange} />

          {/* Sliders fill remaining vertical space */}
          {mode === 'slider' && (
            <View style={{ flex: 1, paddingBottom: 32 }}>
              <SliderStepper
                durationSeconds={timerState.durationSeconds}
                onDurationChange={handleDurationChange}
                disabled={!isInteractive}
              />
            </View>
          )}

          {/* Duration numpad bottom sheet */}
          <BottomSheet
            visible={mode === 'duration'}
            onClose={closeSheet}
            title="Set duration"
          >
            <DurationInput
              onDurationChange={handleDurationChange}
              onStart={handleStart}
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
              onStart={handleStart}
              onClose={closeSheet}
              disabled={!isInteractive}
            />
          </BottomSheet>

          {/* Timer history drawer */}
          <TimerDrawer
            visible={drawerVisible}
            onClose={() => setDrawerVisible(false)}
            entries={history}
            onSelect={handleDrawerSelect}
            onRemove={historyActions.remove}
            onOpenSettings={() => setSettingsVisible(true)}
          />

          <SettingsScreen
            visible={settingsVisible}
            onClose={() => setSettingsVisible(false)}
            alarmSoundId={alarmSoundId}
            onAlarmSoundChange={setAlarmSoundId}
            vibrateEnabled={vibrateEnabled}
            onVibrateChange={setVibrateEnabled}
          />

          <AlarmOverlay
            visible={isAlarming}
            onDismiss={dismissAlarm}
            onAddMinute={() => {
              dismissAlarm();
              timerActions.startWithDuration(60);
            }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

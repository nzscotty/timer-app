import { useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../theme';

export type ThemeMode = 'system' | 'light' | 'dark';

export function useThemeToggle() {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const toggle = useCallback(() => {
    setMode((prev) => {
      if (prev === 'system') return isDark ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [isDark]);

  const icon = isDark ? 'weather-sunny' : 'weather-night';
  const statusBarStyle = isDark ? 'light' : 'dark';

  return useMemo(
    () => ({ theme, isDark, icon, statusBarStyle, toggle } as const),
    [theme, isDark, icon, statusBarStyle, toggle]
  );
}

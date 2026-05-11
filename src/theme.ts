import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0B57D0',
    primaryContainer: '#D3E3FD',
    secondary: '#00639B',
    secondaryContainer: '#C2E7FF',
    surface: '#FFFFFF',
    surfaceVariant: '#E8EEFF',
    background: '#F4F6FF',
    onSurface: '#0D0D12',
    onSurfaceVariant: '#49454F',
    outline: '#9AA0B4',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#EEF1FF',
      level2: '#E5E9FF',
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A8C7FA',
    primaryContainer: '#004A77',
    secondary: '#7DCFFF',
    secondaryContainer: '#004A73',
    surface: '#1A1A2E',
    surfaceVariant: '#252538',
    background: '#0F0F17',
    onSurface: '#E8E8F0',
    onSurfaceVariant: '#B0B0C8',
    outline: '#5A5A78',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: '#20203A',
      level2: '#262642',
    },
  },
};

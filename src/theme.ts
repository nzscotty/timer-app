import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0B57D0',
    primaryContainer: '#D3E3FD',
    secondary: '#00639B',
    secondaryContainer: '#C2E7FF',
    surface: '#FAFAFA',
    surfaceVariant: '#E1E3E1',
    background: '#FAFAFA',
    onSurface: '#1D1B20',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#F3EDF7',
      level2: '#EDE8F0',
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
    surface: '#1C1B1F',
    surfaceVariant: '#49454F',
    background: '#1C1B1F',
    onSurface: '#E6E1E5',
    onSurfaceVariant: '#CAC4D0',
    outline: '#938F99',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: '#2B2930',
      level2: '#302E35',
    },
  },
};

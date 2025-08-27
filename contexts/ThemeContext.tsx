import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    gradient: string[];
    shadow: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: { fontSize: number; fontWeight: string; lineHeight: number };
    h2: { fontSize: number; fontWeight: string; lineHeight: number };
    h3: { fontSize: number; fontWeight: string; lineHeight: number };
    body: { fontSize: number; fontWeight: string; lineHeight: number };
    caption: { fontSize: number; fontWeight: string; lineHeight: number };
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#3B82F6',
    primaryLight: '#DBEAFE',
    primaryDark: '#1D4ED8',
    secondary: '#A3E635',
    background: '#1E293B',
    surface: '#334155',
    card: '#334155',
    text: '#F9FAFB',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: '#475569',
    borderLight: '#64748B',
    success: '#A3E635',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    gradient: ['#3B82F6', '#A3E635'],
    shadow: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  },
};

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#3B82F6',
    primaryLight: '#1E3A8A',
    primaryDark: '#1D4ED8',
    secondary: '#A3E635',
    background: '#1E293B',
    surface: '#334155',
    card: '#334155',
    text: '#F9FAFB',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: '#475569',
    borderLight: '#64748B',
    success: '#A3E635',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    gradient: ['#3B82F6', '#A3E635'],
    shadow: '#000000',
  },
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme_mode');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference
  const updateThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('theme_mode', mode);
      setThemeMode(mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }, []);

  // Calculate current theme
  const currentTheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, systemColorScheme]);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  return useMemo(() => ({
    theme: currentTheme,
    themeMode,
    isDark,
    isLoading,
    setThemeMode: updateThemeMode,
  }), [currentTheme, themeMode, isDark, isLoading, updateThemeMode]);
});
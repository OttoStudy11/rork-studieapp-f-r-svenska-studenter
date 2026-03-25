import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@timer_settings';

export interface TimerSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  backgroundTimerEnabled: boolean;
  focusDuration: number;
  breakDuration: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  notificationsEnabled: true,
  backgroundTimerEnabled: true,
  focusDuration: 25,
  breakDuration: 5,
};

export const [TimerSettingsProvider, useTimerSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load timer settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: TimerSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save timer settings:', error);
    }
  };

  const updateSetting = useCallback(async <K extends keyof TimerSettings>(
    key: K,
    value: TimerSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    await saveSettings(newSettings);
  }, [settings]);

  const setSoundEnabled = useCallback((value: boolean) => updateSetting('soundEnabled', value), [updateSetting]);
  const setHapticsEnabled = useCallback((value: boolean) => updateSetting('hapticsEnabled', value), [updateSetting]);
  const setNotificationsEnabled = useCallback((value: boolean) => updateSetting('notificationsEnabled', value), [updateSetting]);
  const setBackgroundTimerEnabled = useCallback((value: boolean) => updateSetting('backgroundTimerEnabled', value), [updateSetting]);
  const setFocusDuration = useCallback((value: number) => updateSetting('focusDuration', value), [updateSetting]);
  const setBreakDuration = useCallback((value: number) => updateSetting('breakDuration', value), [updateSetting]);

  return useMemo(() => ({
    settings,
    isLoading,
    updateSetting,
    setSoundEnabled,
    setHapticsEnabled,
    setNotificationsEnabled,
    setBackgroundTimerEnabled,
    setFocusDuration,
    setBreakDuration,
  }), [settings, isLoading, updateSetting, setSoundEnabled, setHapticsEnabled, setNotificationsEnabled, setBackgroundTimerEnabled, setFocusDuration, setBreakDuration]);
});

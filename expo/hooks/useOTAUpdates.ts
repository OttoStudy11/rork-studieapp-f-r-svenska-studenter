import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates';

export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'error' | 'timeout';

const UPDATE_TIMEOUT_MS = 15000;

export function useOTAUpdates() {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCheckedRef = useRef(false);

  const clearUpdateTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const checkForUpdates = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.log('🌐 OTA updates not supported on web, skipping');
      setStatus('idle');
      return;
    }

    if (__DEV__) {
      console.log('🛠️ Development mode, skipping OTA update check');
      setStatus('idle');
      return;
    }

    try {
      setStatus('checking');
      setStatusMessage('Letar efter uppdateringar...');
      console.log('🔍 Checking for OTA updates...');

      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Update check timed out, continuing with current version');
        setStatus('timeout');
        setStatusMessage('');
      }, UPDATE_TIMEOUT_MS);

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('📦 New update available! Downloading...');
        setStatus('downloading');
        setStatusMessage('Uppdaterar appen...');

        await Updates.fetchUpdateAsync();

        clearUpdateTimeout();
        console.log('✅ Update downloaded, restarting app...');
        setStatus('ready');
        setStatusMessage('Startar om...');

        await new Promise(resolve => setTimeout(resolve, 500));
        await Updates.reloadAsync();
      } else {
        clearUpdateTimeout();
        console.log('✅ App is up to date');
        setStatus('idle');
        setStatusMessage('');
      }
    } catch (error) {
      clearUpdateTimeout();
      console.log('❌ OTA update error:', error);
      setStatus('error');
      setStatusMessage('');
    }
  }, [clearUpdateTimeout]);

  useEffect(() => {
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      void checkForUpdates();
    }

    return () => {
      clearUpdateTimeout();
    };
  }, [checkForUpdates, clearUpdateTimeout]);

  const isBlocking = status === 'checking' || status === 'downloading' || status === 'ready';

  return {
    status,
    statusMessage,
    isBlocking,
    checkForUpdates,
  };
}

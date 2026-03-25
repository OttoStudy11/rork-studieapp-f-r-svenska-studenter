import { useCallback, useState, useRef, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

interface UseNavigationRefreshOptions {
  queryKeys?: string[][];
  onRefresh?: () => void | Promise<void>;
  enabled?: boolean;
}

export function useNavigationRefresh(options: UseNavigationRefreshOptions = {}) {
  const { queryKeys = [], onRefresh, enabled = true } = options;
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled || !isMounted.current) return;

    console.log('🔄 Navigation refresh triggered');
    setIsRefreshing(true);

    try {
      if (queryKeys.length > 0) {
        await Promise.all(
          queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: key }))
        );
      }

      if (onRefresh) {
        await onRefresh();
      }

      if (isMounted.current) {
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error('❌ Navigation refresh error:', error);
    } finally {
      if (isMounted.current) {
        setIsRefreshing(false);
      }
    }
  }, [enabled, queryKeys, onRefresh, queryClient]);

  useFocusEffect(
    useCallback(() => {
      console.log('📍 Screen focused, triggering refresh');
      refresh();

      return () => {
        console.log('📍 Screen unfocused');
      };
    }, [refresh])
  );

  return {
    refreshKey,
    isRefreshing,
    refresh,
  };
}

export function useScreenMounted() {
  const [isMounted, setIsMounted] = useState(false);
  const mountedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Screen mount/focus');
      setIsMounted(false);
      
      const timer = setTimeout(() => {
        if (!mountedRef.current) {
          mountedRef.current = true;
        }
        setIsMounted(true);
      }, 0);

      return () => {
        clearTimeout(timer);
        setIsMounted(false);
      };
    }, [])
  );

  return isMounted;
}

export function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((tick) => tick + 1), []);
}

import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { usePremium } from './PremiumContext';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { logger } from '@/utils/logger';

export interface HPTrialStatus {
  hasPremium: boolean;
  trialAvailable: boolean;
  trialUsed: boolean;
  trialType?: 'full_test' | 'delprov';
  trialContent?: string;
  trialStartedAt?: string;
  trialCompletedAt?: string;
}

export interface HPTrialContextType {
  trialStatus: HPTrialStatus | null;
  isLoading: boolean;
  isTrialAvailable: boolean;
  canAccessContent: (contentType: 'full_test' | 'delprov', contentId?: string) => boolean;
  startTrial: (trialType: 'full_test' | 'delprov', trialContent: string) => Promise<boolean>;
  completeTrial: (trialId: string, totalQuestions: number, correctAnswers: number, scorePercentage: number, estimatedScore: number, timeSpent: number) => Promise<boolean>;
  refreshTrialStatus: () => Promise<void>;
  showTrialModal: boolean;
  setShowTrialModal: (show: boolean) => void;
}

const TRIAL_KEY_PREFIX = 'hp_trial_v3';

interface StoredTrial {
  userId: string;
  trialUsed: boolean;
  trialType?: 'full_test' | 'delprov';
  trialContent?: string;
  trialStartedAt?: string;
  trialCompletedAt?: string;
}

async function loadTrial(userId: string): Promise<StoredTrial | null> {
  try {
    const raw = await AsyncStorage.getItem(`${TRIAL_KEY_PREFIX}_${userId}`);
    if (!raw) return null;
    const parsed = safeJsonParse<StoredTrial>(raw, null as unknown as StoredTrial, 'HPTrialContext');
    if (!parsed || parsed.userId !== userId) return null;
    return parsed;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.error('HPTrialContext', 'Failed to load trial', msg);
    return null;
  }
}

async function saveTrial(trial: StoredTrial): Promise<void> {
  try {
    await AsyncStorage.setItem(`${TRIAL_KEY_PREFIX}_${trial.userId}`, JSON.stringify(trial));
  } catch (error) {
    console.error('[HP Trial] Failed to save trial:', error);
  }
}

export const [HPTrialProvider, useHPTrial] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const { isPremium } = usePremium();

  const [trialStatus, setTrialStatus] = useState<HPTrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrialModal, setShowTrialModal] = useState(false);

  const buildStatus = useCallback((stored: StoredTrial | null, userId: string): HPTrialStatus => {
    if (!stored) {
      return {
        hasPremium: isPremium,
        trialAvailable: true,
        trialUsed: false,
      };
    }
    return {
      hasPremium: isPremium,
      trialAvailable: !stored.trialUsed,
      trialUsed: stored.trialUsed,
      trialType: stored.trialType,
      trialContent: stored.trialContent,
      trialStartedAt: stored.trialStartedAt,
      trialCompletedAt: stored.trialCompletedAt,
    };
  }, [isPremium]);

  const fetchTrialStatus = useCallback(async () => {
    const userId = user?.id;
    if (!userId) {
      setTrialStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('[HP Trial] Loading local trial status for user:', userId);
      const stored = await loadTrial(userId);
      const status = buildStatus(stored, userId);
      console.log('[HP Trial] Trial status:', status);
      setTrialStatus(status);
    } catch (error) {
      console.error('[HP Trial] Exception loading trial status:', error);
      setTrialStatus({
        hasPremium: isPremium,
        trialAvailable: true,
        trialUsed: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, buildStatus, isPremium]);

  const refreshTrialStatus = useCallback(async () => {
    await fetchTrialStatus();
  }, [fetchTrialStatus]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTrialStatus();
    } else {
      setTrialStatus(null);
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, fetchTrialStatus]);

  const isTrialAvailable = useMemo(() => {
    if (isPremium) return false;
    if (!trialStatus) return false;
    return trialStatus.trialAvailable && !trialStatus.trialUsed;
  }, [isPremium, trialStatus]);

  const canAccessContent = useCallback(
    (contentType: 'full_test' | 'delprov', contentId?: string): boolean => {
      if (isPremium) return true;
      if (!trialStatus) return false;

      const trialIsActive = trialStatus.trialUsed || !!trialStatus.trialStartedAt;
      if (!trialIsActive) return false;

      if (trialStatus.trialType === 'full_test' && contentType === 'full_test') {
        return true;
      }

      if (
        trialStatus.trialType === 'delprov' &&
        contentType === 'delprov' &&
        contentId === trialStatus.trialContent
      ) {
        return true;
      }

      return false;
    },
    [isPremium, trialStatus]
  );

  const startTrial = useCallback(
    async (trialType: 'full_test' | 'delprov', trialContent: string): Promise<boolean> => {
      const userId = user?.id;
      if (!userId) {
        console.error('[HP Trial] No user ID');
        return false;
      }

      try {
        console.log('[HP Trial] Starting trial:', { trialType, trialContent, userId });

        const existing = await loadTrial(userId);
        if (existing?.trialUsed) {
          console.log('[HP Trial] Trial already used for this user');
          return false;
        }

        const newTrial: StoredTrial = {
          userId,
          trialUsed: true,
          trialType,
          trialContent,
          trialStartedAt: new Date().toISOString(),
        };

        await saveTrial(newTrial);
        const status = buildStatus(newTrial, userId);
        setTrialStatus(status);

        console.log('[HP Trial] Trial started successfully');
        return true;
      } catch (error) {
        console.error('[HP Trial] Exception starting trial:', error);
        return false;
      }
    },
    [user?.id, buildStatus]
  );

  const completeTrial = useCallback(async (
    _trialId: string,
    _totalQuestions: number,
    _correctAnswers: number,
    _scorePercentage: number,
    _estimatedScore: number,
    _timeSpent: number
  ): Promise<boolean> => {
    const userId = user?.id;
    if (!userId) return false;

    try {
      console.log('[HP Trial] Completing trial for user:', userId);

      const existing = await loadTrial(userId);
      if (!existing) return false;

      const updated: StoredTrial = {
        ...existing,
        trialCompletedAt: new Date().toISOString(),
      };

      await saveTrial(updated);
      const status = buildStatus(updated, userId);
      setTrialStatus(status);

      console.log('[HP Trial] Trial completed successfully');
      return true;
    } catch (error) {
      console.error('[HP Trial] Exception completing trial:', error);
      return false;
    }
  }, [user?.id, buildStatus]);

  return useMemo(
    () => ({
      trialStatus,
      isLoading,
      isTrialAvailable,
      canAccessContent,
      startTrial,
      completeTrial,
      refreshTrialStatus,
      showTrialModal,
      setShowTrialModal,
    }),
    [
      trialStatus,
      isLoading,
      isTrialAvailable,
      canAccessContent,
      startTrial,
      completeTrial,
      refreshTrialStatus,
      showTrialModal,
      setShowTrialModal,
    ]
  );
});

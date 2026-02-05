import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { usePremium } from './PremiumContext';

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

const STORAGE_KEY = 'hp_trial_status';

export const [HPTrialProvider, useHPTrial] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const { isPremium } = usePremium();

  const [trialStatus, setTrialStatus] = useState<HPTrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrialModal, setShowTrialModal] = useState(false);

  const fetchTrialStatus = useCallback(async () => {
    if (!user?.id) {
      setTrialStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('[HP Trial] Fetching trial status for user:', user.id);

      const { data, error } = await supabase.rpc('get_hp_trial_status', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[HP Trial] Error fetching trial status:', error);
        const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        if (cached) {
          setTrialStatus(JSON.parse(cached));
        }
        return;
      }

      const status: HPTrialStatus = {
        hasPremium: data.has_premium || false,
        trialAvailable: data.trial_available || false,
        trialUsed: data.trial_used || false,
        trialType: data.trial_type,
        trialContent: data.trial_content,
        trialStartedAt: data.trial_started_at,
        trialCompletedAt: data.trial_completed_at,
      };

      console.log('[HP Trial] Trial status:', status);
      setTrialStatus(status);
      await AsyncStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(status));
    } catch (error) {
      console.error('[HP Trial] Exception fetching trial status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

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

      if (!trialStatus || !trialStatus.trialUsed) return false;

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
      if (!user?.id) {
        console.error('[HP Trial] No user ID');
        return false;
      }

      try {
        console.log('[HP Trial] Starting trial:', { trialType, trialContent });

        const { data, error } = await supabase.rpc('start_hp_trial', {
          p_user_id: user.id,
          p_trial_type: trialType,
          p_trial_content: trialContent,
        });

        if (error) {
          console.error('[HP Trial] Error starting trial:', error);
          return false;
        }

        if (!data?.success) {
          console.error('[HP Trial] Trial start failed:', data?.error);
          return false;
        }

        console.log('[HP Trial] Trial started successfully');
        await fetchTrialStatus();
        return true;
      } catch (error) {
        console.error('[HP Trial] Exception starting trial:', error);
        return false;
      }
    },
    [user?.id, fetchTrialStatus]
  );

  const completeTrial = useCallback(async (
    trialId: string,
    totalQuestions: number,
    correctAnswers: number,
    scorePercentage: number,
    estimatedScore: number,
    timeSpent: number
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      console.log('[HP Trial] Completing trial', { trialId, scorePercentage });

      const { data, error } = await supabase.rpc('complete_hp_trial', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[HP Trial] Error completing trial:', error);
        return false;
      }

      console.log('[HP Trial] Trial completed successfully');
      await fetchTrialStatus();
      return true;
    } catch (error) {
      console.error('[HP Trial] Exception completing trial:', error);
      return false;
    }
  }, [user?.id, fetchTrialStatus]);

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

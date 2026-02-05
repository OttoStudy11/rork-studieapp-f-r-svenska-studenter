import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';

export type HPTrialType = 'full_test' | 'section';

export interface HPTrialStatus {
  hasTrialAvailable: boolean;
  trialUsed: boolean;
  trialType: HPTrialType | null;
  trialTarget: string | null;
  trialCompletedAt: Date | null;
}

export interface HPTrialUsage {
  id: string;
  userId: string;
  trialType: HPTrialType;
  trialTarget: string;
  testVersionId?: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'in_progress' | 'completed' | 'abandoned';
  totalQuestions?: number;
  correctAnswers?: number;
  scorePercentage?: number;
  estimatedHPScore?: number;
  timeSpentMinutes?: number;
}

export interface HPTrialContextValue {
  trialStatus: HPTrialStatus;
  isLoading: boolean;
  
  checkTrialEligibility: () => Promise<boolean>;
  canAccessContent: (contentType: 'full_test' | 'section', target?: string) => boolean;
  
  startTrial: (trialType: HPTrialType, target: string, testVersionId?: string) => Promise<string | null>;
  completeTrial: (
    trialId: string,
    totalQuestions: number,
    correctAnswers: number,
    scorePercentage: number,
    estimatedHPScore: number,
    timeSpentMinutes: number
  ) => Promise<boolean>;
  
  getTrialResults: () => HPTrialUsage | null;
  refreshTrialStatus: () => Promise<void>;
}

const STORAGE_KEY = 'hp_trial_status';

export const [HPTrialProvider, useHPTrial] = createContextHook(() => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  
  const [trialStatus, setTrialStatus] = useState<HPTrialStatus>({
    hasTrialAvailable: false,
    trialUsed: false,
    trialType: null,
    trialTarget: null,
    trialCompletedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [trialResults, setTrialResults] = useState<HPTrialUsage | null>(null);

  const loadTrialStatus = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('[HP Trial] Loading trial status for user:', user.id);
      
      const cachedJson = await AsyncStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (cachedJson) {
        const cached = JSON.parse(cachedJson);
        setTrialStatus({
          ...cached,
          trialCompletedAt: cached.trialCompletedAt ? new Date(cached.trialCompletedAt) : null,
        });
      }

      const { data, error } = await supabase.rpc('get_hp_trial_status', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[HP Trial] Error loading status:', error);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const statusData = data[0];
        const newStatus: HPTrialStatus = {
          hasTrialAvailable: statusData.has_trial_available ?? true,
          trialUsed: statusData.trial_used ?? false,
          trialType: statusData.trial_type || null,
          trialTarget: statusData.trial_target || null,
          trialCompletedAt: statusData.trial_completed_at ? new Date(statusData.trial_completed_at) : null,
        };
        
        setTrialStatus(newStatus);
        await AsyncStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(newStatus));
        
        if (statusData.trial_used) {
          const { data: resultsData } = await supabase
            .from('hp_trial_usage')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();
          
          if (resultsData) {
            setTrialResults({
              id: resultsData.id,
              userId: resultsData.user_id,
              trialType: resultsData.trial_type,
              trialTarget: resultsData.trial_target,
              testVersionId: resultsData.test_version_id,
              startedAt: new Date(resultsData.started_at),
              completedAt: resultsData.completed_at ? new Date(resultsData.completed_at) : undefined,
              status: resultsData.status,
              totalQuestions: resultsData.total_questions,
              correctAnswers: resultsData.correct_answers,
              scorePercentage: resultsData.score_percentage,
              estimatedHPScore: resultsData.estimated_hp_score,
              timeSpentMinutes: resultsData.time_spent_minutes,
            });
          }
        }
      } else {
        const newStatus: HPTrialStatus = {
          hasTrialAvailable: true,
          trialUsed: false,
          trialType: null,
          trialTarget: null,
          trialCompletedAt: null,
        };
        setTrialStatus(newStatus);
        await AsyncStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(newStatus));
      }
    } catch (error) {
      console.error('[HP Trial] Error loading trial status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTrialStatus();
  }, [loadTrialStatus]);

  const checkTrialEligibility = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    if (isPremium) return false;

    try {
      const { data, error } = await supabase.rpc('check_hp_trial_available', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[HP Trial] Error checking eligibility:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('[HP Trial] Error checking eligibility:', error);
      return false;
    }
  }, [user?.id, isPremium]);

  const canAccessContent = useCallback((contentType: 'full_test' | 'section', target?: string): boolean => {
    if (isPremium) return true;
    
    if (contentType === 'full_test' && trialStatus.trialType === 'full_test' && trialStatus.trialUsed) {
      return true;
    }
    
    if (contentType === 'section' && trialStatus.trialType === 'section' && trialStatus.trialTarget === target && trialStatus.trialUsed) {
      return true;
    }
    
    return false;
  }, [isPremium, trialStatus]);

  const startTrial = useCallback(async (
    trialType: HPTrialType,
    target: string,
    testVersionId?: string
  ): Promise<string | null> => {
    if (!user?.id) {
      console.error('[HP Trial] No user ID');
      return null;
    }

    try {
      console.log('[HP Trial] Starting trial:', { trialType, target, testVersionId });
      
      const { data, error } = await supabase.rpc('start_hp_trial', {
        p_user_id: user.id,
        p_trial_type: trialType,
        p_trial_target: target,
        p_test_version_id: testVersionId || null,
      });

      if (error) {
        console.error('[HP Trial] Error starting trial:', error);
        return null;
      }

      console.log('[HP Trial] Trial started with ID:', data);
      await loadTrialStatus();
      
      return data;
    } catch (error) {
      console.error('[HP Trial] Error starting trial:', error);
      return null;
    }
  }, [user?.id, loadTrialStatus]);

  const completeTrial = useCallback(async (
    trialId: string,
    totalQuestions: number,
    correctAnswers: number,
    scorePercentage: number,
    estimatedHPScore: number,
    timeSpentMinutes: number
  ): Promise<boolean> => {
    try {
      console.log('[HP Trial] Completing trial:', trialId);
      
      const { data, error } = await supabase.rpc('complete_hp_trial', {
        p_trial_id: trialId,
        p_total_questions: totalQuestions,
        p_correct_answers: correctAnswers,
        p_score_percentage: scorePercentage,
        p_estimated_hp_score: estimatedHPScore,
        p_time_spent_minutes: timeSpentMinutes,
      });

      if (error) {
        console.error('[HP Trial] Error completing trial:', error);
        return false;
      }

      console.log('[HP Trial] Trial completed successfully');
      await loadTrialStatus();
      
      return true;
    } catch (error) {
      console.error('[HP Trial] Error completing trial:', error);
      return false;
    }
  }, [loadTrialStatus]);

  const getTrialResults = useCallback((): HPTrialUsage | null => {
    return trialResults;
  }, [trialResults]);

  const refreshTrialStatus = useCallback(async () => {
    await loadTrialStatus();
  }, [loadTrialStatus]);

  return {
    trialStatus,
    isLoading,
    checkTrialEligibility,
    canAccessContent,
    startTrial,
    completeTrial,
    getTrialResults,
    refreshTrialStatus,
  };
});

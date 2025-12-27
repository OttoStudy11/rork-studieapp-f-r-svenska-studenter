import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo } from 'react';
import { useGamification } from '@/contexts/GamificationContext';

export type ChallengePeriod = 'daily' | 'weekly';

export type ChallengeStatus = 'locked' | 'available' | 'completed' | 'claimed';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  period: ChallengePeriod;
  rewardPoints: number;
  target: number;
  current: number;
  percent: number;
  status: ChallengeStatus;
}

interface ChallengesContextValue {
  challenges: Challenge[];
  todaysChallenges: Challenge[];
  weeklyChallenges: Challenge[];
  claimChallenge: (challengeId: string) => Promise<void>;
  refresh: () => void;
}

export const [ChallengesProvider, useChallenges] = createContextHook<ChallengesContextValue>(() => {
  const gamification = useGamification();

  const refresh = useCallback(() => {
    gamification.refreshAll();
  }, [gamification]);

  const challenges = useMemo(() => {
    return gamification.dailyChallenges.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      emoji: c.emoji,
      period: 'daily' as ChallengePeriod,
      rewardPoints: c.xpReward,
      target: c.targetValue,
      current: c.currentProgress,
      percent: c.targetValue > 0 ? Math.min(100, (c.currentProgress / c.targetValue) * 100) : 0,
      status: c.isClaimed ? 'claimed' : c.isCompleted ? 'completed' : 'available' as ChallengeStatus
    }));
  }, [gamification.dailyChallenges]);

  const todaysChallenges = useMemo(() => challenges, [challenges]);
  const weeklyChallenges = useMemo(() => [], []);

  const claimChallenge = useCallback(async (challengeId: string) => {
    await gamification.claimChallenge(challengeId);
  }, [gamification]);

  useEffect(() => {
    // Auto-refresh on mount
  }, []);

  return useMemo(() => ({
    challenges,
    todaysChallenges,
    weeklyChallenges,
    claimChallenge,
    refresh,
  }), [challenges, todaysChallenges, weeklyChallenges, claimChallenge, refresh]);
});

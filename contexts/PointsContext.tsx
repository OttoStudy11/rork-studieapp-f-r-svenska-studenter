import createContextHook from '@nkzw/create-context-hook';
import { useMemo, useCallback } from 'react';
import { useGamification } from './GamificationContext';

export type PointsEntryType = 'challenge' | 'manual' | 'penalty' | 'bonus';

export interface PointsHistoryEntry {
  id: string;
  amount: number;
  type: PointsEntryType;
  description: string;
  sourceId?: string;
  createdAt: string;
}

interface LevelDefinition {
  level: number;
  min: number;
  max?: number;
  title: string;
  badge: string;
  accent: string;
}

interface ProgressSlice {
  current: number;
  required: number;
  percent: number;
  nextLevel?: LevelDefinition;
}

interface PointsContextValue {
  isReady: boolean;
  studyPoints: number;
  bonusPoints: number;
  achievementPoints: number;
  totalPoints: number;
  level: LevelDefinition;
  progress: ProgressSlice;
  history: PointsHistoryEntry[];
  breakdown: {
    study: number;
    bonus: number;
    achievements: number;
  };
  claimedChallengeIds: string[];
  addPoints: (amount: number, meta?: Partial<PointsHistoryEntry>) => Promise<void>;
  deductPoints: (amount: number, meta?: Partial<PointsHistoryEntry>) => Promise<void>;
  markChallengeClaimed: (challengeId: string) => Promise<void>;
  resetBonusPoints: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
}



export const [PointsProvider, usePoints] = createContextHook<PointsContextValue>(() => {
  const gamification = useGamification();

  if (!gamification) {
    throw new Error('useGamification must be used within GamificationProvider');
  }

  const totalPoints = gamification.totalXp ?? 0;
  const studyPoints = totalPoints;
  const bonusPoints = 0;
  const achievementPoints = (gamification.achievements || [])
    .filter(a => a.isUnlocked && a.isClaimed)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const level: LevelDefinition = useMemo(() => {
    if (!gamification.currentLevel) {
      return {
        level: 1,
        min: 0,
        max: 100,
        title: 'Nybörjare',
        badge: '🌱 Nybörjare',
        accent: '#C7D2FE'
      };
    }
    const nextLevelIndex = gamification.currentLevel.level;
    const maxXp = nextLevelIndex < 50 ? gamification.xpProgress.current + gamification.xpProgress.required : undefined;
    return {
      level: gamification.currentLevel.level,
      min: gamification.currentLevel.requiredXp,
      max: maxXp,
      title: gamification.currentLevel.titleSv,
      badge: `${gamification.currentLevel.iconEmoji} ${gamification.currentLevel.titleSv}`,
      accent: gamification.currentLevel.tier === 'beginner' ? '#C7D2FE' :
              gamification.currentLevel.tier === 'intermediate' ? '#A5F3FC' :
              gamification.currentLevel.tier === 'advanced' ? '#FDE68A' :
              gamification.currentLevel.tier === 'expert' ? '#FECACA' :
              gamification.currentLevel.tier === 'master' ? '#FBE6FF' : '#FBCFE8'
    };
  }, [gamification?.currentLevel, gamification?.xpProgress]);

  const progress: ProgressSlice = useMemo(() => {
    if (!gamification.xpProgress || !gamification.xpProgress.nextLevel) {
      return {
        current: gamification.xpProgress.current,
        required: gamification.xpProgress.required,
        percent: gamification.xpProgress.percent,
        nextLevel: undefined
      };
    }
    
    const nextNext = gamification.xpProgress.nextLevel.level < 50 ? 
      gamification.xpProgress.nextLevel.requiredXp + gamification.xpProgress.required : 
      undefined;
    
    return {
      current: gamification.xpProgress.current,
      required: gamification.xpProgress.required,
      percent: gamification.xpProgress.percent,
      nextLevel: {
        level: gamification.xpProgress.nextLevel.level,
        min: gamification.xpProgress.nextLevel.requiredXp,
        max: nextNext,
        title: gamification.xpProgress.nextLevel.titleSv,
        badge: `${gamification.xpProgress.nextLevel.iconEmoji} ${gamification.xpProgress.nextLevel.titleSv}`,
        accent: gamification.xpProgress.nextLevel.tier === 'beginner' ? '#C7D2FE' :
                gamification.xpProgress.nextLevel.tier === 'intermediate' ? '#A5F3FC' :
                gamification.xpProgress.nextLevel.tier === 'advanced' ? '#FDE68A' :
                gamification.xpProgress.nextLevel.tier === 'expert' ? '#FECACA' :
                gamification.xpProgress.nextLevel.tier === 'master' ? '#FBE6FF' : '#FBCFE8'
      }
    };
  }, [gamification?.xpProgress]);

  const history: PointsHistoryEntry[] = useMemo(() => (gamification.recentTransactions || []).map(t => ({
    id: t.id,
    amount: t.amount,
    type: t.sourceType as PointsEntryType,
    description: t.sourceType,
    sourceId: t.sourceId,
    createdAt: t.createdAt
  })), [gamification?.recentTransactions]);

  const claimedChallengeIds: string[] = useMemo(() => (gamification.dailyChallenges || [])
    .filter(c => c.isClaimed)
    .map(c => c.id), [gamification?.dailyChallenges]);

  const isReady = gamification.isReady ?? false;

  const addPoints = useCallback(async (amount: number, meta?: Partial<PointsHistoryEntry>) => {
    if (amount <= 0) return;
    await gamification.addXp(amount, 'manual', meta?.sourceId, { description: meta?.description });
  }, [gamification]);

  const deductPoints = useCallback(async (amount: number, meta?: Partial<PointsHistoryEntry>) => {
    if (amount <= 0) return;
    await gamification.addXp(-amount, 'penalty', meta?.sourceId, { description: meta?.description });
  }, [gamification]);

  const markChallengeClaimed = useCallback(async (challengeId: string) => {
    const challenge = gamification.dailyChallenges.find(c => c.id === challengeId);
    if (challenge && !challenge.isClaimed) {
      await gamification.claimChallenge(challengeId);
    }
  }, [gamification]);

  const resetBonusPoints = useCallback(async () => {
    console.log('Reset bonus points called - no-op in unified system');
  }, []);

  const refreshFromServer = useCallback(async () => {
    await gamification.refreshAll();
  }, [gamification]);

  const breakdown = useMemo(() => ({
    study: totalPoints - achievementPoints,
    bonus: 0,
    achievements: achievementPoints,
  }), [totalPoints, achievementPoints]);

  return useMemo(() => ({
    isReady,
    studyPoints,
    bonusPoints,
    achievementPoints,
    totalPoints,
    level,
    progress,
    history,
    breakdown,
    claimedChallengeIds,
    addPoints,
    deductPoints,
    markChallengeClaimed,
    resetBonusPoints,
    refreshFromServer,
  }), [isReady, studyPoints, bonusPoints, achievementPoints, totalPoints, level, progress, history, breakdown, claimedChallengeIds, addPoints, deductPoints, markChallengeClaimed, resetBonusPoints, refreshFromServer]);
});
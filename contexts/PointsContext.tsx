import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useAchievements } from './AchievementContext';
import { useAuth } from './AuthContext';
import * as db from '@/lib/database';

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

const STORAGE_FALLBACK_ADJUSTMENTS_KEY = 'points_adjustments_fallback_v1';

const LEVELS: LevelDefinition[] = [
  { level: 1, min: 0, max: 100, title: 'Nybörjare', badge: '🌱 Rookie', accent: '#C7D2FE' },
  { level: 2, min: 100, max: 250, title: 'Studiepilot', badge: '🚀 Pilot', accent: '#A5F3FC' },
  { level: 3, min: 250, max: 450, title: 'Strateg', badge: '🧠 Strateg', accent: '#FDE68A' },
  { level: 4, min: 450, max: 700, title: 'Mästare', badge: '🏅 Master', accent: '#FECACA' },
  { level: 5, min: 700, max: 1100, title: 'Mentor', badge: '💎 Mentor', accent: '#FBE6FF' },
  { level: 6, min: 1100, title: 'Visionär', badge: '👑 Visionär', accent: '#FBCFE8' },
];

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const clampToZero = (value: number) => (value < 0 ? 0 : value);

const getLevelForPoints = (points: number): LevelDefinition => {
  return LEVELS.find((level, index) => {
    const max = level.max ?? Number.POSITIVE_INFINITY;
    const min = level.min;
    const isLast = index === LEVELS.length - 1;
    return (points >= min && points < max) || (isLast && points >= min);
  }) ?? LEVELS[0];
};

const getProgressSlice = (points: number): ProgressSlice => {
  const currentLevel = getLevelForPoints(points);
  const max = currentLevel.max ?? Number.POSITIVE_INFINITY;
  if (!Number.isFinite(max)) {
    return {
      current: points - currentLevel.min,
      required: 0,
      percent: 100,
    };
  }
  const nextLevel = LEVELS.find((level) => level.level === currentLevel.level + 1);
  const range = max - currentLevel.min;
  const progressed = points - currentLevel.min;
  const percent = Math.min(100, Math.max(0, (progressed / range) * 100));
  return {
    current: progressed,
    required: range,
    percent,
    nextLevel,
  };
};

export const [PointsProvider, usePoints] = createContextHook<PointsContextValue>(() => {
  const { user: authUser, isAuthenticated } = useAuth();
  const { totalPoints: achievementPoints } = useAchievements();

  const [studyPoints, setStudyPoints] = useState<number>(0);
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [claimedChallengeIds, setClaimedChallengeIds] = useState<string[]>([]);
  const [history, setHistory] = useState<PointsHistoryEntry[]>([]);
  const [isReady, setIsReady] = useState(false);

  const persistFallback = useCallback(async (nextBonus: number, nextClaimed: string[], nextHistory: PointsHistoryEntry[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_FALLBACK_ADJUSTMENTS_KEY,
        JSON.stringify({ bonusPoints: nextBonus, claimedChallengeIds: nextClaimed, history: nextHistory })
      );
    } catch (error) {
      console.log('Failed to persist points fallback adjustments', error);
    }
  }, []);

  const loadFallback = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_FALLBACK_ADJUSTMENTS_KEY);
      if (!stored) return { bonusPoints: 0, claimedChallengeIds: [] as string[], history: [] as PointsHistoryEntry[] };
      const parsed = JSON.parse(stored) as { bonusPoints?: number; claimedChallengeIds?: string[]; history?: PointsHistoryEntry[] };
      return {
        bonusPoints: typeof parsed.bonusPoints === 'number' ? parsed.bonusPoints : 0,
        claimedChallengeIds: Array.isArray(parsed.claimedChallengeIds) ? parsed.claimedChallengeIds.map(String) : [],
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    } catch (error) {
      console.log('Failed to load points fallback adjustments', error);
      return { bonusPoints: 0, claimedChallengeIds: [] as string[], history: [] as PointsHistoryEntry[] };
    }
  }, []);

  const syncTotalToDb = useCallback(async (baseStudy: number, nextBonus: number, nextClaimed: string[]) => {
    if (!authUser || !isAuthenticated) return;
    const total = clampToZero(baseStudy + achievementPoints + nextBonus);

    try {
      console.log('Syncing total points to db', {
        userId: authUser.id,
        baseStudy,
        achievementPoints,
        nextBonus,
        total,
      });

      await db.upsertUserProgressPoints(authUser.id, total);
    } catch (error) {
      console.log('Failed to sync total_points to user_progress', error);
    }

    try {
      const persisted = await db.upsertUserPointsAdjustments({
        userId: authUser.id,
        bonusPoints: nextBonus,
        claimedChallengeIds: nextClaimed,
      });

      if (!persisted) {
        await persistFallback(nextBonus, nextClaimed, history);
      }
    } catch (error) {
      console.log('Failed to persist points adjustments to Supabase, using fallback', error);
      await persistFallback(nextBonus, nextClaimed, history);
    }
  }, [achievementPoints, authUser, history, isAuthenticated, persistFallback]);

  const refreshFromServer = useCallback(async () => {
    if (!authUser || !isAuthenticated) {
      setStudyPoints(0);
      const fallback = await loadFallback();
      setBonusPoints(fallback.bonusPoints);
      setClaimedChallengeIds(fallback.claimedChallengeIds);
      setHistory(fallback.history);
      setIsReady(true);
      return;
    }

    try {
      console.log('Refreshing points from server for user', authUser.id);

      const [baseStudy, adjustments] = await Promise.all([
        db.rpcCalculateUserPoints(authUser.id).catch((e) => {
          console.log('calculate_user_points rpc failed, falling back to user_progress.total_points', e);
          return null as number | null;
        }),
        db.getUserPointsAdjustments(authUser.id).catch((e) => {
          console.log('getUserPointsAdjustments failed', e);
          return null;
        }),
      ]);

      let resolvedStudy = 0;
      if (typeof baseStudy === 'number') {
        resolvedStudy = baseStudy;
      } else {
        try {
          const progress = await db.getUserProgress(authUser.id);
          resolvedStudy = typeof progress?.total_points === 'number' ? progress.total_points : 0;
        } catch (e) {
          console.log('getUserProgress failed', e);
          resolvedStudy = 0;
        }
      }

      setStudyPoints(resolvedStudy);

      if (adjustments) {
        setBonusPoints(adjustments.bonusPoints);
        setClaimedChallengeIds(adjustments.claimedChallengeIds);
      } else {
        const fallback = await loadFallback();
        setBonusPoints(fallback.bonusPoints);
        setClaimedChallengeIds(fallback.claimedChallengeIds);
        setHistory(fallback.history);
      }

      if (!adjustments) {
        await persistFallback(bonusPoints, claimedChallengeIds, history);
      }

      await syncTotalToDb(resolvedStudy, adjustments?.bonusPoints ?? bonusPoints, adjustments?.claimedChallengeIds ?? claimedChallengeIds);
    } catch (error) {
      console.log('Failed to refresh points from server', error);
      const fallback = await loadFallback();
      setBonusPoints(fallback.bonusPoints);
      setClaimedChallengeIds(fallback.claimedChallengeIds);
      setHistory(fallback.history);
    } finally {
      setIsReady(true);
    }
  }, [authUser, bonusPoints, claimedChallengeIds, history, isAuthenticated, loadFallback, persistFallback, syncTotalToDb]);

  useEffect(() => {
    refreshFromServer();
  }, [refreshFromServer]);

  const updateBonusState = useCallback(async (adjustment: number, meta?: Partial<PointsHistoryEntry>) => {
    setBonusPoints((prevBonus) => {
      const nextBonus = clampToZero(prevBonus + adjustment);
      setHistory((prevHistory) => {
        const entry: PointsHistoryEntry = {
          id: createId(),
          amount: adjustment,
          type: meta?.type ?? (adjustment >= 0 ? 'manual' : 'penalty'),
          description: meta?.description ?? (adjustment >= 0 ? 'Poäng tillagda' : 'Poäng avdragna'),
          sourceId: meta?.sourceId,
          createdAt: new Date().toISOString(),
        };
        const nextHistory = [entry, ...prevHistory].slice(0, 60);
        persistFallback(nextBonus, claimedChallengeIds, nextHistory);
        void syncTotalToDb(studyPoints, nextBonus, claimedChallengeIds);
        return nextHistory;
      });
      return nextBonus;
    });

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available', error);
    }
  }, [claimedChallengeIds, persistFallback, studyPoints, syncTotalToDb]);

  const addPoints = useCallback(async (amount: number, meta?: Partial<PointsHistoryEntry>) => {
    if (amount <= 0) return;
    await updateBonusState(amount, { ...meta, type: meta?.type ?? 'bonus' });
  }, [updateBonusState]);

  const deductPoints = useCallback(async (amount: number, meta?: Partial<PointsHistoryEntry>) => {
    if (amount <= 0) return;
    await updateBonusState(-amount, { ...meta, type: meta?.type ?? 'penalty' });
  }, [updateBonusState]);

  const markChallengeClaimed = useCallback(async (challengeId: string) => {
    if (!challengeId) return;
    setClaimedChallengeIds((prev) => {
      if (prev.includes(challengeId)) return prev;
      const next = [challengeId, ...prev].slice(0, 200);
      void persistFallback(bonusPoints, next, history);
      void syncTotalToDb(studyPoints, bonusPoints, next);
      return next;
    });
  }, [bonusPoints, history, persistFallback, studyPoints, syncTotalToDb]);

  const resetBonusPoints = useCallback(async () => {
    setBonusPoints(0);
    setClaimedChallengeIds([]);
    setHistory([]);
    await persistFallback(0, [], []);
    await syncTotalToDb(studyPoints, 0, []);
  }, [persistFallback, studyPoints, syncTotalToDb]);

  const totalPoints = useMemo(() => clampToZero(studyPoints + achievementPoints + bonusPoints), [studyPoints, achievementPoints, bonusPoints]);
  const level = useMemo(() => getLevelForPoints(totalPoints), [totalPoints]);
  const progress = useMemo(() => getProgressSlice(totalPoints), [totalPoints]);

  const breakdown = useMemo(() => ({
    study: studyPoints,
    bonus: bonusPoints,
    achievements: achievementPoints,
  }), [studyPoints, bonusPoints, achievementPoints]);

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
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useAchievements } from './AchievementContext';

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
  basePoints: number;
  achievementPoints: number;
  totalPoints: number;
  level: LevelDefinition;
  progress: ProgressSlice;
  history: PointsHistoryEntry[];
  breakdown: {
    base: number;
    achievements: number;
  };
  addPoints: (amount: number, meta?: Partial<PointsHistoryEntry>) => Promise<void>;
  deductPoints: (amount: number, meta?: Partial<PointsHistoryEntry>) => Promise<void>;
  resetPoints: () => Promise<void>;
}

const STORAGE_KEY = 'points_state_v1';

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
  const { totalPoints: achievementPoints } = useAchievements();
  const [basePoints, setBasePoints] = useState<number>(0);
  const [history, setHistory] = useState<PointsHistoryEntry[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { basePoints: number; history: PointsHistoryEntry[] };
          setBasePoints(parsed.basePoints ?? 0);
          setHistory(Array.isArray(parsed.history) ? parsed.history : []);
        }
      } catch (error) {
        console.log('Failed to hydrate points state', error);
      } finally {
        setIsReady(true);
      }
    };
    hydrate();
  }, []);

  const persist = useCallback(async (nextPoints: number, nextHistory: PointsHistoryEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ basePoints: nextPoints, history: nextHistory }));
    } catch (error) {
      console.log('Failed to persist points state', error);
    }
  }, []);

  const updateState = useCallback(async (adjustment: number, meta?: Partial<PointsHistoryEntry>) => {
    setBasePoints((prev) => {
      const next = clampToZero(prev + adjustment);
      setHistory((prevHistory) => {
        const entry: PointsHistoryEntry = {
          id: createId(),
          amount: adjustment,
          type: meta?.type ?? (adjustment >= 0 ? 'manual' : 'penalty'),
          description: meta?.description ?? (adjustment >= 0 ? 'Poäng tillagda' : 'Poäng avdragna'),
          sourceId: meta?.sourceId,
          createdAt: new Date().toISOString(),
        };
        const nextHistory = [entry, ...prevHistory].slice(0, 50);
        persist(next, nextHistory);
        return nextHistory;
      });
      return next;
    });
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available', error);
    }
  }, [persist]);

  const addPoints = useCallback(async (amount: number, meta?: Partial<PointsHistoryEntry>) => {
    if (amount <= 0) return;
    await updateState(amount, { ...meta, type: meta?.type ?? 'bonus' });
  }, [updateState]);

  const deductPoints = useCallback(async (amount: number, meta?: Partial<PointsHistoryEntry>) => {
    if (amount <= 0) return;
    await updateState(-amount, { ...meta, type: meta?.type ?? 'penalty' });
  }, [updateState]);

  const resetPoints = useCallback(async () => {
    setBasePoints(0);
    setHistory([]);
    await persist(0, []);
  }, [persist]);

  const totalPoints = useMemo(() => basePoints + achievementPoints, [basePoints, achievementPoints]);
  const level = useMemo(() => getLevelForPoints(totalPoints), [totalPoints]);
  const progress = useMemo(() => getProgressSlice(totalPoints), [totalPoints]);

  const breakdown = useMemo(() => ({ base: basePoints, achievements: achievementPoints }), [basePoints, achievementPoints]);

  return useMemo(() => ({
    isReady,
    basePoints,
    achievementPoints,
    totalPoints,
    level,
    progress,
    history,
    breakdown,
    addPoints,
    deductPoints,
    resetPoints,
  }), [isReady, basePoints, achievementPoints, totalPoints, level, progress, history, breakdown, addPoints, deductPoints, resetPoints]);
});
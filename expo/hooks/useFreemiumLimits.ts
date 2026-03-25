import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { FREEMIUM_LIMITS, FreemiumFeature, FreemiumStatus } from '@/constants/freemiumLimits';

const USAGE_KEY_PREFIX = 'freemium_usage_v3';

interface UsageRecord {
  feature: FreemiumFeature;
  timestamp: number;
  metadata?: Record<string, string>;
}

interface StoredUsage {
  records: UsageRecord[];
  userId: string;
}

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfWeek(): Date {
  const end = getStartOfWeek();
  end.setDate(end.getDate() + 7);
  return end;
}

async function loadUsage(userId: string): Promise<StoredUsage> {
  try {
    const key = `${USAGE_KEY_PREFIX}_${userId}`;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return { records: [], userId };
    const parsed = JSON.parse(raw) as StoredUsage;
    if (parsed.userId !== userId) return { records: [], userId };
    return parsed;
  } catch (error) {
    console.error('[Freemium] Failed to load usage:', error);
    return { records: [], userId };
  }
}

async function saveUsage(usage: StoredUsage): Promise<void> {
  try {
    const key = `${USAGE_KEY_PREFIX}_${usage.userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(usage));
  } catch (error) {
    console.error('[Freemium] Failed to save usage:', error);
  }
}

export function useFreemiumLimits() {
  const { isPremium } = usePremium();
  const { user } = useAuth();
  const [usage, setUsage] = useState<StoredUsage>({ records: [], userId: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedForUser = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setUsage({ records: [], userId: '' });
      setIsLoaded(true);
      return;
    }
    if (loadedForUser.current === userId) return;
    loadedForUser.current = userId;
    setIsLoaded(false);
    loadUsage(userId).then((data) => {
      setUsage(data);
      setIsLoaded(true);
      console.log(`[Freemium] Loaded ${data.records.length} usage records for user ${userId}`);
    });
  }, [user?.id]);

  const trackUsage = useCallback(
    async (feature: FreemiumFeature, metadata?: Record<string, string>) => {
      if (isPremium) return;
      const userId = user?.id;
      if (!userId) return;
      const record: UsageRecord = {
        feature,
        timestamp: Date.now(),
        metadata,
      };
      const updated: StoredUsage = {
        userId,
        records: [...usage.records, record],
      };
      setUsage(updated);
      await saveUsage(updated);
      console.log(`[Freemium] Tracked usage: ${feature}`, metadata);
    },
    [isPremium, usage, user?.id],
  );

  const getTotalCount = useCallback(
    (feature: FreemiumFeature): number => {
      return usage.records.filter((r) => r.feature === feature).length;
    },
    [usage.records],
  );

  const getWeeklyCount = useCallback(
    (feature: FreemiumFeature): number => {
      const startOfWeek = getStartOfWeek().getTime();
      return usage.records.filter(
        (r) => r.feature === feature && r.timestamp >= startOfWeek,
      ).length;
    },
    [usage.records],
  );

  const checkQuiz = useCallback((): FreemiumStatus => {
    if (isPremium) {
      return { isAllowed: true, remaining: Infinity, total: FREEMIUM_LIMITS.quiz.total, resetAt: null, isPremium: true };
    }
    const used = getTotalCount('quiz') + getTotalCount('course_quiz');
    const remaining = Math.max(0, FREEMIUM_LIMITS.quiz.total - used);
    return {
      isAllowed: remaining > 0,
      remaining,
      total: FREEMIUM_LIMITS.quiz.total,
      resetAt: null,
      isPremium: false,
    };
  }, [isPremium, getTotalCount]);

  const checkFlashcards = useCallback((): FreemiumStatus => {
    if (isPremium) {
      return { isAllowed: true, remaining: Infinity, total: FREEMIUM_LIMITS.flashcards.total, resetAt: null, isPremium: true };
    }
    const used = getTotalCount('flashcards');
    const remaining = Math.max(0, FREEMIUM_LIMITS.flashcards.total - used);
    return {
      isAllowed: remaining > 0,
      remaining,
      total: FREEMIUM_LIMITS.flashcards.total,
      resetAt: null,
      isPremium: false,
    };
  }, [isPremium, getTotalCount]);

  const checkFriendStats = useCallback((): FreemiumStatus => {
    if (isPremium) {
      return { isAllowed: true, remaining: Infinity, total: FREEMIUM_LIMITS.friendStats.weekly, resetAt: null, isPremium: true };
    }
    const used = getWeeklyCount('friend_stats');
    const remaining = Math.max(0, FREEMIUM_LIMITS.friendStats.weekly - used);
    return {
      isAllowed: remaining > 0,
      remaining,
      total: FREEMIUM_LIMITS.friendStats.weekly,
      resetAt: getEndOfWeek(),
      isPremium: false,
    };
  }, [isPremium, getWeeklyCount]);

  const checkHPSection = useCallback((): FreemiumStatus => {
    if (isPremium) {
      return { isAllowed: true, remaining: Infinity, total: FREEMIUM_LIMITS.hpTrial, resetAt: null, isPremium: true };
    }
    const used = getTotalCount('hp_section');
    const remaining = Math.max(0, FREEMIUM_LIMITS.hpTrial - used);
    return {
      isAllowed: remaining > 0,
      remaining,
      total: FREEMIUM_LIMITS.hpTrial,
      resetAt: null,
      isPremium: false,
    };
  }, [isPremium, getTotalCount]);

  const checkCourseModule = useCallback(
    (moduleIndex: number): FreemiumStatus => {
      if (isPremium) {
        return { isAllowed: true, remaining: Infinity, total: Infinity, resetAt: null, isPremium: true };
      }
      const isAllowed = moduleIndex < FREEMIUM_LIMITS.courseModules;
      return {
        isAllowed,
        remaining: isAllowed ? 1 : 0,
        total: FREEMIUM_LIMITS.courseModules,
        resetAt: null,
        isPremium: false,
      };
    },
    [isPremium],
  );

  return useMemo(
    () => ({
      isPremium,
      isLoaded,
      trackUsage,
      checkQuiz,
      checkFriendStats,
      checkFlashcards,
      checkHPSection,
      checkCourseModule,
      getTotalCount,
      getWeeklyCount,
    }),
    [
      isPremium,
      isLoaded,
      trackUsage,
      checkQuiz,
      checkFriendStats,
      checkFlashcards,
      checkHPSection,
      checkCourseModule,
      getTotalCount,
      getWeeklyCount,
    ],
  );
}

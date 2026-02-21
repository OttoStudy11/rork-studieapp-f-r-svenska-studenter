import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { FREEMIUM_LIMITS, FreemiumFeature, FreemiumStatus } from '@/constants/freemiumLimits';

const USAGE_STORAGE_KEY = 'freemium_usage_v1';

interface UsageRecord {
  feature: FreemiumFeature;
  timestamp: number;
  metadata?: Record<string, string>;
}

interface StoredUsage {
  records: UsageRecord[];
  lastCleanup: number;
}

function getStartOfDay(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function getEndOfDay(): Date {
  const end = getStartOfDay();
  end.setDate(end.getDate() + 1);
  return end;
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

async function loadUsage(): Promise<StoredUsage> {
  try {
    const raw = await AsyncStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return { records: [], lastCleanup: Date.now() };
    const parsed = JSON.parse(raw) as StoredUsage;
    return parsed;
  } catch (error) {
    console.error('[Freemium] Failed to load usage:', error);
    return { records: [], lastCleanup: Date.now() };
  }
}

async function saveUsage(usage: StoredUsage): Promise<void> {
  try {
    await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error('[Freemium] Failed to save usage:', error);
  }
}

function cleanOldRecords(records: UsageRecord[]): UsageRecord[] {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return records.filter((r) => r.timestamp > weekAgo);
}

export function useFreemiumLimits() {
  const { isPremium } = usePremium();
  const { user } = useAuth();
  const [usage, setUsage] = useState<StoredUsage>({ records: [], lastCleanup: Date.now() });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadUsage().then((data) => {
      const now = Date.now();
      if (now - data.lastCleanup > 24 * 60 * 60 * 1000) {
        data.records = cleanOldRecords(data.records);
        data.lastCleanup = now;
        saveUsage(data);
      }
      setUsage(data);
      setIsLoaded(true);
    });
  }, []);

  const trackUsage = useCallback(
    async (feature: FreemiumFeature, metadata?: Record<string, string>) => {
      if (isPremium) return;
      const record: UsageRecord = {
        feature,
        timestamp: Date.now(),
        metadata,
      };
      const updated: StoredUsage = {
        ...usage,
        records: [...usage.records, record],
      };
      setUsage(updated);
      await saveUsage(updated);
      console.log(`[Freemium] Tracked usage: ${feature}`, metadata);
    },
    [isPremium, usage],
  );

  const getDailyCount = useCallback(
    (feature: FreemiumFeature): number => {
      const startOfDay = getStartOfDay().getTime();
      return usage.records.filter(
        (r) => r.feature === feature && r.timestamp >= startOfDay,
      ).length;
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

  const getTotalCountForCourse = useCallback(
    (feature: FreemiumFeature, courseId: string): number => {
      return usage.records.filter(
        (r) => r.feature === feature && r.metadata?.courseId === courseId,
      ).length;
    },
    [usage.records],
  );

  const checkQuiz = useCallback((): FreemiumStatus => {
    if (isPremium) {
      return { isAllowed: true, remaining: Infinity, total: FREEMIUM_LIMITS.quiz.daily, resetAt: null, isPremium: true };
    }
    const used = getDailyCount('quiz') + getDailyCount('course_quiz');
    const remaining = Math.max(0, FREEMIUM_LIMITS.quiz.daily - used);
    return {
      isAllowed: remaining > 0,
      remaining,
      total: FREEMIUM_LIMITS.quiz.daily,
      resetAt: getEndOfDay(),
      isPremium: false,
    };
  }, [isPremium, getDailyCount]);

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

  const checkFlashcards = useCallback(
    (courseId: string): FreemiumStatus => {
      if (isPremium) {
        return { isAllowed: true, remaining: Infinity, total: FREEMIUM_LIMITS.flashcardsPerCourse, resetAt: null, isPremium: true };
      }
      const used = getTotalCountForCourse('flashcards', courseId);
      const remaining = Math.max(0, FREEMIUM_LIMITS.flashcardsPerCourse - used);
      return {
        isAllowed: remaining > 0,
        remaining,
        total: FREEMIUM_LIMITS.flashcardsPerCourse,
        resetAt: null,
        isPremium: false,
      };
    },
    [isPremium, getTotalCountForCourse],
  );

  const checkHPSection = useCallback((): FreemiumStatus => {
    if (isPremium) {
      return { isAllowed: true, remaining: Infinity, total: FREEMIUM_LIMITS.hpSections, resetAt: null, isPremium: true };
    }
    const used = getDailyCount('hp_section');
    const remaining = Math.max(0, FREEMIUM_LIMITS.hpSections - used);
    return {
      isAllowed: remaining > 0,
      remaining,
      total: FREEMIUM_LIMITS.hpSections,
      resetAt: getEndOfDay(),
      isPremium: false,
    };
  }, [isPremium, getDailyCount]);

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
      getDailyCount,
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
      getDailyCount,
      getWeeklyCount,
    ],
  );
}

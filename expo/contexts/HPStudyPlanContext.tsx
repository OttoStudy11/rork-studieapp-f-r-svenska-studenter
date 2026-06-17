import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { logger } from '@/utils/logger';

export type HPPlanType = 'LUGN' | 'BALANSERAD' | 'INTENSIV';
export type HPDateKey = 'fall2026';

export const HP_EXAM_DATES: Record<HPDateKey, Date> = {
  fall2026: new Date('2026-10-18T09:00:00'),
};

export const HP_DATE_LABELS: Record<HPDateKey, string> = {
  fall2026: 'Höst 2026 · 18 oktober',
};

export interface PlanConfig {
  type: HPPlanType;
  name: string;
  emoji: string;
  subtitle: string;
  targetDays: string;
  goalIncrease: string;
  minutesPerDay: string;
  wordsPerDay: number;
  mekPerDay: number;
  quantPerDay: number;
  color: string;
  gradientColors: [string, string];
  recommended?: boolean;
}

export const PLAN_CONFIGS: PlanConfig[] = [
  {
    type: 'LUGN',
    name: 'Lugn & Långsiktig',
    emoji: '🌱',
    subtitle: 'Bygg starka vanor utan stress',
    targetDays: '90+ dagar kvar',
    goalIncrease: '+0.3 – 0.5 poäng',
    minutesPerDay: '15–20 min/dag',
    wordsPerDay: 20,
    mekPerDay: 2,
    quantPerDay: 5,
    color: '#10B981',
    gradientColors: ['#10B981', '#059669'],
  },
  {
    type: 'BALANSERAD',
    name: 'Balanserad',
    emoji: '⚖️',
    subtitle: 'Rekommenderad för de flesta',
    targetDays: '60–89 dagar kvar',
    goalIncrease: '+0.4 – 0.6 poäng',
    minutesPerDay: '25–35 min/dag',
    wordsPerDay: 30,
    mekPerDay: 3,
    quantPerDay: 12,
    color: '#6366F1',
    gradientColors: ['#6366F1', '#8B5CF6'],
    recommended: true,
  },
  {
    type: 'INTENSIV',
    name: 'Intensiv Sprint',
    emoji: '🔥',
    subtitle: 'Maximera ditt resultat snabbt',
    targetDays: '30–59 dagar kvar',
    goalIncrease: '+0.2 – 0.4 poäng',
    minutesPerDay: '45–60 min/dag',
    wordsPerDay: 50,
    mekPerDay: 5,
    quantPerDay: 22,
    color: '#EF4444',
    gradientColors: ['#EF4444', '#DC2626'],
  },
];

export interface DailyProgress {
  date: string;
  ordCompleted: number;
  mekCompleted: number;
  quantCompleted: number;
  minutesSpent: number;
  fullyCompleted: boolean;
}

export interface HPStudyPlan {
  planType: HPPlanType;
  hpDateKey: HPDateKey;
  startDate: string;
  notificationsEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  streakWarnings: boolean;
  milestonesEnabled: boolean;
  notificationIds: string[];
  pausedUntil: string | null;
}

export interface HPStudyProgress {
  totalWordsLearned: number;
  totalMekCompleted: number;
  totalQuantCompleted: number;
  totalMinutes: number;
  streak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  dailyHistory: DailyProgress[];
}

const PLAN_STORAGE_KEY = '@hp_study_plan';
const PROGRESS_STORAGE_KEY = '@hp_study_progress';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getDaysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function calculateStreak(dailyHistory: DailyProgress[]): number {
  if (dailyHistory.length === 0) return 0;
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const completedDates = new Set(
    dailyHistory.filter(d => d.fullyCompleted).map(d => d.date)
  );

  if (!completedDates.has(today) && !completedDates.has(yesterdayStr)) return 0;

  let streak = 0;
  const check = new Date();
  if (!completedDates.has(today)) {
    check.setDate(check.getDate() - 1);
  }

  while (true) {
    const dateStr = check.toISOString().split('T')[0];
    if (completedDates.has(dateStr)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export const [HPStudyPlanProvider, useHPStudyPlan] = createContextHook(() => {
  const [plan, setPlan] = useState<HPStudyPlan | null>(null);
  const [progress, setProgress] = useState<HPStudyProgress>({
    totalWordsLearned: 0,
    totalMekCompleted: 0,
    totalQuantCompleted: 0,
    totalMinutes: 0,
    streak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    dailyHistory: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [planStr, progressStr] = await Promise.all([
        AsyncStorage.getItem(PLAN_STORAGE_KEY),
        AsyncStorage.getItem(PROGRESS_STORAGE_KEY),
      ]);
      if (planStr) {
        const parsed = safeJsonParse<HPStudyPlan>(planStr, {} as HPStudyPlan, 'HPStudyPlan');
        const migratedPlan: HPStudyPlan = {
          ...parsed,
          hpDateKey: HP_EXAM_DATES[parsed.hpDateKey] ? parsed.hpDateKey : 'fall2026',
        };
        if (migratedPlan.hpDateKey !== parsed.hpDateKey) {
          await AsyncStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(migratedPlan));
        }
        setPlan(migratedPlan);
        console.log('[HPStudyPlan] Loaded plan:', migratedPlan.planType, migratedPlan.hpDateKey);
      }
      if (progressStr) {
        const parsed = safeJsonParse<HPStudyProgress>(progressStr, {} as HPStudyProgress, 'HPStudyPlan');
        const streak = calculateStreak(parsed.dailyHistory);
        setProgress({ ...parsed, streak });
        console.log('[HPStudyPlan] Loaded progress, streak:', streak);
      }
    } catch (e) {
      console.error('[HPStudyPlan] Error loading:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const savePlan = useCallback(async (newPlan: HPStudyPlan) => {
    try {
      await AsyncStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(newPlan));
      setPlan(newPlan);
      console.log('[HPStudyPlan] Saved plan:', newPlan.planType);
    } catch (e) {
      console.error('[HPStudyPlan] Error saving plan:', e);
    }
  }, []);

  const saveProgress = useCallback(async (newProgress: HPStudyProgress) => {
    try {
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (e) {
      console.error('[HPStudyPlan] Error saving progress:', e);
    }
  }, []);

  const selectPlan = useCallback(async (planType: HPPlanType, hpDateKey: HPDateKey) => {
    const newPlan: HPStudyPlan = {
      planType,
      hpDateKey,
      startDate: getTodayString(),
      notificationsEnabled: true,
      dailyReminderHour: 18,
      dailyReminderMinute: 0,
      streakWarnings: true,
      milestonesEnabled: true,
      notificationIds: [],
      pausedUntil: null,
    };
    await savePlan(newPlan);
    await scheduleHPNotifications(newPlan);
  }, [savePlan]);

  const deletePlan = useCallback(async () => {
    try {
      if (plan && plan.notificationIds.length > 0 && Platform.OS !== 'web') {
        for (const id of plan.notificationIds) {
          await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
        }
      }
      await AsyncStorage.removeItem(PLAN_STORAGE_KEY);
      setPlan(null);
      console.log('[HPStudyPlan] Plan deleted');
    } catch (e) {
      console.error('[HPStudyPlan] Error deleting plan:', e);
    }
  }, [plan]);

  const updateSettings = useCallback(async (updates: Partial<HPStudyPlan>) => {
    if (!plan) return;
    const updated = { ...plan, ...updates };
    await savePlan(updated);
    if ('notificationsEnabled' in updates || 'dailyReminderHour' in updates || 'dailyReminderMinute' in updates) {
      await scheduleHPNotifications(updated);
    }
  }, [plan, savePlan]);

  const scheduleHPNotifications = useCallback(async (p: HPStudyPlan) => {
    if (Platform.OS === 'web') return;
    try {
      for (const id of p.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      }
      if (!p.notificationsEnabled) return;

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') return;
      }

      const ids: string[] = [];

      const dailyId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📚 Dags att plugga till HP!',
          body: `Håll din streak vid liv. Dagens pass väntar!`,
          sound: true,
          data: { type: 'hp-daily-reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: p.dailyReminderHour,
          minute: p.dailyReminderMinute,
          channelId: 'study-reminders',
        } as Notifications.DailyTriggerInput,
      });
      ids.push(dailyId);

      const hpDate = HP_EXAM_DATES[p.hpDateKey];
      const milestones = [50, 30, 14, 7];
      for (const days of milestones) {
        const triggerDate = new Date(hpDate);
        triggerDate.setDate(triggerDate.getDate() - days);
        const now = new Date();
        if (triggerDate > now) {
          const seconds = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ ${days} dagar kvar till HP!`,
              body: days <= 14 ? 'Sista sprinten – fokusera och repetera!' : 'Intensifiera din träning nu.',
              sound: true,
              data: { type: 'hp-countdown', daysLeft: days },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds,
              channelId: 'study-reminders',
            } as Notifications.TimeIntervalTriggerInput,
          });
          ids.push(id);
        }
      }

      const updatedPlan = { ...p, notificationIds: ids };
      await AsyncStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(updatedPlan));
      setPlan(updatedPlan);
      console.log('[HPStudyPlan] Scheduled', ids.length, 'notifications');
    } catch (e) {
      console.error('[HPStudyPlan] Error scheduling notifications:', e);
    }
  }, []);

  const updateDailyProgress = useCallback(async (
    type: 'ord' | 'mek' | 'quant',
    amount: number
  ) => {
    if (!plan) return;
    const config = PLAN_CONFIGS.find(c => c.type === plan.planType)!;
    const today = getTodayString();

    const history = [...progress.dailyHistory];
    let todayEntry = history.find(d => d.date === today);
    if (!todayEntry) {
      todayEntry = {
        date: today,
        ordCompleted: 0,
        mekCompleted: 0,
        quantCompleted: 0,
        minutesSpent: 0,
        fullyCompleted: false,
      };
      history.push(todayEntry);
    }

    const idx = history.findIndex(d => d.date === today);
    const entry = { ...history[idx] };

    if (type === 'ord') entry.ordCompleted = Math.min(entry.ordCompleted + amount, config.wordsPerDay);
    if (type === 'mek') entry.mekCompleted = Math.min(entry.mekCompleted + amount, config.mekPerDay);
    if (type === 'quant') entry.quantCompleted = Math.min(entry.quantCompleted + amount, config.quantPerDay);

    const minutesMap: Record<string, number> = { ord: 10, mek: 15, quant: 10 };
    entry.minutesSpent += minutesMap[type] || 5;
    entry.fullyCompleted =
      entry.ordCompleted >= config.wordsPerDay &&
      entry.mekCompleted >= config.mekPerDay &&
      entry.quantCompleted >= config.quantPerDay;

    history[idx] = entry;

    const newProgress: HPStudyProgress = {
      totalWordsLearned: progress.totalWordsLearned + (type === 'ord' ? amount : 0),
      totalMekCompleted: progress.totalMekCompleted + (type === 'mek' ? amount : 0),
      totalQuantCompleted: progress.totalQuantCompleted + (type === 'quant' ? amount : 0),
      totalMinutes: progress.totalMinutes + (minutesMap[type] || 5),
      lastStudyDate: today,
      dailyHistory: history,
      streak: 0,
      longestStreak: progress.longestStreak,
    };
    const streak = calculateStreak(history);
    newProgress.streak = streak;
    newProgress.longestStreak = Math.max(streak, progress.longestStreak);

    await saveProgress(newProgress);
  }, [plan, progress, saveProgress]);

  const getTodayProgress = useCallback((): DailyProgress | null => {
    const today = getTodayString();
    return progress.dailyHistory.find(d => d.date === today) ?? null;
  }, [progress]);

  const getDaysUntilHP = useCallback((): number => {
    if (!plan) return getDaysUntil(HP_EXAM_DATES.fall2026);
    return getDaysUntil(HP_EXAM_DATES[plan.hpDateKey]);
  }, [plan]);

  const getCountdownMessage = useCallback((days: number): string => {
    if (days >= 90) return 'Perfekt tid att börja!';
    if (days >= 60) return 'Lagom tid för grundlig förberedelse';
    if (days >= 30) return 'Intensifiera din träning nu';
    if (days >= 14) return 'Sista sprinten – fokusera!';
    if (days >= 7) return 'En vecka kvar – repetera och vila';
    if (days > 0) return 'Sista dagarna – håll dig lugn!';
    return 'HP är idag – lycka till!';
  }, []);

  const getCurrentDayNumber = useCallback((): number => {
    if (!plan) return 1;
    const start = new Date(plan.startDate);
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.max(1, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }, [plan]);

  const getTotalPlanDays = useCallback((): number => {
    if (!plan) return 90;
    const start = new Date(plan.startDate);
    const hpDate = HP_EXAM_DATES[plan.hpDateKey];
    start.setHours(0, 0, 0, 0);
    hpDate.setHours(0, 0, 0, 0);
    return Math.max(1, Math.ceil((hpDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [plan]);

  const getSuggestedPlan = useCallback((days: number): HPPlanType => {
    if (days >= 90) return 'LUGN';
    if (days >= 60) return 'BALANSERAD';
    return 'INTENSIV';
  }, []);

  const getWeekStats = useCallback(() => {
    const result: DailyProgress[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = progress.dailyHistory.find(h => h.date === dateStr);
      result.push(found ?? {
        date: dateStr,
        ordCompleted: 0,
        mekCompleted: 0,
        quantCompleted: 0,
        minutesSpent: 0,
        fullyCompleted: false,
      });
    }
    return result;
  }, [progress]);

  return {
    plan,
    progress,
    isLoaded,
    selectPlan,
    deletePlan,
    updateSettings,
    updateDailyProgress,
    getTodayProgress,
    getDaysUntilHP,
    getCountdownMessage,
    getCurrentDayNumber,
    getTotalPlanDays,
    getSuggestedPlan,
    getWeekStats,
    scheduleHPNotifications,
  };
});

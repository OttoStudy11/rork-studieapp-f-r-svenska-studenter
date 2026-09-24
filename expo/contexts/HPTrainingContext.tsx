// HP Training context — owns the daily plan, the active training session,
// and the feedback loop that persists performance back to Supabase.

import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { useHogskoleprovet } from './HogskoleprovetContext';
import { useHPStudyPlan } from './HPStudyPlanContext';
import {
  buildDailyTrainingPlan,
  computeTrainingResults,
  pickTrainingQuestions,
  HPQuestionPerformance,
  HPQuestionPool,
  HPTrainingAnswer,
  HPTrainingPlan,
  HPTrainingQuestion,
  HPTrainingResults,
} from '@/lib/hp-training-engine';
import {
  fetchPerformances,
  fetchTrainingHistory,
  savePerformanceUpdates,
  saveTrainingSession,
} from '@/lib/hp-training-store';
import { ALL_HP_QUESTIONS } from '@/constants/hogskoleprovet-questions';
import { EXTENDED_HP_QUESTIONS } from '@/constants/hogskoleprovet-questions-extended';
import { HP_QUESTIONS_V2 } from '@/constants/hogskoleprovet-questions-v2';
import {
  HP_SECTIONS,
  SAMPLE_HP_QUESTIONS,
  HPQuestion as LocalHPQuestion,
} from '@/constants/hogskoleprovet';
import { generateHPQuestionBank } from '@/lib/hp-question-generator';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { shuffleAnswerOptions } from '@/lib/question-utils';

const ACTIVE_SESSION_PREFIX = 'hp_training_active_v1_';

/** An in-progress personalized training pass. */
export interface HPActiveTrainingSession {
  id: string;
  plan: HPTrainingPlan;
  questions: HPTrainingQuestion[];
  answers: Record<string, HPTrainingAnswer>;
  startedAt: number;
}

const STATIC_BANK: LocalHPQuestion[] = [
  ...SAMPLE_HP_QUESTIONS,
  ...EXTENDED_HP_QUESTIONS,
  ...ALL_HP_QUESTIONS,
  ...HP_QUESTIONS_V2,
];

/** Per-section question pools: bundled bank + deterministic generator top-up. */
const buildPools = (): Record<string, HPQuestionPool> => {
  const pools: Record<string, HPQuestionPool> = {};
  for (const section of HP_SECTIONS) {
    const bank = STATIC_BANK.filter(q => q.sectionCode === section.code);
    pools[section.code] = {
      bank,
      // Stable seed keeps generated ids deterministic so repeats can resolve.
      generate: (count: number) =>
        generateHPQuestionBank({
          sectionCode: section.code,
          count,
          seed: `training-${section.code}`,
        }),
    };
  }
  return pools;
};

export const [HPTrainingProvider, useHPTraining] = createContextHook(() => {
  const { user } = useAuth();
  const { getUserStats } = useHogskoleprovet();
  const { getDaysUntilHP } = useHPStudyPlan();
  const queryClient = useQueryClient();

  const [activeSession, setActiveSession] = useState<HPActiveTrainingSession | null>(null);
  const [isSessionHydrated, setIsSessionHydrated] = useState<boolean>(false);
  const [localPerformances, setLocalPerformances] = useState<Record<string, HPQuestionPerformance>>({});

  const stats = getUserStats();
  const daysUntilHP = getDaysUntilHP();
  const userId = user?.id ?? null;

  // ── Server state ──────────────────────────────────────────────────────────
  const performancesQuery = useQuery({
    queryKey: ['hp-question-performances', userId],
    queryFn: () => fetchPerformances(userId as string),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });

  const historyQuery = useQuery({
    queryKey: ['hp-training-history', userId],
    queryFn: () => fetchTrainingHistory(userId as string),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });

  const performances: Record<string, HPQuestionPerformance> = useMemo(
    () => ({ ...(performancesQuery.data ?? {}), ...localPerformances }),
    [performancesQuery.data, localPerformances]
  );

  // ── Hydrate an interrupted session ────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setIsSessionHydrated(true);
      return;
    }
    AsyncStorage.getItem(`${ACTIVE_SESSION_PREFIX}${userId}`)
      .then(raw => {
        if (!mounted) return;
        if (raw) {
          const session = safeJsonParse<HPActiveTrainingSession | null>(raw, null, 'HPTraining');
          if (session && session.questions.length > 0) {
            setActiveSession(session);
          }
        }
        setIsSessionHydrated(true);
      })
      .catch(() => {
        if (mounted) setIsSessionHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const persistActiveSession = useCallback(
    (session: HPActiveTrainingSession | null) => {
      if (!userId) return;
      const key = `${ACTIVE_SESSION_PREFIX}${userId}`;
      if (!session) {
        AsyncStorage.removeItem(key).catch(() => undefined);
        return;
      }
      AsyncStorage.setItem(key, JSON.stringify(session)).catch(() => undefined);
    },
    [userId]
  );

  // ── Today's plan ──────────────────────────────────────────────────────────
  const plan: HPTrainingPlan = useMemo(
    () =>
      buildDailyTrainingPlan({
        sectionStats: stats.sectionStats,
        performances,
        daysUntilHP,
        lastSessionAt: historyQuery.data?.lastSessionAt,
        recentQuestionIds: historyQuery.data?.recentQuestionIds,
      }),
    [stats.sectionStats, performances, daysUntilHP, historyQuery.data]
  );

  // ── Actions ───────────────────────────────────────────────────────────────
  const startTraining = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    const questions = pickTrainingQuestions({
      plan,
      pools: buildPools(),
      performances,
      recentQuestionIds: historyQuery.data?.recentQuestionIds,
    });
    if (questions.length === 0) return false;

    // Shuffle answer options per question, mirroring practice mode.
    const prepared: HPTrainingQuestion[] = questions.map(q => {
      const shuffled = shuffleAnswerOptions(q);
      return { ...shuffled, reason: q.reason };
    });

    const session: HPActiveTrainingSession = {
      id: `train_${Date.now()}`,
      plan,
      questions: prepared,
      answers: {},
      startedAt: Date.now(),
    };

    setActiveSession(session);
    persistActiveSession(session);
    return true;
  }, [userId, plan, performances, historyQuery.data, persistActiveSession]);

  const submitTrainingAnswer = useCallback(
    (questionId: string, answer: string, timeSpentSeconds: number) => {
      setActiveSession(prev => {
        if (!prev || prev.answers[questionId]) return prev;
        const record: HPTrainingAnswer = { answer, timeSpentSeconds };
        const next: HPActiveTrainingSession = {
          ...prev,
          answers: { ...prev.answers, [questionId]: record },
        };
        persistActiveSession(next);
        return next;
      });
    },
    [persistActiveSession]
  );

  const completeTraining = useCallback(async (): Promise<HPTrainingResults | null> => {
    if (!userId || !activeSession) return null;

    const { results, performanceUpdates } = computeTrainingResults({
      sessionId: activeSession.id,
      questions: activeSession.questions,
      answers: activeSession.answers,
      startedAt: activeSession.startedAt,
      performances,
    });

    // Persist per-question stats (cache first, queued on failure)…
    const merged = await savePerformanceUpdates(userId, performanceUpdates, performances);
    setLocalPerformances(prev => ({ ...prev, ...Object.fromEntries(performanceUpdates.map(u => [u.questionId, u])) }));
    queryClient.setQueryData(['hp-question-performances', userId], merged);

    // …and the session record (non-blocking — result is already local).
    void saveTrainingSession(
      userId,
      activeSession.plan,
      results,
      activeSession.questions.map(q => q.id)
    ).then(() => {
      queryClient.invalidateQueries({ queryKey: ['hp-training-history', userId] });
    });

    setActiveSession(null);
    persistActiveSession(null);
    return results;
  }, [userId, activeSession, performances, queryClient, persistActiveSession]);

  const abandonTraining = useCallback(async (): Promise<void> => {
    setActiveSession(null);
    persistActiveSession(null);
  }, [persistActiveSession]);

  const isLoading = Boolean(userId) && (!isSessionHydrated || performancesQuery.isLoading);

  return {
    plan,
    performances,
    activeSession,
    isLoading,
    startTraining,
    submitTrainingAnswer,
    completeTraining,
    abandonTraining,
  };
});

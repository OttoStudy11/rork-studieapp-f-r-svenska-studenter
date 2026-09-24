// Supabase persistence for personalized HP training.
// Remote-first with an AsyncStorage mirror and an offline pending-queue —
// writes land in the cache immediately and flush to Supabase when possible.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { safeJsonParse } from '@/utils/safeJsonParse';
import {
  HPQuestionPerformance,
  HPTrainingPlan,
  HPTrainingResults,
} from '@/lib/hp-training-engine';

const PERF_CACHE_PREFIX = 'hp_training_performances_v1_';
const PENDING_QUEUE_PREFIX = 'hp_training_pending_v1_';

/**
 * Untyped table access for training tables not yet present in the generated
 * Supabase types. Mirrors the pattern used in hp-content.ts.
 */
const fromTable = (table: string): any =>
  (supabase as unknown as { from: (t: string) => any }).from(table);

export interface HPTrainingSessionRow {
  id: string;
  created_at: string;
  completed_at: string;
  plan: HPTrainingPlan | null;
  result: HPTrainingResults | null;
  question_ids: string[];
  total_questions: number;
  correct_count: number;
  accuracy: number;
  duration_seconds: number;
}

export interface HPTrainingHistory {
  lastSessionAt?: string;
  recentQuestionIds: string[];
  sessions: HPTrainingSessionRow[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache helpers
// ─────────────────────────────────────────────────────────────────────────────

const cacheKey = (userId: string): string => `${PERF_CACHE_PREFIX}${userId}`;

const loadCachedPerformances = async (userId: string): Promise<Record<string, HPQuestionPerformance>> => {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(userId));
    if (!raw) return {};
    return safeJsonParse<Record<string, HPQuestionPerformance>>(raw, {}, 'HPTraining');
  } catch {
    return {};
  }
};

const saveCachedPerformances = async (
  userId: string,
  performances: Record<string, HPQuestionPerformance>
): Promise<void> => {
  try {
    await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(performances));
  } catch (e) {
    logger.warn('[HPTraining]', 'cache write failed', e);
  }
};

interface PendingUpdate {
  row: Record<string, unknown>;
}

const pendingKey = (userId: string): string => `${PENDING_QUEUE_PREFIX}${userId}`;

const loadPending = async (userId: string): Promise<PendingUpdate[]> => {
  try {
    const raw = await AsyncStorage.getItem(pendingKey(userId));
    if (!raw) return [];
    return safeJsonParse<PendingUpdate[]>(raw, [], 'HPTraining');
  } catch {
    return [];
  }
};

const savePending = async (userId: string, queue: PendingUpdate[]): Promise<void> => {
  try {
    if (queue.length === 0) {
      await AsyncStorage.removeItem(pendingKey(userId));
    } else {
      await AsyncStorage.setItem(pendingKey(userId), JSON.stringify(queue));
    }
  } catch (e) {
    logger.warn('[HPTraining]', 'pending queue write failed', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Row mapping
// ─────────────────────────────────────────────────────────────────────────────

interface StatsRow {
  question_id: string;
  section_code: string;
  times_seen: number;
  times_correct: number;
  times_wrong: number;
  avg_time_seconds: number;
  consecutive_correct: number;
  last_seen_at: string | null;
  next_review_at: string | null;
}

const mapStatsRow = (row: StatsRow): HPQuestionPerformance => ({
  questionId: row.question_id,
  sectionCode: row.section_code,
  timesSeen: row.times_seen,
  timesCorrect: row.times_correct,
  timesWrong: row.times_wrong,
  avgTimeSeconds: row.avg_time_seconds,
  consecutiveCorrect: row.consecutive_correct,
  lastSeenAt: row.last_seen_at ?? undefined,
  nextReviewAt: row.next_review_at ?? undefined,
  lastCorrect: row.times_seen > 0 && row.times_correct > 0 && row.consecutive_correct > 0,
});

const performanceToRow = (
  userId: string,
  p: HPQuestionPerformance
): Record<string, unknown> => ({
  user_id: userId,
  question_id: p.questionId,
  section_code: p.sectionCode,
  times_seen: p.timesSeen,
  times_correct: p.timesCorrect,
  times_wrong: p.timesWrong,
  avg_time_seconds: p.avgTimeSeconds,
  consecutive_correct: p.consecutiveCorrect,
  last_seen_at: p.lastSeenAt ?? null,
  next_review_at: p.nextReviewAt ?? null,
  updated_at: new Date().toISOString(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loads per-question performance: cache immediately, then merged with remote.
 * Also flushes any queued offline updates.
 */
export const fetchPerformances = async (
  userId: string
): Promise<Record<string, HPQuestionPerformance>> => {
  const cached = await loadCachedPerformances(userId);
  const pending = await loadPending(userId);
  if (pending.length > 0) {
    await flushPending(userId, pending, cached);
  }

  try {
    const { data, error } = await fromTable('hp_question_stats')
      .select('*')
      .eq('user_id', userId)
      .limit(5000) as { data: StatsRow[] | null; error: unknown };

    if (error || !data) {
      logger.warn('[HPTraining]', 'stats fetch failed, using cache', error);
      return cached;
    }

    const merged: Record<string, HPQuestionPerformance> = { ...cached };
    for (const row of data) {
      const remote = mapStatsRow(row);
      const local = merged[remote.questionId];
      // Local wins if newer (pending writes may not be flushed yet).
      const localNewer = local?.lastSeenAt && remote.lastSeenAt &&
        new Date(local.lastSeenAt).getTime() > new Date(remote.lastSeenAt).getTime();
      if (!local || !localNewer) {
        merged[remote.questionId] = remote;
      }
    }

    await saveCachedPerformances(userId, merged);
    return merged;
  } catch (e) {
    logger.warn('[HPTraining]', 'stats fetch error, using cache', e);
    return cached;
  }
};

/**
 * Upserts performance updates; caches first, queues on network failure.
 */
export const savePerformanceUpdates = async (
  userId: string,
  updates: HPQuestionPerformance[],
  current: Record<string, HPQuestionPerformance>
): Promise<Record<string, HPQuestionPerformance>> => {
  const merged: Record<string, HPQuestionPerformance> = { ...current };
  for (const update of updates) {
    merged[update.questionId] = update;
  }
  await saveCachedPerformances(userId, merged);

  const rows = updates.map(u => performanceToRow(userId, u));
  try {
    const { error } = await fromTable('hp_question_stats')
      .upsert(rows as any, { onConflict: 'user_id,question_id' });
    if (error) throw error;
    await flushPending(userId, await loadPending(userId), merged);
  } catch (e) {
    const pending = await loadPending(userId);
    pending.push(...rows.map(row => ({ row })));
    await savePending(userId, pending.slice(-500));
    logger.warn('[HPTraining]', 'stats upsert failed, queued', e);
  }

  return merged;
};

/** Flushes queued offline upserts, dropping rows the server already has. */
const flushPending = async (
  userId: string,
  pending: PendingUpdate[],
  current: Record<string, HPQuestionPerformance>
): Promise<void> => {
  if (pending.length === 0) return;
  try {
    const rows = pending.map(p => p.row);
    const { error } = await fromTable('hp_question_stats')
      .upsert(rows as any, { onConflict: 'user_id,question_id' });
    if (error) throw error;
    await savePending(userId, []);
    for (const row of rows) {
      const qid = String(row.question_id);
      if (current[qid]) current[qid] = { ...current[qid] };
    }
    logger.info('[HPTraining]', `flushed ${rows.length} pending stat updates`);
  } catch (e) {
    logger.warn('[HPTraining]', 'pending flush failed', e);
  }
};

/**
 * Persists a completed training session and returns the row id.
 */
export const saveTrainingSession = async (
  userId: string,
  plan: HPTrainingPlan,
  results: HPTrainingResults,
  questionIds: string[]
): Promise<string | null> => {
  try {
    const { data, error } = await fromTable('hp_training_sessions')
      .insert({
        user_id: userId,
        completed_at: results.completedAt,
        status: 'completed',
        plan: plan as unknown as Record<string, unknown>,
        result: results as unknown as Record<string, unknown>,
        question_ids: questionIds,
        total_questions: results.totalQuestions,
        correct_count: results.correctCount,
        accuracy: results.accuracy,
        duration_seconds: results.durationSeconds,
      } as any)
      .select('id')
      .single();
    if (error) throw error;
    return (data as { id: string })?.id ?? null;
  } catch (e) {
    logger.warn('[HPTraining]', 'session insert failed', e);
    return null;
  }
};

/**
 * Loads recent session history for plan inputs (last session time + recent
 * question ids so fresh picks avoid immediate repetition).
 */
export const fetchTrainingHistory = async (
  userId: string,
  limit = 10
): Promise<HPTrainingHistory> => {
  try {
    const { data, error } = await fromTable('hp_training_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit) as { data: HPTrainingSessionRow[] | null; error: unknown };

    if (error || !data) {
      return { recentQuestionIds: [], sessions: [] };
    }

    const sessions = data.map(row => ({
      ...row,
      question_ids: Array.isArray(row.question_ids) ? (row.question_ids as string[]) : [],
    }));

    return {
      lastSessionAt: sessions[0]?.completed_at,
      recentQuestionIds: sessions[0]?.question_ids ?? [],
      sessions,
    };
  } catch (e) {
    logger.warn('[HPTraining]', 'history fetch failed', e);
    return { recentQuestionIds: [], sessions: [] };
  }
};

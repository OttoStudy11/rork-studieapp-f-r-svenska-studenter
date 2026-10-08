// Personalized HP training engine — pure logic, no side effects.
// Builds a daily training plan from the user's actual performance and
// computes post-session results that feed back into future plans.

import {
  HP_SECTIONS,
  HPQuestion as LocalHPQuestion,
} from '@/constants/hogskoleprovet';

// ─────────────────────────────────────────────────────────────────────────────
// Data model
// ─────────────────────────────────────────────────────────────────────────────

/** Per-question performance record, persisted per user in Supabase. */
export interface HPQuestionPerformance {
  questionId: string;
  sectionCode: string;
  timesSeen: number;
  timesCorrect: number;
  timesWrong: number;
  avgTimeSeconds: number;
  consecutiveCorrect: number;
  lastSeenAt?: string;
  /** When this question should be repeated (spaced repetition). ISO date. */
  nextReviewAt?: string;
  lastCorrect?: boolean;
}

/** Why a question/section was selected for this session. */
export type HPTrainingReason = 'repeat' | 'weak' | 'untrained' | 'maintenance';

/** One section's share of the daily session, e.g. "10 ORD". */
export interface HPTrainingPlanItem {
  sectionCode: string;
  count: number;
  targetDifficulty: 'easy' | 'medium' | 'hard';
  reason: HPTrainingReason;
  /** Section accuracy 0–100, or null if never trained. */
  accuracy: number | null;
}

/** The full daily plan shown on HP home as "Din träning idag". */
export interface HPTrainingPlan {
  id: string;
  createdAt: string;
  items: HPTrainingPlanItem[];
  /** Questions scheduled for spaced repetition. */
  repeatCount: number;
  repeatQuestionIds: string[];
  totalQuestions: number;
  estimatedMinutes: number;
  daysUntilHP: number;
  focusMessage: string;
}

/** A question resolved from the bank for an active session. */
export interface HPTrainingQuestion extends LocalHPQuestion {
  reason: HPTrainingReason;
}

/** Post-session results. */
export interface HPTrainingResults {
  sessionId: string;
  completedAt: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctCount: number;
  accuracy: number;
  durationSeconds: number;
  sectionResults: Array<{
    sectionCode: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
  /** Sections identified as weak this session (accuracy < 60). */
  weaknesses: string[];
  /** Questions scheduled as new repetition points after this session. */
  newRepetitionPoints: Array<{
    questionId: string;
    sectionCode: string;
    questionText: string;
    wasCorrect: boolean;
    nextReviewAt: string;
  }>;
}

export interface HPTrainingAnswer {
  answer: string;
  timeSpentSeconds: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tuning constants
// ─────────────────────────────────────────────────────────────────────────────

const WEAK_ACCURACY = 60;
const STRONG_ACCURACY = 85;
const MAX_REPEAT_SHARE = 0.3;
const MAX_PER_SECTION = 10;
const SECONDS_PER_MINUTE = 60;
/** Rough per-question overhead (reading instructions, transitions). */
const SESSION_OVERHEAD_SHARE = 0.15;

const REVIEW_INTERVAL_DAYS = [1, 2, 4, 7, 14] as const;

const daysBetween = (fromIso: string, toMs: number): number =>
  Math.floor((toMs - new Date(fromIso).getTime()) / (1000 * 60 * 60 * 24));

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const addDaysIso = (fromMs: number, days: number): string =>
  new Date(fromMs + days * 24 * 60 * 60 * 1000).toISOString();

/** Seconds per question for a section, from its official time limit. */
export const sectionSecondsPerQuestion = (sectionCode: string): number => {
  const section = HP_SECTIONS.find(s => s.code === sectionCode);
  if (!section || section.questionCount === 0) return 60;
  return Math.round((section.timeMinutes * SECONDS_PER_MINUTE) / section.questionCount);
};

/**
 * Session size scales with exam proximity — closer to HP, more intense.
 */
const sessionSizeFor = (daysUntilHP: number): number => {
  if (daysUntilHP <= 14) return 30;
  if (daysUntilHP <= 30) return 26;
  if (daysUntilHP <= 90) return 22;
  return 18;
};

/**
 * Next spaced-repetition date after an answer, based on the streak of
 * consecutive correct answers (SM-2-lite).
 */
export const nextReviewDate = (
  consecutiveCorrect: number,
  nowMs: number
): string => {
  const idx = clamp(consecutiveCorrect - 1, 0, REVIEW_INTERVAL_DAYS.length - 1);
  return addDaysIso(nowMs, REVIEW_INTERVAL_DAYS[idx]);
};

// ─────────────────────────────────────────────────────────────────────────────
// Plan building
// ─────────────────────────────────────────────────────────────────────────────

export interface HPTrainingPlanInput {
  sectionStats: Record<string, {
    attempts: number;
    averageScore: number;
    bestScore: number;
    lastAttempt?: string;
  }>;
  performances: Record<string, HPQuestionPerformance>;
  daysUntilHP: number;
  /** ISO date of the last completed training session, if any. */
  lastSessionAt?: string;
  /** Question ids used in the most recent session — avoided for fresh picks. */
  recentQuestionIds?: string[];
  now?: number;
}

/** Builds the prioritized repeat queue from per-question performance. */
export const buildRepeatQueue = (
  performances: Record<string, HPQuestionPerformance>,
  nowMs: number,
  limit: number
): HPQuestionPerformance[] => {
  const due = Object.values(performances).filter(p => {
    const hasErrors = p.timesWrong > 0;
    const isDue = !p.nextReviewAt || new Date(p.nextReviewAt).getTime() <= nowMs;
    const struggling = p.consecutiveCorrect < 2;
    return hasErrors && isDue && struggling;
  });

  return due
    .map(p => {
      const overdueDays = p.nextReviewAt
        ? Math.max(0, daysBetween(p.nextReviewAt, nowMs))
        : 7;
      const errorRate = p.timesSeen > 0 ? p.timesWrong / p.timesSeen : 1;
      return { p, priority: overdueDays * (0.5 + errorRate) };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map(entry => entry.p);
};

/**
 * Builds today's personalized training plan from stats + per-question history.
 */
export const buildDailyTrainingPlan = (
  input: HPTrainingPlanInput
): HPTrainingPlan => {
  const nowMs = input.now ?? Date.now();
  const total = sessionSizeFor(input.daysUntilHP);

  // 1. Repetition slots — capped share of the session.
  const maxRepeats = Math.floor(total * MAX_REPEAT_SHARE);
  const repeatQueue = buildRepeatQueue(input.performances, nowMs, maxRepeats);
  const repeatCount = repeatQueue.length;
  const repeatQuestionIds = repeatQueue.map(p => p.questionId);
  const freshSlots = total - repeatCount;

  // 2. Section weights — weakness, coverage and freshness.
  interface SectionWeight {
    code: string;
    weight: number;
    accuracy: number | null;
    reason: HPTrainingReason;
    targetDifficulty: 'easy' | 'medium' | 'hard';
  }

  const weights: SectionWeight[] = HP_SECTIONS.map(section => {
    const stat = input.sectionStats[section.code];
    const trained = (stat?.attempts ?? 0) > 0;
    const accuracy = trained ? clamp(stat.averageScore, 0, 100) : null;

    let weight: number;
    let reason: HPTrainingReason;
    let targetDifficulty: 'easy' | 'medium' | 'hard';

    if (accuracy === null) {
      // Untrained — coverage matters most.
      weight = 1.15;
      reason = 'untrained';
      targetDifficulty = 'easy';
    } else if (accuracy < WEAK_ACCURACY) {
      weight = 1.3;
      reason = 'weak';
      targetDifficulty = 'easy';
    } else if (accuracy < STRONG_ACCURACY) {
      weight = 0.85;
      reason = 'maintenance';
      targetDifficulty = 'medium';
    } else {
      weight = 0.4;
      reason = 'maintenance';
      targetDifficulty = 'hard';
    }

    // Stale sections resurface.
    if (stat?.lastAttempt) {
      const since = daysBetween(stat.lastAttempt, nowMs);
      if (since > 10) weight *= 1.2;
    }

    // Closer to the exam, double down on weaknesses.
    if (input.daysUntilHP <= 30 && (reason === 'weak' || reason === 'untrained')) {
      weight *= 1.25;
    }

    return { code: section.code, weight, accuracy, reason, targetDifficulty };
  });

  // 3. Distribute fresh slots by weight (largest remainder).
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const raw = weights.map(w => ({
    ...w,
    exact: (w.weight / totalWeight) * freshSlots,
  }));
  const allocations = raw.map(r => ({
    ...r,
    count: Math.min(MAX_PER_SECTION, Math.floor(r.exact)),
  }));
  let remaining = freshSlots - allocations.reduce((sum, a) => sum + a.count, 0);
  const byRemainder = [...allocations].sort(
    (a, b) => (b.exact % 1) - (a.exact % 1)
  );
  let idx = 0;
  while (remaining > 0 && byRemainder.length > 0) {
    const target = byRemainder[idx % byRemainder.length];
    if (target.count < MAX_PER_SECTION) {
      target.count += 1;
      remaining -= 1;
    }
    idx += 1;
    if (idx > freshSlots + weights.length) break;
  }

  const items: HPTrainingPlanItem[] = allocations
    .filter(a => a.count > 0)
    .map(a => ({
      sectionCode: a.code,
      count: a.count,
      targetDifficulty: a.targetDifficulty,
      reason: a.reason,
      accuracy: a.accuracy,
    }))
    .sort((a, b) => b.count - a.count);

  // 4. Estimated time — official pace + repeats slightly faster + overhead.
  const freshSeconds = items.reduce(
    (sum, item) => sum + item.count * sectionSecondsPerQuestion(item.sectionCode),
    0
  );
  const repeatSeconds = repeatQueue.reduce(
    (sum, p) => sum + Math.round(sectionSecondsPerQuestion(p.sectionCode) * 0.75),
    0
  );
  const estimatedMinutes = Math.max(
    3,
    Math.ceil(((freshSeconds + repeatSeconds) * (1 + SESSION_OVERHEAD_SHARE)) / SECONDS_PER_MINUTE)
  );

  // 5. Human-readable focus message.
  const weakest = items.find(i => i.reason === 'weak') ?? items.find(i => i.reason === 'untrained');
  const focusMessage = repeatCount > 0 && weakest
    ? `Fokus: ${weakest.sectionCode} + ${repeatCount} repetitioner`
    : weakest
      ? `Fokus: ${weakest.sectionCode}`
      : 'Blandat underhållsträning';

  return {
    id: `plan_${nowMs}`,
    createdAt: new Date(nowMs).toISOString(),
    items,
    repeatCount,
    repeatQuestionIds,
    totalQuestions: repeatCount + items.reduce((sum, i) => sum + i.count, 0),
    estimatedMinutes,
    daysUntilHP: input.daysUntilHP,
    focusMessage,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Question picking
// ─────────────────────────────────────────────────────────────────────────────

export interface HPQuestionPool {
  /** Bank questions for one section, straight from the question bank. */
  bank: LocalHPQuestion[];
}

export interface PickQuestionsInput {
  plan: HPTrainingPlan;
  pools: Record<string, HPQuestionPool>;
  performances: Record<string, HPQuestionPerformance>;
  recentQuestionIds?: string[];
  now?: number;
}

const difficultyRank: Record<LocalHPQuestion['difficulty'], number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

/**
 * Resolves a plan into concrete questions from the bank.
 * Repeats are looked up by id; fresh picks prefer unseen questions at the
 * target difficulty and question types the user has not trained yet.
 */
export const pickTrainingQuestions = (input: PickQuestionsInput): HPTrainingQuestion[] => {
  const nowMs = input.now ?? Date.now();
  const out: HPTrainingQuestion[] = [];
  const usedIds = new Set<string>();

  // 1. Repetition questions — by stored id, falling back to weak-section picks.
  const repeatPerf = input.plan.repeatQuestionIds
    .map(id => input.performances[id])
    .filter((p): p is HPQuestionPerformance => Boolean(p));

  for (const perf of repeatPerf) {
    const pool = input.pools[perf.sectionCode];
    const found = pool?.bank.find(q => q.id === perf.questionId);
    if (found && !usedIds.has(found.id)) {
      usedIds.add(found.id);
      out.push({ ...found, reason: 'repeat' });
    }
  }

  // 2. Fresh questions per plan item.
  const recent = new Set(input.recentQuestionIds ?? []);
  for (const item of input.plan.items) {
    const pool = input.pools[item.sectionCode];
    if (!pool) continue;

    const targetRank = difficultyRank[item.targetDifficulty];
    const typesTrained = new Set(
      Object.values(input.performances)
        .filter(p => p.sectionCode === item.sectionCode)
        .map(p => {
          const q = pool.bank.find(b => b.id === p.questionId);
          return q?.questionType;
        })
        .filter((t): t is LocalHPQuestion['questionType'] => Boolean(t))
    );

    const candidates = pool.bank
      .filter(q => !usedIds.has(q.id) && !recent.has(q.id));

    // Score: unseen first, then difficulty fit, then untrained types, then staleness.
    const scored = candidates.map(q => {
      const perf = input.performances[q.id];
      let score = 0;
      if (!perf || perf.timesSeen === 0) score += 100;
      const rank = difficultyRank[q.difficulty];
      score += 40 - Math.abs(rank - targetRank) * 25;
      if (q.questionType && !typesTrained.has(q.questionType)) score += 30;
      if (perf?.lastSeenAt) {
        const sinceDays = daysBetween(perf.lastSeenAt, nowMs);
        if (sinceDays < 2) score -= 80;
        else score += Math.min(sinceDays, 14) * 2;
      }
      return { q, score };
    });

    scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);
    const picked = scored.slice(0, item.count);
    for (const { q } of picked) {
      usedIds.add(q.id);
      out.push({ ...q, reason: item.reason });
    }
  }

  // Trim to plan total (repeat fallbacks may have overflowed) and interleave
  // sections so the session feels varied rather than blocked.
  const total = input.plan.totalQuestions;
  const trimmed = shuffle(out).slice(0, total);

  // Keep repeats spread out: simple round-robin by section.
  const bySection = new Map<string, HPTrainingQuestion[]>();
  for (const q of trimmed) {
    const list = bySection.get(q.sectionCode) ?? [];
    list.push(q);
    bySection.set(q.sectionCode, list);
  }
  const interleaved: HPTrainingQuestion[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const list of bySection.values()) {
      const next = list.shift();
      if (next) {
        interleaved.push(next);
        added = true;
      }
    }
  }

  return interleaved;
};

// ─────────────────────────────────────────────────────────────────────────────
// Result computation
// ─────────────────────────────────────────────────────────────────────────────

export interface ComputeResultsInput {
  sessionId: string;
  questions: HPTrainingQuestion[];
  answers: Record<string, HPTrainingAnswer>;
  startedAt: number;
  performances: Record<string, HPQuestionPerformance>;
  now?: number;
}

export interface ComputeResultsOutput {
  results: HPTrainingResults;
  /** Per-question patches to upsert into Supabase. */
  performanceUpdates: HPQuestionPerformance[];
}

/**
 * Scores a finished session and derives the feedback loop:
 * updated per-question stats, weaknesses and new repetition points.
 */
export const computeTrainingResults = (
  input: ComputeResultsInput
): ComputeResultsOutput => {
  const nowMs = input.now ?? Date.now();
  const { questions, answers } = input;

  let correctCount = 0;
  let answeredCount = 0;
  const sectionAgg: Record<string, { total: number; correct: number }> = {};
  const performanceUpdates: HPQuestionPerformance[] = [];
  const newRepetitionPoints: HPTrainingResults['newRepetitionPoints'] = [];

  for (const q of questions) {
    if (!sectionAgg[q.sectionCode]) {
      sectionAgg[q.sectionCode] = { total: 0, correct: 0 };
    }
    sectionAgg[q.sectionCode].total += 1;

    const answer = answers[q.id];
    const isCorrect = answer?.answer === q.correctAnswer;
    if (answer) {
      answeredCount += 1;
      if (isCorrect) correctCount += 1;
      sectionAgg[q.sectionCode].correct += isCorrect ? 1 : 0;
    }

    const prev = input.performances[q.id];
    const seen = (prev?.timesSeen ?? 0) + 1;
    const correct = (prev?.timesCorrect ?? 0) + (isCorrect ? 1 : 0);
    const wrong = (prev?.timesWrong ?? 0) + (isCorrect ? 0 : 1);
    const prevAvg = prev?.avgTimeSeconds ?? 0;
    const avgTime = answer
      ? (prevAvg * (seen - 1) + answer.timeSpentSeconds) / seen
      : prevAvg;
    const consecutiveCorrect = isCorrect
      ? (prev?.consecutiveCorrect ?? 0) + 1
      : 0;
    const nextReviewAt = nextReviewDate(Math.max(consecutiveCorrect, 1), nowMs);

    performanceUpdates.push({
      questionId: q.id,
      sectionCode: q.sectionCode,
      timesSeen: seen,
      timesCorrect: correct,
      timesWrong: wrong,
      avgTimeSeconds: Math.round(avgTime * 10) / 10,
      consecutiveCorrect,
      lastSeenAt: new Date(nowMs).toISOString(),
      nextReviewAt,
      lastCorrect: isCorrect,
    });

    if (!isCorrect) {
      newRepetitionPoints.push({
        questionId: q.id,
        sectionCode: q.sectionCode,
        questionText: q.questionText,
        wasCorrect: false,
        nextReviewAt,
      });
    } else if (consecutiveCorrect === 1 && (prev?.timesWrong ?? 0) > 0) {
      // Repaired question — keep one more short repetition.
      newRepetitionPoints.push({
        questionId: q.id,
        sectionCode: q.sectionCode,
        questionText: q.questionText,
        wasCorrect: true,
        nextReviewAt,
      });
    }
  }

  const sectionResults = Object.entries(sectionAgg).map(([sectionCode, agg]) => ({
    sectionCode,
    total: agg.total,
    correct: agg.correct,
    accuracy: agg.total > 0 ? Math.round((agg.correct / agg.total) * 100) : 0,
  }));

  const weaknesses = sectionResults
    .filter(s => s.accuracy < WEAK_ACCURACY)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map(s => s.sectionCode);

  const results: HPTrainingResults = {
    sessionId: input.sessionId,
    completedAt: new Date(nowMs).toISOString(),
    totalQuestions: questions.length,
    answeredQuestions: answeredCount,
    correctCount,
    accuracy: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
    durationSeconds: Math.max(1, Math.round((nowMs - input.startedAt) / 1000)),
    sectionResults,
    weaknesses,
    newRepetitionPoints,
  };

  return { results, performanceUpdates };
};

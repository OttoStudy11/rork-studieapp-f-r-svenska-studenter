// Supabase-ready content layer for the HP platform.
// Merges bundled questions/theory with rows imported from Supabase, so the
// question bank and theory library can grow without app updates.
//
// Expected (optional) Supabase tables:
//   hp_question_bank: id, section_code, question_text, question_type, options (jsonb),
//     correct_answer, explanation, difficulty, topic, reading_passage, image_url, created_at
//   hp_theory_articles: id, category, title, subtitle, emoji, color, gradient (jsonb),
//     reading_minutes, section_code, sort_order, blocks (jsonb), created_at
// If the tables don't exist yet, everything falls back silently to bundled content.

import { supabase } from '@/lib/supabase';
import { HPQuestion } from '@/constants/hogskoleprovet';
import { HP_QUESTIONS_V2 } from '@/constants/hogskoleprovet-questions-v2';
import { ALL_HP_QUESTIONS } from '@/constants/hogskoleprovet-questions';
import { EXTENDED_HP_QUESTIONS } from '@/constants/hogskoleprovet-questions-extended';
import {
  HP_THEORY_ARTICLES,
  HPTheoryArticle,
  HPTheoryCategoryId,
} from '@/constants/hogskoleprovet-theory';
import { logger } from '@/utils/logger';

interface HPQuestionRow {
  id: string;
  section_code: string;
  question_text: string;
  question_type: string | null;
  options: unknown;
  correct_answer: string;
  explanation: string | null;
  difficulty: string | null;
  topic: string | null;
  reading_passage: string | null;
  image_url: string | null;
  created_at: string | null;
}

interface HPTheoryRow {
  id: string;
  category: string;
  title: string;
  subtitle: string | null;
  emoji: string | null;
  color: string | null;
  gradient: unknown;
  reading_minutes: number | null;
  section_code: string | null;
  sort_order: number | null;
  blocks: unknown;
  created_at: string | null;
}

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const VALID_CATEGORIES: HPTheoryCategoryId[] = ['intro', 'high-score', 'section-guide', 'study-technique', 'exam-strategy'];

const mapQuestionRow = (row: HPQuestionRow, index: number): HPQuestion | null => {
  const options = Array.isArray(row.options) ? row.options.filter((o): o is string => typeof o === 'string') : [];
  if (!row.id || !row.section_code || !row.question_text || !row.correct_answer || options.length < 2) {
    return null;
  }
  const difficulty = VALID_DIFFICULTIES.includes(row.difficulty as typeof VALID_DIFFICULTIES[number])
    ? (row.difficulty as HPQuestion['difficulty'])
    : 'medium';
  const questionType: HPQuestion['questionType'] =
    row.question_type === 'comparison' || row.question_type === 'reading_comprehension'
      ? row.question_type
      : 'multiple_choice';
  return {
    id: `sb-${row.id}`,
    sectionCode: row.section_code,
    questionNumber: index + 1,
    questionText: row.question_text,
    questionType,
    options,
    correctAnswer: row.correct_answer,
    explanation: row.explanation ?? '',
    difficulty,
    topic: row.topic ?? undefined,
    readingPassage: row.reading_passage ?? undefined,
    imageUrl: row.image_url ?? undefined,
    dateAdded: row.created_at ?? undefined,
    source: 'supabase',
  };
};

const mapTheoryRow = (row: HPTheoryRow): HPTheoryArticle | null => {
  if (!row.id || !row.title || !VALID_CATEGORIES.includes(row.category as HPTheoryCategoryId)) {
    return null;
  }
  const blocks = Array.isArray(row.blocks) ? (row.blocks as HPTheoryArticle['blocks']) : [];
  if (blocks.length === 0) return null;
  const gradient: readonly [string, string] =
    Array.isArray(row.gradient) && row.gradient.length >= 2 && typeof row.gradient[0] === 'string'
      ? [row.gradient[0] as string, row.gradient[1] as string]
      : ['#6366F1', '#8B5CF6'];
  return {
    id: `sb-${row.id}`,
    category: row.category as HPTheoryCategoryId,
    title: row.title,
    subtitle: row.subtitle ?? '',
    emoji: row.emoji ?? '📘',
    color: row.color ?? '#6366F1',
    gradient,
    readingMinutes: row.reading_minutes ?? Math.max(3, Math.round(JSON.stringify(blocks).length / 1500)),
    sectionCode: row.section_code ?? undefined,
    order: row.sort_order ?? 999,
    blocks,
    source: 'supabase',
  };
};

/** All bundled questions (legacy banks + V2 metadata bank) */
export const getLocalQuestionBank = (): HPQuestion[] => [
  ...ALL_HP_QUESTIONS,
  ...EXTENDED_HP_QUESTIONS,
  ...HP_QUESTIONS_V2,
];

/**
 * Untyped table access for content tables that may not exist yet in the
 * generated Supabase types. Falls back gracefully when the table is missing.
 */
const fetchRows = async (table: string, limit: number): Promise<unknown[] | null> => {
  const client = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        limit: (n: number) => Promise<{ data: unknown[] | null; error: unknown }>;
      };
    };
  };
  const { data, error } = await client.from(table).select('*').limit(limit);
  if (error || !data) return null;
  return data;
};

/**
 * Fetches remotely imported questions and merges them with the bundled bank.
 * Silently falls back to local content if the table is missing or offline.
 */
export const fetchMergedQuestionBank = async (): Promise<HPQuestion[]> => {
  const local = getLocalQuestionBank();
  try {
    const data = await fetchRows('hp_question_bank', 2000);
    if (!data) {
      return local;
    }
    const remote = (data as HPQuestionRow[])
      .map(mapQuestionRow)
      .filter((q): q is HPQuestion => q !== null);
    const localIds = new Set(local.map(q => q.id));
    return [...local, ...remote.filter(q => !localIds.has(q.id))];
  } catch (e) {
    logger.warn('[hp-content]', 'question bank fetch failed, using local bank', e);
    return local;
  }
};

/**
 * Fetches remotely imported theory articles and merges them with the bundled library.
 * Silently falls back to local content if the table is missing or offline.
 */
export const fetchMergedTheoryArticles = async (): Promise<HPTheoryArticle[]> => {
  const local = HP_THEORY_ARTICLES;
  try {
    const data = await fetchRows('hp_theory_articles', 500);
    if (!data) {
      return local;
    }
    const remote = (data as HPTheoryRow[])
      .map(mapTheoryRow)
      .filter((a): a is HPTheoryArticle => a !== null);
    const localIds = new Set(local.map(a => a.id));
    return [...local, ...remote.filter(a => !localIds.has(a.id))];
  } catch (e) {
    logger.warn('[hp-content]', 'theory fetch failed, using local library', e);
    return local;
  }
};

/** Question bank statistics per section, e.g. for showing bank size in the UI */
export const getQuestionBankStats = (questions: HPQuestion[]): Record<string, { total: number; easy: number; medium: number; hard: number; topics: string[] }> => {
  const stats: Record<string, { total: number; easy: number; medium: number; hard: number; topics: string[] }> = {};
  for (const q of questions) {
    if (!stats[q.sectionCode]) {
      stats[q.sectionCode] = { total: 0, easy: 0, medium: 0, hard: 0, topics: [] };
    }
    const s = stats[q.sectionCode];
    s.total += 1;
    s[q.difficulty] += 1;
    if (q.topic && !s.topics.includes(q.topic)) {
      s.topics.push(q.topic);
    }
  }
  return stats;
};

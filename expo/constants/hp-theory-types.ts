// Types for the HP Theory Hub — a dynamic, Supabase-ready content library.
// Articles are pure data rendered by generic components, so new content can be
// imported from Supabase without any UI changes.

export type HPTheoryCategoryId =
  | 'intro'
  | 'high-score'
  | 'section-guide'
  | 'study-technique'
  | 'exam-strategy';

export interface HPTheoryCategory {
  id: HPTheoryCategoryId;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  gradient: readonly [string, string];
}

export type HPTheoryBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'tip'; text: string }
  | { type: 'warning'; text: string }
  | { type: 'stat'; value: string; label: string }
  | {
      type: 'example';
      title: string;
      question: string;
      options?: string[];
      answer: string;
      explanation: string;
    };

export interface HPTheoryArticle {
  id: string;
  category: HPTheoryCategoryId;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  gradient: readonly [string, string];
  readingMinutes: number;
  /** For section guides: which HP section this article covers */
  sectionCode?: string;
  /** Sort order within its category */
  order: number;
  blocks: HPTheoryBlock[];
  /** Source of the article: bundled locally or imported from Supabase */
  source?: 'local' | 'supabase';
}

export const HP_THEORY_CATEGORIES: HPTheoryCategory[] = [
  {
    id: 'intro',
    title: 'Introduktion',
    subtitle: 'Allt du behöver veta om Högskoleprovet',
    emoji: '🎓',
    color: '#6366F1',
    gradient: ['#6366F1', '#8B5CF6'] as const,
  },
  {
    id: 'high-score',
    title: 'Nå toppresultat',
    subtitle: 'Så pluggar de som får 1.7+',
    emoji: '🏆',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#FBBF24'] as const,
  },
  {
    id: 'section-guide',
    title: 'Delprovsguider',
    subtitle: 'Djupdykningar i alla åtta delprov',
    emoji: '📚',
    color: '#10B981',
    gradient: ['#10B981', '#34D399'] as const,
  },
  {
    id: 'study-technique',
    title: 'Studietekniker',
    subtitle: 'Vetenskapligt bevisade metoder',
    emoji: '🧠',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'] as const,
  },
  {
    id: 'exam-strategy',
    title: 'Provstrategier',
    subtitle: 'Taktik för själva provdagen',
    emoji: '⚡',
    color: '#EC4899',
    gradient: ['#EC4899', '#F472B6'] as const,
  },
];

export const getTheoryCategoryById = (id: HPTheoryCategoryId): HPTheoryCategory =>
  HP_THEORY_CATEGORIES.find(c => c.id === id) ?? HP_THEORY_CATEGORIES[0];

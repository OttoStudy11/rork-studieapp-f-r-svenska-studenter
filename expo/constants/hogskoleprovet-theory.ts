// HP Theory Hub — index that merges all bundled theory articles.
// Remote articles from Supabase are merged on top via lib/hp-content.ts,
// so new content can be added without any UI changes.

import { HPTheoryArticle, HPTheoryCategoryId, HP_THEORY_CATEGORIES, getTheoryCategoryById } from './hp-theory-types';
import { HP_THEORY_INTRO, HP_THEORY_HIGH_SCORE } from './hp-theory-intro';
import { HP_THEORY_SECTIONS } from './hp-theory-sections';
import { HP_THEORY_TECHNIQUES, HP_THEORY_EXAM_STRATEGIES } from './hp-theory-techniques';

export { HP_THEORY_CATEGORIES, getTheoryCategoryById };
export type { HPTheoryArticle, HPTheoryCategoryId };

export const HP_THEORY_ARTICLES: HPTheoryArticle[] = [
  ...HP_THEORY_INTRO,
  ...HP_THEORY_HIGH_SCORE,
  ...HP_THEORY_SECTIONS,
  ...HP_THEORY_TECHNIQUES,
  ...HP_THEORY_EXAM_STRATEGIES,
];

export const getTheoryArticleById = (id: string): HPTheoryArticle | undefined =>
  HP_THEORY_ARTICLES.find(a => a.id === id);

export const getTheoryArticlesByCategory = (category: HPTheoryCategoryId): HPTheoryArticle[] =>
  HP_THEORY_ARTICLES.filter(a => a.category === category).sort((a, b) => a.order - b.order);

export const getTheoryArticleBySection = (sectionCode: string): HPTheoryArticle | undefined =>
  HP_THEORY_ARTICLES.find(a => a.category === 'section-guide' && a.sectionCode === sectionCode);

export const getTotalTheoryReadingMinutes = (): number =>
  HP_THEORY_ARTICLES.reduce((sum, a) => sum + a.readingMinutes, 0);

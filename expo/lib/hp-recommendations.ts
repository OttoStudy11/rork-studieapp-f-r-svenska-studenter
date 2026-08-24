// Personalized HP recommendations based on the user's practice history.
// Pure functions — takes stats in, returns prioritized recommendations out.

import { HP_SECTIONS } from '@/constants/hogskoleprovet';
import { getTheoryArticleBySection, getTheoryArticleById, HPTheoryArticle } from '@/constants/hogskoleprovet-theory';

export interface HPSectionStatsLike {
  attempts: number;
  averageScore: number;
  bestScore: number;
  lastAttempt?: string;
}

export interface HPRecommendationInput {
  totalAttempts: number;
  currentStreak: number;
  sectionStats: Record<string, HPSectionStatsLike>;
  /** Article ids the user has already finished reading */
  readArticleIds?: string[];
}

export type HPRecommendationType = 'theory' | 'practice' | 'simulation' | 'start';

export interface HPRecommendation {
  id: string;
  type: HPRecommendationType;
  title: string;
  message: string;
  /** Theory article to open, when type is 'theory' */
  articleId?: string;
  /** Section to practice, when type is 'practice' */
  sectionCode?: string;
  emoji: string;
  color: string;
  priority: number;
}

const WEAK_THRESHOLD = 60;
const STALE_DAYS = 10;

const daysSince = (iso?: string): number => {
  if (!iso) return Number.MAX_SAFE_INTEGER;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.MAX_SAFE_INTEGER;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
};

/**
 * Builds a prioritized list of personalized recommendations from user stats.
 * Returns at most `limit` items, highest priority first.
 */
export const buildHPRecommendations = (input: HPRecommendationInput, limit = 3): HPRecommendation[] => {
  const recs: HPRecommendation[] = [];
  const readIds = new Set(input.readArticleIds ?? []);

  // Brand-new user: point to the intro + first practice
  if (input.totalAttempts === 0) {
    recs.push({
      id: 'start-intro',
      type: 'theory',
      articleId: 'intro-what-is-hp',
      title: 'Börja med grunderna',
      message: 'Ny inför provet? Läs "Vad är Högskoleprovet?" så förstår du hela upplägget på 5 minuter.',
      emoji: '🎓',
      color: '#6366F1',
      priority: 100,
    });
    recs.push({
      id: 'start-baseline',
      type: 'start',
      title: 'Gör din första övning',
      message: 'Ett första övningspass ger dig en baslinje — då vet du exakt vad du ska träna på.',
      emoji: '🎯',
      color: '#10B981',
      priority: 90,
    });
    return recs.slice(0, limit);
  }

  // Weak sections: recommend theory guide + practice
  const scored = HP_SECTIONS
    .map(s => ({ section: s, stats: input.sectionStats[s.code] }))
    .filter(x => x.stats && x.stats.attempts > 0);

  const weak = scored
    .filter(x => (x.stats?.averageScore ?? 100) < WEAK_THRESHOLD)
    .sort((a, b) => (a.stats?.averageScore ?? 0) - (b.stats?.averageScore ?? 0));

  weak.slice(0, 2).forEach((x, i) => {
    const guide: HPTheoryArticle | undefined = getTheoryArticleBySection(x.section.code);
    if (guide && !readIds.has(guide.id)) {
      recs.push({
        id: `theory-${x.section.code}`,
        type: 'theory',
        articleId: guide.id,
        sectionCode: x.section.code,
        title: `Läs på om ${x.section.code}`,
        message: `Du har haft det tufft med ${x.section.code} (${Math.round(x.stats?.averageScore ?? 0)}% rätt). Läs teoriguiden innan du övar vidare — strategin gör ofta större skillnad än mer nötande.`,
        emoji: x.section.icon,
        color: x.section.color,
        priority: 80 - i * 5,
      });
    }
    recs.push({
      id: `practice-${x.section.code}`,
      type: 'practice',
      sectionCode: x.section.code,
      title: `Träna ${x.section.code} idag`,
      message: `${x.section.fullName} är just nu ditt svagaste delprov. Ett kort riktat pass idag ger störst effekt på totalen.`,
      emoji: '💪',
      color: x.section.color,
      priority: 75 - i * 5,
    });
  });

  // Untouched sections
  const untouched = HP_SECTIONS.filter(s => !input.sectionStats[s.code] || input.sectionStats[s.code].attempts === 0);
  if (untouched.length > 0 && untouched.length < HP_SECTIONS.length) {
    const s = untouched[0];
    recs.push({
      id: `explore-${s.code}`,
      type: 'practice',
      sectionCode: s.code,
      title: `Du har inte provat ${s.code} än`,
      message: `Testa ${s.fullName} — provets totala poäng byggs av alla åtta delprov.`,
      emoji: s.icon,
      color: s.color,
      priority: 60,
    });
  }

  // Stale sections: practiced before but not recently
  const stale = scored
    .filter(x => daysSince(x.stats?.lastAttempt) >= STALE_DAYS && (x.stats?.averageScore ?? 0) >= WEAK_THRESHOLD)
    .sort((a, b) => daysSince(b.stats?.lastAttempt) - daysSince(a.stats?.lastAttempt));
  if (stale.length > 0) {
    const s = stale[0].section;
    recs.push({
      id: `refresh-${s.code}`,
      type: 'practice',
      sectionCode: s.code,
      title: `Dags att repetera ${s.code}`,
      message: `Det var ett tag sedan du övade ${s.fullName}. Utan repetition bleknar färdigheten — kör ett kort pass.`,
      emoji: '🔄',
      color: s.color,
      priority: 50,
    });
  }

  // Experienced user: push full simulation
  if (input.totalAttempts >= 5) {
    const simGuide = getTheoryArticleById('tech-exam-simulation');
    recs.push({
      id: 'full-simulation',
      type: 'simulation',
      articleId: simGuide && !readIds.has(simGuide.id) ? simGuide.id : undefined,
      title: 'Skriv ett helt prov',
      message: 'Du har övat flitigt — nu ger en full provsimulering under tidspress mest. Den visar din verkliga nivå.',
      emoji: '⏱️',
      color: '#EC4899',
      priority: 45,
    });
  }

  // Streak encouragement
  if (input.currentStreak >= 3) {
    recs.push({
      id: 'streak-keep',
      type: 'practice',
      title: `${input.currentStreak} dagars streak!`,
      message: 'Håll serien vid liv — även 10 minuters övning idag räknas.',
      emoji: '🔥',
      color: '#F97316',
      priority: 30,
    });
  }

  // Fallback theory recommendation if list is thin
  if (recs.length < limit) {
    const fallback = ['hs-top-performers', 'strat-time-management', 'tech-active-recall']
      .map(id => getTheoryArticleById(id))
      .find(a => a && !readIds.has(a.id));
    if (fallback) {
      recs.push({
        id: `read-${fallback.id}`,
        type: 'theory',
        articleId: fallback.id,
        title: fallback.title,
        message: fallback.subtitle,
        emoji: fallback.emoji,
        color: fallback.color,
        priority: 20,
      });
    }
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, limit);
};

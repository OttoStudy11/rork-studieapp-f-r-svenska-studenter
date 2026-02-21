export const FREEMIUM_LIMITS = {
  quiz: { daily: 3 },
  courseQuiz: { daily: 3 },
  friendStats: { weekly: 1 },
  flashcardsPerCourse: 20,
  studyPlans: 1,
  hpSections: 1,
  courseModules: 1,
} as const;

export type FreemiumFeature =
  | 'quiz'
  | 'course_quiz'
  | 'friend_stats'
  | 'flashcards'
  | 'study_plan'
  | 'hp_section'
  | 'course_module';

export interface FreemiumStatus {
  isAllowed: boolean;
  remaining: number;
  total: number;
  resetAt: Date | null;
  isPremium: boolean;
}

export function getResetLabel(resetAt: Date | null): string {
  if (!resetAt) return '';
  const now = new Date();
  const diffMs = resetAt.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours >= 24) {
    const days = Math.ceil(diffHours / 24);
    return `Återställs om ${days} ${days === 1 ? 'dag' : 'dagar'}`;
  }
  if (diffHours > 0) {
    return `Återställs om ${diffHours}h ${diffMins}m`;
  }
  if (diffMins > 0) {
    return `Återställs om ${diffMins} min`;
  }
  return 'Återställs snart';
}

export function getFeatureLabel(feature: FreemiumFeature): string {
  switch (feature) {
    case 'quiz': return 'quiz';
    case 'course_quiz': return 'quiz';
    case 'friend_stats': return 'vänjämförelse';
    case 'flashcards': return 'flashcards';
    case 'study_plan': return 'studieplan';
    case 'hp_section': return 'HP-delprov';
    case 'course_module': return 'kursmodul';
  }
}

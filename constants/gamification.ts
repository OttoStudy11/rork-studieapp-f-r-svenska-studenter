export type TierType = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master' | 'legend';
export type RarityType = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export interface LevelDefinition {
  level: number;
  requiredXp: number;
  tier: TierType;
  tierColor: string;
  iconEmoji: string;
  title: string;
  titleSv: string;
  description: string;
}

export interface PointSource {
  type: string;
  baseXp: number;
  description: string;
}

export const TIER_COLORS: Record<TierType, string> = {
  beginner: '#9CA3AF',
  intermediate: '#3B82F6',
  advanced: '#8B5CF6',
  expert: '#EC4899',
  master: '#F59E0B',
  legend: '#EF4444',
};

export const TIER_NAMES: Record<TierType, { en: string; sv: string }> = {
  beginner: { en: 'Beginner', sv: 'Nybörjare' },
  intermediate: { en: 'Intermediate', sv: 'Mellanliggande' },
  advanced: { en: 'Advanced', sv: 'Avancerad' },
  expert: { en: 'Expert', sv: 'Expert' },
  master: { en: 'Master', sv: 'Mästare' },
  legend: { en: 'Legend', sv: 'Legend' },
};

export const RARITY_COLORS: Record<RarityType, string> = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

export const RARITY_NAMES: Record<RarityType, { en: string; sv: string }> = {
  common: { en: 'Common', sv: 'Vanlig' },
  uncommon: { en: 'Uncommon', sv: 'Ovanlig' },
  rare: { en: 'Rare', sv: 'Sällsynt' },
  epic: { en: 'Epic', sv: 'Episk' },
  legendary: { en: 'Legendary', sv: 'Legendarisk' },
};

export const DIFFICULTY_CONFIG: Record<ChallengeDifficulty, { color: string; xpMultiplier: number; label: string }> = {
  easy: { color: '#10B981', xpMultiplier: 1, label: 'Lätt' },
  medium: { color: '#F59E0B', xpMultiplier: 1.5, label: 'Medel' },
  hard: { color: '#EF4444', xpMultiplier: 2.5, label: 'Svår' },
};

export const LEVELS: LevelDefinition[] = [
  { level: 1, requiredXp: 0, tier: 'beginner', tierColor: '#9CA3AF', iconEmoji: '🌱', title: 'Newcomer', titleSv: 'Nybörjare', description: 'Just starting your learning journey' },
  { level: 2, requiredXp: 100, tier: 'beginner', tierColor: '#9CA3AF', iconEmoji: '📚', title: 'Student', titleSv: 'Student', description: 'Beginning to learn' },
  { level: 3, requiredXp: 250, tier: 'beginner', tierColor: '#9CA3AF', iconEmoji: '✏️', title: 'Learner', titleSv: 'Lärling', description: 'Developing study habits' },
  { level: 4, requiredXp: 450, tier: 'beginner', tierColor: '#9CA3AF', iconEmoji: '📖', title: 'Apprentice', titleSv: 'Lärjunge', description: 'Growing knowledge' },
  { level: 5, requiredXp: 700, tier: 'beginner', tierColor: '#9CA3AF', iconEmoji: '🎯', title: 'Focused', titleSv: 'Fokuserad', description: 'Building consistency' },
  { level: 6, requiredXp: 1000, tier: 'beginner', tierColor: '#10B981', iconEmoji: '🌟', title: 'Dedicated', titleSv: 'Dedikerad', description: 'Committed to learning' },
  { level: 7, requiredXp: 1350, tier: 'beginner', tierColor: '#10B981', iconEmoji: '💡', title: 'Bright', titleSv: 'Ljus', description: 'Ideas are flowing' },
  { level: 8, requiredXp: 1750, tier: 'beginner', tierColor: '#10B981', iconEmoji: '🔥', title: 'On Fire', titleSv: 'På Eld', description: 'Burning with passion' },
  { level: 9, requiredXp: 2200, tier: 'beginner', tierColor: '#10B981', iconEmoji: '⚡', title: 'Energized', titleSv: 'Energisk', description: 'Full of energy' },
  { level: 10, requiredXp: 2700, tier: 'intermediate', tierColor: '#3B82F6', iconEmoji: '🚀', title: 'Rising Star', titleSv: 'Stigande Stjärna', description: 'Taking off!' },
  { level: 11, requiredXp: 3300, tier: 'intermediate', tierColor: '#3B82F6', iconEmoji: '🎖️', title: 'Achiever', titleSv: 'Presterare', description: 'Achieving goals' },
  { level: 12, requiredXp: 4000, tier: 'intermediate', tierColor: '#3B82F6', iconEmoji: '🏅', title: 'Medal Winner', titleSv: 'Medaljvinnare', description: 'Earning recognition' },
  { level: 13, requiredXp: 4800, tier: 'intermediate', tierColor: '#3B82F6', iconEmoji: '🎓', title: 'Scholar', titleSv: 'Lärd', description: 'Deep understanding' },
  { level: 14, requiredXp: 5700, tier: 'intermediate', tierColor: '#3B82F6', iconEmoji: '📊', title: 'Analyst', titleSv: 'Analytiker', description: 'Critical thinking' },
  { level: 15, requiredXp: 6700, tier: 'intermediate', tierColor: '#3B82F6', iconEmoji: '🧠', title: 'Intellectual', titleSv: 'Intellektuell', description: 'Sharp mind' },
  { level: 16, requiredXp: 7800, tier: 'intermediate', tierColor: '#3B82F6', iconEmoji: '💎', title: 'Gem', titleSv: 'Juvel', description: 'Precious knowledge' },
  { level: 17, requiredXp: 9000, tier: 'intermediate', tierColor: '#3B82F6', iconEmoji: '🌈', title: 'Versatile', titleSv: 'Mångsidig', description: 'Well-rounded' },
  { level: 18, requiredXp: 10300, tier: 'intermediate', tierColor: '#3B82F6', iconEmoji: '🎪', title: 'Performer', titleSv: 'Utförare', description: 'Consistent performer' },
  { level: 19, requiredXp: 11700, tier: 'intermediate', tierColor: '#3B82F6', iconEmoji: '🎭', title: 'Virtuoso', titleSv: 'Virtuos', description: 'Skilled learner' },
  { level: 20, requiredXp: 13200, tier: 'advanced', tierColor: '#8B5CF6', iconEmoji: '⭐', title: 'Star', titleSv: 'Stjärna', description: 'Shining bright' },
  { level: 21, requiredXp: 14800, tier: 'advanced', tierColor: '#8B5CF6', iconEmoji: '🌙', title: 'Luminary', titleSv: 'Lysande', description: 'Guiding light' },
  { level: 22, requiredXp: 16500, tier: 'advanced', tierColor: '#8B5CF6', iconEmoji: '☀️', title: 'Radiant', titleSv: 'Strålande', description: 'Bright future' },
  { level: 23, requiredXp: 18300, tier: 'advanced', tierColor: '#8B5CF6', iconEmoji: '🔮', title: 'Visionary', titleSv: 'Visionär', description: 'Seeing ahead' },
  { level: 24, requiredXp: 20200, tier: 'advanced', tierColor: '#8B5CF6', iconEmoji: '🎯', title: 'Marksman', titleSv: 'Prickskytt', description: 'Hitting targets' },
  { level: 25, requiredXp: 22200, tier: 'advanced', tierColor: '#8B5CF6', iconEmoji: '🏆', title: 'Champion', titleSv: 'Mästare', description: 'Top performer' },
  { level: 26, requiredXp: 24300, tier: 'advanced', tierColor: '#8B5CF6', iconEmoji: '🛡️', title: 'Guardian', titleSv: 'Väktare', description: 'Protecting knowledge' },
  { level: 27, requiredXp: 26500, tier: 'advanced', tierColor: '#8B5CF6', iconEmoji: '⚔️', title: 'Warrior', titleSv: 'Krigare', description: 'Fighting for success' },
  { level: 28, requiredXp: 28800, tier: 'advanced', tierColor: '#8B5CF6', iconEmoji: '🦅', title: 'Eagle', titleSv: 'Örn', description: 'Soaring high' },
  { level: 29, requiredXp: 31200, tier: 'advanced', tierColor: '#8B5CF6', iconEmoji: '🐉', title: 'Dragon', titleSv: 'Drake', description: 'Powerful presence' },
  { level: 30, requiredXp: 33700, tier: 'expert', tierColor: '#EC4899', iconEmoji: '👑', title: 'Royalty', titleSv: 'Kunglig', description: 'Ruling the realm' },
  { level: 31, requiredXp: 36300, tier: 'expert', tierColor: '#EC4899', iconEmoji: '💫', title: 'Cosmic', titleSv: 'Kosmisk', description: 'Universal knowledge' },
  { level: 32, requiredXp: 39000, tier: 'expert', tierColor: '#EC4899', iconEmoji: '🌌', title: 'Galactic', titleSv: 'Galaktisk', description: 'Expanding horizons' },
  { level: 33, requiredXp: 41800, tier: 'expert', tierColor: '#EC4899', iconEmoji: '🎇', title: 'Spectacular', titleSv: 'Spektakulär', description: 'Awe-inspiring' },
  { level: 34, requiredXp: 44700, tier: 'expert', tierColor: '#EC4899', iconEmoji: '🏛️', title: 'Sage', titleSv: 'Vis', description: 'Ancient wisdom' },
  { level: 35, requiredXp: 47700, tier: 'expert', tierColor: '#EC4899', iconEmoji: '📜', title: 'Scribe', titleSv: 'Skrivare', description: 'Recording history' },
  { level: 36, requiredXp: 50800, tier: 'expert', tierColor: '#EC4899', iconEmoji: '🗝️', title: 'Keymaster', titleSv: 'Nyckelmästare', description: 'Unlocking secrets' },
  { level: 37, requiredXp: 54000, tier: 'expert', tierColor: '#EC4899', iconEmoji: '🌀', title: 'Mystic', titleSv: 'Mystiker', description: 'Deep mysteries' },
  { level: 38, requiredXp: 57300, tier: 'expert', tierColor: '#EC4899', iconEmoji: '✨', title: 'Enchanter', titleSv: 'Förtrollare', description: 'Magical learning' },
  { level: 39, requiredXp: 60700, tier: 'expert', tierColor: '#EC4899', iconEmoji: '🔱', title: 'Trident', titleSv: 'Treudd', description: 'Triple power' },
  { level: 40, requiredXp: 64200, tier: 'master', tierColor: '#F59E0B', iconEmoji: '🌟', title: 'Grandmaster', titleSv: 'Stormästare', description: 'Peak mastery' },
  { level: 41, requiredXp: 67800, tier: 'master', tierColor: '#F59E0B', iconEmoji: '💠', title: 'Diamond', titleSv: 'Diamant', description: 'Unbreakable' },
  { level: 42, requiredXp: 71500, tier: 'master', tierColor: '#F59E0B', iconEmoji: '🔶', title: 'Amber', titleSv: 'Bärnsten', description: 'Preserved excellence' },
  { level: 43, requiredXp: 75300, tier: 'master', tierColor: '#F59E0B', iconEmoji: '🏰', title: 'Fortress', titleSv: 'Fästning', description: 'Unshakeable' },
  { level: 44, requiredXp: 79200, tier: 'master', tierColor: '#F59E0B', iconEmoji: '⚜️', title: 'Noble', titleSv: 'Ädel', description: 'Distinguished' },
  { level: 45, requiredXp: 83200, tier: 'master', tierColor: '#F59E0B', iconEmoji: '🎺', title: 'Herald', titleSv: 'Härold', description: 'Announcing greatness' },
  { level: 46, requiredXp: 87300, tier: 'master', tierColor: '#F59E0B', iconEmoji: '🦁', title: 'Lion', titleSv: 'Lejon', description: 'King of learning' },
  { level: 47, requiredXp: 91500, tier: 'master', tierColor: '#F59E0B', iconEmoji: '🦋', title: 'Metamorphosis', titleSv: 'Metamorfos', description: 'Complete transformation' },
  { level: 48, requiredXp: 95800, tier: 'master', tierColor: '#F59E0B', iconEmoji: '🌠', title: 'Shooting Star', titleSv: 'Stjärnfall', description: 'Blazing trail' },
  { level: 49, requiredXp: 100200, tier: 'master', tierColor: '#F59E0B', iconEmoji: '🎆', title: 'Supernova', titleSv: 'Supernova', description: 'Explosive brilliance' },
  { level: 50, requiredXp: 104700, tier: 'legend', tierColor: '#EF4444', iconEmoji: '👑', title: 'Legend', titleSv: 'Legend', description: 'Eternal greatness' },
];

export const POINT_SOURCES: Record<string, PointSource> = {
  lesson_complete: { type: 'lesson_complete', baseXp: 10, description: 'Slutför en lektion' },
  quiz_50_75: { type: 'quiz_complete', baseXp: 10, description: 'Quiz med 50-75% rätt' },
  quiz_75_90: { type: 'quiz_complete', baseXp: 20, description: 'Quiz med 75-90% rätt' },
  quiz_90_100: { type: 'quiz_complete', baseXp: 30, description: 'Quiz med 90-100% rätt' },
  daily_streak: { type: 'daily_streak', baseXp: 5, description: 'Daglig streak bonus' },
  challenge_easy: { type: 'challenge_complete', baseXp: 35, description: 'Lätt utmaning' },
  challenge_medium: { type: 'challenge_complete', baseXp: 75, description: 'Medel utmaning' },
  challenge_hard: { type: 'challenge_complete', baseXp: 150, description: 'Svår utmaning' },
  first_achievement: { type: 'achievement_unlock', baseXp: 25, description: 'Första prestationen' },
  level_up_bonus: { type: 'level_up_bonus', baseXp: 50, description: 'Nivå upp bonus' },
  module_complete: { type: 'module_complete', baseXp: 50, description: 'Modul slutförd' },
  off_peak_bonus: { type: 'off_peak_bonus', baseXp: 10, description: 'Studera under lugna timmar' },
  study_session: { type: 'lesson_complete', baseXp: 5, description: 'Per minut studietid' },
};

export const getLevelForXp = (totalXp: number): LevelDefinition => {
  let result = LEVELS[0];
  for (const level of LEVELS) {
    if (totalXp >= level.requiredXp) {
      result = level;
    } else {
      break;
    }
  }
  return result;
};

export const getXpProgress = (totalXp: number): { current: number; required: number; percent: number; nextLevel: LevelDefinition | null } => {
  const currentLevel = getLevelForXp(totalXp);
  const nextLevelDef = LEVELS.find(l => l.level === currentLevel.level + 1);
  
  if (!nextLevelDef) {
    return { current: totalXp - currentLevel.requiredXp, required: 0, percent: 100, nextLevel: null };
  }
  
  const xpInCurrentLevel = totalXp - currentLevel.requiredXp;
  const xpRequiredForLevel = nextLevelDef.requiredXp - currentLevel.requiredXp;
  const percent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForLevel) * 100));
  
  return {
    current: xpInCurrentLevel,
    required: xpRequiredForLevel,
    percent,
    nextLevel: nextLevelDef,
  };
};

export const calculateQuizXp = (scorePercent: number): number => {
  if (scorePercent >= 90) return POINT_SOURCES.quiz_90_100.baseXp;
  if (scorePercent >= 75) return POINT_SOURCES.quiz_75_90.baseXp;
  if (scorePercent >= 50) return POINT_SOURCES.quiz_50_75.baseXp;
  return 0;
};

export const calculateStudySessionXp = (minutes: number): number => {
  return Math.floor(minutes) * POINT_SOURCES.study_session.baseXp;
};

export const isOffPeakHour = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 5 && hour < 8;
};

export const getAchievementXpByRarity = (rarity: RarityType): { min: number; max: number } => {
  const ranges: Record<RarityType, { min: number; max: number }> = {
    common: { min: 25, max: 50 },
    uncommon: { min: 75, max: 150 },
    rare: { min: 200, max: 350 },
    epic: { min: 400, max: 600 },
    legendary: { min: 750, max: 1000 },
  };
  return ranges[rarity];
};

export const formatXp = (xp: number): string => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
};

export const getTierForLevel = (level: number): TierType => {
  if (level >= 50) return 'legend';
  if (level >= 40) return 'master';
  if (level >= 30) return 'expert';
  if (level >= 20) return 'advanced';
  if (level >= 10) return 'intermediate';
  return 'beginner';
};

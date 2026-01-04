export const XP_VALUES = {
  LESSON_EASY_COMPLETE: 10,
  LESSON_MEDIUM_COMPLETE: 15,
  LESSON_HARD_COMPLETE: 25,
  
  EXERCISE_EASY_COMPLETE: 15,
  EXERCISE_MEDIUM_COMPLETE: 25,
  EXERCISE_HARD_COMPLETE: 40,
  
  QUIZ_50_75_PERCENT: 20,
  QUIZ_75_90_PERCENT: 35,
  QUIZ_90_100_PERCENT: 50,
  
  PERFECT_QUIZ_BONUS: 25,
  PERFECT_EXERCISE_BONUS: 20,
  
  STREAK_DAILY_BONUS: 5,
  STREAK_WEEKLY_BONUS: 50,
  STREAK_MONTHLY_BONUS: 200,
  
  MODULE_COMPLETION: 100,
  COURSE_COMPLETION_BASE: 250,
  COURSE_COMPLETION_BONUS_PER_HOUR: 10,
  
  ACHIEVEMENT_COMMON: 25,
  ACHIEVEMENT_UNCOMMON: 75,
  ACHIEVEMENT_RARE: 200,
  ACHIEVEMENT_EPIC: 400,
  ACHIEVEMENT_LEGENDARY: 750,
  
  DAILY_CHALLENGE_EASY: 30,
  DAILY_CHALLENGE_MEDIUM: 60,
  DAILY_CHALLENGE_HARD: 120,
  
  ONBOARDING_COMPLETION: 50,
  FIRST_LESSON_BONUS: 25,
  FIRST_COURSE_ENROLLMENT: 50,
  
  EARLY_MORNING_STUDY_BONUS: 5,
  LATE_NIGHT_STUDY_BONUS: 5,
  LONG_SESSION_BONUS: 50,
  FOCUS_STREAK_BONUS: 25,
} as const;

export type XPType = keyof typeof XP_VALUES;

export const LEVEL_REQUIREMENTS: Record<number, { xp_required: number; tier: string; color: string }> = {
  1: { xp_required: 0, tier: "Beginner", color: "#64748B" },
  2: { xp_required: 100, tier: "Beginner", color: "#64748B" },
  3: { xp_required: 250, tier: "Beginner", color: "#64748B" },
  4: { xp_required: 450, tier: "Beginner", color: "#64748B" },
  5: { xp_required: 700, tier: "Beginner", color: "#64748B" },
  6: { xp_required: 1000, tier: "Intermediate", color: "#3B82F6" },
  7: { xp_required: 1350, tier: "Intermediate", color: "#3B82F6" },
  8: { xp_required: 1750, tier: "Intermediate", color: "#3B82F6" },
  9: { xp_required: 2200, tier: "Intermediate", color: "#3B82F6" },
  10: { xp_required: 2700, tier: "Intermediate", color: "#3B82F6" },
  11: { xp_required: 3250, tier: "Intermediate", color: "#3B82F6" },
  12: { xp_required: 3850, tier: "Intermediate", color: "#3B82F6" },
  13: { xp_required: 4500, tier: "Intermediate", color: "#3B82F6" },
  14: { xp_required: 5200, tier: "Intermediate", color: "#3B82F6" },
  15: { xp_required: 5950, tier: "Intermediate", color: "#3B82F6" },
  16: { xp_required: 6750, tier: "Advanced", color: "#8B5CF6" },
  17: { xp_required: 7600, tier: "Advanced", color: "#8B5CF6" },
  18: { xp_required: 8500, tier: "Advanced", color: "#8B5CF6" },
  19: { xp_required: 9450, tier: "Advanced", color: "#8B5CF6" },
  20: { xp_required: 10450, tier: "Advanced", color: "#8B5CF6" },
  21: { xp_required: 11500, tier: "Advanced", color: "#8B5CF6" },
  22: { xp_required: 12600, tier: "Advanced", color: "#8B5CF6" },
  23: { xp_required: 13750, tier: "Advanced", color: "#8B5CF6" },
  24: { xp_required: 14950, tier: "Advanced", color: "#8B5CF6" },
  25: { xp_required: 16200, tier: "Advanced", color: "#8B5CF6" },
  26: { xp_required: 17500, tier: "Expert", color: "#F59E0B" },
  27: { xp_required: 18850, tier: "Expert", color: "#F59E0B" },
  28: { xp_required: 20250, tier: "Expert", color: "#F59E0B" },
  29: { xp_required: 21700, tier: "Expert", color: "#F59E0B" },
  30: { xp_required: 23200, tier: "Expert", color: "#F59E0B" },
  31: { xp_required: 24750, tier: "Expert", color: "#F59E0B" },
  32: { xp_required: 26350, tier: "Expert", color: "#F59E0B" },
  33: { xp_required: 28000, tier: "Expert", color: "#F59E0B" },
  34: { xp_required: 29700, tier: "Expert", color: "#F59E0B" },
  35: { xp_required: 31450, tier: "Expert", color: "#F59E0B" },
  36: { xp_required: 33250, tier: "Master", color: "#EF4444" },
  37: { xp_required: 35100, tier: "Master", color: "#EF4444" },
  38: { xp_required: 37000, tier: "Master", color: "#EF4444" },
  39: { xp_required: 38950, tier: "Master", color: "#EF4444" },
  40: { xp_required: 40950, tier: "Master", color: "#EF4444" },
  41: { xp_required: 43000, tier: "Master", color: "#EF4444" },
  42: { xp_required: 45100, tier: "Master", color: "#EF4444" },
  43: { xp_required: 47250, tier: "Master", color: "#EF4444" },
  44: { xp_required: 49450, tier: "Master", color: "#EF4444" },
  45: { xp_required: 51700, tier: "Master", color: "#EF4444" },
  46: { xp_required: 54000, tier: "Legend", color: "#EC4899" },
  47: { xp_required: 56350, tier: "Legend", color: "#EC4899" },
  48: { xp_required: 58750, tier: "Legend", color: "#EC4899" },
  49: { xp_required: 61200, tier: "Legend", color: "#EC4899" },
  50: { xp_required: 63700, tier: "Legend", color: "#EC4899" },
};

export function calculateLevel(totalXP: number): { level: number; tier: string; color: string; xpToNext: number; currentLevelXP: number; nextLevelXP: number } {
  let currentLevel = 1;
  
  for (let level = 50; level >= 1; level--) {
    if (totalXP >= LEVEL_REQUIREMENTS[level].xp_required) {
      currentLevel = level;
      break;
    }
  }
  
  const currentLevelData = LEVEL_REQUIREMENTS[currentLevel];
  const nextLevelData = LEVEL_REQUIREMENTS[currentLevel + 1] || { xp_required: currentLevelData.xp_required };
  
  return {
    level: currentLevel,
    tier: currentLevelData.tier,
    color: currentLevelData.color,
    xpToNext: nextLevelData.xp_required - totalXP,
    currentLevelXP: currentLevelData.xp_required,
    nextLevelXP: nextLevelData.xp_required,
  };
}

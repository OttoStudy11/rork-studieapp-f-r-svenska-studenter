import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import * as db from '@/lib/database';
import { Database } from '@/lib/database.types';

type DbAchievement = Database['public']['Tables']['achievements']['Row'];
type DbUserAchievement = Database['public']['Tables']['user_achievements']['Row'] & {
  achievements: DbAchievement | null;
};

export interface Achievement {
  id: string;
  achievementKey: string;
  title: string;
  description: string;
  icon: string;
  category: 'study' | 'social' | 'streak' | 'milestone';
  requirement: {
    type: 'study_time' | 'sessions' | 'courses' | 'notes' | 'streak' | 'friends';
    target: number;
    timeframe?: 'day' | 'week' | 'month' | 'total';
  };
  reward: {
    points: number;
    badge?: string;
  };
  unlockedAt?: string;
  progress: number;
}

// Helper function to convert database achievement to app achievement
const dbAchievementToAchievement = (dbUserAchievement: DbUserAchievement): Achievement | null => {
  if (!dbUserAchievement.achievements) return null;
  
  const dbAch = dbUserAchievement.achievements;
  return {
    id: dbAch.id,
    achievementKey: dbAch.achievement_key,
    title: dbAch.title,
    description: dbAch.description,
    icon: dbAch.icon,
    category: dbAch.category,
    requirement: {
      type: dbAch.requirement_type,
      target: dbAch.requirement_target,
      timeframe: dbAch.requirement_timeframe || undefined
    },
    reward: {
      points: dbAch.reward_points,
      badge: dbAch.reward_badge || undefined
    },
    unlockedAt: dbUserAchievement.unlocked_at || undefined,
    progress: dbUserAchievement.progress || 0
  };
};



export const [AchievementProvider, useAchievements] = createContextHook(() => {
  const { user: authUser, isAuthenticated } = useAuth();
  const { showAchievement } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Load user achievements from database
  const loadUserAchievements = useCallback(async () => {
    if (!authUser || !isAuthenticated) {
      setAchievements([]);
      setTotalPoints(0);
      setUnlockedBadges([]);
      setCurrentStreak(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading achievements for user:', authUser.id);
      
      // Check if achievements tables exist by trying to get all achievements first
      const allAchievements = await db.getAllAchievements();
      
      if (allAchievements.length === 0) {
        console.warn('No achievements found in database. Achievements system may not be set up.');
        setAchievements([]);
        setTotalPoints(0);
        setUnlockedBadges([]);
        setCurrentStreak(0);
        return;
      }
      
      // Initialize user achievements if they don't exist
      await db.initializeUserAchievements(authUser.id);
      
      // Get user achievements with progress
      const userAchievements = await db.getUserAchievements(authUser.id);
      
      // Convert to app format
      const achievements = userAchievements
        .map(dbAchievementToAchievement)
        .filter((ach): ach is Achievement => ach !== null);
      
      setAchievements(achievements);
      
      // Calculate stats
      const unlockedAchievements = achievements.filter(a => a.unlockedAt);
      const points = unlockedAchievements.reduce((sum, a) => sum + a.reward.points, 0);
      const badges = unlockedAchievements
        .filter(a => a.reward.badge)
        .map(a => a.reward.badge!);
      
      setTotalPoints(points);
      setUnlockedBadges(badges);
      
      // Get current streak
      try {
        const streak = await db.calculateUserStreak(authUser.id);
        setCurrentStreak(streak);
      } catch (streakError) {
        console.warn('Failed to load streak, setting to 0:', streakError);
        setCurrentStreak(0);
      }
      
      console.log('Achievements loaded:', achievements.length, 'Total points:', points);
    } catch (error: any) {
      // Silently handle network errors to avoid spamming console
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('timeout') || 
          error?.message?.includes('Network connection failed') || 
          error?.name === 'TypeError') {
        console.warn('Network connectivity issue - achievements temporarily unavailable');
      } else {
        console.error('Error loading achievements:', error instanceof Error ? error.message : String(error));
      }
      
      // Always set empty state gracefully when there are errors
      setAchievements([]);
      setTotalPoints(0);
      setUnlockedBadges([]);
      setCurrentStreak(0);
    } finally {
      setIsLoading(false);
    }
  }, [authUser, isAuthenticated]);

  // Load achievements when user changes
  useEffect(() => {
    loadUserAchievements();
  }, [loadUserAchievements]);

  // Check for new achievements (called after user actions like completing a session)
  const checkAchievements = useCallback(async () => {
    if (!authUser || !isAuthenticated) return;

    try {
      console.log('Checking for new achievements...');
      
      const newlyUnlocked = await db.checkAndUpdateAchievements(authUser.id);
      
      // Show notifications for newly unlocked achievements
      for (const userAchievement of newlyUnlocked) {
        const achievement = userAchievement.achievements;
        if (achievement) {
          showAchievement(
            `🎉 ${achievement.title}`,
            `${achievement.description} (+${achievement.reward_points} poäng)`
          );
        }
      }
      
      // Reload achievements to get updated progress
      if (newlyUnlocked.length > 0) {
        await loadUserAchievements();
      }
    } catch (error: any) {
      // Silently handle network errors to avoid disrupting user experience
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('timeout') || 
          error?.message?.includes('Network connection failed') ||
          error?.name === 'TypeError' ||
          error?.name === 'AbortError') {
        console.warn('Network connectivity issue - skipping achievement check');
      } else {
        console.error('Error checking achievements:', error);
      }
    }
  }, [authUser, isAuthenticated, showAchievement, loadUserAchievements]);



  const getAchievementsByCategory = useCallback((category: Achievement['category']) => {
    return achievements.filter(a => a.category === category);
  }, [achievements]);

  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter(a => a.unlockedAt);
  }, [achievements]);

  const getRecentAchievements = useCallback((days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return achievements.filter(a => 
      a.unlockedAt && new Date(a.unlockedAt) >= cutoff
    );
  }, [achievements]);

  const getUserLevel = useCallback(() => {
    // Calculate level based on total points
    if (totalPoints < 50) return { level: 1, title: 'Nybörjare' };
    if (totalPoints < 150) return { level: 2, title: 'Student' };
    if (totalPoints < 300) return { level: 3, title: 'Dedikerad' };
    if (totalPoints < 500) return { level: 4, title: 'Expert' };
    if (totalPoints < 750) return { level: 5, title: 'Mästare' };
    return { level: 6, title: 'Legend' };
  }, [totalPoints]);

  const getProgressToNextLevel = useCallback(() => {
    const thresholds = [0, 50, 150, 300, 500, 750, 1000];
    const currentLevel = getUserLevel().level;
    
    if (currentLevel >= thresholds.length - 1) {
      return { current: totalPoints, needed: 0, progress: 100 };
    }

    const nextThreshold = thresholds[currentLevel];
    const prevThreshold = thresholds[currentLevel - 1];
    const progress = ((totalPoints - prevThreshold) / (nextThreshold - prevThreshold)) * 100;

    return {
      current: totalPoints - prevThreshold,
      needed: nextThreshold - prevThreshold,
      progress: Math.min(100, progress)
    };
  }, [totalPoints, getUserLevel]);

  return useMemo(() => ({
    achievements,
    totalPoints,
    unlockedBadges,
    currentStreak,
    isLoading,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getRecentAchievements,
    getUserLevel,
    getProgressToNextLevel,
    checkAchievements,
    refreshAchievements: loadUserAchievements,
  }), [
    achievements,
    totalPoints,
    unlockedBadges,
    currentStreak,
    isLoading,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getRecentAchievements,
    getUserLevel,
    getProgressToNextLevel,
    checkAchievements,
    loadUserAchievements,
  ]);
});
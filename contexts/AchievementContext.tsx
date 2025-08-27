import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useStudy } from './StudyContext';
import { useToast } from './ToastContext';

export interface Achievement {
  id: string;
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

const ACHIEVEMENTS: Omit<Achievement, 'progress' | 'unlockedAt'>[] = [
  // Study Time Achievements
  {
    id: 'first_session',
    title: 'Första steget',
    description: 'Genomför din första studiesession',
    icon: '🎯',
    category: 'study',
    requirement: { type: 'sessions', target: 1, timeframe: 'total' },
    reward: { points: 10 }
  },
  {
    id: 'study_warrior',
    title: 'Studiekriger',
    description: 'Plugga 60 minuter på en dag',
    icon: '⚔️',
    category: 'study',
    requirement: { type: 'study_time', target: 60, timeframe: 'day' },
    reward: { points: 25 }
  },
  {
    id: 'marathon_student',
    title: 'Maratonstudent',
    description: 'Plugga 300 minuter på en vecka',
    icon: '🏃‍♂️',
    category: 'study',
    requirement: { type: 'study_time', target: 300, timeframe: 'week' },
    reward: { points: 50 }
  },
  {
    id: 'dedication_master',
    title: 'Hängivenhetsmästare',
    description: 'Plugga 1000 minuter totalt',
    icon: '👑',
    category: 'milestone',
    requirement: { type: 'study_time', target: 1000, timeframe: 'total' },
    reward: { points: 100, badge: 'dedication' }
  },

  // Streak Achievements
  {
    id: 'consistency_starter',
    title: 'Konsekvensstartare',
    description: 'Plugga 3 dagar i rad',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak', target: 3 },
    reward: { points: 30 }
  },
  {
    id: 'week_warrior',
    title: 'Veckokriger',
    description: 'Plugga 7 dagar i rad',
    icon: '🔥🔥',
    category: 'streak',
    requirement: { type: 'streak', target: 7 },
    reward: { points: 75 }
  },
  {
    id: 'unstoppable',
    title: 'Ostoppbar',
    description: 'Plugga 30 dagar i rad',
    icon: '🔥🔥🔥',
    category: 'streak',
    requirement: { type: 'streak', target: 30 },
    reward: { points: 200, badge: 'unstoppable' }
  },

  // Course Achievements
  {
    id: 'course_collector',
    title: 'Kurssamlare',
    description: 'Lägg till 5 kurser',
    icon: '📚',
    category: 'milestone',
    requirement: { type: 'courses', target: 5, timeframe: 'total' },
    reward: { points: 20 }
  },
  {
    id: 'note_taker',
    title: 'Anteckningstagare',
    description: 'Skriv 10 anteckningar',
    icon: '📝',
    category: 'milestone',
    requirement: { type: 'notes', target: 10, timeframe: 'total' },
    reward: { points: 15 }
  },
  {
    id: 'prolific_writer',
    title: 'Produktiv skribent',
    description: 'Skriv 50 anteckningar',
    icon: '✍️',
    category: 'milestone',
    requirement: { type: 'notes', target: 50, timeframe: 'total' },
    reward: { points: 60 }
  },

  // Session Achievements
  {
    id: 'session_master',
    title: 'Sessionsmästare',
    description: 'Genomför 25 studiesessioner',
    icon: '🎖️',
    category: 'milestone',
    requirement: { type: 'sessions', target: 25, timeframe: 'total' },
    reward: { points: 40 }
  },
  {
    id: 'century_club',
    title: 'Hundraklubben',
    description: 'Genomför 100 studiesessioner',
    icon: '💯',
    category: 'milestone',
    requirement: { type: 'sessions', target: 100, timeframe: 'total' },
    reward: { points: 150, badge: 'century' }
  },

  // Daily Achievements
  {
    id: 'early_bird',
    title: 'Morgonpigg',
    description: 'Starta en session före 08:00',
    icon: '🌅',
    category: 'study',
    requirement: { type: 'sessions', target: 1, timeframe: 'day' },
    reward: { points: 15 }
  },
  {
    id: 'night_owl',
    title: 'Nattuggla',
    description: 'Starta en session efter 22:00',
    icon: '🦉',
    category: 'study',
    requirement: { type: 'sessions', target: 1, timeframe: 'day' },
    reward: { points: 15 }
  }
];

export const [AchievementProvider, useAchievements] = createContextHook(() => {
  const studyContext = useStudy();
  const { showAchievement } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  
  // Safely extract data from study context with useMemo to prevent re-renders
  const pomodoroSessions = useMemo(() => studyContext?.pomodoroSessions || [], [studyContext?.pomodoroSessions]);
  const courses = useMemo(() => studyContext?.courses || [], [studyContext?.courses]);
  const notes = useMemo(() => studyContext?.notes || [], [studyContext?.notes]);

  // Initialize achievements
  useEffect(() => {
    const initialAchievements = ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      progress: 0,
    }));
    setAchievements(initialAchievements);
  }, []);

  // Calculate current streak
  const calculateStreak = useCallback(() => {
    if (pomodoroSessions.length === 0) return 0;

    const sortedSessions = [...pomodoroSessions]
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    // Check if user studied today or yesterday (to maintain streak)
    const lastSessionDate = new Date(sortedSessions[0].endTime);
    lastSessionDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) return 0; // Streak broken

    // Count consecutive days
    for (let i = 0; i < 365; i++) { // Max 365 days to prevent infinite loop
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const hasSessionThisDay = sortedSessions.some(session => {
        const sessionDate = new Date(session.endTime);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });

      if (hasSessionThisDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [pomodoroSessions]);

  // Calculate progress for each achievement
  const updateAchievementProgress = useCallback(() => {
    const currentStreak = calculateStreak();
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    setAchievements(prev => prev.map(achievement => {
      let currentValue = 0;

      switch (achievement.requirement.type) {
        case 'study_time':
          if (achievement.requirement.timeframe === 'day') {
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            currentValue = pomodoroSessions
              .filter(session => new Date(session.endTime) >= todayStart)
              .reduce((sum, session) => sum + session.duration, 0);
          } else if (achievement.requirement.timeframe === 'week') {
            currentValue = pomodoroSessions
              .filter(session => new Date(session.endTime) >= weekStart)
              .reduce((sum, session) => sum + session.duration, 0);
          } else if (achievement.requirement.timeframe === 'month') {
            currentValue = pomodoroSessions
              .filter(session => new Date(session.endTime) >= monthStart)
              .reduce((sum, session) => sum + session.duration, 0);
          } else {
            currentValue = pomodoroSessions.reduce((sum, session) => sum + session.duration, 0);
          }
          break;

        case 'sessions':
          if (achievement.requirement.timeframe === 'day') {
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            currentValue = pomodoroSessions.filter(session => 
              new Date(session.endTime) >= todayStart
            ).length;
          } else if (achievement.requirement.timeframe === 'week') {
            currentValue = pomodoroSessions.filter(session => 
              new Date(session.endTime) >= weekStart
            ).length;
          } else if (achievement.requirement.timeframe === 'month') {
            currentValue = pomodoroSessions.filter(session => 
              new Date(session.endTime) >= monthStart
            ).length;
          } else {
            currentValue = pomodoroSessions.length;
          }
          break;

        case 'courses':
          currentValue = courses.length;
          break;

        case 'notes':
          currentValue = notes.length;
          break;

        case 'streak':
          currentValue = currentStreak;
          break;

        default:
          currentValue = 0;
      }

      const progress = Math.min(100, (currentValue / achievement.requirement.target) * 100);
      const wasUnlocked = achievement.unlockedAt !== undefined;
      const isNowUnlocked = progress >= 100;

      // Check if achievement was just unlocked
      if (!wasUnlocked && isNowUnlocked) {
        // Show achievement notification
        showAchievement(
          `🎉 ${achievement.title}`,
          `${achievement.description} (+${achievement.reward.points} poäng)`
        );

        return {
          ...achievement,
          progress,
          unlockedAt: new Date().toISOString(),
        };
      }

      return {
        ...achievement,
        progress,
      };
    }));
  }, [pomodoroSessions, courses, notes, calculateStreak, showAchievement]);

  // Update achievements when data changes
  useEffect(() => {
    updateAchievementProgress();
  }, [updateAchievementProgress]);

  // Calculate total points and badges
  useEffect(() => {
    const unlockedAchievements = achievements.filter(a => a.unlockedAt);
    const points = unlockedAchievements.reduce((sum, a) => sum + a.reward.points, 0);
    const badges = unlockedAchievements
      .filter(a => a.reward.badge)
      .map(a => a.reward.badge!);

    setTotalPoints(points);
    setUnlockedBadges(badges);
  }, [achievements]);

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
    getAchievementsByCategory,
    getUnlockedAchievements,
    getRecentAchievements,
    getUserLevel,
    getProgressToNextLevel,
    currentStreak: calculateStreak(),
  }), [
    achievements,
    totalPoints,
    unlockedBadges,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getRecentAchievements,
    getUserLevel,
    getProgressToNextLevel,
    calculateStreak,
  ]);
});
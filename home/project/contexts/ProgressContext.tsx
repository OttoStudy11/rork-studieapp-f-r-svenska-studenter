import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface StudySession {
  id: string;
  courseId: string;
  courseName: string;
  duration: number; // in minutes
  date: Date;
  notes?: string;
  technique?: 'pomodoro' | 'custom' | 'stopwatch';
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'study_time' | 'sessions' | 'streak' | 'course_completion' | 'special';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  totalMinutes: number;
  sessionsCompleted: number;
  coursesStudied: string[];
  achievements: string[];
}

export interface WeeklyStats {
  weekStart: string; // YYYY-MM-DD format
  totalMinutes: number;
  sessionsCompleted: number;
  averageSessionLength: number;
  mostStudiedCourse: string;
  streak: number;
}

export interface UserProgress {
  totalStudyTime: number; // in minutes
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  coursesCompleted: number;
  achievementsUnlocked: number;
  level: number;
  xp: number;
  lastStudyDate?: Date;
}



// Default achievements
const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first_session',
    name: 'Första steget',
    description: 'Genomför din första studiesession',
    icon: 'Play',
    type: 'sessions',
    requirement: 1,
  },
  {
    id: 'early_bird',
    name: 'Morgonpiggen',
    description: 'Studera före 09:00',
    icon: 'Sunrise',
    type: 'special',
    requirement: 1,
  },
  {
    id: 'night_owl',
    name: 'Nattuggle',
    description: 'Studera efter 22:00',
    icon: 'Moon',
    type: 'special',
    requirement: 1,
  },
  {
    id: 'pomodoro_master',
    name: 'Pomodoro-mästare',
    description: 'Genomför 25 pomodoro-sessioner',
    icon: 'Timer',
    type: 'sessions',
    requirement: 25,
  },
  {
    id: 'marathon_runner',
    name: 'Maratonlöpare',
    description: 'Studera i 3 timmar på en dag',
    icon: 'Zap',
    type: 'study_time',
    requirement: 180, // 3 hours in minutes
  },
  {
    id: 'week_warrior',
    name: 'Veckokrigare',
    description: 'Studera 7 dagar i rad',
    icon: 'Calendar',
    type: 'streak',
    requirement: 7,
  },
  {
    id: 'dedication',
    name: 'Hängivenhet',
    description: 'Studera 30 dagar i rad',
    icon: 'Award',
    type: 'streak',
    requirement: 30,
  },
  {
    id: 'course_master',
    name: 'Kursmästare',
    description: 'Slutför din första kurs',
    icon: 'BookOpen',
    type: 'course_completion',
    requirement: 1,
  },
  {
    id: 'scholar',
    name: 'Lärd',
    description: 'Ackumulera 100 timmars studietid',
    icon: 'GraduationCap',
    type: 'study_time',
    requirement: 6000, // 100 hours in minutes
  },
  {
    id: 'perfectionist',
    name: 'Perfektionist',
    description: 'Slutför 5 kurser',
    icon: 'Star',
    type: 'course_completion',
    requirement: 5,
  },
];

export const [ProgressProvider, useProgress] = createContextHook(() => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalStudyTime: 0,
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    coursesCompleted: 0,
    achievementsUnlocked: 0,
    level: 1,
    xp: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database
  const loadFromDatabase = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('Loading progress data from database for user:', user.id);
      
      // Fetch user progress from database
      const { data: progressData, error: progressError } = await (supabase as any)
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching user progress:', progressError);
      } else if (progressData) {
        const dbProgress: UserProgress = {
          totalStudyTime: progressData.total_study_time || 0,
          totalSessions: progressData.total_sessions || 0,
          currentStreak: progressData.current_streak || 0,
          longestStreak: progressData.longest_streak || 0,
          coursesCompleted: progressData.courses_completed || 0,
          achievementsUnlocked: progressData.achievements_unlocked || 0,
          level: progressData.level || 1,
          xp: progressData.xp || 0,
          lastStudyDate: progressData.last_study_date ? new Date(progressData.last_study_date) : undefined,
        };
        setUserProgress(dbProgress);
      }
      
      // Fetch study sessions from database
      const { data: sessionsData, error: sessionsError } = await (supabase as any)
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (sessionsError) {
        console.error('Error fetching study sessions:', sessionsError);
      } else if (sessionsData) {
        const convertedSessions: StudySession[] = sessionsData.map((session: any) => ({
          id: session.id,
          courseId: session.course_id,
          courseName: `Course ${session.course_id}`,
          duration: session.duration_minutes,
          date: new Date(session.created_at),
          notes: session.notes || undefined,
          technique: (session.technique as 'pomodoro' | 'custom' | 'stopwatch') || 'pomodoro',
          completed: session.completed || true,
        }));
        setSessions(convertedSessions);
      }
      
      // Fetch user achievements from database
      const { data: userAchievementsData, error: achievementsError } = await (supabase as any)
        .from('user_achievements')
        .select(`
          achievement_id,
          progress,
          unlocked_at,
          achievements (
            id,
            name,
            description,
            icon,
            type,
            requirement
          )
        `)
        .eq('user_id', user.id);
      
      if (achievementsError) {
        console.error('Error fetching user achievements:', achievementsError);
      } else {
        // Convert achievements data
        const dbAchievements: Achievement[] = userAchievementsData?.map((ua: any) => ({
          id: ua.achievement_id,
          name: ua.achievements?.name || 'Unknown Achievement',
          description: ua.achievements?.description || '',
          icon: ua.achievements?.icon || 'Award',
          type: ua.achievements?.type as Achievement['type'] || 'special',
          requirement: ua.achievements?.requirement || 1,
          unlocked: !!ua.unlocked_at,
          unlockedAt: ua.unlocked_at ? new Date(ua.unlocked_at) : undefined,
          progress: ua.progress || 0,
        })) || [];
        
        // Merge with default achievements
        const allAchievements = DEFAULT_ACHIEVEMENTS.map(defaultAch => {
          const userAch = dbAchievements.find(ua => ua.id === defaultAch.id);
          return userAch || {
            ...defaultAch,
            unlocked: false,
            progress: 0,
          };
        });
        
        setAchievements(allAchievements);
      }
      
      console.log('Successfully loaded progress data from database');
    } catch (error) {
      console.error('Error loading from database:', error);
    }
  }, [user?.id]);

  // Load data
  const loadData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load from database as primary source
      await loadFromDatabase();
      
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadFromDatabase]);



  // Calculate user progress from sessions
  const calculateProgress = useCallback((sessionList: StudySession[]) => {
    const totalStudyTime = sessionList.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = sessionList.length;
    
    // Calculate streak
    const sortedSessions = [...sessionList]
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sessionDates = new Set(
      sortedSessions.map(s => {
        const date = new Date(s.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );
    
    // Calculate current streak
    let checkDate = new Date(today);
    while (sessionDates.has(checkDate.getTime())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Calculate longest streak
    const sortedDates = Array.from(sessionDates).sort((a, b) => b - a);
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0 || sortedDates[i] === sortedDates[i - 1] - 86400000) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    
    // Calculate level and XP
    const xp = totalStudyTime + (totalSessions * 10); // 1 XP per minute + 10 XP per session
    const level = Math.floor(xp / 1000) + 1; // Level up every 1000 XP
    
    const lastStudyDate = sessionList.length > 0 
      ? new Date(Math.max(...sessionList.map(s => s.date.getTime())))
      : undefined;
    
    return {
      totalStudyTime,
      totalSessions,
      currentStreak,
      longestStreak,
      coursesCompleted: 0, // Will be calculated from course completion
      achievementsUnlocked: achievements.filter(a => a.unlocked).length,
      level,
      xp,
      lastStudyDate,
    };
  }, [achievements]);

  // Update progress in database when sessions change
  const updateProgressInDatabase = useCallback(async (newProgress: UserProgress) => {
    if (!user?.id) return;
    
    try {
      const { error } = await (supabase as any)
        .from('user_progress')
        .upsert({
          user_id: user.id,
          total_study_time: newProgress.totalStudyTime,
          total_sessions: newProgress.totalSessions,
          current_streak: newProgress.currentStreak,
          longest_streak: newProgress.longestStreak,
          courses_completed: newProgress.coursesCompleted,
          achievements_unlocked: newProgress.achievementsUnlocked,
          level: newProgress.level,
          xp: newProgress.xp,
          last_study_date: newProgress.lastStudyDate?.toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error('Error updating user progress in database:', error);
      } else {
        console.log('Successfully updated user progress in database');
      }
    } catch (error) {
      console.error('Exception updating user progress in database:', error);
    }
  }, [user?.id]);

  // Update progress when sessions change
  useEffect(() => {
    const newProgress = calculateProgress(sessions);
    setUserProgress(newProgress);
    
    if (user?.id) {
      updateProgressInDatabase(newProgress);
    }
  }, [sessions, calculateProgress, user?.id, updateProgressInDatabase]);

  // Check and unlock achievements
  const checkAchievements = useCallback(async (newSession?: StudySession) => {
    if (!user?.id) return;

    const updatedAchievements = [...achievements];
    let hasNewAchievements = false;

    for (const achievement of updatedAchievements) {
      if (achievement.unlocked) continue;

      let progress = 0;
      let shouldUnlock = false;

      switch (achievement.type) {
        case 'sessions':
          progress = userProgress.totalSessions;
          shouldUnlock = progress >= achievement.requirement;
          break;
        
        case 'study_time':
          if (achievement.id === 'marathon_runner' && newSession) {
            // Check daily study time
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todaySessions = sessions.filter(s => {
              const sessionDate = new Date(s.date);
              sessionDate.setHours(0, 0, 0, 0);
              return sessionDate.getTime() === today.getTime();
            });
            progress = todaySessions.reduce((sum, s) => sum + s.duration, 0);
          } else {
            progress = userProgress.totalStudyTime;
          }
          shouldUnlock = progress >= achievement.requirement;
          break;
        
        case 'streak':
          progress = userProgress.currentStreak;
          shouldUnlock = progress >= achievement.requirement;
          break;
        
        case 'special':
          if (achievement.id === 'early_bird' && newSession) {
            const hour = newSession.date.getHours();
            shouldUnlock = hour < 9;
            progress = shouldUnlock ? 1 : 0;
          } else if (achievement.id === 'night_owl' && newSession) {
            const hour = newSession.date.getHours();
            shouldUnlock = hour >= 22;
            progress = shouldUnlock ? 1 : 0;
          }
          break;
      }

      achievement.progress = progress;
      
      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        hasNewAchievements = true;

        // Save to database
        try {
          const { error: achievementError } = await (supabase as any)
            .from('user_achievements')
            .upsert({
              user_id: user.id,
              achievement_id: achievement.id,
              progress: achievement.progress,
              unlocked_at: achievement.unlockedAt?.toISOString(),
              updated_at: new Date().toISOString(),
            });
          
          if (achievementError) {
            console.error('Error saving achievement to database:', achievementError);
          } else {
            console.log('Successfully saved achievement to database:', achievement.id);
          }
        } catch (error) {
          console.error('Exception saving achievement to database:', error);
        }
      }
    }

    if (hasNewAchievements) {
      setAchievements(updatedAchievements);
    }

    return updatedAchievements.filter(a => a.unlocked && !achievements.find(old => old.id === a.id && old.unlocked));
  }, [user?.id, achievements, userProgress, sessions]);

  // Add a new study session
  const addStudySession = useCallback(async (session: Omit<StudySession, 'id'>) => {
    if (!user?.id) return;

    const newSession: StudySession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Save to database first
    try {
      const { error: sessionError } = await (supabase as any)
        .from('study_sessions')
        .insert({
          id: newSession.id,
          user_id: user.id,
          course_id: session.courseId,
          duration_minutes: session.duration,
          notes: session.notes,
          technique: session.technique,
          completed: session.completed,
          created_at: session.date.toISOString(),
        });
      
      if (sessionError) {
        console.error('Error saving session to database:', sessionError);
        return;
      } else {
        console.log('Successfully saved session to database:', newSession.id);
      }
    } catch (error) {
      console.error('Exception saving session to database:', error);
      return;
    }

    // Update local state after successful database save
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);

    // Check for new achievements
    await checkAchievements(newSession);

    return newSession;
  }, [user?.id, sessions, checkAchievements]);

  // Get daily stats
  const getDailyStats = useCallback((date: Date): DailyStats => {
    const dateStr = date.toISOString().split('T')[0];
    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.toISOString().split('T')[0] === dateStr;
    });

    return {
      date: dateStr,
      totalMinutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
      sessionsCompleted: daySessions.length,
      coursesStudied: [...new Set(daySessions.map(s => s.courseId))],
      achievements: achievements
        .filter(a => a.unlockedAt && a.unlockedAt.toISOString().split('T')[0] === dateStr)
        .map(a => a.id),
    };
  }, [sessions, achievements]);

  // Get weekly stats
  const getWeeklyStats = useCallback((weekStart: Date): WeeklyStats => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const weekSessions = sessions.filter(s => 
      s.date >= weekStart && s.date < weekEnd
    );

    const courseMinutes: Record<string, number> = {};
    weekSessions.forEach(s => {
      courseMinutes[s.courseId] = (courseMinutes[s.courseId] || 0) + s.duration;
    });

    const mostStudiedCourse = Object.entries(courseMinutes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    const totalMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionLength = weekSessions.length > 0 
      ? totalMinutes / weekSessions.length 
      : 0;

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      totalMinutes,
      sessionsCompleted: weekSessions.length,
      averageSessionLength,
      mostStudiedCourse,
      streak: userProgress.currentStreak,
    };
  }, [sessions, userProgress.currentStreak]);

  // Load data when user changes
  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      setSessions([]);
      setAchievements([]);
      setUserProgress({
        totalStudyTime: 0,
        totalSessions: 0,
        currentStreak: 0,
        longestStreak: 0,
        coursesCompleted: 0,
        achievementsUnlocked: 0,
        level: 1,
        xp: 0,
      });
      setIsLoading(false);
    }
  }, [user?.id, loadData]);

  // Computed values
  const recentSessions = useMemo(() => 
    sessions.slice(0, 10),
    [sessions]
  );

  const unlockedAchievements = useMemo(() => 
    achievements.filter(a => a.unlocked),
    [achievements]
  );

  const todayStats = useMemo(() => 
    getDailyStats(new Date()),
    [getDailyStats]
  );

  const thisWeekStats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    return getWeeklyStats(weekStart);
  }, [getWeeklyStats]);

  return useMemo(() => ({
    // State
    sessions,
    achievements,
    userProgress,
    isLoading,
    
    // Actions
    addStudySession,
    checkAchievements,
    loadFromDatabase,
    
    // Computed
    recentSessions,
    unlockedAchievements,
    todayStats,
    thisWeekStats,
    
    // Utilities
    getDailyStats,
    getWeeklyStats,
  }), [
    sessions,
    achievements,
    userProgress,
    isLoading,
    addStudySession,
    checkAchievements,
    loadFromDatabase,
    recentSessions,
    unlockedAchievements,
    todayStats,
    thisWeekStats,
    getDailyStats,
    getWeeklyStats,
  ]);
});
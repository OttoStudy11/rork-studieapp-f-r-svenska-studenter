import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const STORAGE_KEYS = {
  SESSIONS: '@study_sessions_',
  ACHIEVEMENTS: '@achievements_',
  DAILY_STATS: '@daily_stats_',
  USER_PROGRESS: '@user_progress_',
};

const getStorageKey = (userId: string, key: string) => `${key}${userId}`;

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

  // Sync with Supabase
  const syncWithSupabase = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('Syncing progress data with Supabase for user:', user.id);
      
      // Fetch user progress from Supabase
      const { data: progressData, error: progressError } = await (supabase as any)
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching user progress:', progressError);
        return;
      }
      
      // Fetch study sessions from Supabase
      const { data: sessionsData, error: sessionsError } = await (supabase as any)
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (sessionsError) {
        console.error('Error fetching study sessions:', sessionsError);
        return;
      }
      
      // Fetch user achievements from Supabase
      const { data: userAchievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
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
        return;
      }
      
      // Convert Supabase data to local format
      if (sessionsData) {
        const convertedSessions: StudySession[] = sessionsData.map((session: any) => ({
          id: session.id,
          courseId: session.course_id,
          courseName: `Course ${session.course_id}`, // We'll need to fetch course names separately
          duration: session.duration_minutes,
          date: new Date(session.created_at),
          notes: session.notes || undefined,
          technique: (session.technique as 'pomodoro' | 'custom' | 'stopwatch') || 'pomodoro',
          completed: session.completed || true,
        }));
        setSessions(convertedSessions);
        
        // Save to AsyncStorage for offline access
        await AsyncStorage.setItem(
          getStorageKey(user.id, STORAGE_KEYS.SESSIONS),
          JSON.stringify(convertedSessions)
        );
      }
      
      // Convert achievements data
      if (userAchievementsData) {
        const convertedAchievements: Achievement[] = userAchievementsData.map((ua: any) => ({
          id: ua.achievement_id,
          name: (ua.achievements as any)?.name || 'Unknown Achievement',
          description: (ua.achievements as any)?.description || '',
          icon: (ua.achievements as any)?.icon || 'Award',
          type: (ua.achievements as any)?.type as Achievement['type'] || 'special',
          requirement: (ua.achievements as any)?.requirement || 1,
          unlocked: !!ua.unlocked_at,
          unlockedAt: ua.unlocked_at ? new Date(ua.unlocked_at) : undefined,
          progress: ua.progress || 0,
        }));
        
        // Merge with default achievements
        const allAchievements = DEFAULT_ACHIEVEMENTS.map(defaultAch => {
          const userAch = convertedAchievements.find(ua => ua.id === defaultAch.id);
          return userAch || {
            ...defaultAch,
            unlocked: false,
            progress: 0,
          };
        });
        
        setAchievements(allAchievements);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem(
          getStorageKey(user.id, STORAGE_KEYS.ACHIEVEMENTS),
          JSON.stringify(allAchievements)
        );
      }
      
      // Update user progress if we have data from Supabase
      if (progressData) {
        const supabaseProgress: UserProgress = {
          totalStudyTime: (progressData as any).total_study_time || 0,
          totalSessions: (progressData as any).total_sessions || 0,
          currentStreak: (progressData as any).current_streak || 0,
          longestStreak: (progressData as any).longest_streak || 0,
          coursesCompleted: (progressData as any).courses_completed || 0,
          achievementsUnlocked: (progressData as any).achievements_unlocked || 0,
          level: (progressData as any).level || 1,
          xp: (progressData as any).xp || 0,
          lastStudyDate: (progressData as any).last_study_date ? new Date((progressData as any).last_study_date) : undefined,
        };
        setUserProgress(supabaseProgress);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem(
          getStorageKey(user.id, STORAGE_KEYS.USER_PROGRESS),
          JSON.stringify(supabaseProgress)
        );
      }
      
      console.log('Successfully synced progress data with Supabase');
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
    }
  }, [user?.id]);

  // Load data from storage
  const loadData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load from AsyncStorage first for immediate UI update
      const [sessionsData, achievementsData, progressData] = await Promise.all([
        AsyncStorage.getItem(getStorageKey(user.id, STORAGE_KEYS.SESSIONS)),
        AsyncStorage.getItem(getStorageKey(user.id, STORAGE_KEYS.ACHIEVEMENTS)),
        AsyncStorage.getItem(getStorageKey(user.id, STORAGE_KEYS.USER_PROGRESS)),
      ]);

      // Parse and set local data
      if (sessionsData) {
        const parsedSessions = JSON.parse(sessionsData).map((s: any) => ({
          ...s,
          date: new Date(s.date),
        }));
        setSessions(parsedSessions);
      }

      if (achievementsData) {
        const parsedAchievements = JSON.parse(achievementsData).map((a: any) => ({
          ...a,
          unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
        }));
        setAchievements(parsedAchievements);
      } else {
        // Initialize with default achievements
        const initialAchievements = DEFAULT_ACHIEVEMENTS.map(a => ({
          ...a,
          unlocked: false,
          progress: 0,
        }));
        setAchievements(initialAchievements);
        await AsyncStorage.setItem(
          getStorageKey(user.id, STORAGE_KEYS.ACHIEVEMENTS),
          JSON.stringify(initialAchievements)
        );
      }

      if (progressData) {
        const parsedProgress = JSON.parse(progressData);
        if (parsedProgress.lastStudyDate) {
          parsedProgress.lastStudyDate = new Date(parsedProgress.lastStudyDate);
        }
        setUserProgress(parsedProgress);
      }

      // Sync with Supabase in background
      try {
        await syncWithSupabase();
      } catch (syncError) {
        console.log('Background sync failed:', syncError);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, syncWithSupabase]);



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

  // Update progress when sessions change
  useEffect(() => {
    const newProgress = calculateProgress(sessions);
    setUserProgress(newProgress);
    
    if (user?.id) {
      // Save to AsyncStorage
      AsyncStorage.setItem(
        getStorageKey(user.id, STORAGE_KEYS.USER_PROGRESS),
        JSON.stringify(newProgress)
      );
      
      // Sync to Supabase
      (async () => {
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
            console.error('Error syncing user progress to Supabase:', error);
          } else {
            console.log('Successfully synced user progress to Supabase');
          }
        } catch (error) {
          console.error('Exception syncing user progress to Supabase:', error);
        }
      })();
    }
  }, [sessions, calculateProgress, user?.id]);

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

        // Sync to Supabase
        try {
          const { error: achievementError } = await supabase
            .from('user_achievements')
            .upsert({
              user_id: user.id,
              achievement_id: achievement.id,
              progress: achievement.progress,
              unlocked_at: achievement.unlockedAt?.toISOString(),
              updated_at: new Date().toISOString(),
            });
          
          if (achievementError) {
            console.error('Error syncing achievement to Supabase:', achievementError);
          } else {
            console.log('Successfully synced achievement to Supabase:', achievement.id);
          }
        } catch (error) {
          console.error('Exception syncing achievement to Supabase:', error);
        }
      }
    }

    if (hasNewAchievements) {
      setAchievements(updatedAchievements);
      await AsyncStorage.setItem(
        getStorageKey(user.id, STORAGE_KEYS.ACHIEVEMENTS),
        JSON.stringify(updatedAchievements)
      );
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

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);

    // Save to AsyncStorage
    await AsyncStorage.setItem(
      getStorageKey(user.id, STORAGE_KEYS.SESSIONS),
      JSON.stringify(updatedSessions)
    );

    // Sync to Supabase
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
        console.error('Error syncing session to Supabase:', sessionError);
      } else {
        console.log('Successfully synced session to Supabase:', newSession.id);
      }
    } catch (error) {
      console.error('Exception syncing session to Supabase:', error);
    }

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
    syncWithSupabase,
    
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
    syncWithSupabase,
    recentSessions,
    unlockedAchievements,
    todayStats,
    thisWeekStats,
    getDailyStats,
    getWeeklyStats,
  ]);
});
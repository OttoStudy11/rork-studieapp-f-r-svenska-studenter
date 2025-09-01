import { supabase } from './supabase';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];

// User functions
export const createUser = async (userData: Tables['profiles']['Insert']) => {
  try {
    console.log('Creating user with data:', userData);
    
    // First check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id!)
      .single();
    
    if (existingUser) {
      console.log('User already exists, returning existing user:', existingUser);
      return existingUser;
    }
    
    const userDataWithDefaults = {
      ...userData,
      subscription_type: userData.subscription_type || 'free',
      subscription_expires_at: userData.subscription_expires_at || null
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(userDataWithDefaults)
      .select()
      .single();
    
    if (error) {
      console.error('Database error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    console.log('User created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
};

export const getUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUser = async (userId: string, updates: Tables['profiles']['Update']) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Course functions
export const getCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getCourse = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createCourse = async (courseData: Tables['courses']['Insert']) => {
  const { data, error } = await supabase
    .from('courses')
    .insert(courseData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// User-Course relationship functions
export const getUserCourses = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_courses')
    .select(`
      *,
      courses (*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

export const addUserToCourse = async (userId: string, courseId: string, isActive = false) => {
  const { data, error } = await supabase
    .from('user_courses')
    .upsert({
      user_id: userId,
      course_id: courseId,
      progress: 0,
      is_active: isActive
    }, { onConflict: 'user_id,course_id' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserCourseProgress = async (userId: string, courseId: string, progress: number) => {
  const { data, error } = await supabase
    .from('user_courses')
    .update({ progress })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const setActiveCourse = async (userId: string, courseId: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('user_courses')
    .update({ is_active: isActive })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Notes functions
export const getUserNotes = async (userId: string, courseId?: string) => {
  let query = supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const createNote = async (noteData: Tables['notes']['Insert']) => {
  const { data, error } = await supabase
    .from('notes')
    .insert(noteData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateNote = async (noteId: string, updates: Tables['notes']['Update']) => {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteNote = async (noteId: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
  
  if (error) throw error;
};

// Quiz functions
export const getCourseQuizzes = async (courseId: string) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createQuiz = async (quizData: Tables['quizzes']['Insert']) => {
  const { data, error } = await supabase
    .from('quizzes')
    .insert(quizData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Pomodoro session functions
export const getUserPomodoroSessions = async (userId: string, courseId?: string) => {
  let query = supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false });
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const createPomodoroSession = async (sessionData: Tables['pomodoro_sessions']['Insert']) => {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert(sessionData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getPomodoroStats = async (userId: string, days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', startDate.toISOString());
  
  if (error) throw error;
  
  // Calculate stats
  const totalSessions = data.length;
  const totalMinutes = data.reduce((sum, session) => sum + session.duration, 0);
  const averagePerDay = totalMinutes / days;
  
  return {
    totalSessions,
    totalMinutes,
    averagePerDay,
    sessions: data
  };
};

// Friends functions
export const getUserFriends = async (userId: string) => {
  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      friend:profiles!friends_friend_id_fkey (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'accepted');
  
  if (error) throw error;
  return data;
};

export const getFriendRequests = async (userId: string) => {
  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      requester:profiles!friends_user_id_fkey (*)
    `)
    .eq('friend_id', userId)
    .eq('status', 'pending');
  
  if (error) throw error;
  return data;
};

export const sendFriendRequest = async (userId: string, friendId: string) => {
  const { data, error } = await supabase
    .from('friends')
    .insert({
      user_id: userId,
      friend_id: friendId,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const acceptFriendRequest = async (requestId: string) => {
  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const rejectFriendRequest = async (requestId: string) => {
  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', requestId);
  
  if (error) throw error;
};

// Settings functions
export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data;
};

export const createOrUpdateSettings = async (userId: string, settings: Partial<Tables['settings']['Insert']>) => {
  const { data, error } = await supabase
    .from('settings')
    .upsert({
      user_id: userId,
      dark_mode: false,
      timer_focus: 25,
      timer_break: 5,
      notifications: true,
      language: 'sv',
      ...settings
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Premium subscription functions
export const updateUserSubscription = async (userId: string, subscriptionType: 'free' | 'premium', expiresAt?: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      subscription_type: subscriptionType,
      subscription_expires_at: expiresAt || null
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserSubscriptionStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_type, subscription_expires_at')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return {
    subscriptionType: data.subscription_type as 'free' | 'premium',
    expiresAt: data.subscription_expires_at ? new Date(data.subscription_expires_at) : null
  };
};

// Search functions
export const searchCourses = async (query: string, level?: string) => {
  let searchQuery = supabase
    .from('courses')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%`);
  
  if (level) {
    searchQuery = searchQuery.eq('level', level);
  }
  
  const { data, error } = await searchQuery;
  
  if (error) throw error;
  return data;
};

export const searchUsers = async (query: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, level, program')
    .or(`name.ilike.%${query}%`)
    .limit(10);
  
  if (error) throw error;
  return data;
};

// Achievement functions
export const getAllAchievements = async () => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const getUserAchievements = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

export const initializeUserAchievements = async (userId: string) => {
  // Get all achievements
  const achievements = await getAllAchievements();
  
  // Create user_achievement records for all achievements
  const userAchievements = achievements.map(achievement => ({
    user_id: userId,
    achievement_id: achievement.id,
    progress: 0,
    unlocked_at: null
  }));
  
  const { data, error } = await supabase
    .from('user_achievements')
    .upsert(userAchievements, { onConflict: 'user_id,achievement_id' })
    .select();
  
  if (error) throw error;
  return data;
};

export const updateUserAchievementProgress = async (
  userId: string, 
  achievementId: string, 
  progress: number, 
  unlockedAt?: string
) => {
  const updateData: Tables['user_achievements']['Update'] = {
    progress,
    updated_at: new Date().toISOString()
  };
  
  if (unlockedAt) {
    updateData.unlocked_at = unlockedAt;
  }
  
  const { data, error } = await supabase
    .from('user_achievements')
    .update(updateData)
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .select(`
      *,
      achievements (*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserAchievementStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  
  const totalAchievements = data.length;
  const unlockedAchievements = data.filter(ua => ua.unlocked_at).length;
  const totalPoints = data
    .filter(ua => ua.unlocked_at)
    .reduce((sum, ua) => sum + (ua.achievements?.reward_points || 0), 0);
  const badges = data
    .filter(ua => ua.unlocked_at && ua.achievements?.reward_badge)
    .map(ua => ua.achievements?.reward_badge)
    .filter(Boolean);
  
  return {
    totalAchievements,
    unlockedAchievements,
    totalPoints,
    badges,
    achievements: data
  };
};

// Calculate streak from pomodoro sessions
export const calculateUserStreak = async (userId: string) => {
  const { data: sessions, error } = await supabase
    .from('pomodoro_sessions')
    .select('end_time')
    .eq('user_id', userId)
    .order('end_time', { ascending: false });
  
  if (error) throw error;
  if (!sessions || sessions.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Check if user studied today or yesterday (to maintain streak)
  const lastSessionDate = new Date(sessions[0].end_time);
  lastSessionDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0; // Streak broken
  
  // Count consecutive days
  for (let i = 0; i < 365; i++) { // Max 365 days to prevent infinite loop
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const hasSessionThisDay = sessions.some(session => {
      const sessionDate = new Date(session.end_time);
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
};

// Check and update achievements for a user
export const checkAndUpdateAchievements = async (userId: string) => {
  try {
    console.log('Checking achievements for user:', userId);
    
    // Get user's current achievement progress
    const userAchievements = await getUserAchievements(userId);
    
    // Get user's data for calculations
    const [pomodoroSessions, userCourses, userNotes] = await Promise.all([
      getUserPomodoroSessions(userId),
      getUserCourses(userId),
      getUserNotes(userId)
    ]);
    
    const currentStreak = await calculateUserStreak(userId);
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const newlyUnlocked: any[] = [];
    
    // Check each achievement
    for (const userAchievement of userAchievements) {
      const achievement = userAchievement.achievements;
      if (!achievement || userAchievement.unlocked_at) continue; // Skip if already unlocked
      
      let currentValue = 0;
      
      switch (achievement.requirement_type) {
        case 'study_time':
          if (achievement.requirement_timeframe === 'day') {
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            currentValue = pomodoroSessions
              .filter(session => new Date(session.end_time) >= todayStart)
              .reduce((sum, session) => sum + session.duration, 0);
          } else if (achievement.requirement_timeframe === 'week') {
            currentValue = pomodoroSessions
              .filter(session => new Date(session.end_time) >= weekStart)
              .reduce((sum, session) => sum + session.duration, 0);
          } else if (achievement.requirement_timeframe === 'month') {
            currentValue = pomodoroSessions
              .filter(session => new Date(session.end_time) >= monthStart)
              .reduce((sum, session) => sum + session.duration, 0);
          } else {
            currentValue = pomodoroSessions.reduce((sum, session) => sum + session.duration, 0);
          }
          break;
          
        case 'sessions':
          if (achievement.requirement_timeframe === 'day') {
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            currentValue = pomodoroSessions.filter(session => 
              new Date(session.end_time) >= todayStart
            ).length;
          } else if (achievement.requirement_timeframe === 'week') {
            currentValue = pomodoroSessions.filter(session => 
              new Date(session.end_time) >= weekStart
            ).length;
          } else if (achievement.requirement_timeframe === 'month') {
            currentValue = pomodoroSessions.filter(session => 
              new Date(session.end_time) >= monthStart
            ).length;
          } else {
            currentValue = pomodoroSessions.length;
          }
          break;
          
        case 'courses':
          currentValue = userCourses.length;
          break;
          
        case 'notes':
          currentValue = userNotes.length;
          break;
          
        case 'streak':
          currentValue = currentStreak;
          break;
          
        default:
          currentValue = 0;
      }
      
      const progress = Math.min(100, (currentValue / achievement.requirement_target) * 100);
      const isUnlocked = progress >= 100;
      
      // Update progress
      const updatedAchievement = await updateUserAchievementProgress(
        userId,
        achievement.id,
        progress,
        isUnlocked ? new Date().toISOString() : undefined
      );
      
      if (isUnlocked && !userAchievement.unlocked_at) {
        newlyUnlocked.push(updatedAchievement);
        console.log('Achievement unlocked:', achievement.title);
      }
    }
    
    return newlyUnlocked;
  } catch (error) {
    console.error('Error checking achievements:', error);
    throw error;
  }
};
import { supabase } from './supabase';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];

// User functions
export const createUser = async (userData: Tables['profiles']['Insert']) => {
  try {
    console.log('Creating user with data:', {
      ...userData,
      // Don't log sensitive data, just structure
      id: userData.id ? 'provided' : 'not provided',
      name: userData.name ? 'provided' : 'not provided'
    });
    
    // Validate required fields
    if (!userData.name || !userData.level || !userData.program || !userData.purpose) {
      const missingFields = [];
      if (!userData.name) missingFields.push('name');
      if (!userData.level) missingFields.push('level');
      if (!userData.program) missingFields.push('program');
      if (!userData.purpose) missingFields.push('purpose');
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // First check if user already exists using the safer getUser function
    if (userData.id) {
      const existingUser = await getUser(userData.id);
      
      if (existingUser) {
        console.log('User already exists, returning existing user:', existingUser.name);
        return existingUser;
      }
    }
    
    const userDataWithDefaults = {
      ...userData,
      subscription_type: userData.subscription_type || 'free',
      subscription_expires_at: userData.subscription_expires_at || null
    };
    
    console.log('Attempting to insert user into database...');
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(userDataWithDefaults)
      .select()
      .single();
    
    if (error) {
      console.error('Database error creating user:', error.message || 'Unknown error');
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      if (error.code === '42501') {
        throw new Error('Database permission error: Row Level Security is blocking user creation. Please ensure RLS is disabled for the profiles table in your database.');
      } else if (error.code === '23505') {
        throw new Error('User already exists with this information.');
      } else if (error.code === '23503') {
        throw new Error('Invalid reference data provided (e.g., program_id).');
      } else {
        throw new Error(`Failed to create user: ${error.message || 'Unknown database error'}`);
      }
    }
    
    if (!data) {
      throw new Error('User creation succeeded but no data returned');
    }
    
    console.log('User created successfully:', data.name, 'with ID:', data.id);
    return data;
  } catch (error: any) {
    console.error('Error in createUser:', error?.message || error?.toString() || 'Unknown error');
    if (error?.code) {
      console.error('Error code:', error.code);
    }
    console.error('Full error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const getUser = async (userId: string) => {
  try {
    console.log('Getting user from database:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.log('Database error getting user:', error.code, error.message);
      // If user doesn't exist (PGRST116), return null instead of throwing
      if (error.code === 'PGRST116') {
        console.log('User not found in database (PGRST116)');
        return null;
      }
      throw error;
    }
    
    console.log('User found in database:', data.name);
    return data;
  } catch (error: any) {
    console.error('Exception in getUser:', error?.message || error?.toString() || 'Unknown error');
    console.error('Full error details:', JSON.stringify(error, null, 2));
    throw error;
  }
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

// Program functions
export const getPrograms = async () => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getProgramsByLevel = async (level: 'gymnasie' | 'högskola') => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('level', level)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getProgram = async (programId: string) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
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
  return data || [];
};

// Get courses by level (gymnasie/högskola)
export const getCoursesByLevel = async (level: 'gymnasie' | 'högskola') => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('level', level)
    .order('subject', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

// Get courses by program
export const getCoursesByProgram = async (programId: string) => {
  const { data, error } = await supabase
    .from('program_courses')
    .select(`
      courses (*)
    `)
    .eq('program_id', programId);
  
  if (error) throw error;
  return data?.map(pc => pc.courses).filter(Boolean) || [];
};

// Get courses by program name (for backward compatibility)
export const getCoursesByProgramName = async (programName: string) => {
  // First get the program by name
  const { data: program, error: programError } = await supabase
    .from('programs')
    .select('id')
    .eq('name', programName)
    .single();
  
  if (programError || !program) {
    console.warn('Program not found:', programName);
    return [];
  }
  
  return getCoursesByProgram(program.id);
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

// Note: Course creation is restricted to service_role in RLS
// Regular users should not create courses - they should select from existing ones
export const createCourse = async (courseData: Tables['courses']['Insert']) => {
  try {
    console.log('Attempting to create course (requires admin privileges):', {
      title: courseData.title,
      subject: courseData.subject,
      level: courseData.level
    });
    
    // This will only work if called with service_role key or RLS is disabled
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();
    
    if (error) {
      console.error('Database error creating course:', error.message || 'Unknown error');
      console.error('Course error code:', error.code);
      
      // Provide more specific error messages
      if (error.code === '42501') {
        throw new Error('Permission denied: Only administrators can create courses. Please select from existing courses instead.');
      } else if (error.code === '23505') {
        throw new Error('Course already exists with this information.');
      } else if (error.code === '23503') {
        throw new Error('Invalid reference data provided.');
      } else if (error.code === '42P01') {
        throw new Error('Courses table does not exist. Please check your database setup.');
      } else {
        throw new Error(`Failed to create course: ${error.message || 'Unknown database error'}`);
      }
    }
    
    if (!data) {
      throw new Error('Course creation succeeded but no data returned');
    }
    
    console.log('Course created successfully:', data.title, 'with ID:', data.id);
    return data;
  } catch (error: any) {
    console.error('Error creating course:', error?.message || error?.toString() || 'Unknown error');
    throw error;
  }
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
  try {
    // Shorter timeout for better UX
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database request timeout')), 5000);
    });
    
    const queryPromise = supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error) {
      // If achievements table doesn't exist, return empty array
      if (error.code === '42P01' || error.message?.includes('relation "achievements" does not exist')) {
        console.warn('Achievements table does not exist. Returning empty array.');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error: any) {
    // Handle network errors silently to avoid console spam
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('timeout') || error?.name === 'TypeError') {
      console.warn('Network connectivity issue - achievements unavailable');
    } else {
      console.error('Exception in getAllAchievements:', error instanceof Error ? error.message : JSON.stringify(error, null, 2));
    }
    
    // Return empty array if achievements system is not available
    return [];
  }
};

export const getUserAchievements = async (userId: string) => {
  try {
    // Shorter timeout for better UX
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database request timeout')), 5000);
    });
    
    const queryPromise = supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId);
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error) {
      // If user_achievements table doesn't exist, return empty array
      if (error.code === '42P01' || error.message?.includes('relation "user_achievements" does not exist')) {
        console.warn('User achievements table does not exist. Returning empty array.');
        return [];
      }
      // If progress column doesn't exist, handle gracefully
      if (error.message?.includes('column "progress" does not exist')) {
        console.warn('Progress column does not exist in user_achievements table. Please run the database migration.');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error: any) {
    // Handle network errors silently to avoid console spam
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('timeout') || error?.name === 'TypeError') {
      console.warn('Network connectivity issue - user achievements unavailable');
    } else if (error?.message?.includes('column "progress" does not exist')) {
      console.error('Error loading achievements: Database error: Could not find the \'progress\' column of \'user_achievements\' in the schema cache');
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.error('Exception in getUserAchievements:', error instanceof Error ? error.message : JSON.stringify(error, null, 2));
    }
    
    // Return empty array if achievements system is not available
    return [];
  }
};

export const initializeUserAchievements = async (userId: string) => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Network connection failed. Please check your internet connection.')), 5000);
    });
    
    // First check if user exists in profiles table
    const userProfilePromise = getUser(userId);
    const userProfile = await Promise.race([userProfilePromise, timeoutPromise]);
    
    if (!userProfile) {
      console.log('User profile not found, cannot initialize achievements for user:', userId);
      return [];
    }
    
    // Get all achievements
    const achievementsPromise = getAllAchievements();
    const achievements = await Promise.race([achievementsPromise, timeoutPromise]);
    
    // If no achievements exist, skip initialization
    if (achievements.length === 0) {
      console.log('No achievements found, skipping user achievement initialization');
      return [];
    }
    
    // Create user_achievement records for all achievements
    const userAchievements = achievements.map(achievement => ({
      user_id: userId,
      achievement_id: achievement.id,
      progress: 0,
      unlocked_at: null
    }));
    
    const queryPromise = supabase
      .from('user_achievements')
      .upsert(userAchievements, { onConflict: 'user_id,achievement_id' })
      .select();
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01' || error.message?.includes('relation "user_achievements" does not exist')) {
        console.warn('User achievements table does not exist. Skipping initialization.');
        return [];
      }
      
      // If progress column doesn't exist, handle gracefully
      if (error.message?.includes('column "progress" does not exist')) {
        console.error('Error initializing user achievements: Database error: Could not find the \'progress\' column of \'user_achievements\' in the schema cache');
        console.error('Error details:', JSON.stringify(error, null, 2));
        return [];
      }
      
      // If foreign key constraint violation, user profile doesn't exist
      if (error.code === '23503' && error.message?.includes('user_id')) {
        console.warn('User profile does not exist, cannot initialize achievements for user:', userId);
        return [];
      }
      
      throw new Error(`Database error: ${error.message}`);
    }
    return data || [];
  } catch (error: any) {
    // Handle network errors gracefully
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network connection failed') || error?.name === 'TypeError') {
      console.warn('Network connectivity issue - achievements initialization unavailable');
      throw new Error('Network connection failed. Please check your internet connection.');
    }
    
    console.error('Error initializing user achievements:', error instanceof Error ? error.message : JSON.stringify(error, null, 2));
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
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
  try {
    // Shorter timeout for better UX
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database request timeout')), 5000);
    });
    
    const queryPromise = supabase
      .from('pomodoro_sessions')
      .select('end_time')
      .eq('user_id', userId)
      .order('end_time', { ascending: false });
    
    const { data: sessions, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error) {
      throw error;
    }
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
  } catch (error: any) {
    // Handle network errors silently to avoid console spam
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('timeout') || error?.name === 'TypeError') {
      console.warn('Network connectivity issue - streak calculation unavailable');
    } else {
      console.error('Exception in calculateUserStreak:', error instanceof Error ? error.message : JSON.stringify(error, null, 2));
    }
    
    // Return 0 if we can't calculate streak
    return 0;
  }
};

// Leaderboard functions
export const getFriendsLeaderboard = async (userId: string, timeframe: 'week' | 'month' | 'all' = 'week') => {
  try {
    // Get user's friends
    const friends = await getUserFriends(userId);
    const friendIds = friends.map(f => f.friend_id);
    
    // Include current user in the leaderboard
    const allUserIds = [userId, ...friendIds];
    
    if (allUserIds.length === 0) {
      return [];
    }
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'all':
      default:
        startDate = new Date('2020-01-01'); // Far back date
        break;
    }
    
    // Get pomodoro sessions for all users in timeframe
    let query = supabase
      .from('pomodoro_sessions')
      .select(`
        user_id,
        duration,
        start_time,
        end_time
      `)
      .in('user_id', allUserIds);
    
    if (timeframe !== 'all') {
      query = query.gte('start_time', startDate.toISOString());
    }
    
    const { data: sessions, error: sessionsError } = await query;
    
    if (sessionsError) throw sessionsError;
    
    // Get user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, level, program')
      .in('id', allUserIds);
    
    if (profilesError) throw profilesError;
    
    // Calculate stats for each user
    const leaderboardData = allUserIds.map(id => {
      const userSessions = sessions?.filter(s => s.user_id === id) || [];
      const profile = profiles?.find(p => p.id === id);
      
      const totalMinutes = userSessions.reduce((sum, session) => sum + session.duration, 0);
      const totalSessions = userSessions.length;
      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      
      return {
        userId: id,
        name: profile?.name || 'Unknown',
        level: profile?.level || '',
        program: profile?.program || '',
        totalMinutes,
        totalSessions,
        totalHours,
        remainingMinutes,
        isCurrentUser: id === userId
      };
    });
    
    // Sort by total minutes (descending)
    leaderboardData.sort((a, b) => b.totalMinutes - a.totalMinutes);
    
    // Add positions
    return leaderboardData.map((user, index) => ({
      ...user,
      position: index + 1
    }));
    
  } catch (error) {
    console.error('Error getting friends leaderboard:', error);
    throw error;
  }
};

export const getGlobalLeaderboard = async (limit = 50, timeframe: 'week' | 'month' | 'all' = 'week') => {
  try {
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'all':
      default:
        startDate = new Date('2020-01-01');
        break;
    }
    
    // Get all pomodoro sessions in timeframe
    let query = supabase
      .from('pomodoro_sessions')
      .select(`
        user_id,
        duration,
        profiles!inner (
          id,
          name,
          level,
          program
        )
      `);
    
    if (timeframe !== 'all') {
      query = query.gte('start_time', startDate.toISOString());
    }
    
    const { data: sessions, error } = await query;
    
    if (error) throw error;
    
    // Group by user and calculate totals
    const userStats = new Map();
    
    sessions?.forEach(session => {
      const userId = session.user_id;
      const profile = session.profiles;
      
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          userId,
          name: profile.name,
          level: profile.level,
          program: profile.program,
          totalMinutes: 0,
          totalSessions: 0
        });
      }
      
      const stats = userStats.get(userId);
      stats.totalMinutes += session.duration;
      stats.totalSessions += 1;
    });
    
    // Convert to array and sort
    const leaderboardData = Array.from(userStats.values())
      .map(user => ({
        ...user,
        totalHours: Math.floor(user.totalMinutes / 60),
        remainingMinutes: user.totalMinutes % 60
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        position: index + 1
      }));
    
    return leaderboardData;
    
  } catch (error) {
    console.error('Error getting global leaderboard:', error);
    throw error;
  }
};

// Check and update achievements for a user
export const checkAndUpdateAchievements = async (userId: string) => {
  try {
    console.log('Checking achievements for user:', userId);
    
    // Get user's current achievement progress
    const userAchievements = await getUserAchievements(userId);
    
    // If no achievements exist, skip checking
    if (userAchievements.length === 0) {
      console.log('No user achievements found, skipping achievement check');
      return [];
    }
    
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
    console.error('Error checking achievements:', error instanceof Error ? error.message : JSON.stringify(error, null, 2));
    console.error('Full error object:', JSON.stringify(error, null, 2));
    return [];
  }
};
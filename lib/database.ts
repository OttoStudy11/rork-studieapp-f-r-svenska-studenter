import { supabase } from './supabase';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];

// User functions
export const createUser = async (userData: Tables['users']['Insert']) => {
  try {
    console.log('Creating user with data:', userData);
    
    // First check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
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
      .from('users')
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
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUser = async (userId: string, updates: Tables['users']['Update']) => {
  const { data, error } = await supabase
    .from('users')
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
      friend:users!friends_friend_id_fkey (*)
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
      requester:users!friends_user_id_fkey (*)
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
    .from('users')
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
    .from('users')
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
    .from('users')
    .select('id, name, email, level, program')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);
  
  if (error) throw error;
  return data;
};
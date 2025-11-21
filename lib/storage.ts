import { supabase } from './supabase';
import { Database } from './database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================================================
// USER SETTINGS STORAGE
// =====================================================

export interface UserSettings {
  timer_sound_enabled: boolean;
  timer_haptics_enabled: boolean;
  timer_notifications_enabled: boolean;
  timer_background_enabled: boolean;
  timer_focus_duration: number;
  timer_break_duration: number;
  dark_mode: boolean;
  theme_color: string;
  language: string;
  achievements_notifications: boolean;
  friend_request_notifications: boolean;
  study_reminder_notifications: boolean;
  profile_visible: boolean;
  show_study_stats: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  timer_sound_enabled: true,
  timer_haptics_enabled: true,
  timer_notifications_enabled: true,
  timer_background_enabled: true,
  timer_focus_duration: 25,
  timer_break_duration: 5,
  dark_mode: false,
  theme_color: 'blue',
  language: 'sv',
  achievements_notifications: true,
  friend_request_notifications: true,
  study_reminder_notifications: true,
  profile_visible: true,
  show_study_stats: true,
};

type UserSettingsRow = Database['public']['Tables']['user_settings']['Row'];

export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default
        return await createUserSettings(userId, DEFAULT_SETTINGS);
      }
      throw error;
    }

    return extractSettings(data);
  } catch (error) {
    console.error('Error getting user settings:', error);
    return DEFAULT_SETTINGS;
  }
}

function extractSettings(data: UserSettingsRow): UserSettings {
  return {
    timer_sound_enabled: data.timer_sound_enabled,
    timer_haptics_enabled: data.timer_haptics_enabled,
    timer_notifications_enabled: data.timer_notifications_enabled,
    timer_background_enabled: data.timer_background_enabled,
    timer_focus_duration: data.timer_focus_duration,
    timer_break_duration: data.timer_break_duration,
    dark_mode: data.dark_mode,
    theme_color: data.theme_color,
    language: data.language,
    achievements_notifications: data.achievements_notifications,
    friend_request_notifications: data.friend_request_notifications,
    study_reminder_notifications: data.study_reminder_notifications,
    profile_visible: data.profile_visible,
    show_study_stats: data.show_study_stats,
  };
}

export async function createUserSettings(
  userId: string,
  settings: Partial<UserSettings> = {}
): Promise<UserSettings> {
  const finalSettings = { ...DEFAULT_SETTINGS, ...settings };

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...finalSettings }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return extractSettings(data);
}

export async function updateUserSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return extractSettings(data);
}

// =====================================================
// ACTIVE TIMER SESSION STORAGE
// =====================================================

export interface ActiveTimerSession {
  session_type: 'focus' | 'break';
  status: 'idle' | 'running' | 'paused';
  course_id?: string | null;
  course_name: string;
  total_duration: number;
  remaining_time: number;
  start_timestamp: number;
  paused_at?: number | null;
  device_id?: string | null;
  device_platform?: string | null;
}

type ActiveTimerSessionRow = Database['public']['Tables']['active_timer_sessions']['Row'];

export async function saveActiveTimerSession(
  userId: string,
  session: ActiveTimerSession
): Promise<void> {
  try {
    const { error } = await supabase
      .from('active_timer_sessions')
      .upsert(
        {
          user_id: userId,
          session_type: session.session_type,
          status: session.status,
          course_id: session.course_id || null,
          course_name: session.course_name,
          total_duration: session.total_duration,
          remaining_time: session.remaining_time,
          start_timestamp: session.start_timestamp,
          paused_at: session.paused_at || null,
          device_id: session.device_id || null,
          device_platform: session.device_platform || null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) throw error;
    console.log('Active timer session saved to Supabase');
  } catch (error) {
    console.error('Error saving active timer session:', error);
  }
}

function extractTimerSession(data: ActiveTimerSessionRow): ActiveTimerSession {
  return {
    session_type: data.session_type,
    status: data.status,
    course_id: data.course_id,
    course_name: data.course_name,
    total_duration: data.total_duration,
    remaining_time: data.remaining_time,
    start_timestamp: data.start_timestamp,
    paused_at: data.paused_at,
    device_id: data.device_id,
    device_platform: data.device_platform,
  };
}

export async function getActiveTimerSession(
  userId: string
): Promise<ActiveTimerSession | null> {
  try {
    const { data, error } = await supabase
      .from('active_timer_sessions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return extractTimerSession(data);
  } catch (error) {
    console.error('Error getting active timer session:', error);
    return null;
  }
}

export async function clearActiveTimerSession(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('active_timer_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    console.log('Active timer session cleared from Supabase');
  } catch (error) {
    console.error('Error clearing active timer session:', error);
  }
}

// =====================================================
// ONBOARDING STATUS
// =====================================================

export interface OnboardingStatus {
  completed: boolean;
  current_step?: string | null;
  steps_completed: string[];
  selected_courses?: string[];
  selected_gymnasium_id?: string | null;
  selected_gymnasium_grade?: string | null;
  selected_program?: string | null;
  selected_purpose?: string | null;
}

type UserOnboardingRow = Database['public']['Tables']['user_onboarding']['Row'];

function extractOnboardingStatus(data: UserOnboardingRow): OnboardingStatus {
  return {
    completed: data.completed,
    current_step: data.current_step,
    steps_completed: data.steps_completed || [],
    selected_courses: data.selected_courses || [],
    selected_gymnasium_id: data.selected_gymnasium_id,
    selected_gymnasium_grade: data.selected_gymnasium_grade,
    selected_program: data.selected_program,
    selected_purpose: data.selected_purpose,
  };
}

export async function getOnboardingStatus(
  userId: string
): Promise<OnboardingStatus> {
  try {
    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Create default onboarding record
        return await createOnboardingStatus(userId);
      }
      throw error;
    }

    return extractOnboardingStatus(data);
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return {
      completed: false,
      steps_completed: [],
    };
  }
}

export async function createOnboardingStatus(
  userId: string,
  status: Partial<OnboardingStatus> = {}
): Promise<OnboardingStatus> {
  const { data, error } = await supabase
    .from('user_onboarding')
    .upsert(
      {
        user_id: userId,
        completed: status.completed || false,
        current_step: status.current_step || null,
        steps_completed: status.steps_completed || [],
        selected_courses: status.selected_courses || [],
        selected_gymnasium_id: status.selected_gymnasium_id || null,
        selected_gymnasium_grade: status.selected_gymnasium_grade || null,
        selected_program: status.selected_program || null,
        selected_purpose: status.selected_purpose || null,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return extractOnboardingStatus(data);
}

export async function updateOnboardingStatus(
  userId: string,
  updates: Partial<OnboardingStatus>
): Promise<OnboardingStatus> {
  const { data, error } = await supabase
    .from('user_onboarding')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return extractOnboardingStatus(data);
}

export async function completeOnboarding(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_onboarding')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
    console.log('Onboarding marked as completed in Supabase');
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
}

// =====================================================
// MIGRATION HELPER - Move AsyncStorage to Supabase
// =====================================================

export async function migrateUserDataToSupabase(userId: string): Promise<void> {
  console.log('Starting migration to Supabase for user:', userId);

  try {
    // Migrate timer settings
    const timerSettingsKey = '@timer_settings';
    const storedTimerSettings = await AsyncStorage.getItem(timerSettingsKey);
    if (storedTimerSettings) {
      const settings = JSON.parse(storedTimerSettings);
      await createUserSettings(userId, {
        timer_sound_enabled: settings.soundEnabled,
        timer_haptics_enabled: settings.hapticsEnabled,
        timer_notifications_enabled: settings.notificationsEnabled,
        timer_background_enabled: settings.backgroundTimerEnabled,
        timer_focus_duration: settings.focusDuration,
        timer_break_duration: settings.breakDuration,
      });
      await AsyncStorage.removeItem(timerSettingsKey);
      console.log('✅ Migrated timer settings');
    }

    // Migrate onboarding status
    const onboardingKey = `@onboarding_completed_${userId}`;
    const storedOnboarding = await AsyncStorage.getItem(onboardingKey);
    if (storedOnboarding === 'true') {
      await completeOnboarding(userId);
      await AsyncStorage.removeItem(onboardingKey);
      console.log('✅ Migrated onboarding status');
    }

    // Migrate course data
    const coursesKey = `@courses_${userId}`;
    const storedCourses = await AsyncStorage.getItem(coursesKey);
    if (storedCourses) {
      const courses = JSON.parse(storedCourses);
      // Courses will be migrated through CourseContext
      console.log('✅ Found', courses.length, 'courses to migrate');
    }

    // Migrate user profile
    const profileKey = `@user_profile_${userId}`;
    const storedProfile = await AsyncStorage.getItem(profileKey);
    if (storedProfile) {
      // Profile will be migrated through StudyContext
      console.log('✅ Found user profile to migrate');
    }

    console.log('Migration to Supabase completed successfully!');
  } catch (error) {
    console.error('Error during migration to Supabase:', error);
    throw error;
  }
}

// =====================================================
// CLEANUP OLD ASYNCSTORAGE DATA
// =====================================================

export async function cleanupAsyncStorage(userId: string): Promise<void> {
  try {
    const keysToRemove = [
      '@timer_settings',
      '@timer_state',
      '@timer_notification_id',
      `@onboarding_completed_${userId}`,
      `@courses_${userId}`,
      `@user_profile_${userId}`,
      'isDemoMode',
    ];

    await AsyncStorage.multiRemove(keysToRemove);
    console.log('AsyncStorage cleaned up, all data now in Supabase');
  } catch (error) {
    console.error('Error cleaning up AsyncStorage:', error);
  }
}

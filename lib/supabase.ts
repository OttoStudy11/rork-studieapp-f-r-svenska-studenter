import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

const supabaseUrl = 'https://ekeebrhdpjtbooaiggbw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZWVicmhkcGp0Ym9vYWlnZ2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzUyOTUsImV4cCI6MjA3MTgxMTI5NX0.GInDaGYz-r0o0EZ5O9Qea6Hu742Y7jVQAjqIGZ0-8pU';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'studiestugan-app'
    },
    fetch: (url, options = {}) => {
      // Create a timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).catch(error => {
        clearTimeout(timeoutId);
        // Only log network errors once to avoid spam
        if (!error.logged) {
          console.warn('Network request failed:', error.name || 'NetworkError');
          error.logged = true;
        }
        throw new Error('Network connection failed. Please check your internet connection.');
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }
});

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing database connection...');

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 10000);
    });

    const queryPromise = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    const result = (await Promise.race([queryPromise, timeoutPromise])) as { error?: any };
    const { error } = result ?? {};

    if (error) {
      const safeError = {
        message:
          typeof error?.message === 'string'
            ? error.message
            : (() => {
                try {
                  return JSON.stringify(error);
                } catch (_) {
                  return 'Unknown error';
                }
              })(),
        details: error?.details ?? undefined,
        hint: error?.hint ?? undefined,
        code: error?.code ?? undefined,
      };
      console.error('Database connection test failed:', safeError.message);
      console.error('Error details:', safeError);
      return false;
    }

    console.log('Database connection test successful');
    return true;
  } catch (err: any) {
    const fallback = {
      message: err?.message ?? String(err),
      details: err?.stack ?? undefined,
      hint: '',
      code: err?.code ?? '',
    };
    console.error('Database connection test failed:', fallback.message);
    console.error('Error details:', fallback);
    return false;
  }
};

// Auth helpers
export const getCurrentUser = async () => {
  try {
    console.log('Getting current user...');
    
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.log('No active session:', sessionError?.message || 'No session');
      return null;
    }
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('getCurrentUser timeout')), 5000);
    });
    
    const userPromise = supabase.auth.getUser();
    
    const result = await Promise.race([userPromise, timeoutPromise]);
    const { data: { user }, error } = result;
    
    if (error && error.message.includes('Auth session missing')) {
      console.log('Auth session missing - returning null');
      return null;
    }
    
    console.log('Current user result:', { user: user?.id, error });
    return user;
  } catch (error: any) {
    if (error?.message?.includes('Auth session missing')) {
      console.log('Auth session missing in getCurrentUser');
      return null;
    }
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    console.log('Signing up user:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    console.log('Sign up result:', { user: data?.user?.id, error });
    return { data, error };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log('Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('Sign in result:', { user: data?.user?.id, session: !!data?.session, error });
    return { data, error };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    console.log('Signing out user...');
    const { error } = await supabase.auth.signOut();
    console.log('Sign out result:', { error });
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    console.log('Resetting password for:', email);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    console.log('Reset password result:', { error });
    return { data, error };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { data: null, error };
  }
};

// Remember Me functionality
const REMEMBER_ME_KEY = 'remember_me_token';
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export interface RememberMeSession {
  id: string;
  user_id: string;
  token_hash: string;
  device_info: {
    platform: string;
    userAgent?: string;
    deviceName?: string;
  };
  expires_at: string;
  last_used_at: string;
  created_at: string;
  is_active: boolean;
}

// Generate a secure random token
const generateRememberMeToken = async (): Promise<string> => {
  return await Crypto.randomUUID();
};

// Hash a token for secure storage
const hashToken = async (token: string): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    token,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
};

// Get device information
const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    userAgent: Platform.OS === 'web' ? navigator.userAgent : undefined,
    deviceName: Platform.OS === 'ios' ? 'iOS Device' : Platform.OS === 'android' ? 'Android Device' : 'Web Browser'
  };
};

// Create a remember me session
export const createRememberMeSession = async (userId: string): Promise<{ token?: string; error?: any }> => {
  try {
    console.log('Creating remember me session for user:', userId);
    
    // Check if remember_me_sessions table exists by testing database connection first
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.warn('Database not available, skipping remember me session creation');
      return { error: 'Database connection failed' };
    }
    
    // Check if user profile exists first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      console.warn('User profile does not exist yet, cannot create remember me session for user:', userId);
      return { error: 'User profile not found' };
    }
    
    const token = await generateRememberMeToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + REMEMBER_ME_DURATION).toISOString();
    const deviceInfo = getDeviceInfo();
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Remember me session creation timeout')), 10000);
    });
    
    const insertPromise = supabase
      .from('remember_me_sessions')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        device_info: deviceInfo,
        expires_at: expiresAt,
        is_active: true
      });
    
    const { error } = await Promise.race([insertPromise, timeoutPromise]);
    
    if (error) {
      console.error('Error creating remember me session:', {
        message: error.message || 'Unknown error',
        code: error.code || 'No code',
        details: error.details || 'No details',
        hint: error.hint || 'No hint'
      });
      
      // If table doesn't exist, silently fail
      if (error.code === '42P01' || error.message?.includes('relation "remember_me_sessions" does not exist')) {
        console.warn('Remember me sessions table does not exist, skipping session creation');
        return { error: 'Table not found' };
      }
      
      // If foreign key constraint violation, user profile doesn't exist
      if (error.code === '23503' && error.message?.includes('user_id')) {
        console.warn('User profile does not exist, cannot create remember me session for user:', userId);
        return { error: 'User profile not found' };
      }
      
      return { error: error.message || 'Failed to create remember me session' };
    }
    
    // Store the token locally
    await AsyncStorage.setItem(REMEMBER_ME_KEY, token);
    console.log('Remember me session created successfully');
    
    return { token };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error('Exception creating remember me session:', errorMessage);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    
    // Handle network errors gracefully
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('timeout') || error?.name === 'TypeError') {
      console.warn('Network connectivity issue - remember me session creation unavailable');
      return { error: 'Network connection failed' };
    }
    
    return { error: errorMessage };
  }
};

// Validate a remember me session
export const validateRememberMeSession = async (): Promise<{ userId?: string; error?: any }> => {
  try {
    console.log('Validating remember me session...');
    
    const token = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    if (!token) {
      console.log('No remember me token found');
      return { error: 'No token found' };
    }
    
    // Check if database is available
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.warn('Database not available, cannot validate remember me session');
      return { error: 'Database connection failed' };
    }
    
    const tokenHash = await hashToken(token);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Remember me validation timeout')), 10000);
    });
    
    const queryPromise = supabase
      .from('remember_me_sessions')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error || !data) {
      console.log('Invalid or expired remember me session:', error?.message || 'No data');
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      
      // If table doesn't exist, silently fail
      if (error?.code === '42P01' || error?.message?.includes('relation "remember_me_sessions" does not exist')) {
        console.warn('Remember me sessions table does not exist');
        return { error: 'Table not found' };
      }
      
      return { error: error?.message || 'Session not found' };
    }
    
    // Update last used timestamp (don't await to avoid blocking)
    (async () => {
      try {
        await supabase
          .from('remember_me_sessions')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', data.id);
        console.log('Updated last used timestamp');
      } catch (err: any) {
        console.warn('Failed to update last used timestamp:', err?.message || 'Unknown error');
      }
    })();
    
    console.log('Remember me session validated for user:', data.user_id);
    return { userId: data.user_id };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error('Exception validating remember me session:', errorMessage);
    
    // Handle network errors gracefully
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('timeout') || error?.name === 'TypeError') {
      console.warn('Network connectivity issue - remember me validation unavailable');
      return { error: 'Network connection failed' };
    }
    
    return { error: errorMessage };
  }
};

// Clear remember me session
export const clearRememberMeSession = async (): Promise<void> => {
  try {
    console.log('Clearing remember me session...');
    
    const token = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    if (token) {
      try {
        const tokenHash = await hashToken(token);
        
        // Deactivate the session in database (don't await to avoid blocking logout)
        (async () => {
          try {
            await supabase
              .from('remember_me_sessions')
              .update({ is_active: false })
              .eq('token_hash', tokenHash);
            console.log('Remember me session deactivated in database');
          } catch (err: any) {
            console.warn('Failed to deactivate remember me session in database:', err?.message || 'Unknown error');
          }
        })();
      } catch (dbError) {
        console.warn('Failed to deactivate remember me session in database:', dbError);
      }
    }
    
    // Always remove local token regardless of database operation
    await AsyncStorage.removeItem(REMEMBER_ME_KEY);
    console.log('Remember me session cleared locally');
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error('Error clearing remember me session:', errorMessage);
    
    // Still try to remove local token even if there's an error
    try {
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
    } catch (storageError) {
      console.error('Failed to remove remember me token from storage:', storageError);
    }
  }
};

// Clean up expired sessions for a user
export const cleanupExpiredSessions = async (userId: string): Promise<void> => {
  try {
    await supabase
      .from('remember_me_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .lt('expires_at', new Date().toISOString());
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};
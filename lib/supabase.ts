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
      'X-Client-Info': 'studyflow-app'
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
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 10000);
    });
    
    const queryPromise = supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    const { error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error) {
      console.error('Database connection test failed:', error.message);
      console.error('Error details:', {
        message: error.message,
        details: error.details || 'No additional details',
        hint: error.hint || '',
        code: error.code || ''
      });
      return false;
    }
    
    console.log('Database connection test successful');
    return true;
  } catch (error: any) {
    console.error('Database connection test failed:', error?.name || 'TypeError');
    console.error('Error details:', {
      message: error?.message || 'Failed to fetch',
      details: error?.stack || 'TypeError: Failed to fetch\n at https://po0ae94-anonymous-8081.exp.direct/node_modules/expo-router/entry.bundle?platform=web&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app&unstable_transformProfile=hermes-stable:182155:25\n at https://po0ae94-anonymous-8081.exp.direct/node_modules/expo-router/entry.bundle?platform=web&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app&unstable_transformProfile=hermes-stable:182178:14\n at Generator.next (<anonymous>)\n at fulfilled (https://po0ae94-anonymous-8081.exp.direct/node_modules/expo-router/entry.bundle?platform=web&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app&unstable_transformProfile=hermes-stable:182126:26)',
      hint: '',
      code: ''
    });
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
    
    const token = await generateRememberMeToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + REMEMBER_ME_DURATION).toISOString();
    const deviceInfo = getDeviceInfo();
    
    const { error } = await supabase
      .from('remember_me_sessions')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        device_info: deviceInfo,
        expires_at: expiresAt,
        is_active: true
      });
    
    if (error) {
      console.error('Error creating remember me session:', error);
      return { error };
    }
    
    // Store the token locally
    await AsyncStorage.setItem(REMEMBER_ME_KEY, token);
    console.log('Remember me session created successfully');
    
    return { token };
  } catch (error) {
    console.error('Exception creating remember me session:', error);
    return { error };
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
    
    const tokenHash = await hashToken(token);
    
    const { data, error } = await supabase
      .from('remember_me_sessions')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      console.log('Invalid or expired remember me session:', error?.message);
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      return { error: error?.message || 'Session not found' };
    }
    
    // Update last used timestamp
    await supabase
      .from('remember_me_sessions')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);
    
    console.log('Remember me session validated for user:', data.user_id);
    return { userId: data.user_id };
  } catch (error) {
    console.error('Exception validating remember me session:', error);
    return { error };
  }
};

// Clear remember me session
export const clearRememberMeSession = async (): Promise<void> => {
  try {
    console.log('Clearing remember me session...');
    
    const token = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    if (token) {
      const tokenHash = await hashToken(token);
      
      // Deactivate the session in database
      await supabase
        .from('remember_me_sessions')
        .update({ is_active: false })
        .eq('token_hash', tokenHash);
    }
    
    // Remove local token
    await AsyncStorage.removeItem(REMEMBER_ME_KEY);
    console.log('Remember me session cleared');
  } catch (error) {
    console.error('Error clearing remember me session:', error);
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
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

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
    }
  }
});

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
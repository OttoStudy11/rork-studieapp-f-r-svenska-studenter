import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser, signIn, signUp, signOut, resetPassword } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  setOnboardingCompleted: () => Promise<void>;
}

const ONBOARDING_KEY = 'hasCompletedOnboarding';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const checkOnboardingStatus = useCallback(async (userId: string) => {
    try {
      // First check AsyncStorage for local onboarding status
      const stored = await AsyncStorage.getItem(`${ONBOARDING_KEY}_${userId}`);
      if (stored === 'true') {
        setHasCompletedOnboarding(true);
        return;
      }
      
      // If not found locally, check if user exists in database
      try {
        const { getUser } = await import('@/lib/database');
        const dbUser = await getUser(userId);
        if (dbUser) {
          // User exists in database, mark onboarding as completed
          await AsyncStorage.setItem(`${ONBOARDING_KEY}_${userId}`, 'true');
          setHasCompletedOnboarding(true);
        } else {
          setHasCompletedOnboarding(false);
        }
      } catch (dbError) {
        // User doesn't exist in database, onboarding not completed
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        await checkOnboardingStatus(currentUser.id);
      } else {
        setUser(null);
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  }, [checkOnboardingStatus]);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully');
          setUser(session.user);
          await checkOnboardingStatus(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setHasCompletedOnboarding(false);
        } else if (session?.user) {
          setUser(session.user);
          await checkOnboardingStatus(session.user.id);
        } else {
          setUser(null);
          setHasCompletedOnboarding(false);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, checkOnboardingStatus]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        return { error };
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await signUp(email, password);
      if (error) {
        return { error };
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    try {
      const { data, error } = await resetPassword(email);
      return { error };
    } catch (error) {
      return { error };
    }
  }, []);

  const setOnboardingCompleted = useCallback(async () => {
    if (user) {
      try {
        await AsyncStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
        setHasCompletedOnboarding(true);
      } catch (error) {
        console.error('Error setting onboarding completed:', error);
      }
    }
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasCompletedOnboarding,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    setOnboardingCompleted
  };
});
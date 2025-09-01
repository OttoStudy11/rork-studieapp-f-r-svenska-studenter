import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple UUID v4 generator for demo purposes
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthContextType {
  user: DemoUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  signIn: (name: string, email?: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  setOnboardingCompleted: () => Promise<void>;
}

const USER_KEY = 'demo_user';
const ONBOARDING_KEY = 'hasCompletedOnboarding';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const checkOnboardingStatus = useCallback(async (userId: string) => {
    try {
      const stored = await AsyncStorage.getItem(`${ONBOARDING_KEY}_${userId}`);
      setHasCompletedOnboarding(stored === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      console.log('Initializing demo auth...');
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as DemoUser;
        console.log('Found stored user:', parsedUser.name);
        setUser(parsedUser);
        await checkOnboardingStatus(parsedUser.id);
      } else {
        console.log('No stored user found');
        setUser(null);
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      setHasCompletedOnboarding(false);
    } finally {
      console.log('Auth initialization complete');
      setIsLoading(false);
    }
  }, [checkOnboardingStatus]);

  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      if (mounted) {
        await initializeAuth();
      }
    };
    
    initialize();
    
    // Fallback timeout to ensure loading doesn't get stuck
    const fallbackTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth initialization timeout - forcing loading to false');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
    };
  }, [initializeAuth]);

  const handleSignIn = useCallback(async (name: string, email?: string) => {
    try {
      if (!name.trim()) {
        return { error: { message: 'Namn krävs' } };
      }

      const newUser: DemoUser = {
        id: generateUUID(),
        name: name.trim(),
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@demo.com`,
        createdAt: new Date().toISOString()
      };

      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
      setHasCompletedOnboarding(false);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      if (user) {
        await AsyncStorage.removeItem(`${ONBOARDING_KEY}_${user.id}`);
      }
      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [user]);

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
    signOut: handleSignOut,
    setOnboardingCompleted
  };
});
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionType = 'free' | 'premium';

export interface PremiumLimits {
  maxCourses: number;
  maxNotes: number;
  maxFriends: number;
  maxStudySessions: number;
  canCustomizeTimer: boolean;
  canExportData: boolean;
  canUseAdvancedStats: boolean;
  canUseDarkMode: boolean;
  canUseCustomThemes: boolean;
  canUseAdvancedTimers: boolean;
  canAccessPremiumContent: boolean;
  canUseOfflineMode: boolean;
}

export interface PremiumContextType {
  subscriptionType: SubscriptionType;
  subscriptionExpiresAt: Date | null;
  isPremium: boolean;
  isLoading: boolean;
  limits: PremiumLimits;
  
  // Premium check functions
  canAddCourse: (currentCount: number) => boolean;
  canAddNote: (currentCount: number) => boolean;
  canAddFriend: (currentCount: number) => boolean;
  canAddStudySession: (currentCount: number) => boolean;
  checkFeatureAccess: (feature: keyof PremiumLimits) => boolean;
  
  // Premium actions
  upgradeToPremium: () => Promise<void>;
  showPremiumModal: (feature: string) => void;
  
  // Subscription management
  refreshSubscription: () => Promise<void>;
  
  // Demo mode
  isDemoMode: boolean;
  enableDemoMode: () => void;
  exitDemoMode: () => void;
}

const FREE_LIMITS: PremiumLimits = {
  maxCourses: 3,
  maxNotes: 10,
  maxFriends: 3,
  maxStudySessions: 50,
  canCustomizeTimer: false,
  canExportData: false,
  canUseAdvancedStats: false,
  canUseDarkMode: false,
  canUseCustomThemes: false,
  canUseAdvancedTimers: false,
  canAccessPremiumContent: false,
  canUseOfflineMode: false,
};

const PREMIUM_LIMITS: PremiumLimits = {
  maxCourses: Infinity,
  maxNotes: Infinity,
  maxFriends: Infinity,
  maxStudySessions: Infinity,
  canCustomizeTimer: true,
  canExportData: true,
  canUseAdvancedStats: true,
  canUseDarkMode: true,
  canUseCustomThemes: true,
  canUseAdvancedTimers: true,
  canAccessPremiumContent: true,
  canUseOfflineMode: true,
};

const DEMO_MODE_KEY = 'isDemoMode';

export const [PremiumProvider, usePremium] = createContextHook(() => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>('free');
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadDemoModeState = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(DEMO_MODE_KEY);
      setIsDemoMode(stored === 'true');
    } catch (error) {
      console.error('Error loading demo mode state:', error);
    }
  }, []);

  const loadSubscriptionData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!authUser) {
        setSubscriptionType('free');
        setSubscriptionExpiresAt(null);
        return;
      }
      
      console.log('Loading subscription data for user:', authUser.id);
      
      // Get user profile with premium status from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('premium_status')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error('Error loading subscription data:', error);
        setSubscriptionType('free');
        setSubscriptionExpiresAt(null);
        return;
      }
      
      // Set subscription based on database value
      const isPremiumUser = profile?.premium_status === true;
      setSubscriptionType(isPremiumUser ? 'premium' : 'free');
      setSubscriptionExpiresAt(null); // For now, no expiration dates
      
      console.log('User subscription status:', isPremiumUser ? 'premium' : 'free');
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setSubscriptionType('free');
      setSubscriptionExpiresAt(null);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  // Load subscription data when user changes
  useEffect(() => {
    if (isAuthenticated && authUser) {
      loadSubscriptionData();
    } else {
      setSubscriptionType('free');
      setSubscriptionExpiresAt(null);
      setIsLoading(false);
    }
  }, [authUser, isAuthenticated, loadSubscriptionData]);

  // Load demo mode state
  useEffect(() => {
    loadDemoModeState();
  }, [loadDemoModeState]);

  const isPremium = useMemo(() => {
    if (subscriptionType !== 'premium') return false;
    if (!subscriptionExpiresAt) return true; // Lifetime premium
    return subscriptionExpiresAt > new Date();
  }, [subscriptionType, subscriptionExpiresAt]);

  const limits = useMemo(() => {
    return isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
  }, [isPremium]);

  const canAddCourse = useCallback((currentCount: number) => {
    return currentCount < limits.maxCourses;
  }, [limits.maxCourses]);

  const canAddNote = useCallback((currentCount: number) => {
    return currentCount < limits.maxNotes;
  }, [limits.maxNotes]);

  const canAddFriend = useCallback((currentCount: number) => {
    return currentCount < limits.maxFriends;
  }, [limits.maxFriends]);

  const canAddStudySession = useCallback((currentCount: number) => {
    return currentCount < limits.maxStudySessions;
  }, [limits.maxStudySessions]);

  const checkFeatureAccess = useCallback((feature: keyof PremiumLimits) => {
    return limits[feature] === true;
  }, [limits]);

  const showPremiumModal = useCallback((feature: string) => {
    console.log(`Premium feature blocked: ${feature}`);
    // You can implement a modal or toast here
    // For now, just log the attempt
  }, []);

  const upgradeToPremium = useCallback(async () => {
    try {
      if (!authUser) {
        console.log('No user logged in');
        return;
      }
      
      // For demo purposes, toggle premium status
      const newPremiumStatus = !isPremium;
      
      const { error } = await supabase
        .from('profiles')
        .update({ premium_status: newPremiumStatus })
        .eq('id', authUser.id);
      
      if (error) {
        console.error('Error updating premium status:', error);
        return;
      }
      
      // Refresh subscription data
      await loadSubscriptionData();
      
      console.log(`Premium status updated to: ${newPremiumStatus}`);
    } catch (error) {
      console.error('Error upgrading to premium:', error);
    }
  }, [authUser, isPremium, loadSubscriptionData]);

  const refreshSubscription = useCallback(async () => {
    await loadSubscriptionData();
  }, [loadSubscriptionData]);

  const enableDemoMode = useCallback(async () => {
    try {
      await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
      setIsDemoMode(true);
      console.log('Demo mode enabled');
    } catch (error) {
      console.error('Error enabling demo mode:', error);
    }
  }, []);

  const exitDemoMode = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(DEMO_MODE_KEY);
      setIsDemoMode(false);
    } catch (error) {
      console.error('Error exiting demo mode:', error);
    }
  }, []);

  return useMemo(() => ({
    subscriptionType,
    subscriptionExpiresAt,
    isPremium,
    isLoading,
    limits,
    canAddCourse,
    canAddNote,
    canAddFriend,
    canAddStudySession,
    checkFeatureAccess,
    upgradeToPremium,
    showPremiumModal,
    refreshSubscription,
    isDemoMode,
    enableDemoMode,
    exitDemoMode,
  }), [
    subscriptionType,
    subscriptionExpiresAt,
    isPremium,
    isLoading,
    limits,
    canAddCourse,
    canAddNote,
    canAddFriend,
    canAddStudySession,
    checkFeatureAccess,
    upgradeToPremium,
    showPremiumModal,
    refreshSubscription,
    isDemoMode,
    enableDemoMode,
    exitDemoMode,
  ]);
});
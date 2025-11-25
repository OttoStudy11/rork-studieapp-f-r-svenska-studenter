import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionType = 'free' | 'premium';

export interface PremiumLimits {
  maxCourses: number;
  maxNotes: number;
  maxFriends: number;
  canCustomizeTimer: boolean;
  canExportData: boolean;
  canUseAdvancedStats: boolean;
  canUseDarkMode: boolean;
  canUseCustomThemes: boolean;
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
  
  // Premium actions
  upgradeToPremium: () => Promise<void>;
  showPremiumModal: (feature: string) => void;
  
  // Demo mode
  isDemoMode: boolean;
  enableDemoMode: () => void;
  exitDemoMode: () => void;
}

const FREE_LIMITS: PremiumLimits = {
  maxCourses: 3,
  maxNotes: 10,
  maxFriends: 3,
  canCustomizeTimer: false,
  canExportData: false,
  canUseAdvancedStats: false,
  canUseDarkMode: false,
  canUseCustomThemes: false,
};

const PREMIUM_LIMITS: PremiumLimits = {
  maxCourses: Infinity,
  maxNotes: Infinity,
  maxFriends: Infinity,
  canCustomizeTimer: true,
  canExportData: true,
  canUseAdvancedStats: true,
  canUseDarkMode: true,
  canUseCustomThemes: true,
};

const DEMO_MODE_KEY = 'isDemoMode';

export const [PremiumProvider, usePremium] = createContextHook(() => {
  const { user: authUser, isAuthenticated } = useAuth();
  const { showInfo } = useToast();
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
      if (!authUser) return;
      
      // For demo users, always set to free subscription
      // In a real app, this would query the database
      console.log('Loading subscription data for demo user:', authUser.id);
      setSubscriptionType('free');
      setSubscriptionExpiresAt(null);
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

  const showPremiumModal = useCallback((feature: string) => {
    showInfo(
      'Premium krävs',
      `${feature} är endast tillgängligt för Premium-användare. Uppgradera för att låsa upp alla funktioner!`
    );
  }, [showInfo]);

  const upgradeToPremium = useCallback(async () => {
    // TODO: Implement actual payment flow with Stripe
    // For now, just show info about premium
    showInfo(
      'Uppgradera till Premium',
      'Premium-funktioner kommer snart! Du får obegränsat antal kurser, anteckningar, avancerad statistik och mycket mer.'
    );
  }, [showInfo]);

  const enableDemoMode = useCallback(async () => {
    try {
      await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
      setIsDemoMode(true);
      showInfo('Demo-läge aktiverat', 'Du kan nu testa appen med exempeldata. Skapa ett konto för att spara din riktiga data.');
    } catch (error) {
      console.error('Error enabling demo mode:', error);
    }
  }, [showInfo]);

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
    upgradeToPremium,
    showPremiumModal,
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
    upgradeToPremium,
    showPremiumModal,
    isDemoMode,
    enableDemoMode,
    exitDemoMode,
  ]);
});
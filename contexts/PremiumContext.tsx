import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import Purchases, { PurchasesOffering, PurchasesPackage, LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

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
  canUseAIChat: boolean;
  canUseFlashcards: boolean;
  canUseBattle: boolean;
  canUseAdvancedStatistics: boolean;
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
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  getOfferings: () => Promise<PurchasesOffering | null>;
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
  canUseAIChat: false,
  canUseFlashcards: false,
  canUseBattle: false,
  canUseAdvancedStatistics: false,
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
  canUseAIChat: true,
  canUseFlashcards: true,
  canUseBattle: true,
  canUseAdvancedStatistics: true,
};

const DEMO_MODE_KEY = 'isDemoMode';

const REVENUECAT_API_KEY_IOS = 'appl_ttKXYkEBKHJdIqTkYvbLSbUSDcX';
const REVENUECAT_API_KEY_ANDROID = 'goog_YOUR_ANDROID_KEY_HERE'; // Add your Google Play key when ready

export const [PremiumProvider, usePremium] = createContextHook(() => {
  const { user: authUser, isAuthenticated } = useAuth();
  const { showInfo, showError, showSuccess } = useToast();
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>('free');
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isRevenueCatInitialized, setIsRevenueCatInitialized] = useState(false);

  const syncRevenueCatWithDatabase = useCallback(async (customerInfo: any) => {
    try {
      if (!authUser) return;
      
      const hasPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      const expirationDate = customerInfo.entitlements.active['premium']?.expirationDate;
      
      console.log('[RevenueCat] Syncing with database - Has Premium:', hasPremium);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_type: hasPremium ? 'premium' : 'free',
          subscription_expires_at: expirationDate || null,
        })
        .eq('id', authUser.id);
      
      if (error) {
        console.error('[RevenueCat] Error syncing with database:', error);
      } else {
        console.log('[RevenueCat] Successfully synced with database');
        setSubscriptionType(hasPremium ? 'premium' : 'free');
        setSubscriptionExpiresAt(expirationDate ? new Date(expirationDate) : null);
      }
    } catch (error) {
      console.error('[RevenueCat] Sync error:', error);
    }
  }, [authUser]);

  const initializeRevenueCat = useCallback(async () => {
    try {
      if (isRevenueCatInitialized) return;
      
      console.log('[RevenueCat] Initializing...');
      
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      
      const apiKey = Platform.select({
        ios: REVENUECAT_API_KEY_IOS,
        android: REVENUECAT_API_KEY_ANDROID,
      });

      if (!apiKey || apiKey.includes('YOUR_')) {
        console.warn('[RevenueCat] API key not configured. Purchases will not work until you add your RevenueCat API keys.');
        return;
      }

      await Purchases.configure({ apiKey });
      
      if (authUser?.id) {
        await Purchases.logIn(authUser.id);
        console.log('[RevenueCat] Logged in user:', authUser.id);
      }
      
      Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
        console.log('[RevenueCat] Customer info updated:', customerInfo);
        await syncRevenueCatWithDatabase(customerInfo);
      });
      
      setIsRevenueCatInitialized(true);
      console.log('[RevenueCat] Initialized successfully');
    } catch (error) {
      console.error('[RevenueCat] Initialization error:', error);
    }
  }, [authUser, isRevenueCatInitialized, syncRevenueCatWithDatabase]);

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
      
      // Query the database to get the user's premium status
      console.log('Loading subscription data for user:', authUser.id);
      
      // Check if the user has premium status from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_type, subscription_expires_at')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error('Error loading subscription:', error);
        setSubscriptionType('free');
        setSubscriptionExpiresAt(null);
        return;
      }
      
      setSubscriptionType(profile?.subscription_type || 'free');
      setSubscriptionExpiresAt(profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setSubscriptionType('free');
      setSubscriptionExpiresAt(null);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    initializeRevenueCat();
  }, [initializeRevenueCat]);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      loadSubscriptionData();
    } else {
      setSubscriptionType('free');
      setSubscriptionExpiresAt(null);
      setIsLoading(false);
    }
  }, [authUser, isAuthenticated, loadSubscriptionData]);

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

  const getOfferings = useCallback(async () => {
    try {
      console.log('[RevenueCat] Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null) {
        console.log('[RevenueCat] Available offerings:', offerings.current);
        return offerings.current;
      } else {
        console.log('[RevenueCat] No offerings available');
        return null;
      }
    } catch (error) {
      console.error('[RevenueCat] Error fetching offerings:', error);
      return null;
    }
  }, []);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    try {
      console.log('[RevenueCat] Purchasing package:', pkg.identifier);
      
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      
      const hasPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      
      if (hasPremium) {
        console.log('[RevenueCat] Purchase successful!');
        showSuccess('Köpet lyckades!', 'Välkommen till Premium! Alla funktioner är nu upplåsta.');
        await syncRevenueCatWithDatabase(customerInfo);
        return true;
      } else {
        console.log('[RevenueCat] Purchase completed but premium not active');
        return false;
      }
    } catch (error: any) {
      console.error('[RevenueCat] Purchase error:', error);
      
      if (!error.userCancelled) {
        showError('Köpet misslyckades', 'Försök igen senare eller kontakta support om problemet kvarstår.');
      }
      
      return false;
    }
  }, [showSuccess, showError, syncRevenueCatWithDatabase]);

  const restorePurchases = useCallback(async () => {
    try {
      console.log('[RevenueCat] Restoring purchases...');
      
      const customerInfo = await Purchases.restorePurchases();
      const hasPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      
      if (hasPremium) {
        console.log('[RevenueCat] Purchases restored successfully!');
        showSuccess('Köp återställda!', 'Dina premium-funktioner är nu aktiva.');
        await syncRevenueCatWithDatabase(customerInfo);
        return true;
      } else {
        console.log('[RevenueCat] No purchases to restore');
        showInfo('Inga köp hittades', 'Vi kunde inte hitta några tidigare köp på detta konto.');
        return false;
      }
    } catch (error) {
      console.error('[RevenueCat] Restore error:', error);
      showError('Återställning misslyckades', 'Försök igen senare.');
      return false;
    }
  }, [showSuccess, showError, showInfo, syncRevenueCatWithDatabase]);

  const upgradeToPremium = useCallback(async () => {
    console.log('[Premium] Opening upgrade flow');
  }, []);

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
    purchasePackage,
    restorePurchases,
    getOfferings,
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
    purchasePackage,
    restorePurchases,
    getOfferings,
    showPremiumModal,
    isDemoMode,
    enableDemoMode,
    exitDemoMode,
  ]);
});
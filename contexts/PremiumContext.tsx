import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import {
  initializeRevenueCat,
  loginUser,
  logoutUser,
  getOfferings as fetchOfferings,
  purchasePackage as executePurchase,
  restorePurchases as executeRestore,
  getCustomerInfo,
  addCustomerInfoUpdateListener,
  isRevenueCatInitialized,
  PREMIUM_ENTITLEMENT_ID,
  getDebugMode,
} from '@/services/revenuecat';
import {
  savePremiumStatus,
  loadPremiumStatus,
  clearPremiumStorage,
  startOfflineGracePeriod,
  getOfflinePremiumStatus,
  shouldSyncPremiumStatus,
} from '@/lib/premium-storage';

// ============================================================================
// TYPES
// ============================================================================
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
  isOffline: boolean;
  limits: PremiumLimits;
  
  canAddCourse: (currentCount: number) => boolean;
  canAddNote: (currentCount: number) => boolean;
  canAddFriend: (currentCount: number) => boolean;
  
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  getOfferings: () => Promise<PurchasesOffering | null>;
  refreshPremiumStatus: () => Promise<void>;
  showPremiumModal: (feature: string) => void;
  
  isDemoMode: boolean;
  enableDemoMode: () => void;
  exitDemoMode: () => void;
  
  devPremiumEnabled: boolean;
  setDevPremiumEnabled: (enabled: boolean) => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================
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

// ============================================================================
// PROVIDER
// ============================================================================
export const [PremiumProvider, usePremium] = createContextHook(() => {
  const { user: authUser, isAuthenticated } = useAuth();
  const { showInfo, showError, showSuccess } = useToast();
  
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>('free');
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [devPremiumEnabled, setDevPremiumEnabledState] = useState(false);
  
  const listenerCleanupRef = useRef<(() => void) | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastSyncAttemptRef = useRef<number>(0);

  // Sync premium status to Supabase database
  const syncToDatabase = useCallback(async (isPremium: boolean, expirationDate: Date | null) => {
    if (!authUser) return;
    
    try {
      console.log('[Premium] Syncing to database:', { isPremium, expirationDate });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_type: isPremium ? 'premium' : 'free',
          subscription_expires_at: expirationDate?.toISOString() || null,
        })
        .eq('id', authUser.id);
      
      if (error) {
        console.error('[Premium] Database sync error:', error);
      } else {
        console.log('[Premium] Database sync successful');
      }
    } catch (error) {
      console.error('[Premium] Database sync exception:', error);
    }
  }, [authUser]);

  // Process customer info from RevenueCat
  const processCustomerInfo = useCallback(async (customerInfo: CustomerInfo) => {
    const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    const isPremium = typeof premiumEntitlement !== 'undefined';
    const expirationDate = premiumEntitlement?.expirationDate 
      ? new Date(premiumEntitlement.expirationDate)
      : null;
    
    console.log('[Premium] Processing customer info:', { isPremium, expirationDate });
    
    // Update local state
    setSubscriptionType(isPremium ? 'premium' : 'free');
    setSubscriptionExpiresAt(expirationDate);
    setIsOffline(false);
    
    // Persist to local storage
    await savePremiumStatus(isPremium, expirationDate);
    
    // Sync to database
    await syncToDatabase(isPremium, expirationDate);
  }, [syncToDatabase]);

  // Load dev premium override
  const loadDevPremium = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('dev_premium_override');
      if (stored === 'true') {
        setDevPremiumEnabledState(true);
        console.log('[Premium] Dev premium override enabled');
      }
    } catch (error) {
      console.error('[Premium] Failed to load dev premium:', error);
    }
  }, []);

  // Set dev premium override
  const setDevPremiumEnabled = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('dev_premium_override', enabled ? 'true' : 'false');
      setDevPremiumEnabledState(enabled);
      console.log('[Premium] Dev premium override:', enabled);
      showSuccess(
        enabled ? 'Dev Premium aktiverat' : 'Dev Premium inaktiverat',
        enabled ? 'Alla premium-funktioner är nu upplåsta' : 'Premium-funktioner kräver nu prenumeration'
      );
    } catch (error) {
      console.error('[Premium] Failed to save dev premium:', error);
      showError('Fel', 'Kunde inte spara inställning');
    }
  }, [showSuccess, showError]);

  // Initialize RevenueCat and load premium status
  const initializePremium = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[Premium] Initializing...');
      
      // Load dev premium override first
      await loadDevPremium();
      
      // First, load cached premium status for immediate UI response
      const cachedStatus = await loadPremiumStatus();
      if (cachedStatus.isPremium && cachedStatus.isCacheValid) {
        console.log('[Premium] Using valid cached status');
        setSubscriptionType('premium');
        setSubscriptionExpiresAt(cachedStatus.expirationDate);
      }
      
      // Initialize RevenueCat
      const initialized = await initializeRevenueCat(authUser?.id);
      
      if (!initialized) {
        console.warn('[Premium] RevenueCat initialization failed');
        // Fall back to cached/offline status
        const offlinePremium = await getOfflinePremiumStatus();
        if (offlinePremium) {
          console.log('[Premium] Using offline premium status');
          setSubscriptionType('premium');
          setIsOffline(true);
          await startOfflineGracePeriod();
        }
        return;
      }
      
      // Login user if authenticated
      if (authUser?.id) {
        const { success } = await loginUser(authUser.id);
        if (!success) {
          console.warn('[Premium] Failed to login user to RevenueCat');
        }
      }
      
      // Fetch current customer info
      const result = await getCustomerInfo();
      
      if (result.success && result.customerInfo) {
        await processCustomerInfo(result.customerInfo);
      } else {
        console.warn('[Premium] Failed to get customer info, using cached status');
        const offlinePremium = await getOfflinePremiumStatus();
        setSubscriptionType(offlinePremium ? 'premium' : 'free');
        setIsOffline(true);
      }
      
      // Set up customer info update listener
      if (listenerCleanupRef.current) {
        listenerCleanupRef.current();
      }
      listenerCleanupRef.current = addCustomerInfoUpdateListener(async (customerInfo) => {
        console.log('[Premium] Customer info updated via listener');
        await processCustomerInfo(customerInfo);
      });
      
    } catch (error) {
      console.error('[Premium] Initialization error:', error);
      // Fall back to cached status
      const cachedStatus = await loadPremiumStatus();
      if (cachedStatus.isPremium) {
        setSubscriptionType('premium');
        setSubscriptionExpiresAt(cachedStatus.expirationDate);
        setIsOffline(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id, processCustomerInfo, loadDevPremium]);

  // Refresh premium status (manual sync)
  const refreshPremiumStatus = useCallback(async () => {
    // Rate limit: don't sync more than once per 10 seconds
    const now = Date.now();
    if (now - lastSyncAttemptRef.current < 10000) {
      console.log('[Premium] Sync rate limited');
      return;
    }
    lastSyncAttemptRef.current = now;
    
    console.log('[Premium] Refreshing status...');
    
    if (!isRevenueCatInitialized()) {
      await initializePremium();
      return;
    }
    
    const result = await getCustomerInfo();
    if (result.success && result.customerInfo) {
      await processCustomerInfo(result.customerInfo);
      setIsOffline(false);
    } else {
      console.warn('[Premium] Failed to refresh status');
      setIsOffline(true);
    }
  }, [initializePremium, processCustomerInfo]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[Premium] App became active, checking if sync needed');
        const shouldSync = await shouldSyncPremiumStatus();
        if (shouldSync) {
          await refreshPremiumStatus();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [refreshPremiumStatus]);

  // Initialize on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && authUser) {
      initializePremium();
    } else {
      // User logged out
      setSubscriptionType('free');
      setSubscriptionExpiresAt(null);
      setIsLoading(false);
      setIsOffline(false);
      
      // Logout from RevenueCat
      logoutUser();
      
      // Clear local storage
      clearPremiumStorage();
      
      // Clean up listener
      if (listenerCleanupRef.current) {
        listenerCleanupRef.current();
        listenerCleanupRef.current = null;
      }
    }
    
    return () => {
      if (listenerCleanupRef.current) {
        listenerCleanupRef.current();
        listenerCleanupRef.current = null;
      }
    };
  }, [authUser, isAuthenticated, initializePremium]);

  // Calculate if user is premium
  const isPremium = useMemo(() => {
    // Dev override takes precedence
    if (devPremiumEnabled) return true;
    
    if (subscriptionType !== 'premium') return false;
    if (!subscriptionExpiresAt) return true; // Lifetime or no expiration set
    return subscriptionExpiresAt > new Date();
  }, [subscriptionType, subscriptionExpiresAt, devPremiumEnabled]);

  // Get limits based on subscription
  const limits = useMemo(() => {
    return isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
  }, [isPremium]);

  // Limit check functions
  const canAddCourse = useCallback((currentCount: number) => {
    return currentCount < limits.maxCourses;
  }, [limits.maxCourses]);

  const canAddNote = useCallback((currentCount: number) => {
    return currentCount < limits.maxNotes;
  }, [limits.maxNotes]);

  const canAddFriend = useCallback((currentCount: number) => {
    return currentCount < limits.maxFriends;
  }, [limits.maxFriends]);

  // Show premium upgrade modal
  const showPremiumModal = useCallback((feature: string) => {
    showInfo(
      'Premium krävs',
      `${feature} är endast tillgängligt för Premium-användare. Uppgradera för att låsa upp alla funktioner!`
    );
  }, [showInfo]);

  // Get offerings from RevenueCat
  const getOfferings = useCallback(async (): Promise<PurchasesOffering | null> => {
    console.log('[Premium] Fetching offerings...');
    
    if (!isRevenueCatInitialized()) {
      const initialized = await initializeRevenueCat(authUser?.id);
      if (!initialized) {
        showError('Fel', 'Kunde inte ladda produkter. Kontrollera din internetanslutning.');
        return null;
      }
    }
    
    const result = await fetchOfferings();
    
    if (!result.success) {
      console.error('[Premium] Failed to fetch offerings:', result.error);
      showError('Fel', result.error?.userMessage || 'Kunde inte ladda produkter.');
      return null;
    }
    
    if (!result.offering || result.offering.availablePackages.length === 0) {
      console.warn('[Premium] No offerings available');
      // In debug mode, show what was returned
      if (getDebugMode() && result.debugInfo) {
        console.log('[Premium] Debug info:', result.debugInfo);
      }
      return null;
    }
    
    console.log('[Premium] Offerings loaded successfully');
    return result.offering;
  }, [authUser?.id, showError]);

  // Purchase a package
  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    console.log('[Premium] Starting purchase:', pkg.identifier);
    
    const result = await executePurchase(pkg);
    
    if (result.userCancelled) {
      console.log('[Premium] Purchase cancelled by user');
      return false;
    }
    
    if (!result.success) {
      console.error('[Premium] Purchase failed:', result.error);
      if (result.error) {
        showError('Köpet misslyckades', result.error.userMessage);
      }
      return false;
    }
    
    if (result.customerInfo) {
      await processCustomerInfo(result.customerInfo);
    }
    
    showSuccess('Köpet lyckades!', 'Välkommen till Premium! Alla funktioner är nu upplåsta.');
    return true;
  }, [processCustomerInfo, showError, showSuccess]);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    console.log('[Premium] Restoring purchases...');
    
    const result = await executeRestore();
    
    if (!result.success) {
      if (result.error) {
        // Check if it's just "no purchases found" vs actual error
        if (result.error.code === 'RESTORE_NO_PURCHASES') {
          showInfo('Inga köp hittades', 'Vi kunde inte hitta några tidigare köp på detta konto.');
        } else {
          showError('Återställning misslyckades', result.error.userMessage);
        }
      } else {
        showInfo('Inga köp hittades', 'Vi kunde inte hitta några tidigare köp på detta konto.');
      }
      return false;
    }
    
    if (result.customerInfo) {
      await processCustomerInfo(result.customerInfo);
    }
    
    showSuccess('Köp återställda!', 'Dina premium-funktioner är nu aktiva.');
    return true;
  }, [processCustomerInfo, showSuccess, showError, showInfo]);

  // Demo mode functions
  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    showInfo('Demo-läge aktiverat', 'Du kan nu testa appen med exempeldata.');
  }, [showInfo]);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
  }, []);

  return useMemo(() => ({
    subscriptionType,
    subscriptionExpiresAt,
    isPremium,
    isLoading,
    isOffline,
    limits,
    canAddCourse,
    canAddNote,
    canAddFriend,
    purchasePackage,
    restorePurchases,
    getOfferings,
    refreshPremiumStatus,
    showPremiumModal,
    isDemoMode,
    enableDemoMode,
    exitDemoMode,
    devPremiumEnabled,
    setDevPremiumEnabled,
  }), [
    subscriptionType,
    subscriptionExpiresAt,
    isPremium,
    isLoading,
    isOffline,
    limits,
    canAddCourse,
    canAddNote,
    canAddFriend,
    purchasePackage,
    restorePurchases,
    getOfferings,
    refreshPremiumStatus,
    showPremiumModal,
    isDemoMode,
    enableDemoMode,
    exitDemoMode,
    devPremiumEnabled,
    setDevPremiumEnabled,
  ]);
});

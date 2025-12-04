import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// STORAGE KEYS
// ============================================================================
const STORAGE_KEYS = {
  PREMIUM_STATUS: 'premium_status',
  PREMIUM_EXPIRATION: 'premium_expiration',
  LAST_SYNC_TIME: 'premium_last_sync',
  OFFLINE_GRACE_PERIOD_START: 'premium_offline_grace_start',
} as const;

// ============================================================================
// CONFIGURATION
// ============================================================================
// How long we trust locally cached premium status without syncing (24 hours)
const CACHE_VALIDITY_MS = 24 * 60 * 60 * 1000;

// Maximum offline grace period for premium users (7 days)
// Users who were premium can continue to use premium features offline for this period
const OFFLINE_GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================================================
// TYPES
// ============================================================================
export interface PremiumStorageData {
  isPremium: boolean;
  expirationDate: string | null;
  lastSyncTime: string;
  offlineGracePeriodStart: string | null;
}

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

export async function savePremiumStatus(
  isPremium: boolean,
  expirationDate: Date | null
): Promise<void> {
  try {
    const now = new Date().toISOString();
    
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, isPremium ? 'true' : 'false'),
      AsyncStorage.setItem(
        STORAGE_KEYS.PREMIUM_EXPIRATION,
        expirationDate ? expirationDate.toISOString() : ''
      ),
      AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, now),
      // Clear offline grace period when we successfully sync
      AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_GRACE_PERIOD_START),
    ]);

    console.log('[PremiumStorage] Saved premium status:', { isPremium, expirationDate });
  } catch (error) {
    console.error('[PremiumStorage] Failed to save premium status:', error);
  }
}

export async function loadPremiumStatus(): Promise<{
  isPremium: boolean;
  expirationDate: Date | null;
  lastSyncTime: Date | null;
  isCacheValid: boolean;
}> {
  try {
    const [statusStr, expirationStr, lastSyncStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS),
      AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_EXPIRATION),
      AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME),
    ]);

    const isPremium = statusStr === 'true';
    const expirationDate = expirationStr ? new Date(expirationStr) : null;
    const lastSyncTime = lastSyncStr ? new Date(lastSyncStr) : null;

    // Check if cache is still valid
    const isCacheValid = lastSyncTime
      ? Date.now() - lastSyncTime.getTime() < CACHE_VALIDITY_MS
      : false;

    console.log('[PremiumStorage] Loaded premium status:', {
      isPremium,
      expirationDate,
      lastSyncTime,
      isCacheValid,
    });

    return { isPremium, expirationDate, lastSyncTime, isCacheValid };
  } catch (error) {
    console.error('[PremiumStorage] Failed to load premium status:', error);
    return { isPremium: false, expirationDate: null, lastSyncTime: null, isCacheValid: false };
  }
}

export async function startOfflineGracePeriod(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_GRACE_PERIOD_START);
    if (!existing) {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_GRACE_PERIOD_START, now);
      console.log('[PremiumStorage] Started offline grace period');
    }
  } catch (error) {
    console.error('[PremiumStorage] Failed to start offline grace period:', error);
  }
}

export async function isWithinOfflineGracePeriod(): Promise<boolean> {
  try {
    const gracePeriodStart = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_GRACE_PERIOD_START);
    if (!gracePeriodStart) return false;

    const startTime = new Date(gracePeriodStart).getTime();
    const elapsed = Date.now() - startTime;
    const isWithin = elapsed < OFFLINE_GRACE_PERIOD_MS;

    console.log('[PremiumStorage] Offline grace period check:', {
      startTime: gracePeriodStart,
      elapsedMs: elapsed,
      isWithin,
    });

    return isWithin;
  } catch (error) {
    console.error('[PremiumStorage] Failed to check offline grace period:', error);
    return false;
  }
}

export async function clearPremiumStorage(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.PREMIUM_STATUS),
      AsyncStorage.removeItem(STORAGE_KEYS.PREMIUM_EXPIRATION),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC_TIME),
      AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_GRACE_PERIOD_START),
    ]);
    console.log('[PremiumStorage] Cleared all premium storage');
  } catch (error) {
    console.error('[PremiumStorage] Failed to clear premium storage:', error);
  }
}

export async function shouldSyncPremiumStatus(): Promise<boolean> {
  try {
    const lastSyncStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
    if (!lastSyncStr) return true;

    const lastSyncTime = new Date(lastSyncStr).getTime();
    const elapsed = Date.now() - lastSyncTime;
    
    // Sync if cache is older than validity period
    return elapsed >= CACHE_VALIDITY_MS;
  } catch (error) {
    console.error('[PremiumStorage] Failed to check sync status:', error);
    return true;
  }
}

export async function getOfflinePremiumStatus(): Promise<boolean> {
  try {
    const { isPremium, expirationDate, isCacheValid } = await loadPremiumStatus();

    // If we have a valid cache and user was premium
    if (isPremium && isCacheValid) {
      // Check if subscription hasn't expired
      if (!expirationDate || expirationDate > new Date()) {
        return true;
      }
    }

    // Check offline grace period for users who were premium
    if (isPremium) {
      const inGracePeriod = await isWithinOfflineGracePeriod();
      if (inGracePeriod) {
        console.log('[PremiumStorage] User within offline grace period');
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[PremiumStorage] Failed to get offline premium status:', error);
    return false;
  }
}

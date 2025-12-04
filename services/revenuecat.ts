import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesError,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// ============================================================================
// CONFIGURATION
// ============================================================================
// API Keys - iOS key is already configured, Android needs to be added later
// IMPORTANT: These should ideally come from environment variables in production
const REVENUECAT_API_KEY_IOS = 'appl_ttKXYkEBKHJdIqTkYvbLSbUSDcX';
const REVENUECAT_API_KEY_ANDROID = 'goog_YOUR_ANDROID_KEY_HERE'; // TODO: Add your Google Play key

// Expected product/package identifiers - update these to match your RevenueCat configuration
// These are used for validation and debugging
export const EXPECTED_PRODUCT_IDS = {
  MONTHLY: 'premium_monthly', // Your monthly product identifier
  YEARLY: 'premium_yearly',   // Your yearly product identifier
};

// Entitlement identifier - MUST match exactly what's configured in RevenueCat dashboard
export const PREMIUM_ENTITLEMENT_ID = 'premium';

// Debug mode - set to false in production
// When enabled: shows debug info, allows simulated purchases
const DEBUG_MODE = __DEV__;

// ============================================================================
// TYPES
// ============================================================================
export interface RevenueCatConfig {
  apiKey: string;
  userId?: string;
  debugMode?: boolean;
}

export interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: RevenueCatError;
  userCancelled?: boolean;
}

export interface RevenueCatError {
  code: string;
  message: string;
  userMessage: string;
  isRetryable: boolean;
}

export interface OfferingsResult {
  success: boolean;
  offering?: PurchasesOffering | null;
  error?: RevenueCatError;
  debugInfo?: {
    availableOfferingIds: string[];
    availablePackageIds: string[];
    configurationIssues: string[];
  };
}

export interface CustomerInfoResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  isPremium: boolean;
  expirationDate?: Date | null;
  error?: RevenueCatError;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================
function mapPurchaseError(error: any): RevenueCatError {
  const purchaseError = error as PurchasesError;
  const errorCode = purchaseError.code || 'UNKNOWN';
  
  // Map RevenueCat error codes to user-friendly messages
  const errorMappings: Record<string, { userMessage: string; isRetryable: boolean }> = {
    [PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR]: {
      userMessage: 'Köpet avbröts.',
      isRetryable: false,
    },
    [PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR]: {
      userMessage: 'Köp är inte tillåtna på denna enhet. Kontrollera att du är inloggad i App Store.',
      isRetryable: true,
    },
    [PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR]: {
      userMessage: 'Produkten kunde inte köpas. Försök igen senare.',
      isRetryable: true,
    },
    [PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR]: {
      userMessage: 'Produkten är inte tillgänglig för köp just nu.',
      isRetryable: true,
    },
    [PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR]: {
      userMessage: 'Du har redan köpt denna produkt. Försök återställa dina köp.',
      isRetryable: false,
    },
    [PURCHASES_ERROR_CODE.NETWORK_ERROR]: {
      userMessage: 'Nätverksfel. Kontrollera din internetanslutning och försök igen.',
      isRetryable: true,
    },
    [PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR]: {
      userMessage: 'Detta kvitto används redan av ett annat konto.',
      isRetryable: false,
    },
    [PURCHASES_ERROR_CODE.MISSING_RECEIPT_FILE_ERROR]: {
      userMessage: 'Kvittofilen saknas. Försök igen.',
      isRetryable: true,
    },
    [PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR]: {
      userMessage: 'Autentiseringsfel. Kontakta support om problemet kvarstår.',
      isRetryable: false,
    },
    [PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR]: {
      userMessage: 'Serverfel. Försök igen om en stund.',
      isRetryable: true,
    },
    [PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR]: {
      userMessage: 'Problem med App Store. Försök igen senare.',
      isRetryable: true,
    },
    [PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR]: {
      userMessage: 'Din betalning behandlas. Du får åtkomst så fort betalningen är klar.',
      isRetryable: false,
    },
    [PURCHASES_ERROR_CODE.CONFIGURATION_ERROR]: {
      userMessage: 'Konfigurationsfel. Kontakta support.',
      isRetryable: false,
    },
  };

  const mapping = errorMappings[errorCode] || {
    userMessage: 'Ett oväntat fel uppstod. Försök igen.',
    isRetryable: true,
  };

  return {
    code: errorCode,
    message: purchaseError.message || 'Unknown error',
    userMessage: mapping.userMessage,
    isRetryable: mapping.isRetryable,
  };
}

// ============================================================================
// LOGGING
// ============================================================================
function log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) {
  const prefix = '[RevenueCat]';
  const timestamp = new Date().toISOString();
  
  if (level === 'debug' && !DEBUG_MODE) return;
  
  const formattedMessage = `${prefix} ${timestamp} [${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case 'info':
      console.log(formattedMessage, data || '');
      break;
    case 'warn':
      console.warn(formattedMessage, data || '');
      break;
    case 'error':
      console.error(formattedMessage, data || '');
      break;
    case 'debug':
      console.log(formattedMessage, data || '');
      break;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================
let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

export async function initializeRevenueCat(userId?: string): Promise<boolean> {
  // Return existing promise if already initializing
  if (initializationPromise) {
    return initializationPromise;
  }

  // Return immediately if already initialized
  if (isInitialized) {
    log('info', 'RevenueCat already initialized');
    return true;
  }

  initializationPromise = (async () => {
    try {
      log('info', 'Initializing RevenueCat...');

      // Set log level based on debug mode
      Purchases.setLogLevel(DEBUG_MODE ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);

      // Get the appropriate API key for the platform
      const apiKey = Platform.select({
        ios: REVENUECAT_API_KEY_IOS,
        android: REVENUECAT_API_KEY_ANDROID,
        default: REVENUECAT_API_KEY_IOS,
      });

      if (!apiKey || apiKey.includes('YOUR_')) {
        log('warn', 'RevenueCat API key not configured for this platform. Purchases will not work.');
        return false;
      }

      // Configure RevenueCat
      await Purchases.configure({ apiKey });
      log('info', 'RevenueCat configured with API key');

      // Log in user if provided
      if (userId) {
        await loginUser(userId);
      }

      isInitialized = true;
      log('info', 'RevenueCat initialized successfully');
      return true;
    } catch (error) {
      log('error', 'Failed to initialize RevenueCat', error);
      isInitialized = false;
      return false;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

export function isRevenueCatInitialized(): boolean {
  return isInitialized;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================
export async function loginUser(userId: string): Promise<{ success: boolean; error?: RevenueCatError }> {
  try {
    if (!isInitialized) {
      log('warn', 'RevenueCat not initialized, cannot login user');
      return { success: false, error: { code: 'NOT_INITIALIZED', message: 'RevenueCat not initialized', userMessage: 'Systemet är inte redo. Försök igen.', isRetryable: true } };
    }

    log('info', 'Logging in user to RevenueCat', { userId });
    const { customerInfo } = await Purchases.logIn(userId);
    log('info', 'User logged in successfully', { userId, entitlements: Object.keys(customerInfo.entitlements.active) });
    return { success: true };
  } catch (error) {
    log('error', 'Failed to login user', error);
    return { success: false, error: mapPurchaseError(error) };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    if (!isInitialized) return;
    
    log('info', 'Logging out user from RevenueCat');
    await Purchases.logOut();
    log('info', 'User logged out successfully');
  } catch (error) {
    log('error', 'Failed to logout user', error);
  }
}

// ============================================================================
// OFFERINGS
// ============================================================================
export async function getOfferings(): Promise<OfferingsResult> {
  try {
    if (!isInitialized) {
      const initialized = await initializeRevenueCat();
      if (!initialized) {
        return {
          success: false,
          error: {
            code: 'NOT_INITIALIZED',
            message: 'RevenueCat not initialized',
            userMessage: 'Kunde inte ladda produkter. Försök igen.',
            isRetryable: true,
          },
        };
      }
    }

    log('info', 'Fetching offerings...');
    const offerings = await Purchases.getOfferings();

    const debugInfo = {
      availableOfferingIds: Object.keys(offerings.all || {}),
      availablePackageIds: offerings.current?.availablePackages?.map(p => p.identifier) || [],
      configurationIssues: [] as string[],
    };

    // Check for configuration issues
    if (!offerings.current) {
      debugInfo.configurationIssues.push('No current offering set in RevenueCat dashboard');
    }

    if (offerings.current && offerings.current.availablePackages.length === 0) {
      debugInfo.configurationIssues.push('Current offering has no available packages');
    }

    // Validate expected products
    if (offerings.current) {
      const packageIds = offerings.current.availablePackages.map(p => p.identifier);
      const hasMonthly = packageIds.some(id => id.toLowerCase().includes('month') || id === '$rc_monthly');
      const hasYearly = packageIds.some(id => id.toLowerCase().includes('year') || id.toLowerCase().includes('annual') || id === '$rc_annual');
      
      if (!hasMonthly) {
        debugInfo.configurationIssues.push(`Monthly package not found. Available packages: ${packageIds.join(', ')}`);
      }
      if (!hasYearly) {
        debugInfo.configurationIssues.push(`Yearly package not found. Available packages: ${packageIds.join(', ')}`);
      }
    }

    if (DEBUG_MODE && debugInfo.configurationIssues.length > 0) {
      log('warn', 'Configuration issues detected', debugInfo);
    }

    log('info', 'Offerings fetched successfully', {
      hasCurrentOffering: !!offerings.current,
      packageCount: offerings.current?.availablePackages?.length || 0,
    });

    return {
      success: true,
      offering: offerings.current,
      debugInfo: DEBUG_MODE ? debugInfo : undefined,
    };
  } catch (error) {
    log('error', 'Failed to fetch offerings', error);
    return {
      success: false,
      error: mapPurchaseError(error),
    };
  }
}

// ============================================================================
// PURCHASES
// ============================================================================
export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  try {
    if (!isInitialized) {
      return {
        success: false,
        error: {
          code: 'NOT_INITIALIZED',
          message: 'RevenueCat not initialized',
          userMessage: 'Köpsystemet är inte redo. Försök igen.',
          isRetryable: true,
        },
      };
    }

    log('info', 'Starting purchase', { packageId: pkg.identifier, productId: pkg.product.identifier });
    
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    
    const hasPremium = typeof customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== 'undefined';
    
    log('info', 'Purchase completed', { hasPremium, entitlements: Object.keys(customerInfo.entitlements.active) });
    
    return {
      success: hasPremium,
      customerInfo,
    };
  } catch (error: any) {
    const purchaseError = error as PurchasesError;
    
    // Check if user cancelled
    if (purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      log('info', 'Purchase cancelled by user');
      return {
        success: false,
        userCancelled: true,
      };
    }
    
    log('error', 'Purchase failed', error);
    return {
      success: false,
      error: mapPurchaseError(error),
    };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    if (!isInitialized) {
      const initialized = await initializeRevenueCat();
      if (!initialized) {
        return {
          success: false,
          error: {
            code: 'NOT_INITIALIZED',
            message: 'RevenueCat not initialized',
            userMessage: 'Kunde inte återställa köp. Försök igen.',
            isRetryable: true,
          },
        };
      }
    }

    log('info', 'Restoring purchases...');
    const customerInfo = await Purchases.restorePurchases();
    
    const hasPremium = typeof customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== 'undefined';
    
    log('info', 'Purchases restored', { hasPremium, entitlements: Object.keys(customerInfo.entitlements.active) });
    
    return {
      success: hasPremium,
      customerInfo,
    };
  } catch (error) {
    log('error', 'Failed to restore purchases', error);
    return {
      success: false,
      error: mapPurchaseError(error),
    };
  }
}

// ============================================================================
// CUSTOMER INFO
// ============================================================================
export async function getCustomerInfo(): Promise<CustomerInfoResult> {
  try {
    if (!isInitialized) {
      const initialized = await initializeRevenueCat();
      if (!initialized) {
        return {
          success: false,
          isPremium: false,
          error: {
            code: 'NOT_INITIALIZED',
            message: 'RevenueCat not initialized',
            userMessage: 'Kunde inte hämta kontoinformation.',
            isRetryable: true,
          },
        };
      }
    }

    log('debug', 'Fetching customer info...');
    const customerInfo = await Purchases.getCustomerInfo();
    
    const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    const isPremium = typeof premiumEntitlement !== 'undefined';
    const expirationDate = premiumEntitlement?.expirationDate 
      ? new Date(premiumEntitlement.expirationDate)
      : null;
    
    log('debug', 'Customer info fetched', { isPremium, expirationDate });
    
    return {
      success: true,
      customerInfo,
      isPremium,
      expirationDate,
    };
  } catch (error) {
    log('error', 'Failed to get customer info', error);
    return {
      success: false,
      isPremium: false,
      error: mapPurchaseError(error),
    };
  }
}

// ============================================================================
// LISTENERS
// ============================================================================
export function addCustomerInfoUpdateListener(
  callback: (customerInfo: CustomerInfo) => void
): () => void {
  log('info', 'Adding customer info update listener');
  Purchases.addCustomerInfoUpdateListener(callback);
  
  // Return cleanup function
  return () => {
    log('info', 'Removing customer info update listener');
    Purchases.removeCustomerInfoUpdateListener(callback);
  };
}

// ============================================================================
// UTILITIES
// ============================================================================
export function getPackagePrice(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}

export function getPackagePeriod(pkg: PurchasesPackage): string {
  const identifier = pkg.identifier.toLowerCase();
  if (identifier.includes('month') || identifier === '$rc_monthly') {
    return 'månad';
  }
  if (identifier.includes('year') || identifier.includes('annual') || identifier === '$rc_annual') {
    return 'år';
  }
  return '';
}

export function isMonthlyPackage(pkg: PurchasesPackage): boolean {
  const identifier = pkg.identifier.toLowerCase();
  return identifier.includes('month') || identifier === '$rc_monthly' || pkg.packageType === 'MONTHLY';
}

export function isAnnualPackage(pkg: PurchasesPackage): boolean {
  const identifier = pkg.identifier.toLowerCase();
  return identifier.includes('year') || identifier.includes('annual') || identifier === '$rc_annual' || pkg.packageType === 'ANNUAL';
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================
export function getDebugMode(): boolean {
  return DEBUG_MODE;
}

// For testing: simulate active entitlement
export async function simulatePremiumEntitlement(): Promise<void> {
  if (!DEBUG_MODE) {
    log('warn', 'Cannot simulate premium entitlement in production');
    return;
  }
  log('info', 'Simulating premium entitlement (DEBUG MODE)');
  // This is a debug-only function. In a real scenario, you would
  // need to use sandbox testing. This function is just for UI testing.
}

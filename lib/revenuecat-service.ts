import { supabase } from './supabase';

const REVENUECAT_SECRET_API_KEY = 'sk_NkeLAvckKNWALMrGxxEtXkTgKXwRM';
const REVENUECAT_API_BASE = 'https://api.revenuecat.com/v1';

export interface RevenueCatSubscriberInfo {
  request_date: string;
  request_date_ms: number;
  subscriber: {
    entitlements: {
      [key: string]: {
        expires_date: string | null;
        grace_period_expires_date: string | null;
        product_identifier: string;
        purchase_date: string;
      };
    };
    first_seen: string;
    management_url: string | null;
    non_subscriptions: Record<string, unknown>;
    original_app_user_id: string;
    original_application_version: string | null;
    original_purchase_date: string | null;
    other_purchases: Record<string, unknown>;
    subscriptions: {
      [key: string]: {
        auto_resume_date: string | null;
        billing_issues_detected_at: string | null;
        expires_date: string;
        grace_period_expires_date: string | null;
        is_sandbox: boolean;
        original_purchase_date: string;
        ownership_type: string;
        period_type: string;
        purchase_date: string;
        refunded_at: string | null;
        store: string;
        unsubscribe_detected_at: string | null;
      };
    };
  };
}

export interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  expiresAt: Date | null;
  productId: string | null;
  willRenew: boolean;
  isTrial: boolean;
  isSandbox: boolean;
}

export async function getSubscriberInfo(appUserId: string): Promise<RevenueCatSubscriberInfo | null> {
  try {
    console.log('[RevenueCat API] Fetching subscriber info for:', appUserId);
    
    const response = await fetch(`${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REVENUECAT_SECRET_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RevenueCat API] Error response:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[RevenueCat API] Subscriber info retrieved successfully');
    return data as RevenueCatSubscriberInfo;
  } catch (error) {
    console.error('[RevenueCat API] Error fetching subscriber info:', error);
    return null;
  }
}

export function parseSubscriptionStatus(subscriberInfo: RevenueCatSubscriberInfo | null): SubscriptionStatus {
  const defaultStatus: SubscriptionStatus = {
    isActive: false,
    isPremium: false,
    expiresAt: null,
    productId: null,
    willRenew: false,
    isTrial: false,
    isSandbox: false,
  };

  if (!subscriberInfo?.subscriber) {
    return defaultStatus;
  }

  const { entitlements, subscriptions } = subscriberInfo.subscriber;
  
  const premiumEntitlement = entitlements['premium'];
  
  if (!premiumEntitlement) {
    return defaultStatus;
  }

  const now = new Date();
  const expiresDate = premiumEntitlement.expires_date 
    ? new Date(premiumEntitlement.expires_date) 
    : null;
  
  const isActive = !expiresDate || expiresDate > now;
  
  const subscriptionProduct = subscriptions[premiumEntitlement.product_identifier];
  
  return {
    isActive,
    isPremium: isActive,
    expiresAt: expiresDate,
    productId: premiumEntitlement.product_identifier,
    willRenew: subscriptionProduct ? !subscriptionProduct.unsubscribe_detected_at : false,
    isTrial: subscriptionProduct?.period_type === 'trial',
    isSandbox: subscriptionProduct?.is_sandbox ?? false,
  };
}

export async function checkSubscriptionStatus(appUserId: string): Promise<SubscriptionStatus> {
  const subscriberInfo = await getSubscriberInfo(appUserId);
  return parseSubscriptionStatus(subscriberInfo);
}

export async function syncSubscriptionToDatabase(userId: string, status: SubscriptionStatus): Promise<boolean> {
  try {
    console.log('[RevenueCat] Syncing subscription to database for user:', userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_type: status.isPremium ? 'premium' : 'free',
        subscription_expires_at: status.expiresAt?.toISOString() || null,
        subscription_product_id: status.productId,
        revenuecat_customer_id: userId,
      })
      .eq('id', userId);

    if (error) {
      console.error('[RevenueCat] Error syncing to database:', error);
      return false;
    }

    console.log('[RevenueCat] Successfully synced subscription to database');
    return true;
  } catch (error) {
    console.error('[RevenueCat] Error syncing subscription:', error);
    return false;
  }
}

export async function verifyAndSyncSubscription(userId: string): Promise<SubscriptionStatus> {
  const status = await checkSubscriptionStatus(userId);
  await syncSubscriptionToDatabase(userId, status);
  return status;
}

export type WebhookEventType = 
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'NON_RENEWING_PURCHASE'
  | 'SUBSCRIPTION_PAUSED'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE'
  | 'TRANSFER';

export interface RevenueCatWebhookEvent {
  api_version: string;
  event: {
    aliases: string[];
    app_id: string;
    app_user_id: string;
    commission_percentage: number | null;
    country_code: string;
    currency: string;
    entitlement_id: string | null;
    entitlement_ids: string[];
    environment: 'SANDBOX' | 'PRODUCTION';
    event_timestamp_ms: number;
    expiration_at_ms: number | null;
    id: string;
    is_family_share: boolean;
    offer_code: string | null;
    original_app_user_id: string;
    original_transaction_id: string;
    period_type: 'TRIAL' | 'INTRO' | 'NORMAL' | 'PROMOTIONAL';
    presented_offering_id: string | null;
    price: number;
    price_in_purchased_currency: number;
    product_id: string;
    purchased_at_ms: number;
    store: 'PLAY_STORE' | 'APP_STORE' | 'STRIPE' | 'MAC_APP_STORE' | 'PROMOTIONAL';
    subscriber_attributes: Record<string, { value: string; updated_at_ms: number }>;
    takehome_percentage: number;
    tax_percentage: number;
    transaction_id: string;
    type: WebhookEventType;
  };
}

export async function processWebhookEvent(event: RevenueCatWebhookEvent): Promise<boolean> {
  try {
    console.log('[RevenueCat Webhook] Processing event:', event.event.type);
    console.log('[RevenueCat Webhook] App User ID:', event.event.app_user_id);
    
    const userId = event.event.app_user_id;
    const eventType = event.event.type;
    
    let subscriptionType: 'free' | 'premium' = 'free';
    let expiresAt: string | null = null;
    
    switch (eventType) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
        subscriptionType = 'premium';
        expiresAt = event.event.expiration_at_ms 
          ? new Date(event.event.expiration_at_ms).toISOString() 
          : null;
        console.log('[RevenueCat Webhook] Subscription started/renewed');
        break;
        
      case 'CANCELLATION':
        subscriptionType = 'premium';
        expiresAt = event.event.expiration_at_ms 
          ? new Date(event.event.expiration_at_ms).toISOString() 
          : null;
        console.log('[RevenueCat Webhook] Subscription cancelled (still active until expiration)');
        break;
        
      case 'EXPIRATION':
        subscriptionType = 'free';
        expiresAt = null;
        console.log('[RevenueCat Webhook] Subscription expired');
        break;
        
      case 'BILLING_ISSUE':
        console.log('[RevenueCat Webhook] Billing issue detected');
        break;
        
      default:
        console.log('[RevenueCat Webhook] Unhandled event type:', eventType);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .or(`id.eq.${userId},revenuecat_customer_id.eq.${userId}`)
      .single();

    if (profileError || !profile) {
      console.error('[RevenueCat Webhook] User not found:', userId);
      return false;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_type: subscriptionType,
        subscription_expires_at: expiresAt,
        subscription_product_id: event.event.product_id,
        revenuecat_customer_id: userId,
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('[RevenueCat Webhook] Error updating profile:', updateError);
      return false;
    }

    console.log('[RevenueCat Webhook] Successfully processed event');
    return true;
  } catch (error) {
    console.error('[RevenueCat Webhook] Error processing event:', error);
    return false;
  }
}

export function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  return true;
}

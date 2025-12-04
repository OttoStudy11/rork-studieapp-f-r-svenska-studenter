// =============================================================================
// SUPABASE EDGE FUNCTION FOR REVENUECAT WEBHOOKS
// =============================================================================
//
// This file contains the code for a Supabase Edge Function that handles
// RevenueCat webhook events. You need to deploy this to your Supabase project.
//
// DEPLOYMENT INSTRUCTIONS:
// 1. Install Supabase CLI: npm install -g supabase
// 2. Login to Supabase: supabase login
// 3. Link your project: supabase link --project-ref ekeebrhdpjtbooaiggbw
// 4. Create the function: supabase functions new revenuecat-webhook
// 5. Replace the contents of supabase/functions/revenuecat-webhook/index.ts with this code
// 6. Deploy: supabase functions deploy revenuecat-webhook --no-verify-jwt
//
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RevenueCatWebhookEvent {
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
    type: string;
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookEvent: RevenueCatWebhookEvent = await req.json();
    
    console.log('[RevenueCat Webhook] Received event:', webhookEvent.event.type);
    console.log('[RevenueCat Webhook] App User ID:', webhookEvent.event.app_user_id);
    console.log('[RevenueCat Webhook] Environment:', webhookEvent.event.environment);

    const userId = webhookEvent.event.app_user_id;
    const eventType = webhookEvent.event.type;
    
    let subscriptionType: 'free' | 'premium' = 'free';
    let expiresAt: string | null = null;

    switch (eventType) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
      case 'NON_RENEWING_PURCHASE':
        subscriptionType = 'premium';
        expiresAt = webhookEvent.event.expiration_at_ms 
          ? new Date(webhookEvent.event.expiration_at_ms).toISOString() 
          : null;
        console.log('[RevenueCat Webhook] Setting subscription to PREMIUM, expires:', expiresAt);
        break;
        
      case 'CANCELLATION':
        subscriptionType = 'premium';
        expiresAt = webhookEvent.event.expiration_at_ms 
          ? new Date(webhookEvent.event.expiration_at_ms).toISOString() 
          : null;
        console.log('[RevenueCat Webhook] Subscription cancelled, still active until:', expiresAt);
        break;
        
      case 'EXPIRATION':
        subscriptionType = 'free';
        expiresAt = null;
        console.log('[RevenueCat Webhook] Subscription EXPIRED');
        break;
        
      case 'BILLING_ISSUE':
        console.log('[RevenueCat Webhook] Billing issue detected - no status change');
        return new Response(JSON.stringify({ success: true, message: 'Billing issue logged' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
        
      case 'PRODUCT_CHANGE':
        subscriptionType = 'premium';
        expiresAt = webhookEvent.event.expiration_at_ms 
          ? new Date(webhookEvent.event.expiration_at_ms).toISOString() 
          : null;
        console.log('[RevenueCat Webhook] Product changed');
        break;
        
      default:
        console.log('[RevenueCat Webhook] Unhandled event type:', eventType);
        return new Response(JSON.stringify({ success: true, message: 'Event type not processed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
    }

    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .or(`id.eq.${userId},revenuecat_customer_id.eq.${userId}`)
      .maybeSingle();

    if (findError) {
      console.error('[RevenueCat Webhook] Error finding user:', findError);
      return new Response(JSON.stringify({ success: false, error: 'Database error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!profile) {
      console.error('[RevenueCat Webhook] User not found for ID:', userId);
      return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_type: subscriptionType,
        subscription_expires_at: expiresAt,
        subscription_product_id: webhookEvent.event.product_id,
        revenuecat_customer_id: userId,
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('[RevenueCat Webhook] Error updating profile:', updateError);
      return new Response(JSON.stringify({ success: false, error: 'Update failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('[RevenueCat Webhook] Successfully updated user:', profile.id);
    console.log('[RevenueCat Webhook] New status:', subscriptionType);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Subscription updated',
      userId: profile.id,
      subscriptionType,
      expiresAt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[RevenueCat Webhook] Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

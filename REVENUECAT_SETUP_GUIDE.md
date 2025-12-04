# RevenueCat Integration Guide for Studiestugan

This guide walks you through setting up RevenueCat for in-app purchases in your Studiestugan app.

## Your API Keys

- **Public SDK Key (iOS):** `appl_ttKXYkEBKHJdIqTkYvbLSbUSDcX`
- **Secret API Key:** `sk_NkeLAvckKNWALMrGxxEtXkTgKXwRM`

> ⚠️ **Important:** Never expose your Secret API Key in client-side code. It's only used for server-side operations (webhooks).

---

## Step 1: Run the Database Migration

Run this SQL in your Supabase SQL Editor to add the required columns:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ekeebrhdpjtbooaiggbw
2. Click on "SQL Editor" in the left sidebar
3. Paste the contents of `add-revenuecat-columns.sql` and click "Run"

This adds:
- `revenuecat_customer_id` - Links your user to RevenueCat
- `subscription_product_id` - Tracks which product was purchased
- `subscription_updated_at` - Tracks when the subscription was last updated

---

## Step 2: Configure RevenueCat Dashboard

### 2.1 Create Your Products

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your project
3. Go to **Products** → Click **+ New**
4. Create your subscription products:

**Monthly Subscription:**
- Product Identifier: `studiestugan_premium_monthly`
- Price: 49 kr/month

**Annual Subscription:**
- Product Identifier: `studiestugan_premium_yearly`
- Price: 150 kr/year

### 2.2 Create an Entitlement

1. Go to **Entitlements** → Click **+ New**
2. Create entitlement:
   - Identifier: `premium`
   - Description: "Premium access to all features"
3. Attach your products to this entitlement

### 2.3 Create an Offering

1. Go to **Offerings** → Click **+ New**
2. Create offering:
   - Identifier: `default`
   - Description: "Default offering"
3. Add packages:
   - **Monthly Package:** Type = Monthly, Product = `studiestugan_premium_monthly`
   - **Annual Package:** Type = Annual, Product = `studiestugan_premium_yearly`

---

## Step 3: Set Up App Store Products

### For iOS (App Store Connect):

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → **Monetization** → **Subscriptions**
3. Create a Subscription Group called "Premium"
4. Add subscriptions:
   - `studiestugan_premium_monthly` - Monthly, 49 kr
   - `studiestugan_premium_yearly` - Yearly, 150 kr
5. Copy the Shared Secret from App Store Connect
6. In RevenueCat Dashboard, go to your iOS app settings and paste the Shared Secret

### For Android (Google Play Console):

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app → **Monetize** → **Products** → **Subscriptions**
3. Create subscriptions matching RevenueCat products
4. Set up a Service Account for RevenueCat in Google Cloud Console
5. Add the Service Account credentials in RevenueCat

---

## Step 4: Deploy the Webhook Edge Function

Webhooks keep your database in sync with RevenueCat when subscription events occur outside the app.

### 4.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 4.2 Login and Link Project

```bash
supabase login
supabase link --project-ref ekeebrhdpjtbooaiggbw
```

### 4.3 Create the Edge Function

```bash
supabase functions new revenuecat-webhook
```

### 4.4 Add the Function Code

Replace the contents of `supabase/functions/revenuecat-webhook/index.ts` with the code from `supabase-edge-function-webhook.ts` in your project.

### 4.5 Deploy the Function

```bash
supabase functions deploy revenuecat-webhook --no-verify-jwt
```

### 4.6 Get Your Webhook URL

After deployment, your webhook URL will be:
```
https://ekeebrhdpjtbooaiggbw.supabase.co/functions/v1/revenuecat-webhook
```

---

## Step 5: Configure Webhooks in RevenueCat

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Navigate to **Your Project** → **Integrations** → **Webhooks**
3. Click **+ New Webhook**
4. Configure:
   - **Name:** Supabase Webhook
   - **URL:** `https://ekeebrhdpjtbooaiggbw.supabase.co/functions/v1/revenuecat-webhook`
   - **Authorization Header:** Leave empty (we use Supabase service role)
5. Select events to listen for:
   - ✅ `INITIAL_PURCHASE` - When a user first subscribes
   - ✅ `RENEWAL` - When a subscription renews
   - ✅ `CANCELLATION` - When a user cancels (still active until period ends)
   - ✅ `UNCANCELLATION` - When a user re-enables auto-renew
   - ✅ `EXPIRATION` - When a subscription expires
   - ✅ `BILLING_ISSUE` - When there's a payment problem
   - ✅ `PRODUCT_CHANGE` - When user upgrades/downgrades
6. Click **Save**

---

## Step 6: Test in Sandbox Mode

### 6.1 Enable Sandbox Mode in RevenueCat

RevenueCat automatically detects sandbox purchases. Make sure you're testing with:
- **iOS:** Sandbox Apple ID (create in App Store Connect → Users and Access → Sandbox)
- **Android:** License test accounts (Google Play Console → Settings → License Testing)

### 6.2 Test the Purchase Flow

1. Build and run your app on a real device (simulators can't make purchases)
2. Navigate to the Premium screen
3. Attempt to purchase a subscription
4. Use your sandbox/test account credentials
5. Verify the purchase completes

### 6.3 Test Webhook Events

1. Go to RevenueCat Dashboard → **Customers** → Find your test user
2. Click on the user to see their subscription details
3. You can trigger test events from here
4. Check your Supabase Edge Function logs:
   ```bash
   supabase functions logs revenuecat-webhook
   ```

### 6.4 Verify Database Updates

After a successful purchase, check your Supabase database:
```sql
SELECT id, subscription_type, subscription_expires_at, revenuecat_customer_id
FROM profiles
WHERE id = 'YOUR_USER_ID';
```

---

## How It Works

### App-Side Flow (PremiumContext.tsx):

1. **Initialization:** RevenueCat SDK is initialized with your public key
2. **User Login:** When a user authenticates, they're logged into RevenueCat with their Supabase user ID
3. **Get Offerings:** The app fetches available products from RevenueCat
4. **Purchase:** When user taps "Buy", the SDK handles the purchase flow
5. **Sync:** After purchase, the SDK's listener updates the local state and syncs to Supabase

### Server-Side Flow (Webhook):

1. RevenueCat sends events to your webhook URL
2. Edge Function receives the event and parses it
3. Function looks up the user in Supabase by their RevenueCat customer ID
4. Function updates the user's subscription status in the `profiles` table

### Checking Subscription Status:

```typescript
import { checkSubscriptionStatus } from '@/lib/revenuecat-service';

// Check if a user has an active subscription
const status = await checkSubscriptionStatus(userId);
if (status.isPremium) {
  // Grant access to premium features
}
```

---

## File Reference

| File | Purpose |
|------|---------|
| `contexts/PremiumContext.tsx` | Main premium state management, SDK integration |
| `lib/revenuecat-service.ts` | API helpers for server-side RevenueCat calls |
| `add-revenuecat-columns.sql` | Database migration for subscription columns |
| `supabase-edge-function-webhook.ts` | Edge function code for handling webhooks |
| `app/premium.tsx` | Premium purchase UI screen |
| `lib/database.types.ts` | TypeScript types for database |

---

## Troubleshooting

### "No offerings available"
- Check that you've created products in RevenueCat
- Verify products are linked to an entitlement
- Ensure there's a "default" offering with packages

### "Purchase failed"
- Make sure you're testing on a real device
- Use sandbox/test accounts, not real Apple ID
- Check RevenueCat dashboard for error details

### Webhook not updating database
- Check Edge Function logs: `supabase functions logs revenuecat-webhook`
- Verify the webhook URL is correct in RevenueCat
- Ensure the user exists in your `profiles` table

### Subscription status not syncing
- The app syncs on launch and after purchases
- Force a sync by restarting the app
- Check the console for RevenueCat debug logs

---

## Going to Production

Before launching:

1. ✅ Test all purchase flows in sandbox
2. ✅ Test subscription cancellation and expiration
3. ✅ Verify webhooks are updating the database
4. ✅ Remove any hardcoded test prices
5. ✅ Submit your app for App Store/Play Store review
6. ✅ Enable production mode in RevenueCat (it auto-detects)

---

## Support

- [RevenueCat Documentation](https://docs.revenuecat.com)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [App Store In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing](https://developer.android.com/google/play/billing)

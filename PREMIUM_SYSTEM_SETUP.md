# Premium System Setup Guide

This guide explains how the premium system works in the app and how to integrate it with Apple In-App Purchases (IAP).

## Overview

The app now has a fully functional premium system that restricts access to the following features:
- AI Chat
- Flashcards
- Battle/Competition (Friend Stats)
- Advanced Statistics

## Components

### 1. PremiumGate Component (`components/PremiumGate.tsx`)
This is a reusable component that wraps any premium feature with a beautiful blur overlay. When users try to access premium features without a subscription, they see an attractive upgrade prompt.

**Usage:**
```tsx
import { PremiumGate } from '@/components/PremiumGate';

<PremiumGate feature="ai-chat">
  <YourFeatureComponent />
</PremiumGate>
```

**Available Features:**
- `'ai-chat'` - AI Chat feature
- `'flashcards'` - Flashcards feature
- `'battle'` - Friend comparison/battle feature
- `'statistics'` - Advanced statistics

### 2. PremiumContext (`contexts/PremiumContext.tsx`)
This context manages the premium state across the app.

**Key Features:**
- Fetches premium status from Supabase `profiles` table
- Provides `isPremium` boolean
- Includes feature-specific permission checks
- Auto-refreshes when user data changes

**Usage:**
```tsx
import { usePremium } from '@/contexts/PremiumContext';

const { isPremium, limits } = usePremium();

if (limits.canUseAIChat) {
  // User has access to AI chat
}
```

### 3. Database Schema
The premium status is stored in the `profiles` table:
- `subscription_type`: 'free' or 'premium'
- `subscription_expires_at`: Timestamp or NULL (for lifetime premium)

**Database Functions:**
- `is_user_premium(user_id)` - Check if user is premium
- `update_premium_status(user_id, status, expires_at)` - Update premium status

## Integration with Apple In-App Purchases

### Step 1: Run the Database Setup
Execute the `setup-premium-system.sql` file in your Supabase SQL editor.

### Step 2: Implement Apple IAP
You'll need to:

1. Install and configure RevenueCat or similar IAP library
2. Set up your products in App Store Connect
3. Create a backend endpoint or Supabase Edge Function to verify IAP receipts
4. Update the user's premium status in the database after verification

### Step 3: Update Premium Status After Purchase

After verifying the purchase server-side, update the user's premium status:

```javascript
// In your backend or Supabase Edge Function
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// For monthly subscription
await supabase.rpc('update_premium_status', {
  user_id_param: userId,
  new_status: 'premium',
  expires_at_param: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
});

// For lifetime premium
await supabase.rpc('update_premium_status', {
  user_id_param: userId,
  new_status: 'premium',
  expires_at_param: null
});
```

### Step 4: Handle Subscription Renewal
Set up webhooks to handle subscription renewals and expirations. When a subscription renews, update the `subscription_expires_at` date.

When a subscription expires, you can either:
1. Let the database function automatically detect it (it checks if `expires_at` is in the past)
2. Set `subscription_type` to 'free' immediately

## Testing

### Test Premium Features
To test premium features during development:

1. **Directly in Database:**
   ```sql
   SELECT update_premium_status('YOUR_USER_ID', 'premium', NULL);
   ```

2. **Or update manually:**
   ```sql
   UPDATE profiles
   SET subscription_type = 'premium',
       subscription_expires_at = NULL
   WHERE id = 'YOUR_USER_ID';
   ```

### Test Free User Experience
```sql
UPDATE profiles
SET subscription_type = 'free',
    subscription_expires_at = NULL
WHERE id = 'YOUR_USER_ID';
```

## Current Prices in app/premium.tsx
- Monthly: 39 kr/month (3-day free trial)
- Yearly: 129 kr/year (7-day free trial)

You can update these prices in the premium screen.

## Security

- Premium status checks are done server-side in the database
- The `is_user_premium` function uses `SECURITY DEFINER` to safely check status
- The `update_premium_status` function is restricted to `service_role` only
- Never trust client-side premium checks alone - always verify server-side

## Row Level Security (RLS)

Make sure you have RLS policies that respect premium status. For example:

```sql
-- Example: Only allow premium users to create more than 3 courses
CREATE POLICY "users_can_add_courses_based_on_subscription" 
ON user_courses FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT COUNT(*) FROM user_courses WHERE user_id = auth.uid()) < 3 
  OR is_user_premium(auth.uid())
);
```

## Troubleshooting

**Premium status not updating:**
1. Check that the database function is installed correctly
2. Verify RLS policies allow reading from `profiles` table
3. Check browser console for errors

**Blur overlay not showing:**
1. Ensure `PremiumGate` is wrapping the feature component
2. Verify `expo-blur` is installed
3. Check that `usePremium()` is returning the correct `isPremium` value

**User sees premium features after purchase:**
If the app doesn't immediately reflect the premium status:
1. The `PremiumContext` should auto-refresh when the auth state changes
2. You can manually refresh by logging out and back in
3. Consider adding a refresh button or pull-to-refresh

## Next Steps

1. Set up your IAP products in App Store Connect
2. Integrate RevenueCat or another IAP library
3. Create backend verification for purchases
4. Test the complete flow
5. Update the `upgradeToPremium` function in `PremiumContext` to trigger actual purchases

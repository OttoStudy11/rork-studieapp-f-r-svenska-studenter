# Storage Migration Instructions

## Overview
The TypeScript errors in `lib/storage.ts` have been fixed by updating the database type definitions. However, you need to run the SQL script to create the required tables in your Supabase database.

## What Was Fixed
✅ Updated `lib/database.types.ts` to include three new tables:
- `user_settings` - Store user preferences and timer settings
- `active_timer_sessions` - Store active timer state across devices
- `user_onboarding` - Store onboarding progress and selections

## Next Steps

### 1. Run SQL Script in Supabase
Go to your Supabase project → SQL Editor → New Query

Copy and paste the contents of `create-storage-tables.sql` and run it.

This will create:
- Three new tables with proper schema
- Row Level Security (RLS) policies
- Indexes for performance
- Update triggers for `updated_at` columns

### 2. Verify Tables Were Created
After running the SQL, verify in Supabase Dashboard:
- Go to Table Editor
- You should see: `user_settings`, `active_timer_sessions`, `user_onboarding`

### 3. Test the Migration
The `lib/storage.ts` file includes migration helpers:

```typescript
// To migrate existing user data from AsyncStorage to Supabase
await migrateUserDataToSupabase(userId);

// To cleanup old AsyncStorage after successful migration
await cleanupAsyncStorage(userId);
```

## Features Now Available

### User Settings Storage
```typescript
import { getUserSettings, updateUserSettings } from '@/lib/storage';

// Get user settings (creates default if not exists)
const settings = await getUserSettings(userId);

// Update specific settings
await updateUserSettings(userId, {
  timer_focus_duration: 30,
  dark_mode: true
});
```

### Active Timer Sessions
Store timer state across devices and app restarts:

```typescript
import { saveActiveTimerSession, getActiveTimerSession } from '@/lib/storage';

// Save current timer state
await saveActiveTimerSession(userId, {
  session_type: 'focus',
  status: 'running',
  course_name: 'Matematik 1a',
  total_duration: 1500,
  remaining_time: 900,
  start_timestamp: Date.now()
});

// Restore timer state on app launch
const session = await getActiveTimerSession(userId);
if (session) {
  // Resume timer with session data
}
```

### Onboarding Status
Track user onboarding progress:

```typescript
import { getOnboardingStatus, updateOnboardingStatus } from '@/lib/storage';

// Get current onboarding status
const status = await getOnboardingStatus(userId);

// Update progress
await updateOnboardingStatus(userId, {
  current_step: 'select_courses',
  steps_completed: ['welcome', 'profile'],
  selected_gymnasium_id: 'some-id'
});

// Mark as complete
await completeOnboarding(userId);
```

## Security

All tables have Row Level Security (RLS) enabled:
- Users can only access their own data
- Policies enforce authentication via `auth.uid()`
- Foreign keys maintain data integrity

## Performance

Indexes created for optimal query performance:
- `idx_user_settings_user_id`
- `idx_active_timer_sessions_user_id`
- `idx_active_timer_sessions_expires_at`
- `idx_user_onboarding_user_id`

## Data Expiration

Active timer sessions automatically expire after 24 hours to prevent stale data accumulation.

## Troubleshooting

If you encounter issues:

1. **Tables not found**: Run the SQL script in Supabase
2. **Permission denied**: Check RLS policies are created correctly
3. **Type errors**: Ensure `lib/database.types.ts` matches your database schema

## Migration from AsyncStorage

The migration will:
1. Move timer settings from `@timer_settings` to `user_settings` table
2. Move onboarding status to `user_onboarding` table
3. Clean up old AsyncStorage keys after successful migration

This migration runs automatically on user login if old data is detected.

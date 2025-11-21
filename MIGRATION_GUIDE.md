# Migration to Supabase Storage - Complete Guide

## Overview

This guide explains how to migrate all user data from local AsyncStorage to Supabase for cross-device sync and reliable data persistence.

## What's Being Migrated

### Current State (Local Storage)
- ❌ Timer settings (focus/break durations, sound, haptics)
- ❌ Study sessions (active timers, paused state)
- ❌ Onboarding status and progress
- ❌ Course selections and progress
- ❌ User preferences (theme, notifications)

### New State (Supabase)
- ✅ All study sessions and progress synced across devices
- ✅ Timer settings accessible everywhere
- ✅ Course data backed up in cloud
- ✅ Real-time updates with RLS security
- ✅ Achievement and streak data preserved

---

## Step 1: Run Database Migrations

Execute these SQL scripts in **Supabase SQL Editor** in order:

### 1.1 Create Tables
```bash
File: migrate-to-supabase-storage.sql
```

This creates:
- `user_settings` - All user preferences
- `active_timer_sessions` - Active/paused timer states
- `user_onboarding` - Onboarding progress tracking
- Enhanced `user_courses` with progress tracking
- Enhanced `profiles` with avatar configs and coins

**Run this first!**

### 1.2 Setup Security (RLS)
```bash
File: setup-rls-policies.sql
```

This enables:
- Row Level Security on all tables
- Per-user data access policies
- Secure cross-device sync
- No data leakage between users

**Run this second!**

---

## Step 2: Verify Database Setup

### Check Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_settings',
  'active_timer_sessions',
  'user_onboarding',
  'user_progress',
  'study_sessions'
);
```

Expected result: 5 tables

### Check RLS Enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles',
  'user_settings',
  'active_timer_sessions',
  'user_onboarding',
  'user_courses',
  'study_sessions',
  'pomodoro_sessions'
);
```

All should have `rowsecurity = true`

### Check Policies Exist
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Should show multiple policies per table (SELECT, INSERT, UPDATE, DELETE)

---

## Step 3: Update Application Code

### Key Files Modified

1. **lib/storage.ts** (NEW) 
   - Supabase storage functions
   - Migration helpers
   - Replaces AsyncStorage calls

2. **contexts/TimerSettingsContext.tsx**
   - Load from Supabase instead of AsyncStorage
   - Auto-sync settings across devices

3. **contexts/CourseContext.tsx**
   - Remove AsyncStorage dependencies
   - Use Supabase for all course data

4. **contexts/AuthContext.tsx**
   - Check onboarding from Supabase
   - Use `user_onboarding` table

5. **lib/timer-persistence.ts**
   - Save active timer states to Supabase
   - Enable cross-device timer continuity

---

## Step 4: Migration Strategy

### Automatic Migration
The app will automatically migrate existing local data to Supabase on first login after update.

**Migration Flow:**
1. User logs in
2. App checks for AsyncStorage data
3. If found, migrates to Supabase
4. Cleans up local storage
5. Future reads/writes use Supabase only

### Manual Migration Function
Call this function to manually trigger migration:

```typescript
import { migrateUserDataToSupabase } from '@/lib/storage';

// In your auth flow
await migrateUserDataToSupabase(user.id);
```

---

## Step 5: Testing the Migration

### Test Checklist

#### ✅ Timer Settings
- [ ] Change focus duration → Syncs to database
- [ ] Toggle sound → Persists after app restart
- [ ] Settings work on different devices

#### ✅ Study Sessions
- [ ] Start timer → Session saved to DB
- [ ] Complete session → Progress updates
- [ ] Pause timer → Can resume from another device

#### ✅ Course Progress
- [ ] Add course → Appears in Supabase
- [ ] Update progress → Syncs immediately
- [ ] Delete course → Removes from all devices

#### ✅ Onboarding
- [ ] Complete onboarding → Marked in DB
- [ ] Never shows again on any device

#### ✅ Achievements
- [ ] Complete study session → Achievement progress updates
- [ ] Unlock achievement → Visible everywhere

---

## Step 6: RLS Security Verification

### Test User Isolation
1. Create two test accounts
2. Add data to Account A
3. Login to Account B
4. Verify Account B **cannot** see Account A's data

### Test Queries
```sql
-- As authenticated user, should only see own data
SELECT * FROM user_settings WHERE user_id = auth.uid();
SELECT * FROM study_sessions WHERE user_id = auth.uid();
SELECT * FROM user_courses WHERE user_id = auth.uid();
```

---

## Benefits After Migration

### 1. Cross-Device Sync
- Start timer on phone → Continue on tablet
- Add course on web → See on mobile instantly
- Update settings once → Apply everywhere

### 2. Data Reliability
- No data loss on app uninstall
- Automatic backups via Supabase
- Restore data on new devices

### 3. Performance
- Faster data access with proper indexes
- Real-time updates without polling
- Efficient queries with RLS

### 4. Security
- User data isolated per account
- Row-level security policies
- No accidental data leakage

---

## Rollback Plan

If issues occur, revert by:

1. **Disable RLS temporarily** (not recommended):
```sql
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
```

2. **Remove new tables**:
```sql
DROP TABLE IF EXISTS active_timer_sessions CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_onboarding CASCADE;
```

3. **Re-enable AsyncStorage** in code:
   - Restore old context files from git history
   - Remove `lib/storage.ts` imports

---

## Monitoring & Maintenance

### Check Data Growth
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Clean Expired Timer Sessions
Run periodically (or set up a cron job):
```sql
SELECT cleanup_expired_timer_sessions();
```

### Monitor Active Users
```sql
SELECT 
  DATE(last_study_date) as date,
  COUNT(*) as active_users
FROM user_progress
WHERE last_study_date > NOW() - INTERVAL '30 days'
GROUP BY DATE(last_study_date)
ORDER BY date DESC;
```

---

## Troubleshooting

### Problem: RLS blocking user inserts
**Solution**: Ensure policies have `WITH CHECK` clauses:
```sql
CREATE POLICY "Users can insert their own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Problem: Data not syncing
**Solution**: Check network connection and Supabase logs in dashboard

### Problem: Migration fails
**Solution**: Check logs, verify user exists in `profiles` table first

### Problem: Duplicate data
**Solution**: Use `UPSERT` with `ON CONFLICT` in all insert operations

---

## Next Steps

After successful migration:

1. ✅ Monitor first week for issues
2. ✅ Collect user feedback
3. ✅ Set up automated backups in Supabase
4. ✅ Configure real-time subscriptions for live updates
5. ✅ Remove old AsyncStorage code completely (after 2-3 versions)

---

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Review RLS policies
3. Verify user authentication
4. Test with fresh account

**Migration Complete! 🎉**
All data is now safely stored in Supabase with proper security and cross-device sync enabled.

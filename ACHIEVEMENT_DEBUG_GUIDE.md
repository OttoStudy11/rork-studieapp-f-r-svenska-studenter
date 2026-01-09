# Achievement System Debug Guide

## Problem
Achievements like "lägg till vän", "avsluta session", and "streak" are not triggering and not giving XP.

## Root Causes Found

### 1. Database Triggers Not Installed
The file `fix-achievement-triggers.sql` contains the necessary triggers but may not have been run on the database.

**Solution:** Run the SQL file to install triggers:
```bash
# In Supabase SQL Editor, run:
cat fix-achievement-triggers.sql
```

### 2. Missing Achievement Check on Friend Accept
When accepting a friend request, the app wasn't checking for achievements.

**Fixed:** Added `checkAchievements()` call after friend acceptance in `app/(tabs)/friends.tsx`

### 3. Insufficient Logging
Hard to debug when achievement system fails silently.

**Fixed:** Added comprehensive console.logs to:
- `GamificationContext.checkAchievements()`
- Friend acceptance flow
- Session completion flow

## How Achievement System Works

### Database Triggers (Automatic)
When these SQL triggers are installed, achievements are checked automatically:

1. **After Pomodoro Session Insert**
   - Trigger: `auto_check_achievements_after_session`
   - Checks: session count, study time, course-based achievements
   - Also awards XP directly in database

2. **After Friend Status Update**
   - Trigger: `auto_check_achievements_after_friend`
   - Checks: friend count achievements for both users
   - Only triggers when status changes to 'accepted'

### Manual Checks (Backup)
The app also manually calls `checkAchievements()`:

1. **After Focus Session Completes** (`app/(tabs)/timer.tsx`)
   ```typescript
   await checkAchievements();
   await refreshAchievements();
   ```

2. **After Friend Accepted** (`app/(tabs)/friends.tsx`)
   ```typescript
   await checkAchievements();
   ```

## Testing the Fix

### 1. Install Database Triggers
```sql
-- Run fix-achievement-triggers.sql in Supabase SQL Editor
-- This will create:
-- - check_user_achievements() function
-- - auto_check_achievements_after_session trigger
-- - auto_check_achievements_after_friend trigger
```

### 2. Test Session Achievement
1. Start a focus session
2. Complete it
3. Check console logs for:
   ```
   🏆 Calling check_user_achievements RPC for user: [user-id]
   📊 RPC response: [data]
   🎉 X new achievement(s) unlocked!
   🏆 Achievement unlocked: [title] (+X XP)
   ```
4. Verify XP is added to user_progress table
5. Verify achievement shows in achievements screen

### 3. Test Friend Achievement
1. Send a friend request to another user
2. Accept the friend request
3. Check console logs for:
   ```
   🏆 Checking for friend achievements...
   🏆 Calling check_user_achievements RPC for user: [user-id]
   🎉 X new achievement(s) unlocked!
   ✅ Friend achievements checked
   ```
4. Verify "First Friend" achievement unlocks
5. Verify XP is awarded

### 4. Test Streak Achievement
1. Study on consecutive days
2. After 3 days, "3 Day Streak" should unlock
3. Check `user_progress.current_streak` value
4. Achievement should trigger automatically via database

## Common Issues

### Issue: RPC function not found
**Error:** `function check_user_achievements(uuid) does not exist`

**Fix:** Run `fix-achievement-triggers.sql` in Supabase SQL Editor

### Issue: Achievements unlock but no XP
**Cause:** XP update in `check_user_achievements` function might be failing

**Debug:**
```sql
-- Check if user_progress has total_xp column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_progress' AND column_name = 'total_xp';

-- Check user_progress for user
SELECT * FROM user_progress WHERE user_id = '[user-id]';

-- Check user_achievements
SELECT * FROM user_achievements 
WHERE user_id = '[user-id]' 
ORDER BY unlocked_at DESC;
```

### Issue: Achievements not showing in UI
**Cause:** GamificationContext and AchievementContext not syncing

**Fix:** Both contexts now refresh after achievements are unlocked

### Issue: Console shows "No new achievements unlocked"
**Cause:** Either achievements already unlocked OR progress not sufficient

**Debug:**
```sql
-- Check user's progress for specific achievement
SELECT 
  a.title,
  a.requirement_type,
  a.requirement_target,
  ua.progress,
  ua.unlocked_at
FROM achievements a
LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = '[user-id]'
WHERE a.achievement_key IN ('first_session', 'first_friend', 'streak_3');

-- Check actual data
SELECT COUNT(*) as session_count FROM pomodoro_sessions WHERE user_id = '[user-id]';
SELECT COUNT(*) as friend_count FROM friends WHERE (user_id = '[user-id]' OR friend_id = '[user-id]') AND status = 'accepted';
SELECT current_streak FROM user_progress WHERE user_id = '[user-id]';
```

## Expected Console Output (Success)

When completing a session:
```
🎯 Awarding study session XP and updating challenges...
✅ Study session XP awarded successfully
🏆 Checking for achievements after session...
🏆 Calling check_user_achievements RPC for user: abc-123
📊 RPC response: [{achievements: {title: "First Session", ...}}]
🎉 1 new achievement(s) unlocked!
🏆 Achievement unlocked: First Session (+50 XP)
✅ Achievement data refreshed
✅ Achievements checked and refreshed successfully
```

When accepting a friend:
```
🏆 Checking for friend achievements...
🏆 Calling check_user_achievements RPC for user: abc-123
📊 RPC response: [{achievements: {title: "First Friend", ...}}]
🎉 1 new achievement(s) unlocked!
🏆 Achievement unlocked: First Friend (+25 XP)
✅ Achievement data refreshed
✅ Friend achievements checked
```

## Verification Checklist

- [ ] `fix-achievement-triggers.sql` has been run in Supabase
- [ ] Database triggers exist (check in Supabase Dashboard → Database → Triggers)
- [ ] Console shows achievement check logs when completing sessions
- [ ] Console shows achievement check logs when accepting friends
- [ ] XP increases in `user_progress.total_xp`
- [ ] Achievements show as unlocked in achievements screen
- [ ] Toast notifications appear when achievements unlock
- [ ] No errors in console related to achievements

## Next Steps

If issues persist after running fixes:
1. Check Supabase logs for RPC errors
2. Verify RLS policies allow INSERT on user_achievements
3. Check that achievements table is populated with achievement definitions
4. Verify user_progress row exists for user (created on profile creation)

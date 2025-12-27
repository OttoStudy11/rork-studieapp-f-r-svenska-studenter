# Unified Points System - Implementation Summary

## System Architecture

All points, XP, and progression now flow through **GamificationContext** as the single source of truth.

### Context Hierarchy

```
GamificationContext (Master - stores totalXp, levels, achievements, challenges)
    ↓
PointsContext (Wrapper - provides backward compatibility)
    ↓
ChallengesContext (Wrapper - provides challenge interface)
```

## How Points Are Earned

### 1. Study Sessions (Timer)
- **Timer completion**: Calls `awardStudySession(minutes, courseId?)`
- **XP Formula**: `Math.floor(minutes / 5) * 5` XP
- **Example**: 25 min session = 25 XP
- **Triggers**: Session achievements, study streak achievements

### 2. Daily Challenges
- **Completion**: User completes challenge target
- **Claiming**: User must claim to receive XP
- **XP Rewards**: 
  - Easy: 30-50 XP
  - Medium: 60-100 XP
  - Hard: 120-200 XP
- **Triggers**: Challenge completion achievements

### 3. Achievements
- **Automatic unlock**: When requirements are met
- **Manual claim**: User claims to receive XP
- **XP by Rarity**:
  - Common: 25-50 XP
  - Uncommon: 75-150 XP
  - Rare: 200-350 XP
  - Epic: 400-600 XP
  - Legendary: 750-1000 XP

### 4. Level Up Bonuses
- **Automatic**: +50 XP when leveling up
- **Tier Change**: Extra notification when entering new tier

### 5. Lessons & Quizzes
- **Lesson Complete**: 10 XP
- **Quiz 50-75%**: 20 XP
- **Quiz 75-90%**: 35 XP
- **Quiz 90-100%**: 50 XP

## Achievement Triggers

### Implemented Triggers
1. **Study Time** - Tracked via `awardStudySession()`
2. **Level Milestones** - Automatic on level up
3. **Challenge Completion** - Tracked in `claimChallenge()`

### Missing Triggers (To Implement)
1. **Friend Actions**:
   - First friend added
   - 5 friends added
   - 10 friends added
   - Friend request sent
   - Friend request accepted

2. **Social Actions**:
   - Comparing with friends
   - Beating friend in leaderboard
   - Helping another student

3. **Course Actions**:
   - First course completed
   - Multiple courses completed
   - Perfect quiz score
   - Lesson streak

## Database Schema

### Core Tables
- `user_levels` - Stores current_level, total_xp, xp_to_next_level
- `point_transactions` - Audit trail of all XP changes
- `achievements` - Achievement definitions
- `user_achievements` - User's achievement progress and unlocks
- `daily_challenges` - Daily challenge definitions
- `user_daily_challenges` - User's challenge progress

### Data Flow

```
User Action → GamificationContext.addXp() 
    → Updates user_levels.total_xp
    → Creates point_transactions record
    → Checks achievements (checkAchievements())
    → Returns LevelUpEvent if leveled up
```

## API Methods

### GamificationContext
```typescript
addXp(amount, sourceType, sourceId?, metadata?) → Promise<LevelUpEvent | null>
awardStudySession(minutes, courseId?) → Promise<LevelUpEvent | null>
awardLessonComplete() → Promise<LevelUpEvent | null>
awardQuizComplete(scorePercent) → Promise<LevelUpEvent | null>
claimChallenge(challengeId) → Promise<void>
claimAchievement(achievementId) → Promise<void>
checkAchievements() → Promise<void>
```

### PointsContext (Backward Compatible)
```typescript
addPoints(amount, meta?) → Promise<void> // Calls addXp
deductPoints(amount, meta?) → Promise<void> // Calls addXp with negative
markChallengeClaimed(id) → Promise<void> // Calls claimChallenge
```

### ChallengesContext
```typescript
claimChallenge(id) → Promise<void> // Calls gamification.claimChallenge
```

## Progress Display

All screens now show unified data:
- **Profile**: Shows totalXp, current level from GamificationContext
- **Home**: Shows progress bars, achievements from GamificationContext
- **Timer**: Shows streak, daily goals from GamificationContext
- **Friends**: Compares total_xp between users

## Migration Notes

### Old System
- PointsContext had separate studyPoints, bonusPoints, achievementPoints
- ChallengesContext calculated from pomodoroSessions
- AchievementContext had separate totalPoints

### New System
- Single totalXp in GamificationContext
- All contexts derive from GamificationContext
- Backward compatible through wrapper interfaces

## Testing Checklist

- [ ] Complete timer session → Awards correct XP
- [ ] Complete daily challenge → Awards challenge XP
- [ ] Unlock achievement → Shows in profile
- [ ] Claim achievement → Awards achievement XP
- [ ] Level up → Shows notification + bonus XP
- [ ] Add friend → Triggers friend achievement (to implement)
- [ ] Complete lesson → Awards 10 XP
- [ ] Complete quiz → Awards score-based XP
- [ ] All point displays show same value across app

## Known Issues

1. Timer system needs update to call `awardStudySession()` instead of just saving session
2. Friend actions don't trigger achievements yet
3. Achievement checking might not run after all actions
4. Daily challenge progress not updating in real-time from timer

## Next Steps

1. Add achievement triggers to friend actions
2. Update timer to properly award XP on completion
3. Test all point flows end-to-end
4. Add real-time challenge progress updates
5. Create achievements for social features

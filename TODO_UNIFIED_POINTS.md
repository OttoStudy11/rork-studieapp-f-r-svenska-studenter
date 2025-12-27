# TODO - Slutför Unified Points System

## Kvar att göra:

### 1. Timer System (CRITICAL)
Filen: `app/(tabs)/timer.tsx`

**Problem**: Timer använder fortfarande gamla systemet
**Fix**: Uppdatera timer completion för att använda `awardStudySession()`

```typescript
// I handleTimerComplete callback, byt:
const pointsEarned = Math.floor(focusTime / 5);

// Till:
const levelUpEvent = await awardStudySession(focusTime, selectedCourse);
const pointsEarned = Math.floor(focusTime / 5) * 5;

if (levelUpEvent) {
  showAchievement(
    `🎉 Nivå ${levelUpEvent.newLevel}!`,
    `${levelUpEvent.newTier ? 'Ny tier! ' : ''}+${levelUpEvent.bonusXp} XP bonus`
  );
}
```

**Även**: Byt `currentStreak` till `streak` från useGamification()

### 2. Achievement Triggers - Friends
Filer: `app/(tabs)/friends.tsx`, eventuellt friends context

**Lägg till triggers för**:
- När man accepterar vänförfrågan: `checkAchievements()` efter accept
- När man lägger till första vännen: automatic trigger
- När man når 5, 10 vänner: automatic based on count

**Implementation**:
```typescript
// Efter accept friend request:
await checkAchievements();

// Efter add friend:
await checkAchievements();
```

### 3. Achievement Triggers - Study
**Automatiska triggers finns redan** i GamificationContext när:
- Level up händer
- Study session slutförs
- Challenge claimas

**Men vi behöver**:
- First lesson achievement check
- Perfect quiz score achievement
- Course completion achievement

### 4. Database Sync Issue
**Problem**: Daily challenges har duplicate key constraint error
**Fix**: SQL-funktionen `generate_daily_challenges()` försöker skapa samma challenges flera gånger

**Lösning**: Fixa SQL-funktionen att använda UPSERT istället för INSERT

### 5. Profile Display
Filer: `app/profile.tsx`, `app/(tabs)/home.tsx`

**Kontrollera att**: Alla skärmar visar samma XP-värde
- Profile visar `gamification.totalXp`
- Home visar samma
- Timer visar samma
- Leaderboard jämför samma

## Test Checklist:

- [ ] Slutför timer session → Ser +XP notification
- [ ] Level up från session → Ser level up + bonus
- [ ] Claim daily challenge → Får challenge XP
- [ ] Unlock achievement → Syns i profilen
- [ ] Claim achievement → Får achievement XP
- [ ] Lägg till vän → Achievement check körs
- [ ] Profil, Home, Timer visar samma XP
- [ ] Leaderboard sorterar korrekt på XP

## Filer att uppdatera:

1. ✅ `contexts/PointsContext.tsx` - KLAR
2. ✅ `contexts/ChallengesContext.tsx` - KLAR  
3. ⏳ `app/(tabs)/timer.tsx` - BEHÖVER FIX
4. ⏳ `app/(tabs)/friends.tsx` - BEHÖVER ACHIEVEMENT TRIGGERS
5. ⏳ `app/profile.tsx` - VERIFY XP DISPLAY
6. ⏳ `app/(tabs)/home.tsx` - VERIFY XP DISPLAY

## SQL Fix Needed:

```sql
-- Fix generate_daily_challenges to use UPSERT
CREATE OR REPLACE FUNCTION generate_daily_challenges(p_date date)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_challenges (
    challenge_date, title, title_sv, description, description_sv,
    challenge_type, target_value, xp_reward, difficulty, emoji
  ) VALUES
    -- challenges here
  ON CONFLICT (challenge_date, challenge_type) 
  DO NOTHING;
END;
$$ LANGUAGE plpgsql;
```

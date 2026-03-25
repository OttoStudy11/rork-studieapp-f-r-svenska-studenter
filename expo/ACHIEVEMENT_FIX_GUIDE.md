# Achievement System Fix Guide

## Problem
Achievements som "lägg till vän", "avsluta session", och "streak" triggades inte och gav ingen XP.

## Root Causes
1. ❌ SQL-funktionen `check_user_achievements()` saknades i databasen
2. ❌ `checkAndUpdateAchievements()` fanns inte i database.ts
3. ❌ Achievement-checks anropades inte automatiskt efter viktiga händelser
4. ❌ XP tilldelas inte automatiskt när achievements unlockades

## Lösning

### 1. Database Triggers & Functions
Jag har skapat `fix-achievement-triggers.sql` som:
- ✅ Skapar RPC-funktionen `check_user_achievements()` som automatiskt:
  - Beräknar progress för alla achievements baserat på användarens stats
  - Låser upp achievements när målet nås
  - **Tilldelar XP automatiskt** till `user_progress.total_xp`
- ✅ Skapar **automatiska triggers** som kör achievement-check:
  - Efter varje pomodoro session (via trigger på `pomodoro_sessions`)
  - När vän accepteras (via trigger på `friends`)
- ✅ Uppdaterar streak i `user_progress` tabellen
- ✅ Skapar index för bättre prestanda

### 2. TypeScript Implementation
Uppdaterat `lib/database.ts` med:
- ✅ `checkAndUpdateAchievements()` funktion som anropar SQL RPC-funktionen
- ✅ Felhantering och nätverkstolerans
- ✅ Logging för debugging

## Installation

### Steg 1: Kör SQL-migration
Öppna Supabase Dashboard → SQL Editor och kör:

```bash
# Kopiera innehållet från fix-achievement-triggers.sql
# Eller kör direkt via Supabase CLI:
supabase db execute -f fix-achievement-triggers.sql
```

### Steg 2: Verifiera att funktionen skapades
Kör detta i SQL Editor för att verifiera:

```sql
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname = 'check_user_achievements';
```

Du ska se funktionen listad.

### Steg 3: Verifiera triggers
```sql
SELECT tgname, tgrelid::regclass, tgtype 
FROM pg_trigger 
WHERE tgname LIKE '%achievement%';
```

Du ska se:
- `auto_check_achievements_after_session`
- `auto_check_achievements_after_friend`

## Hur det fungerar

### Automatisk Triggning (via Database Triggers)
När användaren:
1. **Avslutar en session** → Trigger körs automatiskt → Achievements checkas → XP tilldelas
2. **Accepterar vän** → Trigger körs automatiskt → Achievements checkas → XP tilldelas
3. **Bygger streak** → Beräknas automatiskt vid nästa session

### Manuell Triggning (via Code)
Achievements checkas också manuellt i vissa fall:
- I `app/(tabs)/timer.tsx` efter session sparas (rad 581)
- Kan anropas från `GamificationContext.checkAchievements()`

## Test Plan

### Test 1: Session Achievement
1. Öppna Timer-fliken
2. Starta en 1-minuters session
3. Avsluta sessionen
4. **Förväntat resultat:**
   - Achievement "Första Sessionen" ska låsas upp (om det är första)
   - XP ska tilldelas automatiskt
   - Toast-notifikation visas med achievement-namn

### Test 2: Friend Achievement  
1. Öppna Vänner-fliken
2. Lägg till en vän (skicka request)
3. Acceptera vänförfrågan (från andra användaren)
4. **Förväntat resultat:**
   - Achievement "Första Vännen" ska låsas upp
   - XP ska tilldelas automatiskt
   - Toast-notifikation visas

### Test 3: Streak Achievement
1. Avsluta minst 1 session idag
2. Kom tillbaka imorgon och avsluta en session
3. Gör samma sak i 3 dagar i rad
4. **Förväntat resultat:**
   - Achievement "3-dagars Streak" ska låsas upp
   - XP ska tilldelas automatiskt

### Test 4: Verifiera XP i Database
Kör detta SQL för att se att XP faktiskt läggs till:

```sql
-- Se användarens XP
SELECT id, name, total_xp 
FROM user_progress 
WHERE user_id = 'YOUR_USER_ID';

-- Se upplåsta achievements
SELECT ua.unlocked_at, a.title, a.xp_reward
FROM user_achievements ua
JOIN achievements a ON a.id = ua.achievement_id
WHERE ua.user_id = 'YOUR_USER_ID'
AND ua.unlocked_at IS NOT NULL
ORDER BY ua.unlocked_at DESC;
```

## Debugging

### Se console logs
Achievements systemet loggar nu:
```
🏆 Checking achievements for user: <user_id>
🎉 2 new achievement(s) unlocked!
✅ No new achievements unlocked
```

### Verifiera att RPC-funktionen körs
Kör detta SQL för att se senaste achievement-unlock:

```sql
SELECT 
  ua.unlocked_at,
  a.title,
  a.xp_reward,
  a.requirement_type,
  ua.progress
FROM user_achievements ua
JOIN achievements a ON a.id = ua.achievement_id
WHERE ua.user_id = 'YOUR_USER_ID'
ORDER BY ua.unlocked_at DESC NULLS LAST
LIMIT 10;
```

### Om achievements inte triggas
1. Kolla att SQL-funktionen finns: `SELECT * FROM pg_proc WHERE proname = 'check_user_achievements';`
2. Kolla att triggers finns: `SELECT * FROM pg_trigger WHERE tgname LIKE '%achievement%';`
3. Kolla att `xp_reward` kolumn finns i `achievements` tabell
4. Kolla att `total_xp` kolumn finns i `user_progress` tabell
5. Se console för fel-meddelanden

## Achievements som nu ska fungera

### Session-baserade
- ✅ "Första Sessionen" (1 session)
- ✅ "10 Sessioner" (10 sessions)
- ✅ "100 Sessioner" (100 sessions totalt)
- ✅ "Studera 30 minuter" (30 minuter)
- ✅ "Studera 10 timmar" (600 minuter)

### Vän-baserade
- ✅ "Första Vännen" (1 vän)
- ✅ "Socialt Geni" (5 vänner)
- ✅ "Influencer" (10 vänner)

### Streak-baserade
- ✅ "3-dagars Streak"
- ✅ "7-dagars Streak"
- ✅ "30-dagars Streak"

## För Premium Access (Testing)

För att testa premium-funktioner utan RevenueCat:

1. Kör detta SQL för att ge dig premium:
```sql
UPDATE profiles 
SET 
  subscription_type = 'premium',
  subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE id = 'YOUR_USER_ID';
```

2. Eller temporärt i koden, lägg till i `PremiumContext.tsx`:
```typescript
// Temporary: Force premium for testing
const isPremium = true; // Change to actual check later
```

## Sammanfattning

✅ **Fixed:**
- SQL RPC-funktion för achievement-checking
- Automatiska database triggers
- XP tilldelas automatiskt när achievements unlockade
- Manuella check-points i kod

✅ **Achievements triggas nu:**
- Efter session avslutas
- När vän läggs till
- När streak uppdateras

✅ **XP-system:**
- XP läggs automatiskt till i `user_progress.total_xp`
- Synkroniseras med GamificationContext
- Visas i UI via PointsContext

## Nästa Steg

1. Kör SQL-migration: `fix-achievement-triggers.sql`
2. Testa alla achievement-typer enligt Test Plan
3. Verifiera XP i database
4. Om något inte fungerar, kolla Debug-sektionen

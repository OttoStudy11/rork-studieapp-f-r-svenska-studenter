# Vänner & Topplista System - Setup Guide

## Översikt

Detta system ger en komplett lösning för vänhantering och topplistor i din studieapp. Systemet inkluderar:

- ✅ Vänförfrågningar (skicka, acceptera, avvisa)
- ✅ Vänlista med online/offline/studerar status
- ✅ Automatisk progress-tracking
- ✅ Flera topplistor (daglig, veckovis, månatlig, totalt, streak)
- ✅ Real-time uppdateringar
- ✅ Row Level Security (RLS)
- ✅ Optimerade databas-queries

## Installation

### Steg 1: Kör SQL-filen

Kör följande SQL-fil i din Supabase SQL Editor:

```bash
complete-friends-leaderboard-system.sql
```

Denna fil skapar:
- `friendships` tabell
- `user_progress` tabell (uppdaterad med leaderboard-fält)
- `study_sessions` tabell (om den inte finns)
- Alla nödvändiga funktioner och triggers
- RLS policies
- Indexes för prestanda

### Steg 2: Verifiera Installation

Kontrollera att följande tabeller finns:
- ✅ `public.friendships`
- ✅ `public.user_progress`
- ✅ `public.study_sessions`
- ✅ `public.profiles`

Kontrollera att följande funktioner finns:
- ✅ `calculate_user_streak(UUID)`
- ✅ `update_user_progress_after_session()`
- ✅ `get_daily_leaderboard(UUID, INTEGER)`
- ✅ `get_weekly_leaderboard(UUID, INTEGER)`
- ✅ `get_monthly_leaderboard(UUID, INTEGER)`
- ✅ `get_alltime_leaderboard(UUID, INTEGER)`
- ✅ `get_streak_leaderboard(UUID, INTEGER)`
- ✅ `search_users_by_username(TEXT)`

## Databas Schema

### Friendships Tabell

```sql
CREATE TABLE public.friendships (
    id UUID PRIMARY KEY,
    user1_id UUID REFERENCES profiles(id),
    user2_id UUID REFERENCES profiles(id),
    status TEXT ('pending' | 'accepted' | 'blocked'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Status:**
- `pending` - Vänförfrågan skickad, väntar på svar
- `accepted` - Vänförfrågan accepterad, ni är vänner
- `blocked` - Användare blockerad

**Viktigt:**
- En användare kan inte lägga till sig själv som vän
- Duplicerade vänförfrågningar förhindras automatiskt
- (A,B) och (B,A) behandlas som samma vänskap

### User Progress Tabell

```sql
CREATE TABLE public.user_progress (
    user_id UUID PRIMARY KEY,
    
    -- Totalt
    total_study_time INTEGER,      -- totala minuter
    total_sessions INTEGER,
    current_streak INTEGER,
    longest_streak INTEGER,
    
    -- Periodbaserat (för topplistor)
    daily_study_time INTEGER,      -- dagens minuter
    weekly_study_time INTEGER,     -- veckans minuter (7 dagar)
    monthly_study_time INTEGER,    -- månadens minuter (30 dagar)
    daily_sessions INTEGER,
    weekly_sessions INTEGER,
    monthly_sessions INTEGER,
    
    -- Metadata
    last_study_date TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Automatisk uppdatering:**
- Uppdateras automatiskt när en `study_session` skapas
- Streak beräknas automatiskt
- Periodbaserad statistik uppdateras i realtid

### Study Sessions Tabell

```sql
CREATE TABLE public.study_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    course_id TEXT,
    duration_minutes INTEGER,
    notes TEXT,
    technique TEXT,
    completed BOOLEAN,
    created_at TIMESTAMP
);
```

## API Användning

### Vänhantering

#### Skicka vänförfrågan

```typescript
const { error } = await supabase
  .from('friendships')
  .insert({
    user1_id: currentUserId,
    user2_id: friendUserId,
    status: 'pending'
  });
```

#### Acceptera vänförfrågan

```typescript
const { error } = await supabase
  .from('friendships')
  .update({ status: 'accepted' })
  .eq('id', requestId)
  .eq('user2_id', currentUserId);
```

#### Avvisa vänförfrågan

```typescript
const { error } = await supabase
  .from('friendships')
  .delete()
  .eq('id', requestId)
  .eq('user2_id', currentUserId);
```

#### Ta bort vän

```typescript
const { error } = await supabase
  .from('friendships')
  .delete()
  .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${currentUserId})`);
```

#### Hämta vänner

```typescript
const { data: friendships } = await supabase
  .from('friendships')
  .select(`
    id,
    user1_id,
    user2_id,
    status,
    user1:profiles!friendships_user1_id_fkey(id, username, display_name, avatar_url),
    user2:profiles!friendships_user2_id_fkey(id, username, display_name, avatar_url)
  `)
  .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
  .eq('status', 'accepted');
```

#### Sök användare

```typescript
const { data: users } = await supabase
  .rpc('search_users_by_username', { search_term: 'john' });
```

### Topplistor

#### Daglig topplista

```typescript
const { data: leaderboard } = await supabase
  .rpc('get_daily_leaderboard', { 
    p_user_id: currentUserId,
    p_limit: 50 
  });
```

#### Veckovis topplista

```typescript
const { data: leaderboard } = await supabase
  .rpc('get_weekly_leaderboard', { 
    p_user_id: currentUserId,
    p_limit: 50 
  });
```

#### Månatlig topplista (Premium)

```typescript
const { data: leaderboard } = await supabase
  .rpc('get_monthly_leaderboard', { 
    p_user_id: currentUserId,
    p_limit: 50 
  });
```

#### Totalt topplista (Premium)

```typescript
const { data: leaderboard } = await supabase
  .rpc('get_alltime_leaderboard', { 
    p_user_id: currentUserId,
    p_limit: 50 
  });
```

#### Streak topplista

```typescript
const { data: leaderboard } = await supabase
  .rpc('get_streak_leaderboard', { 
    p_user_id: currentUserId,
    p_limit: 50 
  });
```

### Progress Tracking

#### Skapa studiesession

```typescript
const { error } = await supabase
  .from('study_sessions')
  .insert({
    user_id: currentUserId,
    course_id: 'matematik-1a',
    duration_minutes: 45,
    technique: 'pomodoro',
    completed: true
  });

// user_progress uppdateras automatiskt via trigger!
```

#### Hämta egen progress

```typescript
const { data: progress } = await supabase
  .from('user_progress')
  .select('*')
  .eq('user_id', currentUserId)
  .single();
```

#### Hämta vänners progress

```typescript
const { data: friendsProgress } = await supabase
  .from('user_progress')
  .select(`
    *,
    profile:profiles(username, display_name, avatar_url)
  `)
  .in('user_id', friendIds);
```

## Real-time Subscriptions

### Lyssna på vänförfrågningar

```typescript
const subscription = supabase
  .channel('friendships')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'friendships',
      filter: `user2_id=eq.${currentUserId}`
    },
    (payload) => {
      console.log('Ny vänförfrågan!', payload);
      // Uppdatera UI
    }
  )
  .subscribe();
```

### Lyssna på progress-uppdateringar

```typescript
const subscription = supabase
  .channel('user_progress')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_progress',
      filter: `user_id=in.(${friendIds.join(',')})`
    },
    (payload) => {
      console.log('Vän uppdaterade sin progress!', payload);
      // Uppdatera topplista
    }
  )
  .subscribe();
```

## Säkerhet (RLS Policies)

### Friendships
- ✅ Användare kan se sina egna vänskaper
- ✅ Användare kan skicka vänförfrågningar
- ✅ Användare kan acceptera/avvisa förfrågningar de mottagit
- ✅ Användare kan ta bort vänskaper
- ❌ Användare kan INTE se andras vänskaper

### User Progress
- ✅ Användare kan se sin egen progress
- ✅ Användare kan se sina vänners progress (för topplistor)
- ❌ Användare kan INTE se icke-vänners progress

### Study Sessions
- ✅ Användare kan se sina egna sessioner
- ✅ Användare kan skapa egna sessioner
- ❌ Användare kan INTE se andras sessioner

## Prestanda

### Indexes
Följande indexes skapas för optimal prestanda:

**Friendships:**
- `friendships_user1_id_idx`
- `friendships_user2_id_idx`
- `friendships_status_idx`
- `friendships_unique_pair_idx` (förhindrar duplicates)

**User Progress:**
- `idx_user_progress_total_study_time`
- `idx_user_progress_current_streak`
- `idx_user_progress_daily_study_time`
- `idx_user_progress_weekly_study_time`
- `idx_user_progress_monthly_study_time`

**Study Sessions:**
- `study_sessions_user_id_idx`
- `study_sessions_course_id_idx`
- `study_sessions_created_at_idx`

### Query Optimering

Alla leaderboard-funktioner använder:
- `ROW_NUMBER()` för effektiv ranking
- Indexes för snabb sortering
- Filtrering på vänner för privacy
- LIMIT för att begränsa resultat

## Testning

### Test 1: Skapa vänförfrågan

```sql
-- Som användare A, skicka förfrågan till B
INSERT INTO public.friendships (user1_id, user2_id, status)
VALUES ('user-a-uuid', 'user-b-uuid', 'pending');
```

### Test 2: Acceptera vänförfrågan

```sql
-- Som användare B, acceptera förfrågan
UPDATE public.friendships
SET status = 'accepted'
WHERE user1_id = 'user-a-uuid' 
AND user2_id = 'user-b-uuid';
```

### Test 3: Skapa studiesession

```sql
-- Skapa en session
INSERT INTO public.study_sessions (user_id, course_id, duration_minutes)
VALUES ('user-a-uuid', 'matematik-1a', 45);

-- Kontrollera att progress uppdaterades
SELECT * FROM public.user_progress WHERE user_id = 'user-a-uuid';
```

### Test 4: Hämta topplista

```sql
-- Hämta veckovis topplista
SELECT * FROM get_weekly_leaderboard('user-a-uuid', 10);
```

## Felsökning

### Problem: Vänförfrågan går inte att skicka

**Lösning:**
- Kontrollera att båda användarna finns i `profiles` tabellen
- Kontrollera att användaren inte försöker lägga till sig själv
- Kontrollera att vänförfrågan inte redan finns

### Problem: Progress uppdateras inte

**Lösning:**
- Kontrollera att triggern `trigger_update_user_progress` finns
- Kontrollera att funktionen `update_user_progress_after_session()` finns
- Kör manuellt: `SELECT update_user_progress_after_session();`

### Problem: Topplistan är tom

**Lösning:**
- Kontrollera att användare har studiesessioner
- Kontrollera att användare är vänner
- Kontrollera RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'user_progress';`

### Problem: Kan inte se vänners progress

**Lösning:**
- Kontrollera att vänskapen har status `'accepted'`
- Kontrollera RLS policy: `"Users can view friends progress"`
- Testa query manuellt i SQL Editor

## Nästa Steg

1. ✅ Kör `complete-friends-leaderboard-system.sql`
2. ✅ Verifiera att alla tabeller och funktioner skapades
3. ✅ Testa vänhantering i appen
4. ✅ Testa topplistor i appen
5. ✅ Implementera real-time uppdateringar
6. ✅ Lägg till notifikationer för vänförfrågningar
7. ✅ Implementera Premium-funktioner (månatlig/totalt topplista)

## Support

Om du stöter på problem:
1. Kontrollera Supabase logs
2. Kontrollera browser console för fel
3. Verifiera RLS policies
4. Testa queries manuellt i SQL Editor

## Sammanfattning

Detta system ger dig:
- 🎯 Komplett vänhantering
- 📊 Flera topplistor
- ⚡ Real-time uppdateringar
- 🔒 Säker med RLS
- 🚀 Optimerad prestanda
- 📱 Redo för produktion

Lycka till med din studieapp! 🎓

-- ============================================================
-- TIMER / STATISTIK / GAMIFICATION SCHEMA
-- ============================================================
-- Gör all tidräkning, statistik, pomodoro, challenges och
-- leaderboard korrekt och komplett på serversidan:
--
--   1. Lägg till saknade kolumner (user_progress.total_xp,
--      profiles.total_points, achievements.xp_reward/rarity/is_hidden).
--   2. Skapa tabeller appen skriver till men som saknats:
--      user_levels, point_transactions, user_points,
--      user_level_history, daily_challenges, user_daily_challenges.
--   3. Trigger som uppdaterar user_progress (minuter, sessioner,
--      streak) automatiskt vid varje pomodoro_sessions-insert —
--      ingen dubbelräkning med klienten (klientens manuella
--      uppdatering är borttagen).
--   4. ensure_daily_challenges() — skapar dagens utmaningar.
--   5. check_user_achievements() — utvärderar achievements + delar
--      ut XP server-side.
--   6. Leaderboard-RPC:er: get_global_leaderboard,
--      get_friends_leaderboard, get_weekly_leaderboard.
--   7. RLS på alla tabeller + idempotent backfill av user_progress
--      från pomodoro_sessions.
--
-- Kör hela filen i Supabase SQL Editor. Idempotent.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. SUPERSÄTT KOLUMNER PÅ BEFINTLIGA TABELLER
-- ============================================================

-- Leaderboard/XP läser och skriver dessa (kolumnen saknades tidigare
-- → XP-synken misslyckades tyst).
alter table public.user_progress add column if not exists total_xp bigint not null default 0;
alter table public.profiles    add column if not exists total_points bigint not null default 0;
alter table public.profiles    add column if not exists updated_at   timestamptz;

-- Appen läser dessa på achievements (föll tillbaka på reward_points).
alter table public.achievements add column if not exists xp_reward integer;
alter table public.achievements add column if not exists rarity    text;
alter table public.achievements add column if not exists is_hidden boolean not null default false;

-- ============================================================
-- 2. NYA TABELLER
-- ============================================================

-- ── user_levels ─────────────────────────────────────────────
-- Nivå/XP per användare (GamificationContext.addXp upsertar här;
-- getLeaderboardPosition rankar på total_xp).
create table if not exists public.user_levels (
  user_id                uuid primary key references public.profiles(id) on delete cascade,
  current_level          integer not null default 1,
  total_xp               bigint  not null default 0,
  xp_to_next_level       integer not null default 100,
  level_progress_percent integer not null default 0 check (level_progress_percent between 0 and 100),
  last_level_up          timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ── point_transactions ──────────────────────────────────────
-- Historik för alla XP/Poäng-händelser.
create table if not exists public.point_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      integer not null,
  source_type text not null,
  source_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ── user_points ─────────────────────────────────────────────
-- XP per källa (xp-manager: dedupe på user_id + source_type + source_id).
create table if not exists public.user_points (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  points         integer not null,
  source_category text not null default 'bonus',
  source_id      text,
  source_type    text not null,
  course_id      text,
  metadata       jsonb not null default '{}'::jsonb,
  awarded_at     timestamptz not null default now()
);

-- ── user_level_history ──────────────────────────────────────
create table if not exists public.user_level_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  level        integer not null,
  total_points bigint  not null default 0,
  achieved_at  timestamptz not null default now()
);

-- ── daily_challenges ────────────────────────────────────────
-- Dagens utmaningar (per datum). id = '<datum>-<nyckel>' → idempotent seed.
create table if not exists public.daily_challenges (
  id             text primary key,
  challenge_date date not null,
  challenge_type text not null check (challenge_type in ('study_minutes', 'sessions_count')),
  title          text not null,
  title_sv       text,
  description    text not null,
  description_sv text,
  emoji          text not null default '🎯',
  target_value   integer not null,
  xp_reward      integer not null default 25,
  difficulty     text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  created_at     timestamptz not null default now(),
  unique (challenge_date, challenge_type, target_value)
);

-- ── user_daily_challenges ───────────────────────────────────
-- Användarens progression per utmaning (unik per användare + utmaning —
-- upsert-målet appen använder: onConflict 'user_id,challenge_id').
create table if not exists public.user_daily_challenges (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  challenge_id    text not null references public.daily_challenges(id) on delete cascade,
  challenge_date  date not null,
  current_progress integer not null default 0,
  is_completed    boolean not null default false,
  is_claimed      boolean not null default false,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, challenge_id)
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
create index if not exists idx_point_transactions_user_date  on public.point_transactions(user_id, created_at desc);
create index if not exists idx_user_points_user              on public.user_points(user_id);
create index if not exists idx_user_points_user_source       on public.user_points(user_id, source_type, source_id);
create index if not exists idx_user_level_history_user       on public.user_level_history(user_id, achieved_at desc);
create index if not exists idx_daily_challenges_date         on public.daily_challenges(challenge_date);
create index if not exists idx_user_daily_challenges_user    on public.user_daily_challenges(user_id, challenge_date);
create index if not exists idx_user_levels_total_xp          on public.user_levels(total_xp desc);
create index if not exists idx_pomodoro_sessions_user_time   on public.pomodoro_sessions(user_id, start_time desc);

-- Unikt index för user_achievements upsert-målet
-- (onConflict 'user_id,achievement_id'). Rensa ev. dubbletter först.
delete from public.user_achievements a
using public.user_achievements b
where a.user_id = b.user_id
  and a.achievement_id = b.achievement_id
  and (
    (b.unlocked_at is not null and a.unlocked_at is null)
    or ((b.unlocked_at is not null) = (a.unlocked_at is not null) and b.id < a.id)
  );

create unique index if not exists user_achievements_user_achievement_uniq
  on public.user_achievements(user_id, achievement_id);

-- ============================================================
-- 4. TRIGGER: pomodoro_sessions → user_progress
-- Server-side sanning för tidräkning och streak. Klienten skriver
-- INTE user_progress längre (annars dubblering).
-- ============================================================
create or replace function public.apply_pomodoro_session_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_progress
    (user_id, total_study_time, total_sessions, current_streak, longest_streak, last_study_date)
  values
    (NEW.user_id, NEW.duration, 1, 1, 1, now())
  on conflict (user_id) do update set
    total_study_time = public.user_progress.total_study_time + NEW.duration,
    total_sessions   = public.user_progress.total_sessions + 1,
    last_study_date  = now(),
    current_streak   = case
      when public.user_progress.last_study_date is null                     then 1
      when public.user_progress.last_study_date::date = current_date        then public.user_progress.current_streak
      when public.user_progress.last_study_date::date = current_date - 1    then public.user_progress.current_streak + 1
      else 1
    end,
    longest_streak   = greatest(
      coalesce(public.user_progress.longest_streak, 0),
      case
        when public.user_progress.last_study_date is null                  then 1
        when public.user_progress.last_study_date::date = current_date     then public.user_progress.current_streak
        when public.user_progress.last_study_date::date = current_date - 1 then public.user_progress.current_streak + 1
        else 1
      end
    ),
    updated_at = now();

  return NEW;
end;
$$;

drop trigger if exists trg_pomodoro_session_stats on public.pomodoro_sessions;
create trigger trg_pomodoro_session_stats
  after insert on public.pomodoro_sessions
  for each row execute function public.apply_pomodoro_session_stats();

-- ============================================================
-- 5. ensure_daily_challenges(p_date)
-- Skapar dagens sex utmaningar om de saknas (anropas av appen
-- innan daily_challenges läses).
-- ============================================================
create or replace function public.ensure_daily_challenges(
  p_date date default current_date
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.daily_challenges where challenge_date = p_date) then
    insert into public.daily_challenges
      (id, challenge_date, challenge_type, title, title_sv, description, description_sv, emoji, target_value, xp_reward, difficulty)
    values
      (to_char(p_date, 'YYYY-MM-DD') || '-snabbfokus',    p_date, 'study_minutes',  'Snabbfokus',    'Snabbfokus',    'Studera i 15 minuter idag',  'Studera i 15 minuter idag',  '⏱️', 15,  30,  'easy'),
      (to_char(p_date, 'YYYY-MM-DD') || '-forsta-passet', p_date, 'sessions_count', 'Första Passet', 'Första Passet', 'Slutför 1 studiepass',       'Slutför 1 studiepass',       '📚', 1,   35,  'easy'),
      (to_char(p_date, 'YYYY-MM-DD') || '-fokustimme',    p_date, 'study_minutes',  'Fokustimme',    'Fokustimme',    'Studera i 60 minuter idag',  'Studera i 60 minuter idag',  '⏳', 60,  60,  'medium'),
      (to_char(p_date, 'YYYY-MM-DD') || '-dubbelpass',    p_date, 'sessions_count', 'Dubbelpass',    'Dubbelpass',    'Slutför 2 studiepass',       'Slutför 2 studiepass',       '🔥', 2,   50,  'medium'),
      (to_char(p_date, 'YYYY-MM-DD') || '-studiemaraton', p_date, 'study_minutes',  'Studiemaraton', 'Studiemaraton', 'Studera i 120 minuter idag', 'Studera i 120 minuter idag', '🏔️', 120, 100, 'hard'),
      (to_char(p_date, 'YYYY-MM-DD') || '-trippelpass',   p_date, 'sessions_count', 'Trippelpass',   'Trippelpass',   'Slutför 3 studiepass',       'Slutför 3 studiepass',       '🚀', 3,   90,  'hard')
    on conflict (id) do nothing;
  end if;
end;
$$;

-- ============================================================
-- 6. check_user_achievements(p_user_id)
-- Utvärderar alla achievements mot verklig statistik, uppdaterar
-- progression, låser upp vid mål och delar ut XP server-side.
-- Returnerar en rad per NY upplåst achievement: (achievement_id,
-- achievements jsonb) — formatet appen förväntar sig.
-- ============================================================
create or replace function public.check_user_achievements(
  p_user_id uuid
) returns table (achievement_id uuid, achievements jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_minutes  bigint := 0;
  v_sessions bigint := 0;
  v_courses  integer := 0;
  v_friends  integer := 0;
  v_streak   integer := 0;
  v_notes    integer := 0;
  v_progress integer := 0;
  v_xp       integer := 0;
  v_row      record;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;

  -- Verklig statistik
  select coalesce(sum(duration), 0), count(*),
         count(distinct course_id) filter (where course_id is not null)
    into v_minutes, v_sessions, v_courses
  from public.pomodoro_sessions
  where public.pomodoro_sessions.user_id = p_user_id;

  select
    (select count(*) from public.friends f where f.user_id = p_user_id and f.status = 'accepted')
    + (select count(*) from public.friends f where f.friend_id = p_user_id and f.status = 'accepted'),
    (select coalesce(up.current_streak, 0) from public.user_progress up where up.user_id = p_user_id),
    (select count(*) from public.notes n where n.user_id = p_user_id)
  into v_friends, v_streak, v_notes;

  for v_row in
    select a.* from public.achievements a
    where not exists (
      select 1 from public.user_achievements ua
      where ua.user_id = p_user_id
        and ua.achievement_id = a.id
        and ua.unlocked_at is not null
    )
  loop
    v_progress := case v_row.requirement_type
      when 'study_time' then v_minutes::integer
      when 'sessions'   then v_sessions::integer
      when 'courses'    then v_courses
      when 'friends'    then v_friends
      when 'streak'     then v_streak
      when 'notes'      then v_notes
      else 0
    end;

    insert into public.user_achievements (user_id, achievement_id, progress, updated_at)
    values (p_user_id, v_row.id, v_progress, now())
    on conflict (user_id, achievement_id) do update
      set progress = excluded.progress, updated_at = now();

    if v_progress >= coalesce(v_row.requirement_target, 1) then
      update public.user_achievements
        set unlocked_at = now(), progress = v_progress, updated_at = now()
        where public.user_achievements.user_id = p_user_id
          and public.user_achievements.achievement_id = v_row.id;

      v_xp := coalesce(v_row.xp_reward, v_row.reward_points, 25);

      -- XP till nivåerna
      insert into public.user_levels
        (user_id, current_level, total_xp, xp_to_next_level, level_progress_percent)
      values
        (p_user_id, 1, v_xp, 100, 0)
      on conflict (user_id) do update
        set total_xp = public.user_levels.total_xp + v_xp, updated_at = now();

      -- XP till progressen/leaderboard
      update public.user_progress
        set total_xp = coalesce(total_xp, 0) + v_xp,
            total_points = coalesce(total_points, 0) + v_xp,
            updated_at = now()
        where public.user_progress.user_id = p_user_id;

      -- Transaktionshistorik
      insert into public.point_transactions (user_id, amount, source_type, source_id, metadata)
      values (p_user_id, v_xp, 'achievement_unlock', v_row.achievement_key,
              jsonb_build_object('title', v_row.title));

      achievement_id := v_row.id;
      achievements   := to_jsonb(v_row);
      return next;
    end if;
  end loop;
end;
$$;

-- ============================================================
-- 7. LEADERBOARD-RPC:ER
-- duration i pomodoro_sessions är MINUTER.
-- ============================================================

-- ── get_global_leaderboard ──────────────────────────────────
create or replace function public.get_global_leaderboard(
  p_user_id uuid default null,
  p_limit   int  default 15
) returns table (
  user_id          uuid,
  rank             bigint,
  username         text,
  display_name     text,
  program          text,
  level            text,
  avatar_url       text,
  total_study_time bigint,
  total_sessions   bigint,
  total_xp         bigint,
  current_streak   integer
)
language sql
security definer
set search_path = public
as $$
  select
    up.user_id,
    row_number() over (order by up.total_study_time desc),
    coalesce(p.username, 'unknown'),
    coalesce(nullif(trim(p.display_name), ''), coalesce(p.username, 'Okänd användare')),
    coalesce(p.program, ''),
    coalesce(p.level, ''),
    p.avatar_url,
    coalesce(up.total_study_time, 0),
    coalesce(up.total_sessions, 0),
    coalesce(up.total_xp, up.total_points, 0),
    coalesce(up.current_streak, 0)
  from public.user_progress up
  join public.profiles p on p.id = up.user_id
  where coalesce(up.total_study_time, 0) > 0
  order by up.total_study_time desc
  limit least(coalesce(p_limit, 15), 100);
$$;

-- ── get_weekly_leaderboard ──────────────────────────────────
create or replace function public.get_weekly_leaderboard(
  p_user_id uuid default null,
  p_limit   int  default 15
) returns table (
  user_id         uuid,
  rank            bigint,
  username        text,
  display_name    text,
  program         text,
  level           text,
  avatar_url      text,
  weekly_minutes  bigint,
  weekly_sessions bigint
)
language sql
security definer
set search_path = public
as $$
  select
    s.user_id,
    row_number() over (order by sum(s.duration) desc),
    coalesce(p.username, 'unknown'),
    coalesce(nullif(trim(p.display_name), ''), coalesce(p.username, 'Okänd användare')),
    coalesce(p.program, ''),
    coalesce(p.level, ''),
    p.avatar_url,
    sum(s.duration),
    count(*)
  from public.pomodoro_sessions s
  join public.profiles p on p.id = s.user_id
  where s.start_time >= date_trunc('week', now())
  group by s.user_id, p.username, p.display_name, p.program, p.level, p.avatar_url
  order by sum(s.duration) desc
  limit least(coalesce(p_limit, 15), 100);
$$;

-- ── get_friends_leaderboard ─────────────────────────────────
create or replace function public.get_friends_leaderboard(
  p_user_id uuid,
  p_limit   int  default 50
) returns table (
  user_id          uuid,
  rank             bigint,
  username         text,
  display_name     text,
  program          text,
  level            text,
  avatar_url       text,
  total_study_time bigint,
  total_sessions   bigint,
  current_streak   integer
)
language sql
security definer
set search_path = public
as $$
  with friend_ids as (
    select f.friend_id as uid from public.friends f
    where f.user_id = p_user_id and f.status = 'accepted'
    union
    select f.user_id as uid from public.friends f
    where f.friend_id = p_user_id and f.status = 'accepted'
    union
    select p_user_id
  )
  select
    up.user_id,
    row_number() over (order by coalesce(up.total_study_time, 0) desc),
    coalesce(p.username, 'unknown'),
    coalesce(nullif(trim(p.display_name), ''), coalesce(p.username, 'Okänd användare')),
    coalesce(p.program, ''),
    coalesce(p.level, ''),
    p.avatar_url,
    coalesce(up.total_study_time, 0),
    coalesce(up.total_sessions, 0),
    coalesce(up.current_streak, 0)
  from friend_ids fi
  join public.user_progress up on up.user_id = fi.uid
  join public.profiles p on p.id = fi.uid
  where coalesce(up.total_study_time, 0) > 0
  order by coalesce(up.total_study_time, 0) desc
  limit least(coalesce(p_limit, 50), 200);
$$;

-- ============================================================
-- 8. SEED: Achievements
-- (kravtyper matchar appen: study_time, sessions, courses, notes,
-- streak, friends — meddelande-typen 'notes' utvärderas av RPC:n)
-- ============================================================
insert into public.achievements
  (achievement_key, title, description, icon, category, requirement_type, requirement_target, requirement_timeframe, reward_points, xp_reward, rarity)
select v.key, v.title, v.descr, v.icon, v.cat, v.rtype, v.target, 'total', v.reward, v.reward, v.rarity
from (values
  ('first_session',  'Första steget',   'Slutför din första studiepass',            '🎯', 'study',    'sessions',   1,    25,  'common'),
  ('sessions_10',    'Framgångsvana',   'Slutför 10 studiepass',                     '📚', 'study',    'sessions',   10,   50,  'common'),
  ('sessions_50',    'Maratonpluggare', 'Slutför 50 studiepass',                     '🏅', 'study',    'sessions',   50,   150, 'rare'),
  ('sessions_100',   'Studielegend',    'Slutför 100 studiepass',                    '👑', 'milestone','sessions',   100,  300, 'epic'),
  ('minutes_60',     'Timmis',          'Studera i totalt 60 minuter',               '⏱️', 'study',    'study_time', 60,   30,  'common'),
  ('minutes_600',    'Timansamlare',    'Studera i totalt 600 minuter',              '⌛', 'study',    'study_time', 600,  100, 'rare'),
  ('minutes_3000',   'Fokusmästare',    'Studera i totalt 3000 minuter',             '🏆', 'milestone','study_time', 3000, 400, 'epic'),
  ('streak_3',       'Får på tre dagar','Studera 3 dagar i rad',                     '🔥', 'streak',   'streak',     3,    50,  'common'),
  ('streak_7',       'Veckans vinnare', 'Studera 7 dagar i rad',                     '⚡', 'streak',   'streak',     7,    120, 'rare'),
  ('streak_30',      'Obesegrade rutin','Studera 30 dagar i rad',                    '💎', 'streak',   'streak',     30,   500, 'epic'),
  ('friends_1',      'Första vännen',   'Lägg till din första vän',                  '🤝', 'social',   'friends',    1,    25,  'common'),
  ('friends_5',      'Socialt fjäder',  'Ha 5 vänner i StudieStugan',                '👥', 'social',   'friends',    5,    75,  'rare'),
  ('courses_3',      'Kursutforskare',  'Studera i 3 olika kurser',                  '📘', 'milestone','courses',    3,    75,  'common'),
  ('notes_10',       'Antecknarmästare','Skriv 10 anteckningar',                     '📝', 'study',    'notes',      10,   50,  'common')
) as v(key, title, descr, icon, cat, rtype, target, reward, rarity)
where not exists (
  select 1 from public.achievements a where a.achievement_key = v.key
);

-- Fyll xp_reward för äldre rader som saknar det
update public.achievements
set xp_reward = reward_points
where xp_reward is null and reward_points is not null;

-- Se till att dagens challenges finns direkt efter migrering
select public.ensure_daily_challenges(current_date);

-- ============================================================
-- 9. BACKFILL: korrigera user_progress-totaler från pomodoro_sessions
-- Idempotent — räkna om minuter/sessioner från sanningen, behåll streak.
-- ============================================================
insert into public.user_progress
  (user_id, total_study_time, total_sessions, current_streak, longest_streak, last_study_date)
select
  s.user_id,
  sum(s.duration),
  count(*),
  0,
  0,
  max(s.end_time)
from public.pomodoro_sessions s
group by s.user_id
on conflict (user_id) do update set
  total_study_time = excluded.total_study_time,
  total_sessions   = excluded.total_sessions,
  updated_at       = now();

-- ============================================================
-- 10. ROW LEVEL SECURITY
-- ============================================================

-- ── pomodoro_sessions: ägaren äger allt ─────────────────────
alter table public.pomodoro_sessions enable row level security;
drop policy if exists "Users manage own pomodoro sessions" on public.pomodoro_sessions;
create policy "Users manage own pomodoro sessions"
  on public.pomodoro_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── user_progress: ägaren äger allt, inloggade får läsa (leaderboard) ──
alter table public.user_progress enable row level security;
drop policy if exists "Users manage own progress" on public.user_progress;
create policy "Users manage own progress"
  on public.user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
drop policy if exists "Authenticated read progress" on public.user_progress;
create policy "Authenticated read progress"
  on public.user_progress for select to authenticated
  using (true);

-- ── active_timer_sessions: ägaren äger allt ─────────────────
alter table public.active_timer_sessions enable row level security;
drop policy if exists "Users manage own timer sessions" on public.active_timer_sessions;
create policy "Users manage own timer sessions"
  on public.active_timer_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── achievements: publik läsning ────────────────────────────
alter table public.achievements enable row level security;
drop policy if exists "Public read achievements" on public.achievements;
create policy "Public read achievements"
  on public.achievements for select using (true);
drop policy if exists "Authenticated insert achievements" on public.achievements;
create policy "Authenticated insert achievements"
  on public.achievements for insert to authenticated with check (true);

-- ── user_achievements: ägaren äger allt ─────────────────────
alter table public.user_achievements enable row level security;
drop policy if exists "Users manage own achievements" on public.user_achievements;
create policy "Users manage own achievements"
  on public.user_achievements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── user_levels: ägaren äger allt, inloggade får läsa (topp-100) ──
alter table public.user_levels enable row level security;
drop policy if exists "Users manage own level" on public.user_levels;
create policy "Users manage own level"
  on public.user_levels for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
drop policy if exists "Authenticated read levels" on public.user_levels;
create policy "Authenticated read levels"
  on public.user_levels for select to authenticated
  using (true);

-- ── Ren användardata: ägaren äger allt ──────────────────────
alter table public.point_transactions enable row level security;
drop policy if exists "Users manage own transactions" on public.point_transactions;
create policy "Users manage own transactions"
  on public.point_transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.user_points enable row level security;
drop policy if exists "Users manage own points" on public.user_points;
create policy "Users manage own points"
  on public.user_points for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.user_level_history enable row level security;
drop policy if exists "Users manage own level history" on public.user_level_history;
create policy "Users manage own level history"
  on public.user_level_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.user_daily_challenges enable row level security;
drop policy if exists "Users manage own daily challenges" on public.user_daily_challenges;
create policy "Users manage own daily challenges"
  on public.user_daily_challenges for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── daily_challenges: publik läsning ────────────────────────
alter table public.daily_challenges enable row level security;
drop policy if exists "Public read daily challenges" on public.daily_challenges;
create policy "Public read daily challenges"
  on public.daily_challenges for select using (true);

-- ============================================================
-- 11. GRANTS
-- ============================================================
grant execute on function public.ensure_daily_challenges(date)       to authenticated;
grant execute on function public.check_user_achievements(uuid)      to authenticated;
grant execute on function public.get_global_leaderboard(uuid, int)  to authenticated;
grant execute on function public.get_weekly_leaderboard(uuid, int)  to authenticated;
grant execute on function public.get_friends_leaderboard(uuid, int) to authenticated;

revoke execute on function public.check_user_achievements(uuid)      from anon;
revoke execute on function public.get_global_leaderboard(uuid, int)  from anon;
revoke execute on function public.get_weekly_leaderboard(uuid, int)  from anon;
revoke execute on function public.get_friends_leaderboard(uuid, int) from anon;

-- ============================================================
-- MIGRATION NOTES
-- ============================================================
-- 1. Kör hela filen i Supabase SQL Editor (idempotent, kan köras om).
-- 2. Tidräkning: pomodoro_sessions-insert → triggern uppdaterar
--    user_progress (minuter, sessioner, streak). Klienten rör inte
--    user_progress längre.
-- 3. Challenges: appen anropar ensure_daily_challenges(datum) innan
--    den läser daily_challenges, och upsertar user_daily_challenges.
-- 4. Achievements: appen anropar check_user_achievements(user_id);
--    RPC:n räknar verklig statistik, låser upp och delar ut XP.
-- 5. Leaderboard: appen anropar de tre RPC:erna (global, weekly,
--    friends) med p_user_id + p_limit.
-- ============================================================

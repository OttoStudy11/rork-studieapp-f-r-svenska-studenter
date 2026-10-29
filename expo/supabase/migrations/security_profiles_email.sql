-- ═══════════════════════════════════════════════════════════════════════════
-- SÄKERHETSFIX: profiles.email är publik i dag (bekräftat via anon-REST
-- 2026-10-29 — e-postadresser kan hämtas utan inloggning).
--
-- Kör manuellt i Supabase SQL Editor (samma som hp_user_stats_v3.sql).
-- Idempotent — säkert att köra flera gånger.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) RLS på (om den av någon anledning är av)
alter table public.profiles enable row level security;

-- 2) Dra tillbaka tabell-wejd SELECT från anon/authenticated och ge tillbaka
--    ALLT UTOM email. Namn/avatar/username är offentliga i appen (sociala
--    funktioner) men e-post ska aldrig vara publik.
do $$
declare cols text;
begin
  select string_agg('"' || column_name || '"', ', ' order by ordinal_position)
    into cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name   = 'profiles'
    and column_name <> 'email';

  execute 'revoke select on public.profiles from anon, authenticated';
  execute format('grant select (%s) on public.profiles to anon, authenticated', cols);
end $$;

-- 3) Läs-policy: profiler får läsas (men nu utan e-postkolumnen)
drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles"
  on public.profiles for select
  using (true);

-- 4) Skrivskydd: enbart ägaren får uppdatera sin egen profil
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Verifiering efter körning (ska ge FEL "column not found" eller tomt fält):
--   curl "https://ekeebrhdpjtbooaiggbw.supabase.co/rest/v1/profiles?select=email&limit=1" \
--     -H "apikey: <ANON_KEY>"
-- ═══════════════════════════════════════════════════════════════════════════

-- ============================================================
-- HP USER STATS V3 — App-compatible user stats schema
-- ============================================================
-- Fixes the mismatch in hp_schema_v2.sql: the app's questions live in
-- hp_question_bank (ids like 'sb-<uuid>' or local string ids), NOT in
-- hp_questions. The v2 tables hp_user_attempt_answers and
-- hp_user_question_progress FK question_id -> hp_questions(id), so the
-- app could never write to them (and never did — both tables are empty).
--
-- V3 rebuilds those two tables with question_id as plain text (app bank
-- ids) and adds hp_user_stats (server-side mirror of the app's local
-- AsyncStorage stats).
--
-- ⚠️ Run in Supabase SQL Editor. The two rebuilt tables are dropped —
-- they must be empty (they are, the app never wrote to them) or data
-- is lost. Run once.
-- ============================================================

-- ============================================================
-- 1. hp_user_attempt_answers — one row per answered question
--    (rebuilt: question_id text, selected_answer text, section_code)
-- ============================================================
drop table if exists public.hp_user_attempt_answers cascade;

create table public.hp_user_attempt_answers (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      text not null,             -- app attempt id (e.g. 'local_full_...')
  user_id         uuid not null references auth.users(id) on delete cascade,
  question_id     text not null,             -- hp_question_bank / bundled bank id
  section_code    text,                      -- ORD, LÄS, ..., XYZ, KVA, NOG, DTK
  selected_answer text,                      -- the option text the user picked
  is_correct      boolean not null default false,
  time_seconds    int,
  answered_at     timestamptz not null default now()
);

create index if not exists idx_hp_uaa_user on public.hp_user_attempt_answers(user_id);
create index if not exists idx_hp_uaa_attempt on public.hp_user_attempt_answers(attempt_id);
create index if not exists idx_hp_uaa_question on public.hp_user_attempt_answers(question_id);

alter table public.hp_user_attempt_answers enable row level security;

drop policy if exists "Users manage own attempt answers" on public.hp_user_attempt_answers;
create policy "Users manage own attempt answers"
  on public.hp_user_attempt_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 2. hp_user_question_progress — aggregated per-question stats
--    (rebuilt: question_id text)
-- ============================================================
drop table if exists public.hp_user_question_progress cascade;

create table public.hp_user_question_progress (
  user_id          uuid not null references auth.users(id) on delete cascade,
  question_id      text not null,
  section_code     text,
  correct_count    int not null default 0,
  incorrect_count  int not null default 0,
  total_attempts   int not null default 0,
  last_correct     boolean,
  avg_time_seconds int,
  last_seen_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists idx_hp_uqp_user on public.hp_user_question_progress(user_id);
create index if not exists idx_hp_uqp_section on public.hp_user_question_progress(user_id, section_code);

alter table public.hp_user_question_progress enable row level security;

drop policy if exists "Users manage own question progress" on public.hp_user_question_progress;
create policy "Users manage own question progress"
  on public.hp_user_question_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 3. hp_user_stats — aggregate stats mirror (AsyncStorage backup)
-- ============================================================
create table if not exists public.hp_user_stats (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  total_attempts          int not null default 0,
  total_study_time        int not null default 0,      -- minutes
  average_score           numeric(5,2) not null default 0,  -- percent 0-100
  best_score              numeric(5,2) not null default 0,  -- percent 0-100
  estimated_hp_score      numeric(3,2) not null default 0,  -- 0.0-2.0
  section_stats           jsonb not null default '{}'::jsonb,
  unlocked_milestones     jsonb not null default '[]'::jsonb,
  updated_at              timestamptz not null default now()
);

alter table public.hp_user_stats enable row level security;

drop policy if exists "Users manage own stats" on public.hp_user_stats;
create policy "Users manage own stats"
  on public.hp_user_stats for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 4. hp_user_exam_attempts — unchanged from v2, listed for reference.
--    The app inserts one row per completed attempt:
--      (user_id, attempt_type, status, total_questions, correct_answers,
--       raw_score, time_spent_seconds, completed_at)
--    which fits the existing columns — no change needed.
-- ============================================================

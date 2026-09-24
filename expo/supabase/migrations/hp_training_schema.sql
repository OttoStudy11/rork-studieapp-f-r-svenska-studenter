-- ============================================================
-- HP TRAINING SCHEMA — Personalized daily training
-- Per-question performance stats + training session history.
-- Run this in Supabase SQL Editor. Safe to re-run.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. hp_question_stats — one row per user × question
-- ============================================================
create table if not exists public.hp_question_stats (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  question_id         text not null,
  section_code        text not null,
  times_seen          int not null default 0,
  times_correct       int not null default 0,
  times_wrong         int not null default 0,
  avg_time_seconds    real not null default 0,
  consecutive_correct int not null default 0,
  last_seen_at        timestamptz,
  next_review_at      timestamptz,
  updated_at          timestamptz not null default now(),
  unique (user_id, question_id)
);

-- ============================================================
-- 2. hp_training_sessions — completed daily training passes
-- ============================================================
create table if not exists public.hp_training_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now(),
  completed_at     timestamptz not null default now(),
  status           text not null default 'completed'
                     check (status in ('completed','abandoned')),
  plan             jsonb,
  result           jsonb,
  question_ids     jsonb not null default '[]'::jsonb,
  total_questions  int not null default 0,
  correct_count    int not null default 0,
  accuracy         real not null default 0,
  duration_seconds int not null default 0
);

create index if not exists hp_question_stats_user_idx
  on public.hp_question_stats(user_id);
create index if not exists hp_question_stats_next_review_idx
  on public.hp_question_stats(user_id, next_review_at);
create index if not exists hp_training_sessions_user_idx
  on public.hp_training_sessions(user_id, completed_at desc);

-- ============================================================
-- 3. Row Level Security — users only touch their own rows
-- ============================================================
alter table public.hp_question_stats enable row level security;
alter table public.hp_training_sessions enable row level security;

drop policy if exists "Users manage own question stats" on public.hp_question_stats;
create policy "Users manage own question stats" on public.hp_question_stats
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own training sessions" on public.hp_training_sessions;
create policy "Users manage own training sessions" on public.hp_training_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

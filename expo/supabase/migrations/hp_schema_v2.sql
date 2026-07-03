-- ============================================================
-- HP SCHEMA V2 — Complete SQL migration for Högskoleprovet
-- Handles all 8 subtests: ORD, LÄS, MEK, ELF, XYZ, KVA, NOG, DTK
-- ============================================================
-- Run this in Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT).
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. hp_exam_sets — One exam occasion (e.g. "HP Vår 2024")
-- ============================================================
create table if not exists public.hp_exam_sets (
  id               uuid primary key default gen_random_uuid(),
  year             int  not null,
  season           text not null check (season in ('vår','höst')),
  title            text not null,
  source           text not null default 'official'
                     check (source in ('official','generated')),
  is_published     boolean not null default false,
  duration_minutes int  not null default 240,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (year, season)
);

-- ============================================================
-- 2. hp_sections — 8 subtests per exam set
-- ============================================================
create table if not exists public.hp_sections (
  id                 uuid primary key default gen_random_uuid(),
  exam_set_id        uuid not null references public.hp_exam_sets(id) on delete cascade,
  type               text not null check (type in ('ORD','LÄS','MEK','ELF','XYZ','KVA','NOG','DTK')),
  part               text not null check (part in ('verbal','kvantitativ')),
  order_index        int  not null,
  time_limit_minutes int,
  question_count     int  not null default 0,
  created_at         timestamptz not null default now(),
  unique (exam_set_id, type)
);

-- ============================================================
-- 3. hp_questions — Individual questions (works for ALL subtests)
-- ============================================================
create table if not exists public.hp_questions (
  id               uuid primary key default gen_random_uuid(),
  section_id       uuid not null references public.hp_sections(id) on delete cascade,
  question_number  int  not null,
  question_text    text not null,
  question_type    text not null default 'multiple_choice'
                     check (question_type in (
                       'multiple_choice',
                       'reading_comprehension',
                       'comparison',
                       'diagram',
                       'nog'
                     )),
  reading_passage  text,          -- for LÄS / ELF
  image_url        text,          -- for DTK diagrams, NOG figures
  needs_image      boolean not null default false,  -- flag: image missing
  difficulty       text check (difficulty in ('easy','medium','hard')),
  topic            text,          -- e.g. 'synonymer', 'geometri', 'procent'
  correct_answer   char(1) not null,  -- letter A-E referencing hp_answer_options
  explanation      text,
  created_at       timestamptz not null default now(),
  unique (section_id, question_number)
);

-- ============================================================
-- 4. hp_answer_options — Normalized answer choices
-- ============================================================
create table if not exists public.hp_answer_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.hp_questions(id) on delete cascade,
  letter      char(1) not null check (letter in ('A','B','C','D','E')),
  text        text not null,
  is_correct  boolean not null default false,
  unique (question_id, letter)
);

-- ============================================================
-- 5. hp_words — Vocabulary bank for ORD training
-- ============================================================
create table if not exists public.hp_words (
  id          uuid primary key default gen_random_uuid(),
  word        text not null unique,
  definition  text not null,
  synonyms    text[] not null default '{}',
  antonyms    text[] not null default '{}',
  example     text,
  etymology   text,
  memory_tip  text,
  category    text,              -- e.g. 'svenska', 'lånord', 'fackspråk'
  difficulty  text check (difficulty in ('easy','medium','hard')),
  frequency   int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 6. hp_word_exam_refs — Link words to exam sets
-- ============================================================
create table if not exists public.hp_word_exam_refs (
  word_id     uuid not null references public.hp_words(id) on delete cascade,
  exam_set_id uuid not null references public.hp_exam_sets(id) on delete cascade,
  primary key (word_id, exam_set_id)
);

-- ============================================================
-- 7. hp_norming_tables — Raw → normed score conversion (0.0–2.0)
-- ============================================================
create table if not exists public.hp_norming_tables (
  id          uuid primary key default gen_random_uuid(),
  exam_set_id uuid references public.hp_exam_sets(id) on delete cascade,
  raw_score   int  not null,
  normed_score numeric(3,1) not null,
  part        text check (part in ('verbal','kvantitativ','total')),
  unique (exam_set_id, raw_score, part)
);

-- ============================================================
-- 8. hp_user_exam_attempts — A full-test or section-practice attempt
-- ============================================================
create table if not exists public.hp_user_exam_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  exam_set_id      uuid references public.hp_exam_sets(id),
  section_id       uuid references public.hp_sections(id),
  attempt_type     text not null check (attempt_type in ('full_test','section_practice')),
  status           text not null default 'in_progress'
                     check (status in ('in_progress','completed','abandoned')),
  total_questions  int  not null default 0,
  correct_answers  int  not null default 0,
  raw_score        int,
  normed_score     numeric(3,1),
  time_spent_seconds int not null default 0,
  section_scores   jsonb not null default '{}'::jsonb,
  started_at       timestamptz not null default now(),
  completed_at     timestamptz,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 9. hp_user_attempt_answers — Individual answers within an attempt
-- ============================================================
create table if not exists public.hp_user_attempt_answers (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid not null references public.hp_user_exam_attempts(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  question_id     uuid not null references public.hp_questions(id) on delete cascade,
  selected_letter char(1),          -- null = unanswered / skipped
  is_correct      boolean not null default false,
  time_seconds    int,
  answered_at     timestamptz not null default now()
);

-- ============================================================
-- 10. hp_user_question_progress — Aggregated per-question stats
-- ============================================================
create table if not exists public.hp_user_question_progress (
  user_id          uuid not null references auth.users(id) on delete cascade,
  question_id      uuid not null references public.hp_questions(id) on delete cascade,
  correct_count    int  not null default 0,
  incorrect_count  int  not null default 0,
  total_attempts   int  not null default 0,
  last_correct     boolean,
  avg_time_seconds int,
  last_seen_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- ============================================================
-- 11. hp_user_word_progress — SRS / spaced repetition for vocabulary
-- ============================================================
create table if not exists public.hp_user_word_progress (
  user_id           uuid not null references auth.users(id) on delete cascade,
  word_id           uuid not null references public.hp_words(id) on delete cascade,
  mastery           int  not null default 0 check (mastery between 0 and 5),
  ease_factor       numeric(3,2) not null default 2.50,
  interval_days     int  not null default 0,
  repetitions       int  not null default 0,
  next_review_at    timestamptz not null default now(),
  streak            int  not null default 0,
  last_reviewed_at  timestamptz,
  updated_at        timestamptz not null default now(),
  primary key (user_id, word_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_hp_sections_exam_set
  on public.hp_sections(exam_set_id);

create index if not exists idx_hp_questions_section
  on public.hp_questions(section_id);

create index if not exists idx_hp_questions_type
  on public.hp_questions(question_type);

create index if not exists idx_hp_answer_options_question
  on public.hp_answer_options(question_id);

create index if not exists idx_hp_words_word
  on public.hp_words(word);

create index if not exists idx_hp_norming_exam
  on public.hp_norming_tables(exam_set_id, raw_score, part);

create index if not exists idx_hp_user_attempts_user
  on public.hp_user_exam_attempts(user_id);

create index if not exists idx_hp_user_attempts_status
  on public.hp_user_exam_attempts(user_id, status);

create index if not exists idx_hp_user_attempts_exam
  on public.hp_user_exam_attempts(user_id, exam_set_id);

create index if not exists idx_hp_user_attempt_answers_attempt
  on public.hp_user_attempt_answers(attempt_id);

create index if not exists idx_hp_user_attempt_answers_user
  on public.hp_user_attempt_answers(user_id);

create index if not exists idx_hp_user_attempt_answers_question
  on public.hp_user_attempt_answers(question_id);

create index if not exists idx_hp_user_qprogress_user
  on public.hp_user_question_progress(user_id);

create index if not exists idx_hp_user_qprogress_last_correct
  on public.hp_user_question_progress(user_id, last_correct);

create index if not exists idx_hp_user_wprogress_user
  on public.hp_user_word_progress(user_id);

create index if not exists idx_hp_user_wprogress_next_review
  on public.hp_user_word_progress(user_id, next_review_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Content tables: public read on published content
alter table public.hp_exam_sets   enable row level security;
alter table public.hp_sections    enable row level security;
alter table public.hp_questions   enable row level security;
alter table public.hp_answer_options enable row level security;
alter table public.hp_words       enable row level security;
alter table public.hp_word_exam_refs enable row level security;
alter table public.hp_norming_tables enable row level security;

-- User data tables: user owns their own data
alter table public.hp_user_exam_attempts    enable row level security;
alter table public.hp_user_attempt_answers  enable row level security;
alter table public.hp_user_question_progress enable row level security;
alter table public.hp_user_word_progress    enable row level security;

-- ── Content policies ──────────────────────────────────────────

create policy "Public read published exam sets"
  on public.hp_exam_sets for select
  using (is_published = true);

create policy "Public read sections of published exams"
  on public.hp_sections for select
  using (
    exists (
      select 1 from public.hp_exam_sets e
      where e.id = exam_set_id and e.is_published = true
    )
  );

create policy "Public read questions of published exams"
  on public.hp_questions for select
  using (
    exists (
      select 1 from public.hp_sections s
      join public.hp_exam_sets e on e.id = s.exam_set_id
      where s.id = section_id and e.is_published = true
    )
  );

create policy "Public read answer options"
  on public.hp_answer_options for select
  using (
    exists (
      select 1 from public.hp_questions q
      join public.hp_sections s on s.id = q.section_id
      join public.hp_exam_sets e on e.id = s.exam_set_id
      where q.id = question_id and e.is_published = true
    )
  );

create policy "Public read words"
  on public.hp_word_exam_refs for select using (true);

create policy "Public read word refs"
  on public.hp_words for select using (true);

create policy "Public read norming tables"
  on public.hp_norming_tables for select using (true);

-- ── User data policies ────────────────────────────────────────

create policy "Users manage own exam attempts"
  on public.hp_user_exam_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own attempt answers"
  on public.hp_user_attempt_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own question progress"
  on public.hp_user_question_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own word progress"
  on public.hp_user_word_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- ── hp_create_exam_with_sections ──────────────────────────────
-- Creates an exam set + all 8 sections with correct time limits
-- in a single call. Returns the exam_set UUID.
-- ──────────────────────────────────────────────────────────────
create or replace function public.hp_create_exam_with_sections(
  p_year   int,
  p_season text,
  p_title  text
) returns uuid as $$
declare
  v_exam_id uuid;
begin
  insert into public.hp_exam_sets (year, season, title)
  values (p_year, p_season, p_title)
  returning id into v_exam_id;

  insert into public.hp_sections (exam_set_id, type, part, order_index, time_limit_minutes, question_count)
  values
    (v_exam_id, 'ORD', 'verbal',       1, 20, 20),
    (v_exam_id, 'LÄS', 'verbal',       2, 55, 20),
    (v_exam_id, 'MEK', 'verbal',       3, 15, 20),
    (v_exam_id, 'ELF', 'verbal',       4, 30, 20),
    (v_exam_id, 'XYZ', 'kvantitativ',  5, 55, 20),
    (v_exam_id, 'KVA', 'kvantitativ',  6, 20, 20),
    (v_exam_id, 'NOG', 'kvantitativ',  7, 20, 20),
    (v_exam_id, 'DTK', 'kvantitativ',  8, 45, 20);

  return v_exam_id;
end;
$$ language plpgsql security definer;

-- ── hp_record_answer ──────────────────────────────────────────
-- Records a single answer within an attempt, updates aggregated
-- question progress, and returns whether the answer was correct.
-- ──────────────────────────────────────────────────────────────
create or replace function public.hp_record_answer(
  p_attempt_id     uuid,
  p_question_id    uuid,
  p_selected_letter char(1) default null,
  p_time_seconds   int    default null
) returns boolean as $$
declare
  v_user_id     uuid;
  v_is_correct  boolean := false;
  v_correct_letter char(1);
begin
  -- Get the attempt's user
  select user_id into v_user_id
    from public.hp_user_exam_attempts
    where id = p_attempt_id;

  if v_user_id is null then
    raise exception 'Attempt % not found', p_attempt_id;
  end if;

  -- Get the correct letter for this question
  select correct_answer into v_correct_letter
    from public.hp_questions
    where id = p_question_id;

  -- Determine correctness
  v_is_correct := (p_selected_letter is not null and p_selected_letter = v_correct_letter);

  -- Insert the answer record
  insert into public.hp_user_attempt_answers
    (attempt_id, user_id, question_id, selected_letter, is_correct, time_seconds)
  values
    (p_attempt_id, v_user_id, p_question_id, p_selected_letter, v_is_correct, p_time_seconds)
  on conflict do nothing;

  -- Update aggregated per-question progress via upsert
  insert into public.hp_user_question_progress
    (user_id, question_id, correct_count, incorrect_count, total_attempts,
     last_correct, avg_time_seconds, last_seen_at, updated_at)
  values
    (v_user_id, p_question_id,
     case when v_is_correct then 1 else 0 end,
     case when v_is_correct then 0 else 1 end,
     1,
     v_is_correct,
     p_time_seconds,
     now(),
     now())
  on conflict (user_id, question_id) do update
    set correct_count    = hp_user_question_progress.correct_count + case when v_is_correct then 1 else 0 end,
        incorrect_count  = hp_user_question_progress.incorrect_count + case when v_is_correct then 0 else 1 end,
        total_attempts   = hp_user_question_progress.total_attempts + 1,
        last_correct     = v_is_correct,
        avg_time_seconds = case
          when p_time_seconds is not null
          then coalesce(
            (hp_user_question_progress.avg_time_seconds * (hp_user_question_progress.total_attempts) + p_time_seconds)
            / (hp_user_question_progress.total_attempts + 1),
            p_time_seconds
          )
          else hp_user_question_progress.avg_time_seconds
        end,
        last_seen_at     = now(),
        updated_at       = now();

  return v_is_correct;
end;
$$ language plpgsql security definer;

-- ── hp_finalize_attempt ───────────────────────────────────────
-- Finalizes an attempt: counts correct answers, looks up normed
-- score from the norming table if available, sets status.
-- Returns a JSON summary.
-- ──────────────────────────────────────────────────────────────
create or replace function public.hp_finalize_attempt(
  p_attempt_id uuid
) returns jsonb as $$
declare
  v_user_id       uuid;
  v_exam_set_id   uuid;
  v_total         int;
  v_correct       int;
  v_raw           int;
  v_normed        numeric(3,1);
  v_time_spent    int;
  v_section_scores jsonb := '{}'::jsonb;
  v_result        jsonb;
begin
  select user_id, exam_set_id into v_user_id, v_exam_set_id
    from public.hp_user_exam_attempts
    where id = p_attempt_id;

  if v_user_id is null then
    raise exception 'Attempt % not found', p_attempt_id;
  end if;

  -- Count correct answers
  select count(*), count(*) filter (where is_correct)
    into v_total, v_correct
    from public.hp_user_attempt_answers
    where attempt_id = p_attempt_id;

  v_raw := v_correct;

  -- Compute total time spent
  select coalesce(sum(time_seconds), 0) into v_time_spent
    from public.hp_user_attempt_answers
    where attempt_id = p_attempt_id;

  -- Look up normed score if exam set has a norming table
  if v_exam_set_id is not null then
    select normed_score into v_normed
      from public.hp_norming_tables
      where exam_set_id = v_exam_set_id
        and raw_score = v_raw
        and (part = 'total' or part is null)
      order by part nulls last
      limit 1;
  end if;

  -- Build per-section breakdown
  select jsonb_object_agg(
    s.type,
    jsonb_build_object(
      'correct', count(*) filter (where a.is_correct),
      'total', count(*)
    )
  )
  into v_section_scores
  from public.hp_user_attempt_answers a
  join public.hp_questions q on q.id = a.question_id
  join public.hp_sections s on s.id = q.section_id
  where a.attempt_id = p_attempt_id
  group by s.type;

  -- Update the attempt record
  update public.hp_user_exam_attempts
    set status           = 'completed',
        total_questions  = v_total,
        correct_answers  = v_correct,
        raw_score        = v_raw,
        normed_score     = coalesce(v_normed, null),
        time_spent_seconds = v_time_spent,
        section_scores   = v_section_scores,
        completed_at     = now()
    where id = p_attempt_id;

  v_result := jsonb_build_object(
    'attempt_id',    p_attempt_id,
    'total',         v_total,
    'correct',       v_correct,
    'raw_score',     v_raw,
    'normed_score',  v_normed,
    'time_spent',    v_time_spent,
    'section_scores', v_section_scores
  );

  return v_result;
end;
$$ language plpgsql security definer;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Create initial exam sets (unpublished by default)
-- Uncomment to seed:
-- select public.hp_create_exam_with_sections(2024, 'vår', 'Högskoleprov Vårterminen 2024');
-- select public.hp_create_exam_with_sections(2024, 'höst', 'Högskoleprov Höstterminen 2024');
-- select public.hp_create_exam_with_sections(2023, 'vår', 'Högskoleprov Vårterminen 2023');
-- select public.hp_create_exam_with_sections(2023, 'höst', 'Högskoleprov Höstterminen 2023');

-- ============================================================
-- STORAGE BUCKET (run separately in Supabase dashboard)
-- ============================================================
-- insert into storage.buckets (id, name, public)
-- values ('hp-question-images', 'hp-question-images', true)
-- on conflict do nothing;
--
-- create policy "Public read hp images"
--   on storage.objects for select
--   using (bucket_id = 'hp-question-images');
--
-- create policy "Service role upload hp images"
--   on storage.objects for insert
--   with check (bucket_id = 'hp-question-images' and auth.role() = 'service_role');
--
-- Folder structure: /{year}/{season}/{section_type}/{question_number}.webp
-- Example:          /2024/vår/DTK/3.webp

-- ============================================================
-- HELPER VIEW: Section question counts
-- ============================================================
create or replace view public.hp_section_question_counts as
select
  s.type           as section_type,
  s.part           as part,
  count(q.id)      as total_questions,
  count(q.id) filter (where q.image_url is not null) as questions_with_images,
  count(q.id) filter (where q.needs_image)          as questions_needing_images,
  count(q.id) filter (where q.difficulty = 'easy')  as easy_count,
  count(q.id) filter (where q.difficulty = 'medium') as medium_count,
  count(q.id) filter (where q.difficulty = 'hard')  as hard_count
from public.hp_sections s
left join public.hp_questions q on q.section_id = s.id
group by s.type, s.part
order by s.part, s.type;

-- ============================================================
-- MIGRATION NOTES
-- ============================================================
-- The following OLD tables can be dropped after migrating data:
--   hp_test_versions  (replaced by hp_exam_sets)
--   hp_tests          (replaced by hp_exam_sets)
--   hp_sections (old) (replaced by hp_sections v2 — note: old table
--                      used section_code as standalone, new links to exam_set)
--   hp_questions (old)(replaced by hp_questions v2 with normalized options)
--   user_hp_test_attempts (replaced by hp_user_exam_attempts)
--   user_hp_question_answers (replaced by hp_user_attempt_answers + progress)
--
-- Migration script (run manually after verifying v2 works):
--
--   -- 1. Migrate exam sets
--   insert into hp_exam_sets (year, season, title, is_published, duration_minutes)
--   select test_year,
--          case when test_season = 'spring' then 'vår' else 'höst' end,
--          'HP ' || test_season || ' ' || test_year,
--          is_published,
--          240
--   from hp_tests on conflict (year, season) do nothing;
--
--   -- 2. Then migrate sections and questions manually, mapping
--      old section_code → new hp_sections rows per exam_set.
--
--   -- 3. Drop old tables when done:
--   drop table if exists public.user_hp_question_answers cascade;
--   drop table if exists public.user_hp_test_attempts cascade;
--   drop table if exists public.hp_questions cascade;       -- OLD table
--   drop table if exists public.hp_sections cascade;        -- OLD table
--   drop table if exists public.hp_tests cascade;
--   drop table if exists public.hp_test_versions cascade;
-- ============================================================

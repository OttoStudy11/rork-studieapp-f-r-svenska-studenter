-- ============================================================================
-- App Rating & Review System — analytics table
-- Tracks every prompt shown, dismiss, rating selected, and review submitted
-- so conversion can be optimized over time.
-- ============================================================================

create table if not exists public.rating_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  event_type text not null check (
    event_type in ('prompt_shown', 'prompt_dismissed', 'rating_selected', 'review_submitted', 'feedback_submitted')
  ),
  trigger_source text not null,
  rating integer check (rating is null or (rating >= 1 and rating <= 5)),
  feedback_kind text check (feedback_kind is null or feedback_kind in ('bug', 'feature', 'general')),
  feedback_text text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.rating_events enable row level security;

drop policy if exists "Users can insert their own rating events" on public.rating_events;
create policy "Users can insert their own rating events"
  on public.rating_events for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Users can read their own rating events" on public.rating_events;
create policy "Users can read their own rating events"
  on public.rating_events for select
  using (auth.uid() = user_id);

-- Indexes for analytics queries
create index if not exists rating_events_user_id_idx on public.rating_events (user_id);
create index if not exists rating_events_created_at_idx on public.rating_events (created_at desc);
create index if not exists rating_events_event_type_idx on public.rating_events (event_type);
create index if not exists rating_events_trigger_source_idx on public.rating_events (trigger_source);

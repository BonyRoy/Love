-- Run this in Supabase → SQL Editor

create table if not exists public.app_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.app_content enable row level security;

-- Dev-friendly policies (tighten before public launch)
create policy "Anyone can read app content"
  on public.app_content
  for select
  using (true);

create policy "Anyone can insert app content"
  on public.app_content
  for insert
  with check (true);

create policy "Anyone can update app content"
  on public.app_content
  for update
  using (true);

-- Also enable Realtime for this table:
-- Dashboard → Database → Replication → supabase_realtime → add app_content

-- Then upload all content (run supabase/seed.sql once):

-- Chat feature (run supabase/chat.sql):

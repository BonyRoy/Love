-- Chat feature — run in Supabase SQL Editor (after schema.sql)

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (sender in ('her', 'admin')),
  body text,
  image_path text,
  image_url text,
  reactions jsonb not null default '{}'::jsonb,
  reply_to uuid references public.chat_messages (id) on delete set null,
  latitude double precision,
  longitude double precision,
  location_accuracy double precision,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists chat_messages_created_at_idx
  on public.chat_messages (created_at desc);

alter table public.chat_messages enable row level security;

create policy "Anyone can read chat messages"
  on public.chat_messages for select using (true);

create policy "Anyone can send chat messages"
  on public.chat_messages for insert with check (true);

create policy "Anyone can delete chat messages"
  on public.chat_messages for delete using (true);

create policy "Anyone can update chat messages"
  on public.chat_messages for update using (true) with check (true);

-- If table already exists, run once in SQL Editor:
-- alter table public.chat_messages add column if not exists reactions jsonb not null default '{}'::jsonb;
-- alter table public.chat_messages add column if not exists reply_to uuid references public.chat_messages (id) on delete set null;
-- alter table public.chat_messages add column if not exists latitude double precision;
-- alter table public.chat_messages add column if not exists longitude double precision;
-- alter table public.chat_messages add column if not exists location_accuracy double precision;

-- Chat presence (who is currently in the chat window)
create table if not exists public.chat_presence (
  sender text primary key check (sender in ('her', 'admin')),
  in_chat boolean not null default false,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.chat_presence enable row level security;

create policy "Anyone can read chat presence"
  on public.chat_presence for select using (true);

create policy "Anyone can insert chat presence"
  on public.chat_presence for insert with check (true);

create policy "Anyone can update chat presence"
  on public.chat_presence for update using (true) with check (true);

-- If table already exists, run once in SQL Editor:
-- (see chat_presence block above)

-- Storage bucket for chat images
insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', true)
on conflict (id) do nothing;

create policy "Public read chat images"
  on storage.objects for select
  using (bucket_id = 'chat-images');

create policy "Anyone upload chat images"
  on storage.objects for insert
  with check (bucket_id = 'chat-images');

create policy "Anyone delete chat images"
  on storage.objects for delete
  using (bucket_id = 'chat-images');

-- Delete messages older than 24 hours (call from app on load)
create or replace function public.cleanup_old_chat_messages()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.chat_messages
  where created_at < now() - interval '24 hours';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant execute on function public.cleanup_old_chat_messages() to anon, authenticated;

-- Enable Realtime (run once; safe to re-run)
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.chat_presence;

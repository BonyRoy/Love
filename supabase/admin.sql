-- Admin security — run in Supabase SQL Editor (after schema.sql)

create extension if not exists pgcrypto with schema extensions;

-- pgcrypto digest() expects bytea, not text
create or replace function public.hash_token(p_token text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(extensions.digest(convert_to(p_token, 'UTF8'), 'sha256'), 'hex');
$$;

-- ── Admin credentials (never store plaintext passwords) ──
create table if not exists public.admin_settings (
  id text primary key default 'main',
  admin_id text not null,
  password_hash text not null,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.admin_settings enable row level security;

-- ── Admin sessions (opaque tokens, hashed at rest) ──
create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists admin_sessions_expires_idx
  on public.admin_sessions (expires_at);

alter table public.admin_sessions enable row level security;

-- ── Runtime config (Supabase keys — not in .env / client bundle) ──
create table if not exists public.app_runtime_config (
  id text primary key default 'main',
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.app_runtime_config enable row level security;

-- Seed admin (change password from Admin → Security after first login)
insert into public.admin_settings (id, admin_id, password_hash)
values (
  'main',
  '8369877891',
  extensions.crypt('Isha@090404', extensions.gen_salt('bf'))
)
on conflict (id) do nothing;

-- Seed runtime keys (update values to match your project)
insert into public.app_runtime_config (id, config)
values (
  'main',
  jsonb_build_object(
    'supabase_url', 'https://rfkfctipgahysdysctea.supabase.co',
    'supabase_anon_key', 'sb_publishable_59SVELm577DKAAdLLWEzvw_rjoFwEaM'
  )
)
on conflict (id) do nothing;

-- Public bootstrap bucket (read config without bundling keys)
insert into storage.buckets (id, name, public)
values ('app-bootstrap', 'app-bootstrap', true)
on conflict (id) do nothing;

drop policy if exists "Public read bootstrap config" on storage.objects;
drop policy if exists "Bootstrap upload runtime json" on storage.objects;
drop policy if exists "Bootstrap replace runtime json" on storage.objects;

create policy "Public read bootstrap config"
  on storage.objects for select
  using (bucket_id = 'app-bootstrap');

create policy "Bootstrap upload runtime json"
  on storage.objects for insert
  with check (bucket_id = 'app-bootstrap' and name = 'runtime.json');

create policy "Bootstrap replace runtime json"
  on storage.objects for update
  using (bucket_id = 'app-bootstrap' and name = 'runtime.json');

-- ── RPC: bootstrap config (no direct table read) ──
create or replace function public.get_runtime_config()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select config from public.app_runtime_config where id = 'main';
$$;

-- ── RPC: admin login ──
create or replace function public.admin_login(p_admin_id text, p_password text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_settings public.admin_settings%rowtype;
  v_token text;
  v_token_hash text;
begin
  select * into v_settings from public.admin_settings where id = 'main';
  if not found then
    return null;
  end if;

  if v_settings.admin_id <> trim(p_admin_id) then
    return null;
  end if;

  if v_settings.password_hash <> extensions.crypt(p_password, v_settings.password_hash) then
    return null;
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_token_hash := public.hash_token(v_token);

  insert into public.admin_sessions (token_hash, expires_at)
  values (v_token_hash, now() + interval '12 hours');

  delete from public.admin_sessions where expires_at < now();

  return v_token;
end;
$$;

-- ── RPC: validate session ──
create or replace function public.admin_validate_token(p_token text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_sessions
    where token_hash = public.hash_token(p_token)
      and expires_at > now()
  );
$$;

-- ── RPC: logout ──
create or replace function public.admin_logout(p_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.admin_sessions
  where token_hash = public.hash_token(p_token);
$$;

-- ── RPC: get admin id (for settings UI) ──
create or replace function public.admin_get_settings(p_token text)
returns table(admin_id text, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_validate_token(p_token) then
    return;
  end if;

  return query
  select s.admin_id, s.updated_at
  from public.admin_settings s
  where s.id = 'main';
end;
$$;

-- ── RPC: update admin credentials ──
create or replace function public.admin_update_credentials(
  p_token text,
  p_current_password text,
  p_new_admin_id text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_settings public.admin_settings%rowtype;
begin
  if not public.admin_validate_token(p_token) then
    return false;
  end if;

  select * into v_settings from public.admin_settings where id = 'main';

  if v_settings.password_hash <> extensions.crypt(p_current_password, v_settings.password_hash) then
    return false;
  end if;

  if length(trim(p_new_password)) < 8 then
    return false;
  end if;

  update public.admin_settings
  set
    admin_id = trim(p_new_admin_id),
    password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
    updated_at = now()
  where id = 'main';

  return true;
end;
$$;

-- ── RPC: save content (admin only) ──
create or replace function public.admin_save_content(p_token text, p_content jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_validate_token(p_token) then
    return false;
  end if;

  insert into public.app_content (id, content, updated_at)
  values ('main', p_content, now())
  on conflict (id) do update
  set content = excluded.content, updated_at = excluded.updated_at;

  return true;
end;
$$;

-- ── RPC: update runtime config (admin only) ──
create or replace function public.admin_update_runtime_config(
  p_token text,
  p_config jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_validate_token(p_token) then
    return false;
  end if;

  update public.app_runtime_config
  set config = p_config, updated_at = now()
  where id = 'main';

  return true;
end;
$$;

grant execute on function public.get_runtime_config() to anon, authenticated;
grant execute on function public.admin_login(text, text) to anon, authenticated;
grant execute on function public.admin_validate_token(text) to anon, authenticated;
grant execute on function public.admin_logout(text) to anon, authenticated;
grant execute on function public.admin_get_settings(text) to anon, authenticated;
grant execute on function public.admin_update_credentials(text, text, text, text) to anon, authenticated;
grant execute on function public.admin_save_content(text, jsonb) to anon, authenticated;
grant execute on function public.admin_update_runtime_config(text, jsonb) to anon, authenticated;

-- Tighten app_content writes (admin RPC only)
drop policy if exists "Anyone can insert app content" on public.app_content;
drop policy if exists "Anyone can update app content" on public.app_content;

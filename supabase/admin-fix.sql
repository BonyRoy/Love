-- Quick fix: pgcrypto lives in the extensions schema on Supabase.
-- Run this in SQL Editor if login fails with "function crypt does not exist".

create extension if not exists pgcrypto with schema extensions;

create or replace function public.hash_token(p_token text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(extensions.digest(convert_to(p_token, 'UTF8'), 'sha256'), 'hex');
$$;

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
  if not found then return null; end if;
  if v_settings.admin_id <> trim(p_admin_id) then return null; end if;
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

create or replace function public.admin_validate_token(p_token text)
returns boolean
language sql
security definer
set search_path = public, extensions
stable
as $$
  select exists (
    select 1 from public.admin_sessions
    where token_hash = public.hash_token(p_token)
      and expires_at > now()
  );
$$;

create or replace function public.admin_logout(p_token text)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  delete from public.admin_sessions
  where token_hash = public.hash_token(p_token);
$$;

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
  if not public.admin_validate_token(p_token) then return false; end if;

  select * into v_settings from public.admin_settings where id = 'main';

  if v_settings.password_hash <> extensions.crypt(p_current_password, v_settings.password_hash) then
    return false;
  end if;

  if length(trim(p_new_password)) < 8 then return false; end if;

  update public.admin_settings
  set
    admin_id = trim(p_new_admin_id),
    password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
    updated_at = now()
  where id = 'main';

  return true;
end;
$$;

-- Re-hash admin password if the seed row was never created correctly
insert into public.admin_settings (id, admin_id, password_hash)
values (
  'main',
  '8369877891',
  extensions.crypt('Isha@090404', extensions.gen_salt('bf'))
)
on conflict (id) do update
set password_hash = excluded.password_hash,
    admin_id = excluded.admin_id,
    updated_at = now();

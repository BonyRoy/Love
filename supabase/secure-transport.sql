-- Base64 secure transport gateway — run in Supabase SQL Editor (after admin-fix.sql)

create or replace function public.b64_decode_text(p text)
returns text
language sql
immutable
set search_path = public
as $$
  select convert_from(decode(p, 'base64'), 'UTF8');
$$;

create or replace function public.b64_decode_json(p text)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select public.b64_decode_text(p)::jsonb;
$$;

create or replace function public.b64_encode_text(p text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p is null then null
    else encode(convert_to(p, 'UTF8'), 'base64')
  end;
$$;

create or replace function public.b64_encode_json(p jsonb)
returns text
language sql
immutable
set search_path = public
as $$
  select public.b64_encode_text(p::text);
$$;

create or replace function public.secure_chat_select(p_query jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_select text;
  v_filter jsonb;
  v_where text := 'true';
  v_order text := '';
  v_sql text;
  v_result jsonb;
begin
  v_select := coalesce(p_query->>'select', '*');
  if v_select not in ('*', 'image_path', 'reactions', 'id') then
    raise exception 'select not allowed';
  end if;

  for v_filter in
    select * from jsonb_array_elements(coalesce(p_query->'filters', '[]'::jsonb))
  loop
    if v_filter->>'col' = 'created_at' and v_filter->>'op' = 'gte' then
      v_where := v_where || format(' and created_at >= %L::timestamptz', v_filter->>'val');
    elsif v_filter->>'col' = 'created_at' and v_filter->>'op' = 'lt' then
      v_where := v_where || format(' and created_at < %L::timestamptz', v_filter->>'val');
    elsif v_filter->>'col' = 'id' and v_filter->>'op' = 'eq' then
      v_where := v_where || format(' and id = %L::uuid', v_filter->>'val');
    elsif v_filter->>'col' = 'image_path' and v_filter->>'op' = 'not.is' then
      v_where := v_where || ' and image_path is not null';
    end if;
  end loop;

  if p_query->'order' is not null then
    v_order := format(
      ' order by %I %s',
      p_query->'order'->>'col',
      case when coalesce((p_query->'order'->>'asc')::boolean, true) then 'asc' else 'desc' end
    );
  end if;

  v_sql := format(
    'select coalesce(jsonb_agg(row_to_json(t)), ''[]''::jsonb) from (select %s from public.chat_messages where %s%s) t',
    v_select,
    v_where,
    v_order
  );

  execute v_sql into v_result;
  return v_result;
end;
$$;

create or replace function public.secure_gateway(p_envelope text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v jsonb;
  v_result jsonb;
  v_text text;
  v_bool boolean;
  v_method text;
  v_table text;
  v_body jsonb;
  v_query jsonb;
  v_filter jsonb;
  v_row public.chat_messages%rowtype;
  v_content public.app_content%rowtype;
  v_single boolean;
  v_id uuid;
begin
  v := public.b64_decode_json(p_envelope);

  if v->>'type' = 'rpc' then
    case v->>'name'
      when 'admin_login' then
        v_text := public.admin_login(v->'args'->>'p_admin_id', v->'args'->>'p_password');
        return public.b64_encode_text(v_text);
      when 'admin_validate_token' then
        v_bool := public.admin_validate_token(v->'args'->>'p_token');
        return public.b64_encode_json(to_jsonb(v_bool));
      when 'admin_logout' then
        perform public.admin_logout(v->'args'->>'p_token');
        return public.b64_encode_json('null'::jsonb);
      when 'admin_get_settings' then
        select coalesce(jsonb_agg(row_to_json(s)), '[]'::jsonb)
        into v_result
        from public.admin_get_settings(v->'args'->>'p_token') s;
        return public.b64_encode_json(v_result);
      when 'admin_update_credentials' then
        v_bool := public.admin_update_credentials(
          v->'args'->>'p_token',
          v->'args'->>'p_current_password',
          v->'args'->>'p_new_admin_id',
          v->'args'->>'p_new_password'
        );
        return public.b64_encode_json(to_jsonb(v_bool));
      when 'admin_save_content' then
        v_bool := public.admin_save_content(
          v->'args'->>'p_token',
          v->'args'->'p_content'
        );
        return public.b64_encode_json(to_jsonb(v_bool));
      when 'admin_update_runtime_config' then
        v_bool := public.admin_update_runtime_config(
          v->'args'->>'p_token',
          v->'args'->'p_config'
        );
        return public.b64_encode_json(to_jsonb(v_bool));
      when 'get_runtime_config' then
        return public.b64_encode_json(public.get_runtime_config());
      when 'cleanup_old_chat_messages' then
        perform public.cleanup_old_chat_messages();
        return public.b64_encode_json('null'::jsonb);
      else
        raise exception 'rpc not allowed';
    end case;
  end if;

  if v->>'type' = 'rest' then
    v_method := upper(v->>'method');
    v_table := v->>'table';
    v_body := v->'body';
    v_query := coalesce(v->'query', '{}'::jsonb);
    v_single := coalesce((v_query->>'single')::boolean, false);

    if v_table = 'app_content' and v_method = 'GET' then
      select * into v_content
      from public.app_content
      where id = coalesce(
        (
          select f->>'val'
          from jsonb_array_elements(coalesce(v_query->'filters', '[]'::jsonb)) f
          where f->>'col' = 'id' and f->>'op' = 'eq'
          limit 1
        ),
        'main'
      );

      if not found then
        v_result := '[]'::jsonb;
      elsif coalesce(v_query->>'select', '*') = 'id' then
        v_result := jsonb_build_array(jsonb_build_object('id', v_content.id));
      elsif coalesce(v_query->>'select', '*') = 'content' then
        v_result := jsonb_build_array(jsonb_build_object('content', v_content.content));
      else
        v_result := jsonb_build_array(to_jsonb(v_content));
      end if;

      if v_single and jsonb_array_length(v_result) > 0 then
        return public.b64_encode_json(v_result->0);
      end if;
      return public.b64_encode_json(v_result);
    end if;

    if v_table = 'chat_messages' then
      if v_method = 'GET' then
        v_result := public.secure_chat_select(v_query);
        if v_single and jsonb_array_length(v_result) > 0 then
          return public.b64_encode_json(v_result->0);
        end if;
        return public.b64_encode_json(v_result);
      end if;

      if v_method = 'POST' then
        insert into public.chat_messages (
          sender, body, image_path, image_url,
          latitude, longitude, location_accuracy, reactions
        )
        values (
          v_body->>'sender',
          v_body->>'body',
          v_body->>'image_path',
          v_body->>'image_url',
          nullif(v_body->>'latitude', '')::double precision,
          nullif(v_body->>'longitude', '')::double precision,
          nullif(v_body->>'location_accuracy', '')::double precision,
          coalesce(v_body->'reactions', '{}'::jsonb)
        )
        returning * into v_row;

        if v_single then
          return public.b64_encode_json(to_jsonb(v_row));
        end if;
        return public.b64_encode_json(jsonb_build_array(to_jsonb(v_row)));
      end if;

      if v_method = 'PATCH' then
        select (f->>'val')::uuid into v_id
        from jsonb_array_elements(coalesce(v_query->'filters', '[]'::jsonb)) f
        where f->>'col' = 'id' and f->>'op' = 'eq'
        limit 1;

        update public.chat_messages
        set
          body = coalesce(v_body->>'body', body),
          reactions = coalesce(v_body->'reactions', reactions)
        where id = v_id
        returning * into v_row;

        if v_single then
          return public.b64_encode_json(to_jsonb(v_row));
        end if;
        return public.b64_encode_json(jsonb_build_array(to_jsonb(v_row)));
      end if;

      if v_method = 'DELETE' then
        for v_filter in
          select * from jsonb_array_elements(coalesce(v_query->'filters', '[]'::jsonb))
        loop
          if v_filter->>'col' = 'id' and v_filter->>'op' = 'eq' then
            delete from public.chat_messages where id = (v_filter->>'val')::uuid;
          elsif v_filter->>'col' = 'created_at' and v_filter->>'op' = 'lt' then
            delete from public.chat_messages
            where created_at < (v_filter->>'val')::timestamptz;
          end if;
        end loop;
        return public.b64_encode_json('null'::jsonb);
      end if;
    end if;
  end if;

  raise exception 'secure_gateway: unsupported request';
end;
$$;

grant execute on function public.secure_chat_select(jsonb) to anon, authenticated;
grant execute on function public.secure_gateway(text) to anon, authenticated;

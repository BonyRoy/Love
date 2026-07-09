-- Add Google Photos / Drive settings to Supabase runtime config.
-- Run once in the Supabase SQL Editor, then:
--   npm run upload-bootstrap
-- (so public app-bootstrap/runtime.json includes the photos block)

update public.app_runtime_config
set
  config = config || jsonb_build_object(
    'photos',
    jsonb_build_object(
      'drive_folder_id', '1WbfUf1VukZwdczyghwAeEuNsgIjHyHU9',
      'drive_manifest_url', 'https://script.google.com/macros/s/AKfycbwTLO5o0SiofZcMNafpOqg0RidumQilKdq5oC5kDsHFKBTGwteT7XX15ENnxOlGcWRL8Q/exec',
      'google_drive_api_key', '',
      'google_client_id', ''
    )
  ),
  updated_at = now()
where id = 'main';

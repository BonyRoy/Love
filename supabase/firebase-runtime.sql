-- Add Beatify Firebase keys to runtime config (run once in SQL Editor)
-- Replace the placeholder values with your Firebase project settings.

update public.app_runtime_config
set
  config = config || jsonb_build_object(
    'firebase',
    jsonb_build_object(
      'api_key', 'YOUR_FIREBASE_API_KEY',
      'auth_domain', 'beatify-873fb.firebaseapp.com',
      'project_id', 'beatify-873fb',
      'storage_bucket', 'beatify-873fb.firebasestorage.app',
      'messaging_sender_id', '901163740976',
      'app_id', 'YOUR_FIREBASE_APP_ID'
    )
  ),
  updated_at = now()
where id = 'main';

-- Then upload to the public bootstrap bucket (local):
--   1. Copy supabase/bootstrap-runtime.example.json → supabase/bootstrap-runtime.json
--   2. Fill in supabase + firebase values
--   3. Run: npm run upload-bootstrap

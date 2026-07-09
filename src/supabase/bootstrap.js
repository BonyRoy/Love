const PROJECT_REF =
  import.meta.env.VITE_SUPABASE_PROJECT_REF || "rfkfctipgahysdysctea";
const CONFIG_CACHE_KEY = "ishu-runtime-config-v3";

function projectUrl() {
  return `https://${PROJECT_REF}.supabase.co`;
}

function readCachedConfig() {
  try {
    const raw = sessionStorage.getItem(CONFIG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.supabase_url && parsed?.supabase_anon_key) {
      return applyEnvFirebaseFallback(parsed);
    }
  } catch {
    // ignore
  }
  return null;
}

function firebaseFromEnv() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) return null;

  return {
    api_key: apiKey,
    auth_domain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    project_id: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storage_bucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messaging_sender_id: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    app_id: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

function applyEnvFirebaseFallback(config) {
  if (config.firebase?.api_key) return config;
  const firebase = firebaseFromEnv();
  if (!firebase) return config;
  return { ...config, firebase };
}

function cacheConfig(config) {
  try {
    sessionStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function clearRuntimeConfigCache() {
  try {
    sessionStorage.removeItem(CONFIG_CACHE_KEY);
  } catch {
    // ignore
  }
}

async function fetchBootstrapRpc(anonKey) {
  const res = await fetch(`${projectUrl()}/rest/v1/rpc/get_runtime_config`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.supabase_url && data?.supabase_anon_key) return data;
  return null;
}

async function fetchBootstrapJson() {
  const res = await fetch(
    `${projectUrl()}/storage/v1/object/public/app-bootstrap/runtime.json`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.supabase_url && data?.supabase_anon_key) return data;
  return null;
}

function mergeRuntimeConfig(cached, fresh) {
  let next = cached;

  if (!cached.photos?.drive_folder_id && fresh.photos?.drive_folder_id) {
    next = { ...next, photos: fresh.photos };
  }

  if (!cached.firebase?.api_key && fresh.firebase?.api_key) {
    next = { ...next, firebase: fresh.firebase };
  }

  return next;
}

export async function loadRuntimeConfig() {
  const cached = readCachedConfig();
  const fromStorage = await fetchBootstrapJson();

  if (fromStorage) {
    const fresh = applyEnvFirebaseFallback(fromStorage);

    if (!cached) {
      cacheConfig(fresh);
      return fresh;
    }

    const merged = mergeRuntimeConfig(cached, fresh);
    if (merged !== cached) {
      cacheConfig(merged);
    }
    return merged;
  }

  if (cached) return cached;

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    const config = applyEnvFirebaseFallback({
      supabase_url: envUrl,
      supabase_anon_key: envKey,
    });
    cacheConfig(config);
    return config;
  }

  if (envKey) {
    const fromRpc = await fetchBootstrapRpc(envKey);
    if (fromRpc) {
      const config = applyEnvFirebaseFallback(fromRpc);
      cacheConfig(config);
      return config;
    }
  }

  throw new Error(
    "App config not found. Run: npm run upload-bootstrap — or add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env",
  );
}

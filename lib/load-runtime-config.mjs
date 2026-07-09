import { parsePhotosRuntime } from "./photos-runtime.mjs";

const PROJECT_REF = process.env.VITE_SUPABASE_PROJECT_REF || "rfkfctipgahysdysctea";
const PROJECT_URL = process.env.VITE_SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`;

let cachedRuntime = null;
let cachedAt = 0;
const CACHE_MS = 60_000;

export async function loadServerRuntimeConfig() {
  if (cachedRuntime && Date.now() - cachedAt < CACHE_MS) {
    return cachedRuntime;
  }

  const bootstrapRes = await fetch(
    `${PROJECT_URL}/storage/v1/object/public/app-bootstrap/runtime.json`,
    { cache: "no-store" },
  );

  if (bootstrapRes.ok) {
    cachedRuntime = await bootstrapRes.json();
    cachedAt = Date.now();
    return cachedRuntime;
  }

  const anonKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (anonKey) {
    const rpcRes = await fetch(`${PROJECT_URL}/rest/v1/rpc/get_runtime_config`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    if (rpcRes.ok) {
      cachedRuntime = await rpcRes.json();
      cachedAt = Date.now();
      return cachedRuntime;
    }
  }

  throw new Error("Could not load runtime config from Supabase.");
}

export async function loadPhotosRuntime() {
  const runtime = await loadServerRuntimeConfig();
  const photos = parsePhotosRuntime(runtime);
  if (!photos) {
    throw new Error("Photos config is missing in Supabase runtime.");
  }
  return photos;
}

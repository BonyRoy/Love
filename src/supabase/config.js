import { createClient } from "@supabase/supabase-js";
import { loadRuntimeConfig } from "./bootstrap";
import { createSecureFetch } from "./secureFetch";

let client = null;

export async function initSupabase() {
  if (client) return client;

  const config = await loadRuntimeConfig();
  client = createClient(config.supabase_url, config.supabase_anon_key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: createSecureFetch() },
  });

  return client;
}

export function getSupabase() {
  if (!client) {
    throw new Error("Supabase is not initialized yet.");
  }
  return client;
}

export function isSupabaseConfigured() {
  return client !== null;
}

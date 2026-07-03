import { getSupabase } from "./config";
import { clearRuntimeConfigCache } from "./bootstrap";

const TOKEN_KEY = "ishu-admin-token";

export function getAdminToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setAdminToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function adminLogin(adminId, password) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("admin_login", {
    p_admin_id: adminId.trim(),
    p_password: password,
  });

  if (error) throw error;
  if (!data) return false;

  setAdminToken(data);
  return true;
}

export async function validateAdminSession() {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_validate_token", {
      p_token: token,
    });
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

export async function adminLogout() {
  const token = getAdminToken();
  if (token) {
    try {
      const supabase = getSupabase();
      await supabase.rpc("admin_logout", { p_token: token });
    } catch {
      // ignore
    }
  }
  clearAdminToken();
}

export async function fetchAdminSettings() {
  const token = getAdminToken();
  if (!token) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("admin_get_settings", {
    p_token: token,
  });

  if (error) throw error;
  return data?.[0] ?? null;
}

export async function updateAdminCredentials({
  currentPassword,
  newAdminId,
  newPassword,
}) {
  const token = getAdminToken();
  if (!token) throw new Error("Not signed in.");

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("admin_update_credentials", {
    p_token: token,
    p_current_password: currentPassword,
    p_new_admin_id: newAdminId.trim(),
    p_new_password: newPassword,
  });

  if (error) throw error;
  return Boolean(data);
}

export async function publishBootstrapConfig() {
  const token = getAdminToken();
  if (!token) throw new Error("Not signed in.");

  const supabase = getSupabase();
  const { data: config, error: configError } = await supabase.rpc(
    "get_runtime_config",
  );
  if (configError) throw configError;
  if (!config?.supabase_url || !config?.supabase_anon_key) {
    throw new Error("Runtime config is missing in the database.");
  }

  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });

  const { error: uploadError } = await supabase.storage
    .from("app-bootstrap")
    .upload("runtime.json", blob, {
      upsert: true,
      contentType: "application/json",
    });

  if (uploadError) throw uploadError;

  const { data: ok, error: rpcError } = await supabase.rpc(
    "admin_update_runtime_config",
    {
      p_token: token,
      p_config: config,
    },
  );

  if (rpcError) throw rpcError;
  if (!ok) throw new Error("Could not update runtime config.");

  clearRuntimeConfigCache();
  return true;
}

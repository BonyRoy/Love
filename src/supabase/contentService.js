import { getAdminToken } from "./adminService";
import { getSupabase, isSupabaseConfigured } from "./config";

const TABLE = "app_content";
const ROW_ID = "main";

const NO_CONTENT_ERROR =
  "No content in Supabase yet. Run supabase/seed.sql in the SQL Editor.";

export function subscribeToContent(onData, onError) {
  if (!isSupabaseConfigured()) {
    onError?.(new Error("Supabase is not configured."));
    onData(null);
    return () => {};
  }

  const supabase = getSupabase();
  let active = true;

  const load = async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("content")
      .eq("id", ROW_ID)
      .maybeSingle();

    if (!active) return;

    if (error) {
      console.error("Supabase fetch failed:", error);
      onError?.(error);
      onData(null);
      return;
    }

    if (!data?.content) {
      onError?.(new Error(NO_CONTENT_ERROR));
      onData(null);
      return;
    }

    onData(data.content);
  };

  load();

  const channel = supabase
    .channel("app_content_main")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: TABLE,
        filter: `id=eq.${ROW_ID}`,
      },
      (payload) => {
        const row = payload.new;
        if (row?.content) onData(row.content);
      },
    )
    .subscribe();

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

export async function saveContent(data) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const token = getAdminToken();
  if (!token) {
    throw new Error("Admin session required to save content.");
  }

  const supabase = getSupabase();
  const { data: ok, error } = await supabase.rpc("admin_save_content", {
    p_token: token,
    p_content: data,
  });

  if (error) throw error;
  if (!ok) throw new Error("Save failed. Sign in again as admin.");
}

export async function hasContent() {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id")
    .eq("id", ROW_ID)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

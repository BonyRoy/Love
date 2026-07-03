import { getSupabase, isSupabaseConfigured } from "./config";

const TABLE = "chat_messages";
const BUCKET = "chat-images";
const CHANNEL = "chat_room_live";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const POLL_MS = 3_000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let liveChannel = null;
let lastCleanupAt = 0;

function requireSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  return getSupabase();
}

export async function cleanupExpiredMessages() {
  const client = requireSupabase();

  const cutoff = new Date(Date.now() - MAX_AGE_MS).toISOString();
  const { data: expired } = await client
    .from(TABLE)
    .select("image_path")
    .lt("created_at", cutoff)
    .not("image_path", "is", null);

  if (expired?.length) {
    const paths = expired.map((row) => row.image_path).filter(Boolean);
    if (paths.length) {
      await client.storage.from(BUCKET).remove(paths);
    }
  }

  await client.from(TABLE).delete().lt("created_at", cutoff);

  try {
    await client.rpc("cleanup_old_chat_messages");
  } catch {
    // RPC optional if not deployed yet
  }

  lastCleanupAt = Date.now();
}

async function maybeCleanup() {
  if (Date.now() - lastCleanupAt >= CLEANUP_INTERVAL_MS) {
    await cleanupExpiredMessages();
  }
}

export async function fetchMessages({ withCleanup = false } = {}) {
  const client = requireSupabase();
  if (withCleanup) {
    await cleanupExpiredMessages();
  } else {
    await maybeCleanup();
  }

  const cutoff = new Date(Date.now() - MAX_AGE_MS).toISOString();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function notifyPeers() {
  if (!liveChannel) return;
  try {
    await liveChannel.send({
      type: "broadcast",
      event: "message_sent",
      payload: { at: Date.now() },
    });
  } catch (err) {
    console.warn("Chat broadcast failed:", err);
  }
}

export function subscribeToMessages(onMessages) {
  const client = requireSupabase();
  let active = true;
  let refreshTimer = null;

  const refresh = async ({ withCleanup = false } = {}) => {
    if (!active) return;
    try {
      const messages = await fetchMessages({ withCleanup });
      onMessages(messages);
    } catch (err) {
      console.error("Chat fetch failed:", err);
    }
  };

  const scheduleRefresh = () => {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => refresh(), 120);
  };

  refresh({ withCleanup: true });

  const pollInterval = setInterval(refresh, POLL_MS);

  const onVisible = () => {
    if (document.visibilityState === "visible") refresh();
  };
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", refresh);

  const channel = client
    .channel(CHANNEL, { config: { broadcast: { ack: false, self: false } } })
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: TABLE },
      () => scheduleRefresh(),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: TABLE },
      () => scheduleRefresh(),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: TABLE },
      () => scheduleRefresh(),
    )
    .on("broadcast", { event: "message_sent" }, () => scheduleRefresh())
    .subscribe((status) => {
      if (status === "SUBSCRIBED") refresh();
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setTimeout(() => channel.subscribe(), 2000);
      }
    });

  liveChannel = channel;

  return {
    unsubscribe: () => {
      active = false;
      clearInterval(pollInterval);
      if (refreshTimer) clearTimeout(refreshTimer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
      if (liveChannel === channel) liveChannel = null;
      client.removeChannel(channel);
    },
    refresh,
  };
}

function withLocation(row, location) {
  if (!location) return row;
  return {
    ...row,
    latitude: location.latitude,
    longitude: location.longitude,
    location_accuracy: location.accuracy ?? null,
  };
}

export async function sendTextMessage(sender, body, location = null) {
  const client = requireSupabase();
  const text = body.trim();
  if (!text) return null;

  const { data, error } = await client
    .from(TABLE)
    .insert(withLocation({ sender, body: text }, location))
    .select()
    .single();

  if (error) throw error;
  await notifyPeers();
  return data;
}

export async function sendImageMessage(sender, file, location = null) {
  const client = requireSupabase();
  const ext = file.name?.split(".").pop() || "jpg";
  const path = `${sender}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "86400", upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await client
    .from(TABLE)
    .insert(
      withLocation(
        {
          sender,
          image_path: path,
          image_url: urlData.publicUrl,
          body: null,
        },
        location,
      ),
    )
    .select()
    .single();

  if (error) throw error;
  await notifyPeers();
  return data;
}

export async function deleteMessage(message) {
  const client = requireSupabase();

  if (message.image_path) {
    await client.storage.from(BUCKET).remove([message.image_path]);
  }

  const { error } = await client.from(TABLE).delete().eq("id", message.id);
  if (error) throw error;
  await notifyPeers();
}

export async function updateMessageBody(id, body) {
  const client = requireSupabase();
  const text = body.trim();
  if (!text) return null;

  const { data, error } = await client
    .from(TABLE)
    .update({ body: text })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  await notifyPeers();
  return data;
}

export async function setMessageReaction(messageId, reactor, emoji) {
  const client = requireSupabase();

  const { data: current, error: fetchError } = await client
    .from(TABLE)
    .select("reactions")
    .eq("id", messageId)
    .single();

  if (fetchError) throw fetchError;

  const reactions = { ...(current?.reactions ?? {}) };
  if (reactions[reactor] === emoji) {
    delete reactions[reactor];
  } else {
    reactions[reactor] = emoji;
  }

  const { data, error } = await client
    .from(TABLE)
    .update({ reactions })
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw error;
  await notifyPeers();
  return data;
}

export function getReactionSummary(reactions) {
  if (!reactions || typeof reactions !== "object") return [];
  const counts = {};
  for (const emoji of Object.values(reactions)) {
    if (!emoji) continue;
    counts[emoji] = (counts[emoji] ?? 0) + 1;
  }
  return Object.entries(counts).map(([emoji, count]) => ({ emoji, count }));
}

export const CHAT_EXPIRY_NOTE =
  "Messages and photos disappear automatically after 24 hours.";

export function createOptimisticMessage(sender, partial) {
  return {
    id: `pending-${crypto.randomUUID()}`,
    sender,
    body: partial.body ?? null,
    image_url: partial.image_url ?? null,
    image_path: null,
    created_at: new Date().toISOString(),
    pending: true,
  };
}

export function mergeMessages(serverMessages, pendingLocal = []) {
  const serverIds = new Set(serverMessages.map((m) => m.id));
  const stillPending = pendingLocal.filter((m) => m.pending && !serverIds.has(m.id));
  const combined = [...serverMessages, ...stillPending];
  combined.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return combined;
}

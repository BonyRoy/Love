import { useCallback, useEffect, useState } from "react";
import { fetchUnreadCount } from "../supabase/chatService";
import { isSupabaseConfigured } from "../supabase/config";

const POLL_MS = 3_000;

export function useUnreadChatCount(viewer, { pause = false } = {}) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (pause || !isSupabaseConfigured()) {
      setCount(0);
      return;
    }
    try {
      const next = await fetchUnreadCount(viewer);
      setCount(next);
    } catch {
      // keep last count on transient errors
    }
  }, [viewer, pause]);

  useEffect(() => {
    refresh();
    if (pause || !isSupabaseConfigured()) return undefined;

    const interval = setInterval(refresh, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onRead = (event) => {
      if (event.detail?.viewer === viewer) refresh();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    window.addEventListener("ishu-chat-read", onRead);
    window.addEventListener("storage", refresh);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("ishu-chat-read", onRead);
      window.removeEventListener("storage", refresh);
    };
  }, [viewer, pause, refresh]);

  return count;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { EMPTY_CONTENT, processContent } from "../data/contentUtils";
import { saveContent, subscribeToContent } from "../supabase/contentService";
import { isSupabaseConfigured } from "../supabase/config";

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(null);
  const usingSupabase = isSupabaseConfigured();

  useEffect(() => {
    const unsubscribe = subscribeToContent(
      (data) => {
        setRaw(data);
        setError(null);
      },
      (err) => {
        setError(err?.message ?? "Failed to load content");
      },
    );
    return unsubscribe;
  }, []);

  const updateSection = useCallback(
    async (key, value) => {
      if (!raw) return;
      const next = { ...raw, [key]: value };
      await saveContent(next);
      setRaw(next);
    },
    [raw],
  );

  const updateSections = useCallback(
    async (patch) => {
      if (!raw) return;
      const next = { ...raw, ...patch };
      await saveContent(next);
      setRaw(next);
    },
    [raw],
  );

  const value = useMemo(() => {
    const data = raw ?? EMPTY_CONTENT;
    return {
      raw: data,
      isLoading: !raw,
      error,
      ...processContent(data),
      usingSupabase,
      updateSection,
      updateSections,
    };
  }, [raw, error, usingSupabase, updateSection, updateSections]);

  if (error && !raw) {
    return (
      <div className="app-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error("useContent must be used within ContentProvider");
  }
  return ctx;
}

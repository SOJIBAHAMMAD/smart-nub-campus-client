"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { SearchRecent } from "@/types/search.types";

export const SEARCH_RECENTS_KEY = "snub:global-search:recents";
export const SEARCH_RECENTS_MAX = 6;

const GlobalSearchContext = React.createContext<GlobalSearchContextValue | null>(
  null,
);

export interface GlobalSearchContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  query: string;
  setQuery: (query: string) => void;
  recents: SearchRecent[];
  addRecent: (recent: Omit<SearchRecent, "timestamp">) => void;
  removeRecent: (query: string, url: string) => void;
  clearRecents: () => void;
}

interface GlobalSearchProviderProps {
  children: React.ReactNode;
  /** Allow overriding the shortcut modifier key in tests. */
  openOnKey?: (e: KeyboardEvent) => boolean;
  /** Allow overriding the "/" shortcut. */
  openOnSlash?: (e: KeyboardEvent) => boolean;
}

const DEFAULT_OPEN_ON_KEY = (e: KeyboardEvent) =>
  (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";

const DEFAULT_OPEN_ON_SLASH = (e: KeyboardEvent) => e.key === "/";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function readRecents(): SearchRecent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SEARCH_RECENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is SearchRecent =>
        !!entry &&
        typeof entry === "object" &&
        typeof (entry as SearchRecent).query === "string",
    );
  } catch {
    return [];
  }
}

function persistRecents(recents: SearchRecent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SEARCH_RECENTS_KEY,
      JSON.stringify(recents.slice(0, SEARCH_RECENTS_MAX)),
    );
  } catch {
    // Storage may be unavailable (private mode); ignore.
  }
}

export function GlobalSearchProvider({
  children,
  openOnKey = DEFAULT_OPEN_ON_KEY,
  openOnSlash = DEFAULT_OPEN_ON_SLASH,
}: GlobalSearchProviderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [recents, setRecents] = React.useState<SearchRecent[]>([]);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  // Lazily hydrate recents on first open (or immediately on mount in browser).
  React.useEffect(() => {
    setRecents(readRecents());
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const addRecent = React.useCallback(
    (recent: Omit<SearchRecent, "timestamp">) => {
      setRecents((prev) => {
        const key = `${recent.query}::${recent.url}`;
        const filtered = prev.filter(
          (entry) => `${entry.query}::${entry.url}` !== key,
        );
        const next = [{ ...recent, timestamp: Date.now() }, ...filtered].slice(
          0,
          SEARCH_RECENTS_MAX,
        );
        persistRecents(next);
        return next;
      });
    },
    [],
  );

  const removeRecent = React.useCallback((q: string, url: string) => {
    setRecents((prev) => {
      const next = prev.filter(
        (entry) => !(entry.query === q && entry.url === url),
      );
      persistRecents(next);
      return next;
    });
  }, []);

  const clearRecents = React.useCallback(() => {
    setRecents([]);
    persistRecents([]);
  }, []);

  // Close when the user navigates away.
  React.useEffect(() => {
    close();
  }, [pathname, close]);

  // Global shortcuts: ⌘K / Ctrl+K toggles, "/" opens (unless typing).
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (openOnKey(e)) {
        e.preventDefault();
        toggle();
        return;
      }
      if (
        openOnSlash(e) &&
        !isOpen &&
        !isTypingTarget(e.target) &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        open();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, open, openOnKey, openOnSlash, toggle]);

  const value = React.useMemo<GlobalSearchContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      query,
      setQuery,
      recents,
      addRecent,
      removeRecent,
      clearRecents,
    }),
    [
      isOpen,
      open,
      close,
      toggle,
      query,
      recents,
      addRecent,
      removeRecent,
      clearRecents,
    ],
  );

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearchContext(): GlobalSearchContextValue {
  const ctx = React.useContext(GlobalSearchContext);
  if (!ctx) {
    throw new Error(
      "useGlobalSearchContext must be used within a GlobalSearchProvider",
    );
  }
  return ctx;
}

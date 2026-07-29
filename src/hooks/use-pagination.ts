"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface UsePaginationOptions {
  /** Initial page number. Defaults to 1. */
  initialPage?: number;
  /** Items per page. Defaults to 20. */
  pageSize?: number;
  /** Whether to sync page state with URL search params. Defaults to false. */
  syncWithUrl?: boolean;
  /** URL search param key for page number. Defaults to "page". */
  pageParam?: string;
}

interface UsePaginationReturn {
  /** Current page number (1-indexed). */
  page: number;
  /** Items per page. */
  pageSize: number;
  /** Set the current page. */
  setPage: (page: number) => void;
  /** Go to the next page. */
  nextPage: () => void;
  /** Go to the previous page. */
  prevPage: () => void;
  /** Whether there is a previous page. */
  hasPrevPage: boolean;
  /** Calculate the offset for the current page (0-indexed). */
  offset: number;
  /** Reset to page 1. */
  reset: () => void;
}

/**
 * Manages pagination state with optional URL sync.
 * When `syncWithUrl` is true, the page number is derived from the URL search params.
 */
export function usePagination({
  initialPage = 1,
  pageSize = 20,
  syncWithUrl = false,
  pageParam = "page",
}: UsePaginationOptions = {}): UsePaginationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // When syncing with URL, derive the page directly from searchParams (no effect needed)
  const getPageFromUrl = (): number => {
    if (!syncWithUrl) return initialPage;
    const urlPage = searchParams.get(pageParam);
    const parsed = urlPage ? parseInt(urlPage, 10) : initialPage;
    return isNaN(parsed) || parsed < 1 ? initialPage : parsed;
  };

  const [localPage, setLocalPage] = useState(initialPage);

  // Derive page: if syncing with URL, read from searchParams; otherwise use local state
  const page = syncWithUrl ? getPageFromUrl() : localPage;

  const setPage = useCallback(
    (newPage: number) => {
      const clamped = Math.max(1, newPage);

      if (syncWithUrl) {
        const params = new URLSearchParams(searchParams.toString());
        if (clamped === initialPage) {
          params.delete(pageParam);
        } else {
          params.set(pageParam, String(clamped));
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      } else {
        setLocalPage(clamped);
      }
    },
    [syncWithUrl, searchParams, pathname, router, pageParam, initialPage],
  );

  const nextPage = useCallback(() => setPage(page + 1), [page, setPage]);
  const prevPage = useCallback(() => setPage(page - 1), [page, setPage]);
  const reset = useCallback(() => setPage(initialPage), [setPage, initialPage]);

  return {
    page,
    pageSize,
    setPage,
    nextPage,
    prevPage,
    hasPrevPage: page > 1,
    offset: (page - 1) * pageSize,
    reset,
  };
}

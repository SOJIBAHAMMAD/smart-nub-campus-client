"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface UseInfiniteScrollOptions {
  /** Whether there are more items to load. */
  hasMore: boolean;
  /** Whether data is currently being fetched. */
  isLoading: boolean;
  /** Callback to load the next page of data. */
  loadMore: () => void;
  /** Root margin for IntersectionObserver. Defaults to "200px". */
  rootMargin?: string;
  /** Threshold for IntersectionObserver. Defaults to 0. */
  threshold?: number;
}

interface UseInfiniteScrollReturn {
  /** Ref to attach to the sentinel element at the bottom of the list. */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Infinite scroll hook using IntersectionObserver.
 * Attach the returned `sentinelRef` to a div at the bottom of your list.
 * When the sentinel enters the viewport, `loadMore` is called.
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  loadMore,
  rootMargin = "200px",
  threshold = 0,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef(loadMore);

  // Keep the callback ref fresh without triggering observer re-creation
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMoreRef.current();
      }
    },
    [hasMore, isLoading],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, rootMargin, threshold]);

  return { sentinelRef };
}

/**
 * Alternative: a simpler implementation that returns state for infinite scroll
 * with built-in state management.
 */
export function useInfiniteScrollState<T>({
  fetchFn,
  pageSize = 20,
}: {
  /** Async function that returns an array of items for a given page. */
  fetchFn: (page: number, limit: number) => Promise<T[]>;
  /** Number of items per page. */
  pageSize?: number;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await fetchFn(page, pageSize);
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      setItems((prev) => [...prev, ...newItems]);
      setPage((prev) => prev + 1);
    } catch {
      // Error is swallowed — callers can add toast notifications externally
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, pageSize, isLoading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(false);
  }, []);

  return { items, isLoading, hasMore, loadMore, reset };
}

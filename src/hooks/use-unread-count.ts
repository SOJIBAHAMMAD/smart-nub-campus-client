"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import type { UnreadCountResponse } from "@/types/notification.types";
import type { Notification } from "@/lib/types/socket-events";

interface UseUnreadCountOptions {
  /** Whether to automatically fetch the count on mount. Defaults to true. */
  autoFetch?: boolean;
}

interface UseUnreadCountReturn {
  /** Current unread notification count. */
  count: number;
  /** Whether the count is being loaded for the first time. */
  isLoading: boolean;
  /** Manually refresh the count. */
  refresh: () => Promise<void>;
  /** Decrement the count by a given amount (used when marking as read). */
  decrement: (amount?: number) => void;
  /** Reset the count to zero. */
  reset: () => void;
}

/**
 * Tracks the global unread notification count.
 *
 * ARCHITECTURAL NOTE (ISSUE-073):
 * This hook uses `apiClient` (browser-direct fetch) instead of `serverApi`
 * because it runs in client components. Using `serverApi` would pull in
 * server-only modules (next/headers, cookie) into the client bundle.
 *
 * The server-side `notificationService.getUnreadCount()` uses `serverApi`
 * with the `"unread-count"` cache tag — that path is only used in
 * Server Components and server actions. Both paths call the same
 * `GET /notifications/unread-count` endpoint and return the same
 * `UnreadCountResponse` shape.
 *
 * This trade-off is intentional and correct: browser-direct fetch for
 * client-side real-time hooks; serverApi with cache tags for SSR.
 */
export function useUnreadCount({
  autoFetch = true,
}: UseUnreadCountOptions = {}): UseUnreadCountReturn {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const { socket } = useSocket();

  useSocketEvent(socket, "notification:new", (_notification: Notification) => {
    setCount((prev) => prev + 1);
  });

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await apiClient.get<{
        success: boolean;
        message: string;
        data: UnreadCountResponse;
      }>("/notifications/unread-count");
      setCount(result.data?.data?.unreadCount ?? 0);
    } catch {
      // Swallow — callers can handle errors externally
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount when enabled
  useEffect(() => {
    if (!autoFetch) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await apiClient.get<{
          success: boolean;
          message: string;
          data: UnreadCountResponse;
        }>("/notifications/unread-count");
        if (!cancelled) {
          setCount(result.data?.data?.unreadCount ?? 0);
        }
      } catch {
        // Swallow — callers can handle errors externally
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [autoFetch]);

  const decrement = useCallback((amount = 1) => {
    setCount((prev) => Math.max(0, prev - amount));
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  return { count, isLoading, refresh, decrement, reset };
}

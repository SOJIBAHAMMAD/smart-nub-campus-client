"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type {
  Notification,
  NotificationListResponse,
} from "@/types/notification.types";

interface UseNotificationsOptions {
  /** Whether to automatically fetch on mount. Defaults to true. */
  autoFetch?: boolean;
  /** Page size. Defaults to 20. */
  limit?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  prependNotification: (notification: Notification) => void;
}

/**
 * Manages the notification list state for the notifications page.
 * Uses browser-side apiClient to avoid server-only module contamination.
 */
export function useNotifications({
  autoFetch = true,
  limit = 20,
}: UseNotificationsOptions = {}): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (pageNum: number, append = false) => {
      try {
        setIsLoading(true);
        const result = await apiClient.get<{
          success: boolean;
          message: string;
          data: NotificationListResponse;
        }>(`/notifications?page=${pageNum}&limit=${limit}`);
        if (result.data?.data) {
          const { data: items, meta } = result.data.data;
          setNotifications((prev) =>
            append ? [...prev, ...(items ?? [])] : (items ?? []),
          );
          setHasMore(meta.page < meta.totalPages);
        }
      } catch {
        // Swallow
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    if (!autoFetch) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await apiClient.get<{
          success: boolean;
          message: string;
          data: NotificationListResponse;
        }>(`/notifications?page=1&limit=${limit}`);
        if (!cancelled && result.data?.data) {
          setNotifications(result.data.data.data ?? []);
          setHasMore(result.data.data.meta.page < result.data.data.meta.totalPages);
        }
      } catch {
        // Swallow
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [autoFetch, limit]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPage(nextPage, true);
  }, [page, fetchPage]);

  const refresh = useCallback(async () => {
    setPage(1);
    await fetchPage(1, false);
  }, [fetchPage]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await apiClient.patch(`/notifications/${id}/read`, {});
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiClient.patch("/notifications/read-all", {});
    } catch {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: n.isRead })),
      );
    }
  }, []);

  const prependNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  return {
    notifications,
    isLoading,
    hasMore,
    page,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    prependNotification,
  };
}

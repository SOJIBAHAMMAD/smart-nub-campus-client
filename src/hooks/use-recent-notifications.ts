"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import type { Notification } from "@/types/notification.types";
import type { Notification as SocketNotification } from "@/lib/types/socket-events";

interface UseRecentNotificationsOptions {
  limit?: number;
  autoFetch?: boolean;
}

interface UseRecentNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  prependNotification: (notification: Notification) => void;
}

/**
 * Lightweight hook for the notification bell dropdown.
 * Fetches only a small number of recent notifications.
 */
export function useRecentNotifications({
  limit = 5,
  autoFetch = true,
}: UseRecentNotificationsOptions = {}): UseRecentNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const { socket } = useSocket();

  const prependNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Deduplicate by id
      if (prev.some((n) => n.id === notification.id)) return prev;
      return [notification, ...prev].slice(0, 10); // Keep max 10 in memory
    });
  }, []);

  // Listen for real-time notifications and prepend them
  useSocketEvent(socket, "notification:new", (data) => {
    const notification = data as unknown as SocketNotification;
    prependNotification(notification as unknown as Notification);
  });

  const fetchRecent = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await apiClient.get<{
        success: boolean;
        message: string;
        data: Notification[];
      }>(`/notifications/recent?limit=${limit}`);
      if (result.data?.data) {
        setNotifications(result.data.data ?? []);
      }
    } catch {
      // Swallow — callers can handle errors externally
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (!autoFetch) return;
    let cancelled = false;
    (async () => {
      await fetchRecent();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [autoFetch, fetchRecent]);

  const refresh = useCallback(async () => {
    await fetchRecent();
  }, [fetchRecent]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await apiClient.patch(`/notifications/${id}/read`, {});
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
    }
  }, []);

  const markAsUnread = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
    );
    try {
      await apiClient.patch(`/notifications/${id}/read`, { isRead: false });
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
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

  const deleteNotification = useCallback(async (id: string) => {
    const deleted = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiClient.del(`/notifications/${id}`);
    } catch {
      if (deleted) {
        setNotifications((prev) => [deleted, ...prev]);
      }
    }
  }, [notifications]);

  return {
    notifications,
    isLoading,
    refresh,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    prependNotification,
  };
}

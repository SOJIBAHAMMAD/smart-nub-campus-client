"use client";

import { useEffect, useCallback, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { useNotifications } from "@/hooks/use-notifications";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { useSocket } from "@/hooks/use-socket";
import { useSocketEvent } from "@/hooks/use-socket";
import { NotificationItem } from "./notification-item";
import { toast } from "sonner";
import type { Notification as AppNotification, NotificationType } from "@/types/notification.types";

type TabValue = "all" | "messages" | "connections" | "teams" | "resources" | "qa" | "discussions" | "events" | "system";

const TAB_CONFIG: { value: TabValue; label: string; types?: NotificationType[] }[] = [
  { value: "all", label: "All" },
  { value: "messages", label: "Messages", types: ["MESSAGE", "MESSAGE_REQUEST"] },
  { value: "connections", label: "Connections", types: ["CONNECTION_REQUEST", "CONNECTION_ACCEPTED"] },
  { value: "teams", label: "Teams", types: ["TEAM_APPLICATION", "TEAM_APPLICATION_ACCEPTED", "TEAM_APPLICATION_REJECTED"] },
  { value: "resources", label: "Resources", types: ["RESOURCE_UPVOTE", "RESOURCE_DOWNVOTE", "RESOURCE_COMMENT", "RESOURCE_REPORT_REVIEWED"] },
  { value: "qa", label: "Q&A", types: ["QUESTION_ANSWER", "QUESTION_ACCEPTED"] },
  { value: "discussions", label: "Discussions", types: ["DISCUSSION_REPLY", "DISCUSSION_MENTION"] },
  { value: "events", label: "Events", types: ["EVENT_REMINDER"] },
  { value: "system", label: "System", types: ["BADGE_UNLOCKED", "SYSTEM"] },
];

interface TimeGroup {
  label: string;
  notifications: AppNotification[];
}

function groupByTime(notifications: AppNotification[]): TimeGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

  const groups: Record<string, AppNotification[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  for (const n of notifications) {
    const date = new Date(n.createdAt);
    if (date >= todayStart) {
      groups["Today"].push(n);
    } else if (date >= yesterdayStart) {
      groups["Yesterday"].push(n);
    } else if (date >= weekStart) {
      groups["This Week"].push(n);
    } else {
      groups["Earlier"].push(n);
    }
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, notifications: items }));
}

export function NotificationsClient() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const {
    notifications,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    prependNotification,
  } = useNotifications();

  const { count: unreadCount, decrement, refresh: refreshCount } = useUnreadCount();
  const { socket } = useSocket();

  // Listen for real-time notifications
  useSocketEvent(socket, "notification:new", (data) => {
    const notification = data as unknown as AppNotification;
    prependNotification(notification);
    toast.info(notification.title, {
      description: notification.message,
      duration: 4000,
    });
    // Refresh count after a short delay to avoid race conditions
    setTimeout(() => refreshCount(), 500);
  });

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id);
      decrement(1);
    },
    [markAsRead, decrement],
  );

  const handleMarkAllAsRead = useCallback(() => {
    const unreadCount = (notifications ?? []).filter((n) => !n.isRead).length;
    markAllAsRead();
    decrement(unreadCount);
  }, [markAllAsRead, decrement, notifications]);

  // Refresh on mount to sync with any changes
  useEffect(() => {
    refresh();
    refreshCount();
  }, [refresh, refreshCount]);

  // Filter notifications by active tab
  const filteredNotifications = (notifications ?? []).filter((n) => {
    if (activeTab === "all") return true;
    const tabConfig = TAB_CONFIG.find((t) => t.value === activeTab);
    return tabConfig?.types?.includes(n.type) ?? true;
  });

  const unreadNotifications = filteredNotifications.filter((n) => !n.isRead);
  const readNotifications = filteredNotifications.filter((n) => n.isRead);

  // Group read notifications by time
  const readGroups = groupByTime(readNotifications);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadNotifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="mt-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          {TAB_CONFIG.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4">
        {filteredNotifications.length === 0 && !isLoading ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="When you receive notifications, they will appear here."
          />
        ) : (
          <div className="space-y-2">
            {/* Unread section */}
            {unreadNotifications.length > 0 && (
              <>
                <p className="px-1 text-xs font-medium uppercase text-muted-foreground">
                  Unread
                </p>
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </>
            )}

            {/* Read sections grouped by time */}
            {readGroups.map((group) => (
              <div key={group.label}>
                {unreadNotifications.length > 0 || readGroups.indexOf(group) > 0 ? (
                  <div className="my-4 h-px bg-border" />
                ) : null}
                <p className="px-1 text-xs font-medium uppercase text-muted-foreground">
                  {group.label}
                </p>
                {group.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

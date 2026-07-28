"use client";

import { useEffect, useCallback, useState } from "react";
import {
  Bell,
  CheckCheck,
  Inbox,
  MessageCircle,
  Users,
  Trophy,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Calendar,
  Settings,
  Loader2,
  Trash2,
  Eye,
  SquareCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotifications } from "@/hooks/use-notifications";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { useSocket } from "@/hooks/use-socket";
import { useSocketEvent } from "@/hooks/use-socket";
import { NotificationItem } from "./notification-item";
import { NotificationPageSkeleton } from "./notification-skeleton";
import { toast } from "sonner";
import type {
  Notification as AppNotification,
  NotificationType,
} from "@/types/notification.types";

type TabValue =
  | "all"
  | "messages"
  | "connections"
  | "teams"
  | "resources"
  | "qa"
  | "discussions"
  | "events"
  | "system";

const TAB_CONFIG: {
  value: TabValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  types?: NotificationType[];
}[] = [
  { value: "all", label: "All", icon: Inbox },
  {
    value: "messages",
    label: "Messages",
    icon: MessageCircle,
    types: ["MESSAGE", "MESSAGE_REQUEST"],
  },
  {
    value: "connections",
    label: "Connections",
    icon: Users,
    types: ["CONNECTION_REQUEST", "CONNECTION_ACCEPTED"],
  },
  {
    value: "teams",
    label: "Teams",
    icon: Trophy,
    types: [
      "TEAM_APPLICATION",
      "TEAM_APPLICATION_ACCEPTED",
      "TEAM_APPLICATION_REJECTED",
    ],
  },
  {
    value: "resources",
    label: "Resources",
    icon: BookOpen,
    types: [
      "RESOURCE_UPVOTE",
      "RESOURCE_DOWNVOTE",
      "RESOURCE_COMMENT",
      "RESOURCE_REPORT_REVIEWED",
    ],
  },
  {
    value: "qa",
    label: "Q&A",
    icon: HelpCircle,
    types: ["QUESTION_ANSWER", "QUESTION_ACCEPTED"],
  },
  {
    value: "discussions",
    label: "Discussions",
    icon: MessageSquare,
    types: ["DISCUSSION_REPLY", "DISCUSSION_MENTION"],
  },
  {
    value: "events",
    label: "Events",
    icon: Calendar,
    types: ["EVENT_REMINDER"],
  },
  {
    value: "system",
    label: "System",
    icon: Settings,
    types: ["BADGE_UNLOCKED", "SYSTEM"],
  },
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

function getEmptyStateContent(tab: TabValue): {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
} {
  const states: Record<
    TabValue,
    {
      icon: React.ComponentType<{ className?: string }>;
      title: string;
      description: string;
    }
  > = {
    all: {
      icon: Bell,
      title: "No notifications yet",
      description:
        "When you receive notifications about connections, messages, or activity, they will appear here.",
    },
    messages: {
      icon: MessageCircle,
      title: "No message notifications",
      description:
        "When someone sends you a message or a message request, you will be notified here.",
    },
    connections: {
      icon: Users,
      title: "No connection notifications",
      description: "Connection requests and acceptances will show up here.",
    },
    teams: {
      icon: Trophy,
      title: "No team notifications",
      description: "Team applications and updates will be notified here.",
    },
    resources: {
      icon: BookOpen,
      title: "No resource notifications",
      description: "Upvotes, comments, and resource reviews will appear here.",
    },
    qa: {
      icon: HelpCircle,
      title: "No Q&A notifications",
      description:
        "Answers to your questions and accepted solutions will show up here.",
    },
    discussions: {
      icon: MessageSquare,
      title: "No discussion notifications",
      description: "Replies and mentions in discussions will appear here.",
    },
    events: {
      icon: Calendar,
      title: "No event notifications",
      description: "Event reminders and updates will be notified here.",
    },
    system: {
      icon: Settings,
      title: "No system notifications",
      description: "Badge unlocks and system announcements will show up here.",
    },
  };
  return states[tab];
}

export function NotificationsClient() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const {
    notifications,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    bulkMarkAsRead,
    bulkDelete,
    prependNotification,
  } = useNotifications();

  const { socket } = useSocket();
  const {
    count: unreadCount,
    decrement,
    refresh: refreshCount,
  } = useUnreadCount({ socket });

  // Listen for real-time notifications
  useSocketEvent(socket, "notification:new", (data) => {
    const notification = data as unknown as AppNotification;
    prependNotification(notification);
    toast.info(notification.title, {
      description: notification.message,
      duration: 4000,
    });
    setTimeout(() => refreshCount(), 500);
  });

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id);
      decrement(1);
    },
    [markAsRead, decrement],
  );

  const handleMarkAsUnread = useCallback(
    (id: string) => {
      markAsUnread(id);
      decrement(-1);
    },
    [markAsUnread, decrement],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const item = notifications.find((n) => n.id === id);
      if (item && !item.isRead) {
        decrement(1);
      }
      deleteNotification(id);
    },
    [notifications, deleteNotification, decrement],
  );

  const handleMarkAllAsRead = useCallback(() => {
    const unread = (notifications ?? []).filter((n) => !n.isRead).length;
    markAllAsRead();
    decrement(unread);
  }, [markAllAsRead, decrement, notifications]);

  // Refresh on mount
  useEffect(() => {
    refresh();
    refreshCount();
  }, [refresh, refreshCount]);

  // Filter by tab
  const filteredNotifications = (notifications ?? []).filter((n) => {
    if (activeTab === "all") return true;
    const tabConfig = TAB_CONFIG.find((t) => t.value === activeTab);
    return tabConfig?.types?.includes(n.type) ?? true;
  });

  // Selection handlers
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const filteredIds = filteredNotifications.map((n) => n.id);
    setSelectedIds(new Set(filteredIds));
  }, [filteredNotifications]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkMarkAsRead = useCallback(async () => {
    const ids = Array.from(selectedIds);
    const unreadCount = notifications.filter(
      (n) => ids.includes(n.id) && !n.isRead,
    ).length;
    await bulkMarkAsRead(ids);
    decrement(unreadCount);
    setSelectedIds(new Set());
    setSelectionMode(false);
    toast.success(`${ids.length} notification(s) marked as read`);
  }, [selectedIds, notifications, bulkMarkAsRead, decrement]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    const unreadCount = notifications.filter(
      (n) => ids.includes(n.id) && !n.isRead,
    ).length;
    await bulkDelete(ids);
    decrement(unreadCount);
    setSelectedIds(new Set());
    setSelectionMode(false);
    toast.success(`${ids.length} notification(s) deleted`);
  }, [selectedIds, notifications, bulkDelete, decrement]);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const unreadNotifications = filteredNotifications.filter((n) => !n.isRead);
  const readNotifications = filteredNotifications.filter((n) => n.isRead);
  const readGroups = groupByTime(readNotifications);

  const emptyState = getEmptyStateContent(activeTab);
  const EmptyIcon = emptyState.icon;
  const showInitialLoading = isLoading && notifications.length === 0;

  const allVisibleSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((n) => selectedIds.has(n.id));

  const selectionCount = selectedIds.size;

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-6 sm:px-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You are all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selectionMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={exitSelectionMode}
              >
                <X className="size-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              {unreadNotifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck className="size-4" />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Read all</span>
                </Button>
              )}
              {filteredNotifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setSelectionMode(true)}
                >
                  <SquareCheck className="size-4" />
                  <span className="hidden sm:inline">Select</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="mt-6"
      >
        <TabsList className="w-full justify-start gap-1 overflow-x-auto pb-1">
          {TAB_CONFIG.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 px-3 text-xs"
              >
                <TabIcon className="size-3.5" />
                {activeTab === tab.value && (
                  <span className="hidden sm:inline">{tab.label}</span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Selection mode: select all bar */}
      {selectionMode && filteredNotifications.length > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5">
          <Checkbox
            checked={allVisibleSelected}
            onCheckedChange={() =>
              allVisibleSelected ? handleDeselectAll() : handleSelectAll()
            }
          />
          <span className="text-sm text-muted-foreground">
            {selectionCount > 0
              ? `${selectionCount} selected`
              : `Select all (${filteredNotifications.length})`}
          </span>
          {selectionCount > 0 && (
            <button
              className="ml-auto text-xs text-primary hover:underline"
              onClick={handleDeselectAll}
            >
              Deselect all
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="mt-4">
        {showInitialLoading ? (
          <NotificationPageSkeleton />
        ) : filteredNotifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            role="status"
          >
            <div className="relative">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted/80">
                <EmptyIcon className="size-7 text-muted-foreground/50" />
              </div>
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">
              {emptyState.title}
            </h3>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground leading-relaxed">
              {emptyState.description}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Unread section */}
            {unreadNotifications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-1 pb-2 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Unread
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {unreadNotifications.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAsUnread={handleMarkAsUnread}
                      onDelete={handleDelete}
                      selectionMode={selectionMode}
                      isSelected={selectedIds.has(notification.id)}
                      onToggleSelect={handleToggleSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Read sections grouped by time */}
            {readGroups.map((group, groupIdx) => (
              <div key={group.label}>
                {unreadNotifications.length > 0 || groupIdx > 0 ? (
                  <div className="my-4 h-px bg-border/60" />
                ) : null}
                <div className="flex items-center gap-2 px-1 pb-2 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {group.notifications.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {group.notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAsUnread={handleMarkAsUnread}
                      onDelete={handleDelete}
                      selectionMode={selectionMode}
                      isSelected={selectedIds.has(notification.id)}
                      onToggleSelect={handleToggleSelect}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center py-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}

            {/* End of list */}
            {!hasMore && filteredNotifications.length > 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                You have reached the end
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating bulk action bar */}
      {selectionMode && selectionCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center gap-2 rounded-xl border bg-popover px-4 py-3 shadow-xl">
            <span className="text-sm font-medium whitespace-nowrap">
              {selectionCount} selected
            </span>
            <div className="mx-1 h-5 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleBulkMarkAsRead}
            >
              <Eye className="size-4" />
              <span className="hidden sm:inline">Mark read</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={handleBulkDelete}
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

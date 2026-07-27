"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useRecentNotifications } from "@/hooks/use-recent-notifications";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { NotificationDropdownItem } from "./notification-dropdown-item";
import { NotificationDropdownSkeleton } from "./notification-skeleton";
import ROUTES from "@/constants/routes";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activeConversationId = useMemo(() => {
    const match = pathname.match(/^\/messages\/([^/?]+)/);
    return match?.[1] ?? null;
  }, [pathname]);
  const {
    notifications,
    isLoading,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
  } = useRecentNotifications({ limit: 5 });
  const {
    count: unreadCount,
    decrement,
    refresh: refreshCount,
  } = useUnreadCount({ activeConversationId });

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
    const unreadInDropdown = notifications.filter((n) => !n.isRead).length;
    markAllAsRead();
    decrement(unreadInDropdown);
    refreshCount();
  }, [markAllAsRead, decrement, notifications, refreshCount]);

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white animate-in zoom-in-0 duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] sm:w-80 p-0 origin-top-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <Separator />

        {/* Notification list */}
        <ScrollArea className="h-[28rem] sm:h-80">
          {isLoading && notifications.length === 0 ? (
            <NotificationDropdownSkeleton />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative">
                <div className="flex size-14 items-center justify-center rounded-full bg-muted/80">
                  <Bell className="size-6 text-muted-foreground/60" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary/10">
                  <CheckCheck className="size-3 text-primary" />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                All caught up!
              </p>
              <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
                No new notifications. We&apos;ll let you know when something
                happens.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => (
                <NotificationDropdownItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAsUnread={handleMarkAsUnread}
                  onDelete={handleDelete}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="px-4 py-2.5">
          <Link
            href={ROUTES.NOTIFICATIONS}
            className="flex items-center justify-center gap-1.5 rounded-md py-1 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

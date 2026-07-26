"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
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
import ROUTES from "@/constants/routes";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useRecentNotifications({ limit: 5 });
  const { count: unreadCount, decrement, refresh: refreshCount } = useUnreadCount();

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id);
      decrement(1);
    },
    [markAsRead, decrement],
  );

  const handleMarkAllAsRead = useCallback(() => {
    const unreadInDropdown = notifications.filter((n) => !n.isRead).length;
    markAllAsRead();
    decrement(unreadInDropdown);
    refreshCount();
  }, [markAllAsRead, decrement, notifications, refreshCount]);

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
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {unreadCount} unread
              </span>
            )}
          </div>
          {notifications.some((n) => !n.isRead) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        <Separator />

        {/* Notification list */}
        <ScrollArea className="h-80">
          {isLoading && notifications.length === 0 ? (
            <div className="space-y-1 p-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5">
                  <div className="size-8 shrink-0 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Bell className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                No notifications yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                When you receive notifications, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationDropdownItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
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
            className="block text-center text-sm font-medium text-primary hover:underline"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

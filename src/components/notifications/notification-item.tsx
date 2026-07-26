"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  Notification,
  NotificationCategory,
} from "@/types/notification.types";
import {
  Bell,
  CheckCircle,
  MessageCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Users,
  Award,
  AlertCircle,
  Inbox,
  Eye,
  EyeOff,
  Trash2,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<Notification["type"], LucideIcon> = {
  CONNECTION_REQUEST: Users,
  CONNECTION_ACCEPTED: CheckCircle,
  MESSAGE: MessageCircle,
  MESSAGE_REQUEST: MessageSquare,
  RESOURCE_UPVOTE: ThumbsUp,
  RESOURCE_DOWNVOTE: ThumbsDown,
  RESOURCE_COMMENT: MessageSquare,
  RESOURCE_REPORT_REVIEWED: AlertCircle,
  DISCUSSION_REPLY: MessageSquare,
  DISCUSSION_MENTION: MessageSquare,
  QUESTION_ANSWER: FileText,
  QUESTION_ACCEPTED: CheckCircle,
  TEAM_APPLICATION: Users,
  TEAM_APPLICATION_ACCEPTED: CheckCircle,
  TEAM_APPLICATION_REJECTED: AlertCircle,
  EVENT_REMINDER: Bell,
  BADGE_UNLOCKED: Award,
  SYSTEM: Bell,
};

const COLOR_MAP: Record<Notification["type"], string> = {
  CONNECTION_REQUEST:
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  CONNECTION_ACCEPTED:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  MESSAGE:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  MESSAGE_REQUEST:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  RESOURCE_UPVOTE:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  RESOURCE_DOWNVOTE:
    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  RESOURCE_COMMENT:
    "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  RESOURCE_REPORT_REVIEWED:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  DISCUSSION_REPLY:
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  DISCUSSION_MENTION:
    "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  QUESTION_ANSWER:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  QUESTION_ACCEPTED:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  TEAM_APPLICATION:
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  TEAM_APPLICATION_ACCEPTED:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  TEAM_APPLICATION_REJECTED:
    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  EVENT_REMINDER:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  BADGE_UNLOCKED:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  SYSTEM: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  messages: "Message",
  connections: "Connection",
  teams: "Team",
  resources: "Resource",
  qa: "Q&A",
  discussions: "Discussion",
  events: "Event",
  system: "System",
};

const CATEGORY_BADGE_COLORS: Record<NotificationCategory, string> = {
  messages:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  connections:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  teams: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  resources:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  qa: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  discussions:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  events:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  system: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function getCategoryFromType(type: Notification["type"]): NotificationCategory {
  const map: Record<Notification["type"], NotificationCategory> = {
    MESSAGE: "messages",
    MESSAGE_REQUEST: "messages",
    CONNECTION_REQUEST: "connections",
    CONNECTION_ACCEPTED: "connections",
    TEAM_APPLICATION: "teams",
    TEAM_APPLICATION_ACCEPTED: "teams",
    TEAM_APPLICATION_REJECTED: "teams",
    RESOURCE_UPVOTE: "resources",
    RESOURCE_DOWNVOTE: "resources",
    RESOURCE_COMMENT: "resources",
    RESOURCE_REPORT_REVIEWED: "resources",
    QUESTION_ANSWER: "qa",
    QUESTION_ACCEPTED: "qa",
    DISCUSSION_REPLY: "discussions",
    DISCUSSION_MENTION: "discussions",
    EVENT_REMINDER: "events",
    BADGE_UNLOCKED: "system",
    SYSTEM: "system",
  };
  return map[type] ?? "system";
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false);
  const Icon = ICON_MAP[notification.type] || Inbox;
  const colorClass =
    COLOR_MAP[notification.type] || "bg-gray-100 text-gray-600";
  const category = getCategoryFromType(notification.type);
  const categoryLabel = CATEGORY_LABELS[category];
  const categoryBadgeColor = CATEGORY_BADGE_COLORS[category];

  const content = (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-all duration-200",
        notification.isRead
          ? "border-border/50 bg-background hover:border-border hover:bg-muted/30"
          : "border-primary/20 bg-primary/[0.03] hover:border-primary/30 hover:bg-primary/[0.06] dark:border-primary/15 dark:bg-primary/[0.05] dark:hover:border-primary/25 dark:hover:bg-primary/[0.08]",
        isSelected && "border-primary/40 bg-primary/[0.06] dark:bg-primary/[0.1]",
        notification.link && !selectionMode && "cursor-pointer",
      )}
      onClick={() => {
        if (selectionMode && onToggleSelect) {
          onToggleSelect(notification.id);
        } else if (!notification.isRead) {
          onMarkAsRead(notification.id);
        }
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Checkbox for selection mode */}
      {selectionMode && (
        <div className="flex shrink-0 items-center pt-0.5">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(notification.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Sender avatar or type icon */}
      {notification.sender ? (
        <div className="relative">
          <Avatar
            id={notification.sender.id}
            name={notification.sender.name}
            src={notification.sender.image}
            className="size-9"
          />
          {!notification.isRead && !selectionMode && (
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-primary" />
          )}
        </div>
      ) : (
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            colorClass,
          )}
        >
          <Icon className="size-4" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm",
              !notification.isRead && "font-semibold text-foreground",
              notification.isRead && "text-foreground/80",
            )}
          >
            {notification.title}
          </p>
          <Badge
            variant="secondary"
            className={cn(
              "hidden h-5 px-1.5 text-[10px] font-medium sm:inline-flex",
              categoryBadgeColor,
            )}
          >
            {categoryLabel}
          </Badge>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        {notification.metadata &&
          typeof notification.metadata === "object" &&
          "entityTitle" in notification.metadata && (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground">
              {(notification.metadata as { entityTitle: string }).entityTitle}
            </div>
          )}

        {/* Footer: timestamp + status + mobile actions */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <time className="text-xs text-muted-foreground/70">
              {formatRelativeTime(notification.createdAt)}
            </time>
            {!notification.isRead && !selectionMode && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Unread
              </span>
            )}
          </div>

          {/* Mobile action buttons — right-aligned footer */}
          {!selectionMode && (
            <div
              className="flex items-center gap-0.5 sm:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {notification.isRead ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  title="Mark as unread"
                  onClick={() => onMarkAsUnread?.(notification.id)}
                >
                  <EyeOff className="size-3.5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  title="Mark as read"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <Eye className="size-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  title="Delete notification"
                  onClick={() => onDelete(notification.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop hover actions */}
      {!selectionMode && showActions && (
        <div
          className="hidden sm:flex absolute right-3 top-3 items-center gap-0.5 rounded-lg border bg-popover p-0.5 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {notification.isRead ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              title="Mark as unread"
              onClick={() => onMarkAsUnread?.(notification.id)}
            >
              <EyeOff className="size-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              title="Mark as read"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Eye className="size-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              title="Delete notification"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (notification.link && !selectionMode) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

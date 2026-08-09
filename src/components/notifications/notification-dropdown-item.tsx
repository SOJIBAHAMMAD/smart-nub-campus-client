"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/types/notification.types";
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
  EyeOff,
  Trash2,
  Check,
  Handshake,
  CalendarDays,
  Target,
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
  MENTORSHIP_REQUEST_RECEIVED: Handshake,
  MENTORSHIP_REQUEST_UPDATED: Handshake,
  MENTORSHIP_ACCEPTED: Handshake,
  MENTORSHIP_SESSION_SCHEDULED: CalendarDays,
  MENTORSHIP_SESSION_UPDATED: CalendarDays,
  MENTORSHIP_GOAL_UPDATED: Target,
  MENTORSHIP_MESSAGE: MessageCircle,
  MENTORSHIP_COMPLETED: CheckCircle,
  MENTORSHIP_ENDED: Handshake,
  MENTORSHIP_REMINDER: Bell,
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
  MENTORSHIP_REQUEST_RECEIVED:
    "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  MENTORSHIP_REQUEST_UPDATED:
    "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  MENTORSHIP_ACCEPTED:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  MENTORSHIP_SESSION_SCHEDULED:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  MENTORSHIP_SESSION_UPDATED:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  MENTORSHIP_GOAL_UPDATED:
    "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  MENTORSHIP_MESSAGE:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  MENTORSHIP_COMPLETED:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  MENTORSHIP_ENDED:
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  MENTORSHIP_REMINDER:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
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

interface NotificationDropdownItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function NotificationDropdownItem({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onClose,
}: NotificationDropdownItemProps) {
  const [showActions, setShowActions] = useState(false);
  const Icon = ICON_MAP[notification.type] || Inbox;
  const colorClass =
    COLOR_MAP[notification.type] || "bg-gray-100 text-gray-600";

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClose();
  };

  const content = (
    <div
      className={cn(
        "group relative flex items-start gap-2.5 px-3 py-2.5 transition-all duration-200 cursor-pointer",
        notification.isRead
          ? "hover:bg-muted/60"
          : "bg-primary/[0.04] hover:bg-primary/[0.07] dark:bg-primary/[0.06] dark:hover:bg-primary/[0.1]",
      )}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Sender avatar or type icon */}
      {notification.sender ? (
        <div className="relative">
          <Avatar
            id={notification.sender.id}
            name={notification.sender.name}
            src={notification.sender.image}
            className="size-8"
          />
          {!notification.isRead && (
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-primary" />
          )}
        </div>
      ) : (
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            colorClass,
          )}
        >
          <Icon className="size-3.5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug line-clamp-1",
            !notification.isRead && "font-semibold text-foreground",
            notification.isRead && "text-muted-foreground",
          )}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
          {notification.message}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <time className="text-[11px] text-muted-foreground/70">
              {formatRelativeTime(notification.createdAt)}
            </time>
            {!notification.isRead && (
              <span className="text-[11px] font-medium text-primary">
                New
              </span>
            )}
          </div>

          {/* Mobile action buttons — right-aligned */}
          <div
            className="flex items-center gap-0.5 sm:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {notification.isRead ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                title="Mark as unread"
                onClick={() => onMarkAsUnread?.(notification.id)}
              >
                <EyeOff className="size-3" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                title="Mark as read"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <Check className="size-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-destructive hover:text-destructive"
                title="Delete"
                onClick={() => onDelete(notification.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop hover actions */}
      {showActions && (
        <div
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 rounded-md border bg-popover p-0.5 shadow-md"
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
              <Check className="size-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
              title="Delete"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block" onClick={onClose}>
        {content}
      </Link>
    );
  }

  return content;
}

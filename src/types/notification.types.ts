/**
 * Notification module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/notification.prisma
 */

// ── Core models ──────────────────────────────────────────────────────────────

export interface NotificationSender {
  id: string;
  name: string;
  image?: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  senderId?: string | null;
  sender?: NotificationSender | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

// ── Enums ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "CONNECTION_REQUEST"
  | "CONNECTION_ACCEPTED"
  | "MESSAGE"
  | "MESSAGE_REQUEST"
  | "RESOURCE_UPVOTE"
  | "RESOURCE_DOWNVOTE"
  | "RESOURCE_COMMENT"
  | "RESOURCE_REPORT_REVIEWED"
  | "DISCUSSION_REPLY"
  | "DISCUSSION_MENTION"
  | "QUESTION_ANSWER"
  | "QUESTION_ACCEPTED"
  | "TEAM_APPLICATION"
  | "TEAM_APPLICATION_ACCEPTED"
  | "TEAM_APPLICATION_REJECTED"
  | "EVENT_REMINDER"
  | "BADGE_UNLOCKED"
  | "SYSTEM";

// ── Notification type category mapping ───────────────────────────────────────

export type NotificationCategory =
  | "messages"
  | "connections"
  | "teams"
  | "resources"
  | "qa"
  | "discussions"
  | "events"
  | "system";

export const NOTIFICATION_CATEGORY_MAP: Record<NotificationType, NotificationCategory> = {
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

// ── API query / list types ───────────────────────────────────────────────────

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: import("./resource.types").PaginationMeta;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

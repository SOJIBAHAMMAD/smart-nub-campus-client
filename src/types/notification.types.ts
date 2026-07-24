/**
 * Notification module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/notification.prisma
 */

// ── Core models ──────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
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

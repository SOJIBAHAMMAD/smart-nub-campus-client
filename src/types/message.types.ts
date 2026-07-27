/**
 * Message module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/message.prisma
 */

import type { UserReference } from "./common.types";

// ── Shared references ────────────────────────────────────────────────────────

export type MessageSender = UserReference;

export interface ConversationUser extends UserReference {
  status?: string;
}

// ── Core models ──────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string | null;
  description?: string | null;
  groupImage?: string | null;
  creatorId?: string | null;
  creator?: ConversationUser;
  lastMessageAt?: string | null;
  conversationParticipants?: ConversationParticipant[];
  lastMessage?: Message | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user?: ConversationUser;
  lastReadAt?: string | null;
  isAdmin: boolean;
  isMuted: boolean;
  isPinned: boolean;
  joinedAt: string;
}

export interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export type MessageSendStatus = "sending" | "sent" | "failed";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: MessageSender;
  content: string;
  type: MessageType;
  fileUrl?: string | null;
  filePublicId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  isRead: boolean;
  readAt?: string | null;
  isEdited: boolean;
  editedAt?: string | null;
  isForwarded: boolean;
  forwardedFromId?: string | null;
  replyToId?: string | null;
  replyTo?: Message | null;
  reactions?: MessageReaction[];
  isDeleted: boolean;
  /** UI-only field for tracking optimistic send status. */
  status?: MessageSendStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MessageReadReceipt {
  messageId: string;
  readBy: string;
  readAt: string;
}

// ── Enums ────────────────────────────────────────────────────────────────────

export type ConversationType = "DIRECT" | "GROUP";

export type MessageType = "TEXT" | "FILE" | "IMAGE";

// ── API query / list types ───────────────────────────────────────────────────

export interface ListConversationsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
  before?: string;
  search?: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  meta: import("./resource.types").PaginationMeta;
}

export interface MessageListResponse {
  messages: Message[];
  meta: import("./resource.types").PaginationMeta;
}

// ── Extended UI types ────────────────────────────────────────────────────────

export interface ForwardMessagePayload {
  targetConversationId: string;
  messageId: string;
}

export interface ConversationSettingsUpdate {
  isPinned?: boolean;
  isMuted?: boolean;
}

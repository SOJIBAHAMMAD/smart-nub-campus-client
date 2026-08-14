import { apiClient } from "@/lib/api-client";
import { buildQueryString } from "@/lib/utils";
import type {
  Conversation,
  Message,
  MessageReaction,
  ListConversationsParams,
  ListMessagesParams,
  ConversationListResponse,
  MessageListResponse,
  ConversationSettingsUpdate,
} from "@/types/message.types";

function unwrap<T>(data: unknown): T {
  return ((data as { data?: T })?.data ?? (data as T)) as T;
}

/**
 * Browser-side wrapper around the Messages endpoints. Uses `apiClient`
 * (cookie-forwarding fetch) instead of the server-only `serverApi`, so it is
 * safe to import from client components.
 */
export const messageClientService = {
  async listConversations(
    params: ListConversationsParams = {},
  ): Promise<ConversationListResponse> {
    const query = buildQueryString(params);
    const res = await apiClient.get<ConversationListResponse>(
      `/messages/conversations${query}`,
    );
    const payload = unwrap<{ data?: Conversation[]; conversations?: Conversation[]; meta?: ConversationListResponse["meta"] }>(res.data);
    // Server returns { data, meta }; normalize to the client { conversations, meta } shape.
    return {
      conversations: payload.conversations ?? payload.data ?? [],
      meta: payload.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  async getConversationById(id: string): Promise<Conversation> {
    const res = await apiClient.get<Conversation>(`/messages/conversations/${id}`);
    return unwrap<Conversation>(res.data);
  },

  async createConversation(data: {
    participantId: string;
  }): Promise<Conversation> {
    const res = await apiClient.post<Conversation>("/messages/conversations", data);
    // Server returns a ConversationWithDetails shape (otherUser / lastMessage /
    // unreadCount) without `conversationParticipants`. Normalize it into the
    // client `Conversation` shape so the UI can render it consistently.
    const raw = unwrap<Record<string, unknown>>(res.data);
    const otherUser = raw.otherUser as
      | { id: string; name: string; image?: string | null }
      | null
      | undefined;
    const normalized: Conversation = {
      id: raw.id as string,
      type: (raw.type as Conversation["type"]) ?? "DIRECT",
      name: (raw.name as string | null) ?? null,
      description: (raw.description as string | null) ?? null,
      groupImage: (raw.groupImage as string | null) ?? null,
      creatorId: (raw.creatorId as string | null) ?? null,
      lastMessageAt: (raw.lastMessageAt as string | null) ?? null,
      createdAt: raw.createdAt as string,
      updatedAt: raw.updatedAt as string,
      conversationParticipants: otherUser
        ? [
            {
              id: `p-${otherUser.id}`,
              conversationId: raw.id as string,
              userId: otherUser.id,
              user: { id: otherUser.id, name: otherUser.name, image: otherUser.image },
              isAdmin: false,
              isMuted: false,
              isPinned: false,
              joinedAt: raw.createdAt as string,
            },
          ]
        : [],
      lastMessage: (raw.lastMessage as Conversation["lastMessage"]) ?? null,
      unreadCount: (raw.unreadCount as number) ?? 0,
    };
    return normalized;
  },

  async listMessages(params: ListMessagesParams): Promise<MessageListResponse> {
    const { conversationId, ...rest } = params;
    const query = buildQueryString(rest);
    const res = await apiClient.get<MessageListResponse>(
      `/messages/conversations/${conversationId}/messages${query}`,
    );
    const payload = unwrap<{ data?: Message[]; messages?: Message[]; meta?: MessageListResponse["meta"] }>(res.data);
    // Server returns { data, meta }; normalize to the client { messages, meta } shape.
    return {
      messages: payload.messages ?? payload.data ?? [],
      meta: payload.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  async sendMessage(
    conversationId: string,
    data: {
      content: string;
      type?: string;
      replyToId?: string;
      fileUrl?: string;
      filePublicId?: string;
      fileName?: string;
      fileSize?: number;
      isForwarded?: boolean;
      forwardedFromId?: string;
    },
  ): Promise<Message> {
    const res = await apiClient.post<Message>(
      `/messages/conversations/${conversationId}/messages`,
      data,
    );
    return unwrap<Message>(res.data);
  },

  async editMessage(
    conversationId: string,
    messageId: string,
    content: string,
  ): Promise<Message> {
    const res = await apiClient.put<Message>(
      `/messages/conversations/${conversationId}/messages/${messageId}`,
      { content },
    );
    return unwrap<Message>(res.data);
  },

  async deleteMessage(
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    await apiClient.del(
      `/messages/conversations/${conversationId}/messages/${messageId}`,
    );
  },

  async clearMessages(conversationId: string): Promise<{ count: number }> {
    const res = await apiClient.del<{ count: number }>(
      `/messages/conversations/${conversationId}/messages`,
    );
    return unwrap<{ count: number }>(res.data);
  },

  async addMembers(
    conversationId: string,
    participantIds: string[],
  ): Promise<void> {
    await apiClient.post(
      `/messages/groups/${conversationId}/members`,
      { participantIds },
    );
  },

  async addReaction(
    conversationId: string,
    messageId: string,
    emoji: string,
  ): Promise<MessageReaction> {
    const res = await apiClient.post<MessageReaction>(
      `/messages/conversations/${conversationId}/messages/${messageId}/reactions`,
      { emoji },
    );
    return unwrap<MessageReaction>(res.data);
  },

  async forwardMessage(
    sourceConversationId: string,
    targetConversationId: string,
    messageId: string,
  ): Promise<Message> {
    const res = await apiClient.post<Message>(
      `/messages/conversations/${sourceConversationId}/messages/forward`,
      { targetConversationId, messageId },
    );
    return unwrap<Message>(res.data);
  },

  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.post(`/messages/conversations/${conversationId}/read`, {});
  },

  async updateConversationSettings(
    conversationId: string,
    settings: ConversationSettingsUpdate,
  ): Promise<void> {
    await apiClient.put(
      `/messages/conversations/${conversationId}/settings`,
      settings,
    );
  },

  async createGroup(data: {
    name: string;
    participantIds: string[];
    description?: string;
  }): Promise<Conversation> {
    const res = await apiClient.post<Conversation>("/messages/groups", data);
    return unwrap<Conversation>(res.data);
  },
};

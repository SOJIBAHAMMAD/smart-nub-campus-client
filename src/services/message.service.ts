import serverApi from "@/lib/server-api";
import { buildQueryString } from "@/lib/utils";
import type {
  Conversation,
  Message,
  ListConversationsParams,
  ListMessagesParams,
  ConversationListResponse,
  MessageListResponse,
} from "@/types/message.types";

export const messageService = {
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await serverApi.get<{ unreadCount: number }>(
      "/messages/unread",
    );
    return response.data!;
  },

  async listConversations(
    params: ListConversationsParams = {},
  ): Promise<ConversationListResponse> {
    const query = buildQueryString(params);
    const response = await serverApi.get<ConversationListResponse>(
      `/messages/conversations${query}`,
      { tags: ["conversations-list"] },
    );
    const payload = response.data! as unknown as {
      data?: Conversation[];
      conversations?: Conversation[];
      meta?: ConversationListResponse["meta"];
    };
    return {
      conversations: payload.conversations ?? payload.data ?? [],
      meta: payload.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  async getConversationById(id: string): Promise<Conversation> {
    const response = await serverApi.get<Conversation>(
      `/messages/conversations/${id}`,
    );
    return response.data!;
  },

  async createConversation(data: {
    participantId: string;
    type?: "DIRECT" | "GROUP";
    name?: string;
  }): Promise<Conversation> {
    const response = await serverApi.post<Conversation>(
      "/messages/conversations",
      data,
    );
    return response.data!;
  },

  async createGroup(data: {
    name: string;
    participantIds: string[];
  }): Promise<Conversation> {
    const response = await serverApi.post<Conversation>(
      "/messages/groups",
      data,
    );
    return response.data!;
  },

  async updateGroup(id: string, data: { name?: string }): Promise<Conversation> {
    const response = await serverApi.put<Conversation>(
      `/messages/groups/${id}`,
      data,
    );
    return response.data!;
  },

  async addGroupMember(
    groupId: string,
    userId: string,
  ): Promise<Conversation> {
    const response = await serverApi.post<Conversation>(
      `/messages/groups/${groupId}/members`,
      { participantIds: [userId] },
    );
    return response.data!;
  },

  async removeGroupMember(
    groupId: string,
    memberId: string,
  ): Promise<void> {
    await serverApi.del(`/messages/groups/${groupId}/members/${memberId}`);
  },

  async leaveGroup(groupId: string): Promise<void> {
    await serverApi.post(`/messages/groups/${groupId}/leave`, {});
  },

  async listMessages(
    params: ListMessagesParams,
  ): Promise<MessageListResponse> {
    const { conversationId, ...rest } = params;
    const query = buildQueryString(rest);
    const response = await serverApi.get<MessageListResponse>(
      `/messages/conversations/${conversationId}/messages${query}`,
    );
    const payload = response.data! as unknown as {
      data?: Message[];
      messages?: Message[];
      meta?: MessageListResponse["meta"];
    };
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
    },
  ): Promise<Message> {
    const response = await serverApi.post<Message>(
      `/messages/conversations/${conversationId}/messages`,
      data,
    );
    return response.data!;
  },

  async markAsRead(conversationId: string): Promise<void> {
    await serverApi.post(
      `/messages/conversations/${conversationId}/read`,
      {},
    );
  },

  async getConversationUnread(
    conversationId: string,
  ): Promise<{ unreadCount: number }> {
    const response = await serverApi.get<{ unreadCount: number }>(
      `/messages/conversations/${conversationId}/unread`,
    );
    return response.data!;
  },
};

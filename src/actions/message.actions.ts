"use server";

import { messageService } from "@/services/message.service";
import type { ApiResponse } from "@/types";
import type { ListConversationsParams, ListMessagesParams } from "@/types/message.types";

/** List conversations. */
export async function listConversations(
  params: ListConversationsParams = {},
): Promise<ApiResponse> {
  try {
    const data = await messageService.listConversations(params);
    return { success: true, message: "Conversations fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch conversations.";
    return { success: false, message };
  }
}

/** Create a new conversation. */
export async function createConversation(data: {
  type?: "DIRECT" | "GROUP";
  name?: string;
  participantId: string;
}): Promise<ApiResponse> {
  try {
    const conversation = await messageService.createConversation(data);
    return {
      success: true,
      message: "Conversation created.",
      data: conversation,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create conversation.";
    return { success: false, message };
  }
}

/** List messages in a conversation. */
export async function listMessages(
  params: ListMessagesParams,
): Promise<ApiResponse> {
  try {
    const data = await messageService.listMessages(params);
    return { success: true, message: "Messages fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch messages.";
    return { success: false, message };
  }
}

/** Send a message in a conversation. */
export async function sendMessage(
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
): Promise<ApiResponse> {
  try {
    const message = await messageService.sendMessage(conversationId, data);
    return { success: true, message: "Message sent.", data: message };
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Failed to send message.";
    return { success: false, message: msg };
  }
}

/** Mark messages as read in a conversation. */
export async function markAsRead(
  conversationId: string,
): Promise<ApiResponse> {
  try {
    await messageService.markAsRead(conversationId);
    return { success: true, message: "Messages marked as read." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark as read.";
    return { success: false, message };
  }
}

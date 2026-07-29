"use server";

import { aiService } from "@/services/ai.service";
import type { ApiResponse } from "@/types";
import type { SendAIMessagePayload } from "@/types/ai.types";

/** List AI chat sessions. */
export async function listAISessions(
  page = 1,
  limit = 20,
): Promise<ApiResponse> {
  try {
    const data = await aiService.listSessions({ page, limit });
    return { success: true, message: "Sessions fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch sessions.";
    return { success: false, message };
  }
}

/** Get an AI session by ID. */
export async function getAISession(id: string): Promise<ApiResponse> {
  try {
    const data = await aiService.getSessionById(id);
    return { success: true, message: "Session fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch session.";
    return { success: false, message };
  }
}

/** Send a message to the AI assistant. */
export async function sendAIMessage(
  sessionId: string,
  payload: SendAIMessagePayload,
): Promise<ApiResponse> {
  try {
    const data = await aiService.sendMessage(sessionId, payload);
    return { success: true, message: "Message sent.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send message.";
    return { success: false, message };
  }
}

/** Delete an AI session. */
export async function deleteAISession(id: string): Promise<ApiResponse> {
  try {
    await aiService.deleteSession(id);
    return { success: true, message: "Session deleted." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete session.";
    return { success: false, message };
  }
}

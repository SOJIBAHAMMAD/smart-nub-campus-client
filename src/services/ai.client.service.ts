/* TODO(AI-PAGE): Known issues to revisit — Phase 18 AI Assistant page. See commit/notes: 1) New-chat URL uses /ai?chat=<id> via createNewSession; confirm this matches desired route (some wanted /ai/<uuid> path segment). 2) Chat history title updates from server on first message — verify it shows promptly. 3) Verify send retry-on-not-found and clean URL across refresh/back-forward. 4) Re-check right sidebar (AI Tools removed per request). */
import { apiClient } from "@/lib/api-client";
import { env } from "@/env";
import { buildQueryString } from "@/lib/utils";
import type {
  AIChatSession,
  SendAIMessagePayload,
  SendAIMessageResponse,
  ListAISessionsParams,
  AISessionListResponse,
} from "@/types/ai.types";

const API_URL = env.NEXT_PUBLIC_API_URL;

/** Thin client-side wrapper around the AI endpoints (browser context). */
export const aiClientService = {
  async createSession(data: { title?: string }): Promise<AIChatSession> {
    const res = await apiClient.post<AIChatSession>("/ai/sessions", data);
    // apiClient returns the server envelope { success, message, data }.
    return ((res.data as unknown) as { data: AIChatSession }).data;
  },

  async listSessions(
    params: ListAISessionsParams = {},
  ): Promise<AISessionListResponse> {
    const query = buildQueryString(params);
    const res = await apiClient.get<AISessionListResponse>(
      `/ai/sessions${query}`,
    );
    return ((res.data as unknown) as { data: AISessionListResponse }).data;
  },

  async getSessionById(id: string): Promise<AIChatSession> {
    const res = await apiClient.get<AIChatSession>(`/ai/sessions/${id}`);
    return ((res.data as unknown) as { data: AIChatSession }).data;
  },

  async getMessages(sessionId: string): Promise<unknown> {
    const res = await apiClient.get<unknown>(
      `/ai/sessions/${sessionId}/messages`,
    );
    return ((res.data as unknown) as { data: unknown }).data;
  },

  async sendMessage(
    sessionId: string,
    payload: SendAIMessagePayload,
  ): Promise<SendAIMessageResponse> {
    const res = await apiClient.post<SendAIMessageResponse>(
      `/ai/sessions/${sessionId}/messages`,
      payload,
    );
    return ((res.data as unknown) as { data: SendAIMessageResponse }).data;
  },

  async deleteSession(id: string): Promise<void> {
    await fetch(`${API_URL}/ai/sessions/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  },

  async markHelpful(messageId: string, isHelpful: boolean): Promise<void> {
    await fetch(`${API_URL}/ai/messages/${messageId}/helpful`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHelpful }),
    });
  },

  async getStudyStats(): Promise<unknown> {
    const res = await apiClient.get<unknown>("/ai/stats");
    return (res.data as { data: unknown }).data;
  },
};

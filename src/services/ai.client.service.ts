import { apiClient } from "@/lib/api-client";
import { env } from "@/env";
import { buildQueryString } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import type {
  AIChatSession,
  SendAIMessagePayload,
  SendAIMessageResponse,
  ListAISessionsParams,
  AISessionListResponse,
  StreamChunk,
  StreamChunkCallback,
  AIAttachment,
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

  async sendMessageStream(
    sessionId: string,
    payload: SendAIMessagePayload,
    onChunk: StreamChunkCallback,
    signal?: AbortSignal,
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/ai/sessions/${sessionId}/messages/stream`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
        signal,
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Stream request failed (${response.status}): ${text}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          onChunk({ type: "done" });
          return;
        }

        try {
          const chunk = JSON.parse(data) as StreamChunk;
          onChunk(chunk);
        } catch {
          // skip malformed chunks
        }
      }
    }
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

  async uploadAttachment(
    sessionId: string,
    file: File,
  ): Promise<AIAttachment> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.postForm<{ data: AIAttachment }>(
      `/ai/sessions/${sessionId}/attachments`,
      formData,
    );

    return res.data!.data;
  },
};

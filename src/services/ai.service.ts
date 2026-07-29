import serverApi from "@/lib/server-api";
import { buildQueryString } from "@/lib/utils";
import type {
  AIChatSession,
  SendAIMessagePayload,
  SendAIMessageResponse,
  ListAISessionsParams,
  AISessionListResponse,
  AIMessage,
  AIStudyStats,
} from "@/types/ai.types";
import type { PaginationMeta } from "@/types/resource.types";

export const aiService = {
  async createSession(data: { title?: string }): Promise<AIChatSession> {
    const response = await serverApi.post<AIChatSession>(
      "/ai/sessions",
      data,
    );
    return response.data!;
  },

  async listSessions(
    params: ListAISessionsParams = {},
  ): Promise<AISessionListResponse> {
    const query = buildQueryString(params);
    const response = await serverApi.get<AISessionListResponse>(
      `/ai/sessions${query}`,
      { tags: ["ai-sessions"] },
    );
    return response.data!;
  },

  async getSessionById(id: string): Promise<AIChatSession> {
    const response = await serverApi.get<AIChatSession>(
      `/ai/sessions/${id}`,
    );
    return response.data!;
  },

  async getMessages(sessionId: string): Promise<{ data: AIMessage[]; meta: PaginationMeta }> {
    const response = await serverApi.get<{ data: AIMessage[]; meta: PaginationMeta }>(
      `/ai/sessions/${sessionId}/messages`,
    );
    return response.data!;
  },

  async sendMessage(
    sessionId: string,
    payload: SendAIMessagePayload,
  ): Promise<SendAIMessageResponse> {
    const response = await serverApi.post<SendAIMessageResponse>(
      `/ai/sessions/${sessionId}/messages`,
      payload,
    );
    return response.data!;
  },

  async deleteSession(id: string): Promise<void> {
    await serverApi.del(`/ai/sessions/${id}`);
  },

  async markHelpful(messageId: string, isHelpful: boolean): Promise<void> {
    await serverApi.patch(`/ai/messages/${messageId}/helpful`, {
      isHelpful,
    });
  },

  async getStudyStats(): Promise<AIStudyStats> {
    const response = await serverApi.get<AIStudyStats>("/ai/stats");
    return response.data!;
  },

  async getStudyStatsHistory(): Promise<AIStudyStats[]> {
    const response = await serverApi.get<AIStudyStats[]>("/ai/stats/history");
    return response.data!;
  },

  async summarizePdf(data: { fileUrl: string }): Promise<unknown> {
    const response = await serverApi.post<unknown>(
      "/ai/tools/summarize-pdf",
      data,
    );
    return response.data!;
  },

  async generateQuiz(data: {
    content: string;
    numQuestions?: number;
  }): Promise<unknown> {
    const response = await serverApi.post<unknown>(
      "/ai/tools/generate-quiz",
      data,
    );
    return response.data!;
  },

  async generateFlashcards(data: {
    content: string;
    numCards?: number;
  }): Promise<unknown> {
    const response = await serverApi.post<unknown>(
      "/ai/tools/generate-flashcards",
      data,
    );
    return response.data!;
  },

  async explainCode(data: { code: string; language?: string }): Promise<unknown> {
    const response = await serverApi.post<unknown>(
      "/ai/tools/explain-code",
      data,
    );
    return response.data!;
  },
};

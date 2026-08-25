/**
 * AI Assistant module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/ai.prisma
 */

// ── Core models ──────────────────────────────────────────────────────────────

export interface AIChatSession {
  id: string;
  userId: string;
  title?: string | null;
  aiMessages?: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  sessionId: string;
  role: AIMessageRole;
  content: string;
  isHelpful?: boolean | null;
  attachments?: AIAttachment[];
  createdAt: string;
}

export interface AIAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  createdAt: string;
}

export interface AIStudyStats {
  id: string;
  userId: string;
  weekStart: string;
  questionsAsked: number;
  timeSpentMinutes: number;
  topicsExplored: number;
  quizzesGenerated: number;
  createdAt: string;
  updatedAt: string;
}

// ── Enums ────────────────────────────────────────────────────────────────────

export type AIMessageRole = "USER" | "ASSISTANT";

// ── API types ────────────────────────────────────────────────────────────────

export interface SendAIMessagePayload {
  sessionId?: string;
  content: string;
  attachmentIds?: string[];
}

export interface SendAIMessageResponse {
  userMessage: AIMessage;
  aiMessage: AIMessage;
}

export interface ListAISessionsParams {
  page?: number;
  limit?: number;
}

export interface AISessionListResponse {
  sessions: AIChatSession[];
  meta: import("./resource.types").PaginationMeta;
}

// ── Streaming types ──────────────────────────────────────────────────────────

export interface StreamChunk {
  type: "text" | "reasoning" | "tool_start" | "tool_end" | "error" | "done";
  content?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
}

export type StreamChunkCallback = (chunk: StreamChunk) => void;

/**
 * Q&A module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/qa.prisma
 */

import type { Tag } from "./resource.types";
import type { UserReferenceWithEmail, CategoryBase } from "./common.types";

// ── Shared references ────────────────────────────────────────────────────────

export interface QuestionAuthor extends UserReferenceWithEmail {
  reputation?: number;
}

// ── Core models ──────────────────────────────────────────────────────────────

export type QuestionCategory = CategoryBase;

export interface Question {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  category?: QuestionCategory;
  authorId: string;
  author?: QuestionAuthor;
  courseId?: string | null;
  course?: { id: string; code: string; name: string } | null;
  upvoteCount: number;
  answerCount: number;
  viewCount: number;
  isAnswered: boolean;
  isClosed: boolean;
  questionTags?: QuestionTag[];
  answers?: Answer[];
  userVote?: "UP" | "DOWN" | null;
  isBookmarked?: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  content: string;
  questionId: string;
  authorId: string;
  author?: QuestionAuthor;
  upvoteCount: number;
  isAccepted: boolean;
  answerVotes?: AnswerVote[];
  userVote?: "UP" | "DOWN" | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionVote {
  id: string;
  questionId: string;
  userId: string;
  type: "UP" | "DOWN";
  createdAt: string;
}

export interface AnswerVote {
  id: string;
  answerId: string;
  userId: string;
  type: "UP" | "DOWN";
  createdAt: string;
}

export interface QuestionTag {
  id: string;
  questionId: string;
  tagId: string;
  tag?: Tag;
  createdAt: string;
}

export interface QuestionBookmark {
  id: string;
  questionId: string;
  userId: string;
  createdAt: string;
}

// ── API query / list types ───────────────────────────────────────────────────

export type QASort = "latest" | "trending" | "most_answered" | "unanswered";

export interface ListQuestionsParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  answered?: "true" | "false" | null;
  /** Maps to server `answered` + `sort`. */
  sort?: QASort;
}

export interface QuestionListResponse {
  data: Question[];
  meta: import("./resource.types").PaginationMeta;
}

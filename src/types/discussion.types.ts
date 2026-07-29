/**
 * Discussion module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/discussion.prisma
 */

import type { Tag } from "./resource.types";
import type { UserReferenceWithEmail, CategoryBase } from "./common.types";

// ── Shared references ────────────────────────────────────────────────────────

export type DiscussionAuthor = UserReferenceWithEmail;

// ── Core models ──────────────────────────────────────────────────────────────

export type DiscussionCategory = CategoryBase;

export interface Discussion {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  category?: DiscussionCategory;
  authorId: string;
  author?: DiscussionAuthor;
  courseId?: string | null;
  course?: { id: string; code: string; name: string } | null;
  solutionReplyId?: string | null;
  replyCount: number;
  viewCount: number;
  upvoteCount: number;
  visibility: DiscussionVisibility;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  discussionTags?: DiscussionTag[];
  discussionReplies?: DiscussionReply[];
  isDeleted: boolean;
  userVote?: "UP" | "DOWN" | null;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  content: string;
  discussionId: string;
  authorId: string;
  author?: DiscussionAuthor;
  parentId?: string | null;
  replies?: DiscussionReply[];
  upvoteCount: number;
  userVote?: "UP" | "DOWN" | null;
  isEdited: boolean;
  isDeleted: boolean;
  isAccepted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionVote {
  id: string;
  discussionId: string;
  userId: string;
  type: import("./resource.types").VoteType;
  createdAt: string;
}

export interface DiscussionReplyVote {
  id: string;
  replyId: string;
  userId: string;
  type: import("./resource.types").VoteType;
  createdAt: string;
}

export interface DiscussionTag {
  id: string;
  discussionId: string;
  tagId: string;
  tag?: Tag;
  createdAt: string;
}

export interface DiscussionBookmark {
  id: string;
  discussionId: string;
  userId: string;
  createdAt: string;
}

// ── Enums ────────────────────────────────────────────────────────────────────

export type DiscussionVisibility = "PUBLIC" | "DEPARTMENT" | "BATCH";

// ── API query / list types ───────────────────────────────────────────────────

export interface ListDiscussionsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  /** Category slug (used by the client list filtering). */
  category?: string;
  courseId?: string;
  search?: string;
  visibility?: DiscussionVisibility;
  sortBy?: "createdAt" | "upvoteCount" | "replyCount" | "viewCount";
  sortOrder?: "asc" | "desc";
  /** Tag slug (used by the client list filtering). */
  tag?: string;
  /** Client-side sort alias accepted by the list endpoint. */
  sort?: "latest" | "popular" | "unanswered";
}

export interface DiscussionListResponse {
  data: Discussion[];
  meta: import("./resource.types").PaginationMeta;
}

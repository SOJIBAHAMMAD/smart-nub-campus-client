/**
 * Resource module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/resource.prisma
 */

import type { UserReferenceWithEmail, CategoryBase } from "./common.types";

// ── Shared references ────────────────────────────────────────────────────────

/** Minimal course reference embedded in resource responses. */
export interface ResourceCourse {
  id: string;
  code: string;
  name: string;
  department: string;
}

/** Minimal uploader (User) reference. */
export type ResourceUploader = UserReferenceWithEmail;

// ── Core models ──────────────────────────────────────────────────────────────

export interface ResourceCategory extends CategoryBase {
  description?: string | null;
}

export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  filePublicId?: string | null;
  fileType: string;
  fileSize: number;
  courseId: string;
  course?: ResourceCourse;
  categoryId: string;
  category?: ResourceCategory;
  uploaderId: string;
  uploader?: ResourceUploader;
  upvoteCount: number;
  downvoteCount: number;
  downloadCount: number;
  viewCount: number;
  reportCount: number;
  isVerified: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  resourceTags?: ResourceTag[];
  comments?: Comment[];
  userVote?: VoteType | null;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceTag {
  id: string;
  resourceId: string;
  tagId: string;
  tag?: Tag;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface ResourceVote {
  id: string;
  resourceId: string;
  userId: string;
  type: VoteType;
  createdAt: string;
}

export interface ResourceReport {
  id: string;
  resourceId: string;
  userId: string;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface ResourceBookmark {
  id: string;
  resourceId: string;
  userId: string;
  createdAt: string;
}

export interface ResourceDownload {
  id: string;
  resourceId: string;
  userId: string;
  downloadedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  resourceId: string;
  userId: string;
  user?: ResourceUploader;
  parentId?: string | null;
  replies?: Comment[];
  upvoteCount: number;
  downvoteCount: number;
  userVote?: VoteType | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Enums ────────────────────────────────────────────────────────────────────

export type VoteType = "UP" | "DOWN";

export type ReportReason =
  | "SPAM"
  | "COPYRIGHT"
  | "OFFENSIVE_CONTENT"
  | "DUPLICATE"
  | "WRONG_CATEGORY"
  | "BROKEN_FILE"
  | "MALWARE"
  | "OTHER";

export type ReportStatus = "PENDING" | "REVIEWED" | "DISMISSED" | "ACTION_TAKEN";

// ── API query / list types ───────────────────────────────────────────────────

export interface ListResourcesParams {
  page?: number;
  limit?: number;
  courseId?: string;
  categoryId?: string;
  search?: string;
  sort?: "newest" | "popular" | "downloads";
  tag?: string | string[];
  tab?: "bookmarks" | "uploads";
}

export interface ResourceListResponse {
  data: Resource[];
  meta: PaginationMeta;
}

// ── Shared pagination meta ───────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

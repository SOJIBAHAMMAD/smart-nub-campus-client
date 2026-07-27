/**
 * Team module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/team.prisma
 */

import type { Tag } from "./resource.types";
import type { UserReferenceWithEmail } from "./common.types";

// ── Shared references ────────────────────────────────────────────────────────

export type TeamCreator = UserReferenceWithEmail;
export type TeamApplicant = UserReferenceWithEmail;

// ── Enums ────────────────────────────────────────────────────────────────────

export type TeamRequestStatus = "OPEN" | "FILLED" | "CLOSED";

export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export type TeamMemberRole = "LEADER" | "MEMBER";

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type MeetingPreference = "ONLINE" | "IN_PERSON" | "HYBRID" | "FLEXIBLE";

// ── Core models ──────────────────────────────────────────────────────────────

export interface TeamRequest {
  id: string;
  title: string;
  description: string;
  lookingForCount: number;
  currentMemberCount: number;
  projectName?: string | null;
  deadline?: string | null;
  status: TeamRequestStatus;
  creatorId: string;
  creator?: TeamCreator;
  category?: string | null;
  difficulty?: Difficulty | null;
  meetingPreference: MeetingPreference;
  contactInfo?: string | null;
  viewCount: number;
  bookmarkCount: number;
  isBookmarked?: boolean;
  hasApplied?: boolean;
  teamRequestSkills?: TeamRequestSkill[];
  teamApplications?: TeamApplication[];
  teamMembers?: TeamMember[];
  /** Application count for this request (included by list endpoint). */
  _count?: { teamApplications: number; teamMembers: number };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamRequestSkill {
  id: string;
  teamRequestId: string;
  tagId: string;
  tag?: Tag;
  createdAt: string;
}

export interface TeamApplication {
  id: string;
  teamRequestId: string;
  applicantId: string;
  applicant?: TeamApplicant;
  teamRequest?: TeamRequest;
  message?: string | null;
  status: ApplicationStatus;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamRequestId: string;
  userId: string;
  user?: TeamCreator;
  role: TeamMemberRole;
  joinedAt: string;
}

export interface TeamBookmark {
  id: string;
  teamRequestId: string;
  userId: string;
  createdAt: string;
}

export interface TeamCategoryCount {
  category: string;
  count: number;
}

export interface TeamPopularSkill {
  tagId: string;
  name: string;
  count: number;
}

// ── API query / list types ───────────────────────────────────────────────────

export interface ListTeamRequestsParams {
  page?: number;
  limit?: number;
  status?: TeamRequestStatus;
  category?: string;
  difficulty?: Difficulty;
  meetingPreference?: MeetingPreference;
  /** Skill tag slug. */
  skill?: string;
  search?: string;
  sort?: "newest" | "deadline" | "applications";
  /** When true, excludes the current user's own requests. */
  excludeOwn?: boolean;
  /** When true, only returns bookmarked teams. */
  bookmarked?: boolean;
}

export interface TeamRequestListResponse {
  data: TeamRequest[];
  meta: import("./resource.types").PaginationMeta;
}

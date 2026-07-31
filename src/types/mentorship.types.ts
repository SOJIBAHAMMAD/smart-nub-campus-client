/**
 * Mentorship module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/mentorship.prisma
 */

import type { ApplicationStatus } from "@/constants/enums";
import type { PaginationMeta } from "./resource.types";

// ── Core models ──────────────────────────────────────────────────────────────

export interface Mentor {
  id: string;
  name: string;
  image: string | null;
  profile: {
    jobTitle: string | null;
    currentEmployer: string | null;
    industry: string | null;
    mentorshipTopics: string[];
    batchYear: number | null;
    location: string | null;
  } | null;
  student: {
    department: string | null;
    graduationYear: number | null;
    degreeTitle: string | null;
  } | null;
  stats: {
    connectionCount: number;
  };
}

export interface MentorshipRequestUser {
  id: string;
  name: string;
  image: string | null;
}

export interface MentorshipRequestParty extends MentorshipRequestUser {
  profile: {
    jobTitle: string | null;
    currentEmployer: string | null;
  } | null;
  student: {
    department: string | null;
    admissionYear: number | null;
    admissionSemester: string | null;
  } | null;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  topic: string | null;
  message: string | null;
  status: ApplicationStatus;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  mentor: MentorshipRequestParty;
  mentee: MentorshipRequestParty;
}

// ── API query / list types ───────────────────────────────────────────────────

export interface ListMentorsParams {
  page?: number;
  limit?: number;
  department?: string;
  industry?: string;
  topic?: string;
}

export interface MentorListResponse {
  data: Mentor[];
  meta: PaginationMeta;
}

export interface ListMentorshipRequestsParams {
  role: "mentor" | "mentee";
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}

export interface MentorshipRequestListResponse {
  data: MentorshipRequest[];
  meta: PaginationMeta;
}

// ── Mutation inputs ──────────────────────────────────────────────────────────

export interface CreateMentorshipRequestPayload {
  mentorId: string;
  topic?: string;
  message?: string;
}

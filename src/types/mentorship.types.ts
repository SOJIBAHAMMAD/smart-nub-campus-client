/**
 * Mentorship module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/alumni.prisma
 */

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
    mentorHeadline: string | null;
    mentorBio: string | null;
    mentorAvailability: string | null;
    mentorCadence: string | null;
    mentorMeetingFormat: string | null;
    mentorMaxMentees: number;
  } | null;
  student: {
    department: string | null;
    graduationYear: number | null;
    degreeTitle: string | null;
  } | null;
  stats: {
    connectionCount: number;
    maxMentees: number;
    committedSlots: number;
    slotsAvailable: number;
  };
  rating: {
    average: number | null;
    count: number;
  };
  matchScore: number;
  bestMatchTopic: string | null;
  /**
   * The viewer's relationship with this mentor: their own card ("self"),
   * an existing ACTIVE mentorship ("active"), an in-flight request
   * ("pending"), or no relationship ("none").
   */
  relationshipState?: "self" | "active" | "pending" | "none";
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
  goals: string[];
  status: string;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  mentor: MentorshipRequestParty;
  mentee: MentorshipRequestParty;
}

export interface MentorshipParty {
  id: string;
  name: string;
  image: string | null;
  profile: {
    jobTitle: string | null;
    currentEmployer: string | null;
    location: string | null;
  } | null;
  student: {
    department: string | null;
    admissionYear: number | null;
  } | null;
}

export interface MentorshipGoal {
  id: string;
  mentorshipId: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipSession {
  id: string;
  mentorshipId: string;
  scheduledAt: string;
  durationMinutes: number | null;
  format: string;
  location: string | null;
  agenda: string | null;
  notes: string | null;
  actionItems: string | null;
  status: string;
  completedAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipMessageSender {
  id: string;
  name: string;
  image: string | null;
}

export interface MentorshipMessage {
  id: string;
  mentorshipId: string;
  senderId: string;
  sender: MentorshipMessageSender;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mentorship {
  id: string;
  requestId: string;
  mentorId: string;
  menteeId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  lastActivityAt: string;
  mentorRating: number | null;
  menteeRating: number | null;
  mentorFeedback: string | null;
  menteeFeedback: string | null;
  createdAt: string;
  updatedAt: string;
  request: {
    topic: string | null;
    message: string | null;
    goals: string[];
    createdAt: string;
  };
  mentor: MentorshipParty;
  mentee: MentorshipParty;
  goals: MentorshipGoal[];
  sessions: MentorshipSession[];
  _count: { messages: number };
  role: "mentor" | "mentee";
  other: MentorshipParty;
  stats: {
    goalCount: number;
    completedGoalCount: number;
    sessionCount: number;
    completedSessionCount: number;
    daysSinceLastActivity: number;
    upcomingSession: {
      id: string;
      scheduledAt: string;
      format: string;
      location: string | null;
    } | null;
  };
}

export interface MentorshipMessageList {
  data: MentorshipMessage[];
}

// ── API query / list types ───────────────────────────────────────────────────

export interface ListMentorsParams {
  page?: number;
  limit?: number;
  department?: string;
  industry?: string;
  topic?: string;
  sort?: "relevance" | "name";
}

export interface MentorListResponse {
  data: Mentor[];
  meta: PaginationMeta;
}

export interface ListMentorshipRequestsParams {
  role: "mentor" | "mentee";
  status?: string;
  page?: number;
  limit?: number;
}

export interface MentorshipRequestListResponse {
  data: MentorshipRequest[];
  meta: PaginationMeta;
}

export interface ListMentorshipsParams {
  status?: "ACTIVE" | "COMPLETED" | "ENDED";
  page?: number;
  limit?: number;
}

export interface MentorshipListResponse {
  data: Mentorship[];
  meta: PaginationMeta;
}

// ── Mutation inputs ──────────────────────────────────────────────────────────

export interface CreateMentorshipRequestPayload {
  mentorId: string;
  topic?: string;
  message?: string;
  goals: string[];
}

export interface CreateMentorshipGoalPayload {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateMentorshipGoalPayload {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  status?: string;
}

export interface CreateMentorshipSessionPayload {
  scheduledAt: string;
  durationMinutes?: number;
  format?: string;
  location?: string;
  agenda?: string;
}

export interface UpdateMentorshipSessionPayload {
  scheduledAt?: string;
  durationMinutes?: number;
  format?: string;
  location?: string | null;
  agenda?: string | null;
  notes?: string | null;
  actionItems?: string | null;
  status?: string;
}

export interface SendMentorshipMessagePayload {
  body: string;
}

export interface CompleteMentorshipPayload {
  feedback?: string;
}

export interface RateMentorPayload {
  rating: number;
  feedback?: string;
}

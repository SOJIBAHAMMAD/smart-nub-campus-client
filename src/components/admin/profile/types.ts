import { format } from "date-fns";

/**
 * Shared types + helpers for the admin profile feature.
 * Mirror the payload returned by `GET /identity/me`
 * (server: src/app/module/identity/identity.service.ts `me`).
 */

export interface AdminProfileUser {
  id: string;
  name: string;
  email: string;
  role: string;
  gender: string | null;
  image: string | null;
  emailVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfileAdmin {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  department: string | null;
  designation: string | null;
  employeeId: string | null;
  joinedAt: string;
}

export interface AdminProfileProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  bio: string | null;
  coverImage: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  phoneNumber: string | null;
  currentSemester: number | null;
  batchYear: number | null;
  currentEmployer: string | null;
  jobTitle: string | null;
  industry: string | null;
  showInAlumniDirectory: boolean;
  isMentor: boolean;
  mentorshipTopics: string[];
  mentorHeadline: string | null;
  mentorBio: string | null;
  mentorAvailability: string | null;
  mentorCadence: string | null;
  mentorMeetingFormat: string | null;
  mentorMaxMentees: number;
}

export interface AdminProfileMe {
  user: AdminProfileUser;
  student: Record<string, unknown> | null;
  admin: AdminProfileAdmin | null;
  profile: AdminProfileProfile | null;
}

/**
 * Payload for `PATCH /identity/profile`. Every key exists in the server's
 * `updateProfileSchema` (identity.validation.ts) — only the subset that makes
 * sense for an admin's "about/contact" profile is editable here.
 */
export interface AdminProfileUpdatePayload {
  bio?: string;
  location?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

/** Format an ISO date string; falls back to "—" when missing/invalid. */
export function formatDate(value?: string | null, pattern = "MMM d, yyyy"): string {
  if (!value) return "—";
  try {
    return format(new Date(value), pattern);
  } catch {
    return "—";
  }
}

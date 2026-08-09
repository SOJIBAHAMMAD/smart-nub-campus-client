// ── Profile ─────────────────────────────────────────────────────────────────

import type { BadgeCategory, BadgeTier } from "@/types/gamification.types";

export interface UserProfile {
  id: string;
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
  // ── Career profile (Alumni feature) ──────────────────────────────────────
  currentEmployer: string | null;
  jobTitle: string | null;
  industry: string | null;
  showInAlumniDirectory: boolean;
  isMentor: boolean;
  mentorshipTopics: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSkill {
  id: string;
  name: string;
  userSkillId: string;
}

export interface ProfileBadge {
  id: string;
  unlockedAt: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string | null;
    category: BadgeCategory;
    tier: BadgeTier;
    points: number;
  };
}

export interface ProfileStats {
  totalPoints: number;
  connectionCount: number;
}

export interface ProfileContentCounts {
  resources: number;
  discussions: number;
  questions: number;
}

export interface ProfileBadgesSummary {
  items: ProfileBadge[];
  total: number;
}

export interface ProfileUser {
  id: string;
  name: string;
  image: string | null;
  createdAt: string;
  gender: string | null;
  student: {
    studentId: string;
    department: string;
    admissionYear: number;
    admissionSemester: string;
  } | null;
  profile: UserProfile | null;
  skills?: ProfileSkill[];
  stats?: ProfileStats;
  badges?: ProfileBadgesSummary;
  contentCounts?: ProfileContentCounts;
}

export interface UpdateProfilePayload {
  bio?: string;
  coverImage?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
  location?: string;
  phoneNumber?: string;
  currentSemester?: number;
  batchYear?: number;
  image?: string;
  // ── Career profile (Alumni feature) ──────────────────────────────────────
  currentEmployer?: string;
  jobTitle?: string;
  industry?: string;
  showInAlumniDirectory?: boolean;
  isMentor?: boolean;
  mentorshipTopics?: string[];
}

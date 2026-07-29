/**
 * Gamification module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/gamification.prisma
 */

// ── Core models ──────────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string | null;
  category: BadgeCategory;
  tier: BadgeTier;
  points: number;
  condition: string;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge?: Badge;
  unlockedAt: string;
}

export interface ReputationPoint {
  id: string;
  userId: string;
  points: number;
  reason: string;
  source?: string | null;
  event: ReputationEvent;
  createdAt: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  image?: string | null;
}

export interface Leaderboard {
  rank: number;
  user: LeaderboardUser | null;
  totalPoints: number;
}

// ── Enums ────────────────────────────────────────────────────────────────────

export type BadgeCategory =
  | "ACADEMIC"
  | "COMMUNITY"
  | "CONTRIBUTION"
  | "NETWORKING"
  | "MILESTONES"
  | "REPUTATION";

export type BadgeTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export type ReputationEvent =
  | "RESOURCE_UPLOADED"
  | "RESOURCE_UPVOTED_received"
  | "DISCUSSION_CREATED"
  | "DISCUSSION_UPVOTED_received"
  | "QUESTION_ASKED"
  | "QUESTION_UPVOTED_received"
  | "ANSWER_UPVOTED_received"
  | "ANSWER_ACCEPTED"
  | "REPLY_POSTED"
  | "PROFILE_COMPLETED"
  | "BADGE_UNLOCKED"
  | "RESOURCE_DOWNVOTED_received"
  | "RESOURCE_DOWNVOTED_given"
  | "DISCUSSION_DOWNVOTED_received"
  | "QUESTION_DOWNVOTED_received"
  | "ANSWER_DOWNVOTED_received"
  | "ANSWER_UNACCEPTED"
  | "CONTENT_REMOVED"
  | "ADMIN_ADJUSTMENT"
  | "VOTE_REVERSAL";

// ── API query / list types ───────────────────────────────────────────────────

export interface LeaderboardResponse {
  data: Leaderboard[];
  meta: import("./resource.types").PaginationMeta;
}

/**
 * Enum constants mirroring backend Prisma enums exactly.
 * Single source of truth — never hardcode these strings.
 */

export const OnboardingStepValue = {
  VERIFICATION_FORM: "VERIFICATION_FORM",
  ADMIN_REVIEW: "ADMIN_REVIEW",
  ACCOUNT_CREATION: "ACCOUNT_CREATION",
  VERIFY_EMAIL: "VERIFY_EMAIL",
  COMPLETED: "COMPLETED",
} as const;

export type OnboardingStepValue =
  (typeof OnboardingStepValue)[keyof typeof OnboardingStepValue];

export const VerificationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const UserRole = {
  STUDENT: "STUDENT",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  BANNED: "BANNED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const AdmissionSemester = {
  SPRING: "SPRING",
  SUMMER: "SUMMER",
  FALL: "FALL",
} as const;

export type AdmissionSemester =
  (typeof AdmissionSemester)[keyof typeof AdmissionSemester];

export const Department = {
  CSE: "CSE",
  ECSE: "ECSE",
  EEE: "EEE",
  EEEE: "EEEE",
  BBA: "BBA",
  MBA: "MBA",
  ENGLISH: "ENGLISH",
  MAE: "MAE",
  BANGLA: "BANGLA",
  MAB: "MAB",
  LLB: "LLB",
  MPH: "MPH",
  BPH: "BPH",
  ME: "ME",
  CIVIL: "CIVIL",
  BTX: "BTX",
  EBTX: "EBTX",
} as const;

export type Department = (typeof Department)[keyof typeof Department];

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
  PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

// ── Team enums ───────────────────────────────────────────────────────────────

export const TeamRequestStatus = {
  OPEN: "OPEN",
  FILLED: "FILLED",
  CLOSED: "CLOSED",
} as const;

export type TeamRequestStatus =
  (typeof TeamRequestStatus)[keyof typeof TeamRequestStatus];

export const ApplicationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const TeamMemberRole = {
  LEADER: "LEADER",
  MEMBER: "MEMBER",
} as const;

export type TeamMemberRole =
  (typeof TeamMemberRole)[keyof typeof TeamMemberRole];

// ── Vote enums ───────────────────────────────────────────────────────────────

export const VoteType = {
  UP: "UP",
  DOWN: "DOWN",
} as const;

export type VoteType = (typeof VoteType)[keyof typeof VoteType];

// ── Connection enums ─────────────────────────────────────────────────────────

export const ConnectionStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  BLOCKED: "BLOCKED",
} as const;

export type ConnectionStatus =
  (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

// ── Message enums ────────────────────────────────────────────────────────────

export const ConversationType = {
  DIRECT: "DIRECT",
  GROUP: "GROUP",
} as const;

export type ConversationType =
  (typeof ConversationType)[keyof typeof ConversationType];

export const MessageType = {
  TEXT: "TEXT",
  FILE: "FILE",
  IMAGE: "IMAGE",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

// ── AI enums ─────────────────────────────────────────────────────────────────

export const AIMessageRole = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
} as const;

export type AIMessageRole = (typeof AIMessageRole)[keyof typeof AIMessageRole];

// ── Event enums ──────────────────────────────────────────────────────────────

export const EventStatus = {
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

// ── Notification enums ───────────────────────────────────────────────────────

export const NotificationType = {
  CONNECTION_REQUEST: "CONNECTION_REQUEST",
  CONNECTION_ACCEPTED: "CONNECTION_ACCEPTED",
  MESSAGE: "MESSAGE",
  MESSAGE_REQUEST: "MESSAGE_REQUEST",
  RESOURCE_UPVOTE: "RESOURCE_UPVOTE",
  RESOURCE_DOWNVOTE: "RESOURCE_DOWNVOTE",
  RESOURCE_COMMENT: "RESOURCE_COMMENT",
  RESOURCE_REPORT_REVIEWED: "RESOURCE_REPORT_REVIEWED",
  DISCUSSION_REPLY: "DISCUSSION_REPLY",
  DISCUSSION_MENTION: "DISCUSSION_MENTION",
  QUESTION_ANSWER: "QUESTION_ANSWER",
  QUESTION_ACCEPTED: "QUESTION_ACCEPTED",
  TEAM_APPLICATION: "TEAM_APPLICATION",
  TEAM_APPLICATION_ACCEPTED: "TEAM_APPLICATION_ACCEPTED",
  TEAM_APPLICATION_REJECTED: "TEAM_APPLICATION_REJECTED",
  EVENT_REMINDER: "EVENT_REMINDER",
  BADGE_UNLOCKED: "BADGE_UNLOCKED",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

// ── Discussion enums ─────────────────────────────────────────────────────────

export const DiscussionVisibility = {
  PUBLIC: "PUBLIC",
  DEPARTMENT: "DEPARTMENT",
  BATCH: "BATCH",
} as const;

export type DiscussionVisibility =
  (typeof DiscussionVisibility)[keyof typeof DiscussionVisibility];

// ── Report enums ─────────────────────────────────────────────────────────────

export const ReportReason = {
  SPAM: "SPAM",
  COPYRIGHT: "COPYRIGHT",
  OFFENSIVE_CONTENT: "OFFENSIVE_CONTENT",
  DUPLICATE: "DUPLICATE",
  WRONG_CATEGORY: "WRONG_CATEGORY",
  BROKEN_FILE: "BROKEN_FILE",
  MALWARE: "MALWARE",
  OTHER: "OTHER",
} as const;

export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason];

export const ReportStatus = {
  PENDING: "PENDING",
  REVIEWED: "REVIEWED",
  DISMISSED: "DISMISSED",
  ACTION_TAKEN: "ACTION_TAKEN",
} as const;

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

// ── Gamification enums ───────────────────────────────────────────────────────

export const BadgeCategory = {
  ACADEMIC: "ACADEMIC",
  COMMUNITY: "COMMUNITY",
  CONTRIBUTION: "CONTRIBUTION",
  NETWORKING: "NETWORKING",
  MILESTONES: "MILESTONES",
  REPUTATION: "REPUTATION",
} as const;

export type BadgeCategory =
  (typeof BadgeCategory)[keyof typeof BadgeCategory];

export const BadgeTier = {
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
} as const;

export type BadgeTier = (typeof BadgeTier)[keyof typeof BadgeTier];

export const ReputationEvent = {
  RESOURCE_UPLOADED: "RESOURCE_UPLOADED",
  RESOURCE_UPVOTED_received: "RESOURCE_UPVOTED_received",
  DISCUSSION_CREATED: "DISCUSSION_CREATED",
  DISCUSSION_UPVOTED_received: "DISCUSSION_UPVOTED_received",
  QUESTION_ASKED: "QUESTION_ASKED",
  QUESTION_UPVOTED_received: "QUESTION_UPVOTED_received",
  ANSWER_UPVOTED_received: "ANSWER_UPVOTED_received",
  ANSWER_ACCEPTED: "ANSWER_ACCEPTED",
  REPLY_POSTED: "REPLY_POSTED",
  PROFILE_COMPLETED: "PROFILE_COMPLETED",
  BADGE_UNLOCKED: "BADGE_UNLOCKED",
  RESOURCE_DOWNVOTED_received: "RESOURCE_DOWNVOTED_received",
  RESOURCE_DOWNVOTED_given: "RESOURCE_DOWNVOTED_given",
  DISCUSSION_DOWNVOTED_received: "DISCUSSION_DOWNVOTED_received",
  QUESTION_DOWNVOTED_received: "QUESTION_DOWNVOTED_received",
  ANSWER_DOWNVOTED_received: "ANSWER_DOWNVOTED_received",
  ANSWER_UNACCEPTED: "ANSWER_UNACCEPTED",
  CONTENT_REMOVED: "CONTENT_REMOVED",
  ADMIN_ADJUSTMENT: "ADMIN_ADJUSTMENT",
  VOTE_REVERSAL: "VOTE_REVERSAL",
} as const;

export type ReputationEvent =
  (typeof ReputationEvent)[keyof typeof ReputationEvent];

// ── Core ─────────────────────────────────────────────────────────────────────
export type { ApiResponse, ApiError } from "./api.types";
export type { PaginationMeta } from "./resource.types";

// ── Auth / Onboarding ────────────────────────────────────────────────────────
export type { OnboardingStateResponse } from "./onboarding.types";
export type { CreateAccountResponse } from "./account.types";

export type {
  VerificationRequestData,
  CreateVerificationRequestPayload,
  CreateVerificationRequestResponse,
  VerificationDetailResponse,
  ListVerificationParams,
  ListVerificationResponse,
  VerificationRequest,
  VerificationDetail,
} from "./verification.types";

// ── Resources ────────────────────────────────────────────────────────────────
export type {
  Resource,
  ResourceCategory,
  ResourceTag,
  ResourceVote,
  ResourceReport,
  ResourceBookmark,
  ResourceDownload,
  Comment,
  Tag,
  VoteType,
  ReportReason,
  ReportStatus,
  ListResourcesParams,
  ResourceListResponse,
  ResourceCourse,
  ResourceUploader,
} from "./resource.types";

// ── Teams ────────────────────────────────────────────────────────────────────
export type {
  TeamRequest,
  TeamRequestSkill,
  TeamApplication,
  TeamMember,
  TeamRequestStatus,
  ApplicationStatus,
  TeamMemberRole,
  ListTeamRequestsParams,
  TeamRequestListResponse,
} from "./team.types";

// ── Discussions ──────────────────────────────────────────────────────────────
export type {
  Discussion,
  DiscussionCategory,
  DiscussionReply,
  DiscussionVote,
  DiscussionReplyVote,
  DiscussionTag,
  DiscussionBookmark,
  DiscussionVisibility,
  ListDiscussionsParams,
  DiscussionListResponse,
} from "./discussion.types";

// ── Q&A ──────────────────────────────────────────────────────────────────────
export type {
  Question,
  QuestionCategory,
  Answer,
  QuestionVote,
  AnswerVote,
  QuestionTag,
  QuestionBookmark,
  ListQuestionsParams,
  QuestionListResponse,
} from "./qa.types";

// ── Connections ──────────────────────────────────────────────────────────────
export type {
  Connection,
  ConnectionRequest,
  ConnectionStatus,
  ConnectionOtherUser,
  ConnectionWithUser,
  UserSkill,
  SuggestedPerson,
  SearchPerson,
  SearchPeopleResponse,
  ConnectionOverview,
  ListConnectionsParams,
  ConnectionListResponse,
} from "./connection.types";

// ── Messages ─────────────────────────────────────────────────────────────────
export type {
  Conversation,
  ConversationParticipant,
  Message,
  MessageReadReceipt,
  ConversationType,
  MessageType,
  ListConversationsParams,
  ListMessagesParams,
  ConversationListResponse,
  MessageListResponse,
} from "./message.types";

// ── AI ───────────────────────────────────────────────────────────────────────
export type {
  AIChatSession,
  AIMessage,
  AIMessageRole,
  AIStudyStats,
  SendAIMessagePayload,
  SendAIMessageResponse,
  ListAISessionsParams,
  AISessionListResponse,
} from "./ai.types";

// ── Events ───────────────────────────────────────────────────────────────────
export type {
  Event,
  EventRSVP,
  EventStatus,
  ListEventsParams,
  EventListResponse,
} from "./event.types";

// ── Gamification ─────────────────────────────────────────────────────────────
export type {
  Badge,
  UserBadge,
  ReputationPoint,
  Leaderboard,
  BadgeCategory,
  BadgeTier,
  ReputationEvent,
  LeaderboardResponse,
} from "./gamification.types";

// ── Notifications ────────────────────────────────────────────────────────────
export type {
  Notification,
  NotificationType,
  ListNotificationsParams,
  NotificationListResponse,
  UnreadCountResponse,
} from "./notification.types";

// ── Admin ────────────────────────────────────────────────────────────────────
export type {
  AdminDashboardStats,
  AdminUser,
  AdminUserDetail,
  AdminUserStudent,
  AdminUserAdmin,
  ListAdminUsersParams,
  ListAdminUsersResponse,
  AdminVerificationDetail,
  ListAdminVerificationsParams,
  ListAdminVerificationsResponse,
  AuditLogEntry,
  ListAuditLogsParams,
  ListAuditLogsResponse,
} from "./admin.types";

// ── Profile ────────────────────────────────────────────────────────────────
export type {
  UserProfile,
  ProfileUser,
  UpdateProfilePayload,
} from "./profile.types";

// ── Settings / Account ──────────────────────────────────────────────────────
export type {
  ProfileVisibilityLevel,
  ConnectionRequestPolicy,
  MessagingPolicy,
  UserSettings,
  UserNotificationSettings,
  ActiveSession,
  LoginHistoryEntry,
  PaginatedLoginHistory,
  ExportType,
  ExportJob,
  DeletionInfo,
} from "./settings.types";

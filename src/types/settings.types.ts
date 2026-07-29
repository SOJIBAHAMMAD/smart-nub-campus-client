// ── Privacy / Visibility Settings ────────────────────────────────────────────

export type ProfileVisibilityLevel =
  | "EVERYONE"
  | "STUDENTS_ONLY"
  | "CONNECTIONS_ONLY"
  | "ONLY_ME";

export type ConnectionRequestPolicy =
  | "EVERYONE"
  | "SAME_DEPARTMENT"
  | "SAME_BATCH"
  | "MUTUAL_CONNECTIONS"
  | "NOBODY";

export type MessagingPolicy =
  | "EVERYONE"
  | "CONNECTIONS"
  | "DEPARTMENT"
  | "NOBODY";

export interface UserSettings {
  id: string;
  userId: string;
  showProfile: ProfileVisibilityLevel;
  showAcademicInfo: ProfileVisibilityLevel;
  showSkills: ProfileVisibilityLevel;
  showProjects: ProfileVisibilityLevel;
  showReputation: ProfileVisibilityLevel;
  showBadges: ProfileVisibilityLevel;
  showSocialLinks: ProfileVisibilityLevel;
  connectionRequestPolicy: ConnectionRequestPolicy;
  messagingPolicy: MessagingPolicy;
  allowMessageRequests: boolean;
  showOnlineStatus: boolean;
  showLastActive: boolean;
  readReceipts: boolean;
  searchableProfile: boolean;
  appearInRecommendations: boolean;
  twoFactorEnabled: boolean;
}

// ── Notification Settings ───────────────────────────────────────────────────

export interface UserNotificationSettings {
  id: string;
  userId: string;
  resourcesInApp: boolean;
  resourcesEmail: boolean;
  discussionsInApp: boolean;
  discussionsEmail: boolean;
  qaInApp: boolean;
  qaEmail: boolean;
  messagingInApp: boolean;
  messagingEmail: boolean;
  networkInApp: boolean;
  networkEmail: boolean;
  teamsInApp: boolean;
  teamsEmail: boolean;
  adminInApp: boolean;
  adminEmail: boolean;
}

// ── Security ────────────────────────────────────────────────────────────────

export interface ActiveSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface LoginHistoryEntry {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  failureReason: string | null;
  createdAt: string;
}

export interface PaginatedLoginHistory {
  data: LoginHistoryEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Account Management ──────────────────────────────────────────────────────

export type ExportType = "JSON" | "CSV" | "PDF";

export interface ExportJob {
  jobId: string;
  type: string;
  status: string;
  fileUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface DeletionInfo {
  scheduledDeletionAt: string | null;
}

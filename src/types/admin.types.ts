import type { UserRole, UserStatus, VerificationStatus } from "@/constants/enums";

// ── Dashboard Stats ──────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalUsers: number;
  totalResources: number;
  verifiedResources: number;
  unverifiedResources: number;
  totalDiscussions: number;
  totalQuestions: number;
  totalEvents: number;
  pendingVerifications: number;
}

// ── Dashboard Charts ─────────────────────────────────────────────────────────

export interface ChartBucket {
  date: string;
  count: number;
}

export interface DepartmentBucket {
  department: string;
  count: number;
}

export interface AdminDashboardCharts {
  userRegistrations: ChartBucket[];
  resourceUploads: ChartBucket[];
  departmentDistribution: DepartmentBucket[];
  verificationTrends: ChartBucket[];
}

// ── User Management ──────────────────────────────────────────────────────────

export interface AdminUserStudent {
  id: string;
  department: string;
  admissionYear: number;
  admissionSemester: string;
}

export interface AdminUserAdmin {
  id: string;
  designation: string | null;
  department: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isDeleted: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  student: AdminUserStudent | null;
  admin: AdminUserAdmin | null;
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isDeleted: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
  student: Record<string, unknown> | null;
  admin: Record<string, unknown> | null;
  profile: Record<string, unknown> | null;
  _count: {
    resources: number;
    discussions: number;
    questions: number;
    answers: number;
    teamMembers: number;
  };
}

export interface ListAdminUsersParams {
  search?: string;
  role?: string;
  status?: UserStatus;
  page: number;
  limit: number;
}

export interface ListAdminUsersResponse {
  data: AdminUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Verification Management ──────────────────────────────────────────────────

export interface AdminVerificationDetail {
  id: string;
  email: string;
  studentId: string;
  name: string;
  dateOfBirth: string;
  idCardImage: string;
  status: VerificationStatus;
  note: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListAdminVerificationsParams {
  page: number;
  limit: number;
  status?: VerificationStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ListAdminVerificationsResponse {
  data: AdminVerificationDetail[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  adminUserId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  adminUser: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ListAuditLogsParams {
  page: number;
  limit: number;
  adminUserId?: string;
  action?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListAuditLogsResponse {
  data: AuditLogEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Resource Management ─────────────────────────────────────────────────────

export interface AdminResource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  filePublicId: string | null;
  fileType: string;
  fileSize: number;
  courseId: string;
  categoryId: string;
  uploaderId: string;
  upvoteCount: number;
  downvoteCount: number;
  downloadCount: number;
  viewCount: number;
  reportCount: number;
  isVerified: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  course: { id: string; code: string; name: string };
  category: { id: string; name: string; slug: string };
  uploader: { id: string; name: string; email: string };
}

export type AdminResourceSort =
  | "newest"
  | "oldest"
  | "downloads"
  | "upvotes"
  | "reports"
  | "views";

export interface ListAdminResourcesParams {
  page: number;
  limit: number;
  search?: string;
  courseId?: string;
  categoryId?: string;
  isVerified?: boolean;
  sort?: AdminResourceSort;
}

export interface ListAdminResourcesResponse {
  data: AdminResource[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Resource Reports ─────────────────────────────────────────────────────

export interface AdminResourceReport {
  id: string;
  reason: string;
  description: string | null;
  status: "PENDING" | "REVIEWED" | "DISMISSED" | "ACTION_TAKEN";
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  resource: { id: string; title: string; fileType: string };
  user: { id: string; name: string; email: string };
}

export type AdminReportStatus = "REVIEWED" | "DISMISSED" | "ACTION_TAKEN";

export interface ListAdminReportsResponse {
  data: AdminResourceReport[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Course Management ───────────────────────────────────────────────────────

export interface AdminCourse {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { resources: number; discussions: number };
}

export interface ListAdminCoursesResponse {
  data: AdminCourse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCourseInput {
  code: string;
  name: string;
  department: string;
  semester?: number;
  description?: string;
}

// ── Category Management ─────────────────────────────────────────────────────

export interface AdminResourceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { resources: number };
}

export interface AdminDiscussionCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { discussions: number };
}

export interface AdminQuestionCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { questions: number };
}

export interface ListAdminCategoriesResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Discussion Management ───────────────────────────────────────────────────

export interface AdminDiscussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: { id: string; name: string; email: string; image?: string | null };
  category: { id: string; name: string; slug: string } | null;
  course: { id: string; code: string; name: string } | null;
  replyCount: number;
  viewCount: number;
  upvoteCount: number;
  visibility: string;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminDiscussionSort = "newest" | "oldest" | "popular" | "replies";

export type AdminDiscussionStatus = "all" | "pinned" | "locked" | "solved";

export interface ListAdminDiscussionsParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  status?: AdminDiscussionStatus;
  sort?: AdminDiscussionSort;
}

export interface ListAdminDiscussionsResponse {
  data: AdminDiscussion[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Event Management ────────────────────────────────────────────────────────

export interface AdminEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  imageUrl: string | null;
  organizerId: string | null;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  organizer: { id: string; name: string; email: string } | null;
  _count: { rsvps: number };
}

export interface ListAdminEventsResponse {
  data: AdminEvent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateEventInput {
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  imageUrl?: string;
  organizerId?: string;
  status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  isFeatured?: boolean;
}

import { apiClient } from "@/lib/api-client";
import type {
  AdminDashboardStats,
  AdminDiscussion,
  ListAdminDiscussionsParams,
  ListAdminDiscussionsResponse,
  AdminDiscussionSort,
  AdminDiscussionStatus,
  AdminDashboardCharts,
  ListAdminUsersParams,
  ListAdminUsersResponse,
  AdminUserDetail,
  ListAdminVerificationsParams,
  ListAdminVerificationsResponse,
  AdminVerificationDetail,
  ListAuditLogsParams,
  ListAuditLogsResponse,
  ListAdminResourcesParams,
  ListAdminResourcesResponse,
  ListAdminCoursesResponse,
  CreateCourseInput,
  AdminCourse,
  ListAdminCategoriesResponse,
  AdminResourceCategory,
  AdminDiscussionCategory,
  AdminQuestionCategory,
  ListAdminEventsResponse,
  AdminEvent,
  CreateEventInput,
  ListAdminReportsResponse,
  AdminReportStatus,
} from "@/types/admin.types";

/**
 * Admin service — client-side API calls for admin dashboard.
 * Uses apiClient (browser-direct fetch with credentials) since admin pages
 * are interactive client components.
 */
export const adminService = {
  // ── Dashboard ────────────────────────────────────────────────────────────

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: AdminDashboardStats;
    }>("/admin/stats");
    return response.data!.data;
  },

  async getDashboardCharts(days = 7): Promise<AdminDashboardCharts> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: AdminDashboardCharts;
    }>(`/admin/stats/charts?days=${days}`);
    return response.data!.data;
  },

  // ── User Management ─────────────────────────────────────────────────────

  async listUsers(params: ListAdminUsersParams): Promise<ListAdminUsersResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page));
    searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.role) searchParams.set("role", params.role);
    if (params.status) searchParams.set("status", params.status);

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAdminUsersResponse;
    }>(`/admin/users?${searchParams.toString()}`);
    return response.data!.data;
  },

  async getUserById(id: string): Promise<AdminUserDetail> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: AdminUserDetail;
    }>(`/admin/users/${id}`);
    return response.data!.data;
  },

  async updateUserStatus(
    id: string,
    status: "ACTIVE" | "SUSPENDED" | "BANNED",
  ): Promise<{ id: string; name: string; email: string; role: string; status: string }> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { id: string; name: string; email: string; role: string; status: string };
    }>(`/admin/users/${id}/status`, { status });
    return response.data!.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.del(`/admin/users/${id}`);
  },

  // ── Verification Management ──────────────────────────────────────────────

  async listVerifications(
    params: ListAdminVerificationsParams,
  ): Promise<ListAdminVerificationsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page));
    searchParams.set("limit", String(params.limit));
    if (params.status) searchParams.set("status", params.status);
    if (params.search) searchParams.set("search", params.search);
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAdminVerificationsResponse;
    }>(`/verification?${searchParams.toString()}`);
    return response.data!.data;
  },

  async getVerificationById(id: string): Promise<AdminVerificationDetail> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: AdminVerificationDetail;
    }>(`/verification/${id}`);
    return response.data!.data;
  },

  async approveVerification(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.patch<{
      success: boolean;
      message: string;
    }>(`/verification/${id}/approve`, {});
    return { success: res.data!.success, message: res.data!.message };
  },

  async rejectVerification(
    id: string,
    note: string,
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.patch<{
      success: boolean;
      message: string;
    }>(`/verification/${id}/reject`, { note });
    return { success: res.data!.success, message: res.data!.message };
  },

  // ── Audit Logs ───────────────────────────────────────────────────────────

  async listAuditLogs(
    params: ListAuditLogsParams,
  ): Promise<ListAuditLogsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page));
    searchParams.set("limit", String(params.limit));
    if (params.adminUserId) searchParams.set("adminUserId", params.adminUserId);
    if (params.action) searchParams.set("action", params.action);
    if (params.targetType) searchParams.set("targetType", params.targetType);
    if (params.startDate) searchParams.set("startDate", params.startDate);
    if (params.endDate) searchParams.set("endDate", params.endDate);

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAuditLogsResponse;
    }>(`/admin/audit-log?${searchParams.toString()}`);
    return response.data!.data;
  },

  // ── Resource Management ──────────────────────────────────────────────────

  async listResources(
    params: ListAdminResourcesParams,
  ): Promise<ListAdminResourcesResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page));
    searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.courseId) searchParams.set("courseId", params.courseId);
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.isVerified !== undefined)
      searchParams.set("isVerified", String(params.isVerified));
    if (params.sort) searchParams.set("sort", params.sort);

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAdminResourcesResponse;
    }>(`/admin/resources?${searchParams.toString()}`);
    return response.data!.data;
  },

  async verifyResource(
    id: string,
    isVerified: boolean,
  ): Promise<{ id: string; isVerified: boolean }> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { id: string; isVerified: boolean };
    }>(`/admin/resources/${id}/verify`, { isVerified });
    return response.data!.data;
  },

  async deleteResource(id: string): Promise<void> {
    await apiClient.del(`/admin/resources/${id}`);
  },

  async bulkVerifyResources(
    ids: string[],
    isVerified: boolean,
  ): Promise<void> {
    await Promise.all(ids.map((id) => this.verifyResource(id, isVerified)));
  },

  async bulkDeleteResources(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.deleteResource(id)));
  },

  // ── Resource Reports ────────────────────────────────────────────────────

  async listReports(
    page = 1,
    limit = 20,
  ): Promise<ListAdminReportsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("limit", String(limit));

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAdminReportsResponse;
    }>(`/resources/admin/reports?${searchParams.toString()}`);
    return response.data!.data;
  },

  async reviewReport(
    id: string,
    status: AdminReportStatus,
  ): Promise<{ id: string; status: string }> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { id: string; status: string };
    }>(`/resources/admin/reports/${id}`, { status });
    return response.data!.data;
  },

  // ── Course Management ───────────────────────────────────────────────────

  async listCourses(
    page = 1,
    limit = 20,
  ): Promise<ListAdminCoursesResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("limit", String(limit));

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAdminCoursesResponse;
    }>(`/admin/courses?${searchParams.toString()}`);
    return response.data!.data;
  },

  async getCourseById(id: string): Promise<AdminCourse> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: AdminCourse;
    }>(`/admin/courses/${id}`);
    return response.data!.data;
  },

  async createCourse(data: CreateCourseInput): Promise<AdminCourse> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: AdminCourse;
    }>("/admin/courses", data);
    return response.data!.data;
  },

  async updateCourse(
    id: string,
    data: Partial<CreateCourseInput>,
  ): Promise<AdminCourse> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: AdminCourse;
    }>(`/admin/courses/${id}`, data);
    return response.data!.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient.del(`/admin/courses/${id}`);
  },

  // ── Category Management ─────────────────────────────────────────────────

  async listResourceCategories(
    page = 1,
    limit = 50,
  ): Promise<ListAdminCategoriesResponse<AdminResourceCategory>> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("limit", String(limit));

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAdminCategoriesResponse<AdminResourceCategory>;
    }>(`/admin/resource-categories?${searchParams.toString()}`);
    return response.data!.data;
  },

  async createResourceCategory(data: {
    name: string;
    icon?: string;
    description?: string;
  }): Promise<AdminResourceCategory> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: AdminResourceCategory;
    }>("/admin/resource-categories", data);
    return response.data!.data;
  },

  async deleteResourceCategory(id: string): Promise<void> {
    await apiClient.del(`/admin/resource-categories/${id}`);
  },

  async listDiscussionCategories(
    page = 1,
    limit = 50,
  ): Promise<ListAdminCategoriesResponse<AdminDiscussionCategory>> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("limit", String(limit));

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAdminCategoriesResponse<AdminDiscussionCategory>;
    }>(`/admin/discussion-categories?${searchParams.toString()}`);
    return response.data!.data;
  },

  async createDiscussionCategory(data: {
    name: string;
    icon?: string;
  }): Promise<AdminDiscussionCategory> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: AdminDiscussionCategory;
    }>("/admin/discussion-categories", data);
    return response.data!.data;
  },

  async deleteDiscussionCategory(id: string): Promise<void> {
    await apiClient.del(`/admin/discussion-categories/${id}`);
  },

  async listQuestionCategories(
    page = 1,
    limit = 50,
  ): Promise<ListAdminCategoriesResponse<AdminQuestionCategory>> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("limit", String(limit));

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAdminCategoriesResponse<AdminQuestionCategory>;
    }>(`/admin/question-categories?${searchParams.toString()}`);
    return response.data!.data;
  },

  async createQuestionCategory(data: {
    name: string;
    icon?: string;
  }): Promise<AdminQuestionCategory> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: AdminQuestionCategory;
    }>("/admin/question-categories", data);
    return response.data!.data;
  },

  async deleteQuestionCategory(id: string): Promise<void> {
    await apiClient.del(`/admin/question-categories/${id}`);
  },

  // ── Discussion Management ───────────────────────────────────────────────

  async listDiscussions(
    params: ListAdminDiscussionsParams,
  ): Promise<ListAdminDiscussionsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page));
    searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.status && params.status !== "all")
      searchParams.set("status", params.status);
    if (params.sort) searchParams.set("sort", params.sort);

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAdminDiscussionsResponse;
    }>(`/admin/discussions?${searchParams.toString()}`);
    return response.data!.data;
  },

  async deleteDiscussion(id: string): Promise<void> {
    await apiClient.del(`/admin/discussions/${id}`);
  },

  async togglePin(id: string): Promise<{ isPinned: boolean }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: { isPinned: boolean };
    }>(`/admin/discussions/${id}/pin`, {});
    return response.data!.data;
  },

  async toggleLock(id: string): Promise<{ isLocked: boolean }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: { isLocked: boolean };
    }>(`/admin/discussions/${id}/lock`, {});
    return response.data!.data;
  },

  async bulkDeleteDiscussions(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.deleteDiscussion(id)));
  },

  async bulkTogglePin(ids: string[], isPinned: boolean): Promise<void> {
    await Promise.all(
      ids.map((id) => (isPinned ? this.togglePin(id) : this.togglePin(id))),
    );
  },

  async bulkToggleLock(ids: string[], isLocked: boolean): Promise<void> {
    await Promise.all(
      ids.map((id) => (isLocked ? this.toggleLock(id) : this.toggleLock(id))),
    );
  },

  // ── Event Management ────────────────────────────────────────────────────

  async listEvents(
    page = 1,
    limit = 20,
  ): Promise<ListAdminEventsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("limit", String(limit));

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ListAdminEventsResponse;
    }>(`/events?${searchParams.toString()}`);
    return response.data!.data;
  },

  async getEventById(id: string): Promise<AdminEvent> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: AdminEvent;
    }>(`/events/${id}`);
    return response.data!.data;
  },

  async createEvent(data: CreateEventInput): Promise<AdminEvent> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: AdminEvent;
    }>("/events", data);
    return response.data!.data;
  },

  async updateEvent(
    id: string,
    data: Partial<CreateEventInput>,
  ): Promise<AdminEvent> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: AdminEvent;
    }>(`/events/${id}`, data);
    return response.data!.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await apiClient.del(`/events/${id}`);
  },
};

import serverApi from "@/lib/server-api";
import type {
  UserSettings,
  UserNotificationSettings,
  ActiveSession,
  PaginatedLoginHistory,
  ExportJob,
} from "@/types";

/**
 * Settings module service — wraps all `/settings` endpoints.
 * Mirrors the server settings module (Phase 24).
 */
export const settingsService = {
  // ── Privacy Settings ─────────────────────────────────────────────────

  async getPrivacySettings(): Promise<UserSettings | null> {
    try {
      const response = await serverApi.get<UserSettings>(
        "/settings/privacy",
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  },

  async updatePrivacySettings(
    data: Partial<UserSettings>,
  ): Promise<UserSettings> {
    const response = await serverApi.patch<UserSettings>(
      "/settings/privacy",
      data,
    );
    return response.data!;
  },

  // ── Notification Settings ─────────────────────────────────────────────

  async getNotificationSettings(): Promise<UserNotificationSettings | null> {
    try {
      const response = await serverApi.get<UserNotificationSettings>(
        "/settings/notifications",
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  },

  async updateNotificationSettings(
    data: Partial<UserNotificationSettings>,
  ): Promise<UserNotificationSettings> {
    const response = await serverApi.patch<UserNotificationSettings>(
      "/settings/notifications",
      data,
    );
    return response.data!;
  },

  // ── Security ──────────────────────────────────────────────────────────

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    await serverApi.post("/settings/security/change-password", data);
  },

  async getActiveSessions(): Promise<ActiveSession[]> {
    const response = await serverApi.get<ActiveSession[]>(
      "/settings/security/sessions",
    );
    return response.data ?? [];
  },

  async terminateSession(sessionId: string): Promise<void> {
    await serverApi.del(`/settings/security/sessions/${sessionId}`);
  },

  async terminateOtherSessions(): Promise<void> {
    await serverApi.post(
      "/settings/security/sessions/terminate-others",
      {},
    );
  },

  async getLoginHistory(
    page = 1,
    limit = 20,
  ): Promise<PaginatedLoginHistory> {
    const response = await serverApi.get<PaginatedLoginHistory>(
      `/settings/security/login-history?page=${page}&limit=${limit}`,
    );
    return response.data!;
  },

  // ── Account Management ────────────────────────────────────────────────

  async requestExport(type: string): Promise<{ jobId: string; status: string }> {
    const response = await serverApi.post<{ jobId: string; status: string }>(
      "/settings/account/export",
      { type },
    );
    return response.data!;
  },

  async getExportStatus(jobId: string): Promise<ExportJob> {
    const response = await serverApi.get<ExportJob>(
      `/settings/account/export/${jobId}`,
    );
    return response.data!;
  },

  async downloadExport(jobId: string): Promise<{ downloadUrl: string | null }> {
    const response = await serverApi.get<{ downloadUrl: string | null }>(
      `/settings/account/export/${jobId}/download`,
    );
    return response.data!;
  },

  async requestArchive(password: string): Promise<{ jobId: string }> {
    const response = await serverApi.post<{ jobId: string }>(
      "/settings/account/archive",
      { password },
    );
    return response.data!;
  },

  async deactivateAccount(password: string): Promise<void> {
    await serverApi.post("/settings/account/deactivate", { password });
  },

  async reactivateAccount(password: string): Promise<void> {
    await serverApi.post("/settings/account/reactivate", { password });
  },

  async requestDeletion(
    password: string,
    reason?: string,
  ): Promise<{ scheduledDeletionAt: string }> {
    const response = await serverApi.post<{ scheduledDeletionAt: string }>(
      "/settings/account/delete",
      { password, reason: reason ?? undefined },
    );
    return response.data!;
  },

  async cancelDeletion(): Promise<void> {
    await serverApi.post("/settings/account/delete/cancel", {});
  },
};

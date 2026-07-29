"use server";

import { settingsService } from "@/services/settings.service";
import type { ApiResponse } from "@/types";

/**
 * Server Actions wrapping the settings service. Each action returns an
 * `ApiResponse` envelope so client components can check `success` and show
 * toasts consistently.
 */

// ── Privacy Settings ────────────────────────────────────────────────────────

export async function getPrivacySettingsAction(): Promise<ApiResponse> {
  try {
    const data = await settingsService.getPrivacySettings();
    return { success: true, message: "Privacy settings fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch privacy settings.";
    return { success: false, message };
  }
}

export async function updatePrivacySettingsAction(
  data: Record<string, unknown>,
): Promise<ApiResponse> {
  try {
    const result = await settingsService.updatePrivacySettings(data);
    return { success: true, message: "Privacy settings updated.", data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update privacy settings.";
    return { success: false, message };
  }
}

// ── Notification Settings ───────────────────────────────────────────────────

export async function getNotificationSettingsAction(): Promise<ApiResponse> {
  try {
    const data = await settingsService.getNotificationSettings();
    return { success: true, message: "Notification settings fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch notification settings.";
    return { success: false, message };
  }
}

export async function updateNotificationSettingsAction(
  data: Record<string, unknown>,
): Promise<ApiResponse> {
  try {
    const result = await settingsService.updateNotificationSettings(data);
    return { success: true, message: "Notification settings updated.", data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update notification settings.";
    return { success: false, message };
  }
}

// ── Security ────────────────────────────────────────────────────────────────

export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResponse> {
  try {
    await settingsService.changePassword(data);
    return { success: true, message: "Password changed successfully." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to change password.";
    return { success: false, message };
  }
}

export async function getActiveSessionsAction(): Promise<ApiResponse> {
  try {
    const data = await settingsService.getActiveSessions();
    return { success: true, message: "Sessions fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch sessions.";
    return { success: false, message };
  }
}

export async function terminateSessionAction(
  sessionId: string,
): Promise<ApiResponse> {
  try {
    await settingsService.terminateSession(sessionId);
    return { success: true, message: "Session terminated." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to terminate session.";
    return { success: false, message };
  }
}

export async function terminateOtherSessionsAction(): Promise<ApiResponse> {
  try {
    await settingsService.terminateOtherSessions();
    return { success: true, message: "Other sessions terminated." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to terminate sessions.";
    return { success: false, message };
  }
}

export async function getLoginHistoryAction(
  page = 1,
  limit = 20,
): Promise<ApiResponse> {
  try {
    const data = await settingsService.getLoginHistory(page, limit);
    return { success: true, message: "Login history fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch login history.";
    return { success: false, message };
  }
}

// ── Account Management ──────────────────────────────────────────────────────

export async function requestExportAction(
  type: string,
): Promise<ApiResponse> {
  try {
    const data = await settingsService.requestExport(type);
    return { success: true, message: "Export request submitted.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to request export.";
    return { success: false, message };
  }
}

export async function getExportStatusAction(
  jobId: string,
): Promise<ApiResponse> {
  try {
    const data = await settingsService.getExportStatus(jobId);
    return { success: true, message: "Export status fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch export status.";
    return { success: false, message };
  }
}

export async function downloadExportAction(
  jobId: string,
): Promise<ApiResponse> {
  try {
    const data = await settingsService.downloadExport(jobId);
    return { success: true, message: "Download URL generated.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate download URL.";
    return { success: false, message };
  }
}

export async function requestArchiveAction(
  password: string,
): Promise<ApiResponse> {
  try {
    const data = await settingsService.requestArchive(password);
    return { success: true, message: "Archive request submitted.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to request archive.";
    return { success: false, message };
  }
}

export async function deactivateAccountAction(
  password: string,
): Promise<ApiResponse> {
  try {
    await settingsService.deactivateAccount(password);
    return { success: true, message: "Account deactivated." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to deactivate account.";
    return { success: false, message };
  }
}

export async function reactivateAccountAction(
  password: string,
): Promise<ApiResponse> {
  try {
    await settingsService.reactivateAccount(password);
    return { success: true, message: "Account reactivated." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reactivate account.";
    return { success: false, message };
  }
}

export async function requestDeletionAction(
  password: string,
  reason?: string,
): Promise<ApiResponse> {
  try {
    const data = await settingsService.requestDeletion(password, reason);
    return { success: true, message: "Deletion scheduled.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to request deletion.";
    return { success: false, message };
  }
}

export async function cancelDeletionAction(): Promise<ApiResponse> {
  try {
    await settingsService.cancelDeletion();
    return { success: true, message: "Deletion cancelled." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel deletion.";
    return { success: false, message };
  }
}

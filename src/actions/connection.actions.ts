"use server";

import { connectionService } from "@/services/connection.service";
import type { ApiResponse } from "@/types";

/**
 * Server Actions wrapping the connection service. Each action returns an
 * `ApiResponse` envelope so client components can check `success` and show
 * toasts consistently. Mutations invalidate the CONNECTIONS cache tags.
 */

export async function searchPeopleAction(params: {
  query?: string;
  department?: string;
  semester?: string;
  skills?: string[];
  page?: number;
  limit?: number;
}): Promise<ApiResponse> {
  try {
    const data = await connectionService.searchPeople(params);
    return { success: true, message: "People fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch people.";
    return { success: false, message };
  }
}

export async function getSuggestionsAction(): Promise<ApiResponse> {
  try {
    const data = await connectionService.getSuggestions();
    return { success: true, message: "Suggestions fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch suggestions.";
    return { success: false, message };
  }
}

export async function getPendingRequestsAction(): Promise<ApiResponse> {
  try {
    const data = await connectionService.getPendingRequests();
    return { success: true, message: "Pending requests fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch pending requests.";
    return { success: false, message };
  }
}

export async function getSentRequestsAction(): Promise<ApiResponse> {
  try {
    const data = await connectionService.getSentRequests();
    return { success: true, message: "Sent requests fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch sent requests.";
    return { success: false, message };
  }
}

export async function getBlockedUsersAction(): Promise<ApiResponse> {
  try {
    const data = await connectionService.getBlockedUsers();
    return { success: true, message: "Blocked users fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch blocked users.";
    return { success: false, message };
  }
}

export async function getMyConnectionsAction(
  filter: "ALL" | "SENIORS" | "JUNIORS" | "SAME_SEMESTER" | "FAVORITES" = "ALL",
  page = 1,
  limit = 12,
): Promise<ApiResponse> {
  try {
    const data = await connectionService.getMyConnections(filter, page, limit);
    return { success: true, message: "Connections fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch connections.";
    return { success: false, message };
  }
}

export async function getOverviewAction(): Promise<ApiResponse> {
  try {
    const data = await connectionService.getOverview();
    return { success: true, message: "Overview fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch overview.";
    return { success: false, message };
  }
}

export async function sendConnectionRequestAction(
  receiverId: string,
  note?: string,
): Promise<ApiResponse> {
  try {
    await connectionService.sendRequest(receiverId, note);
    return { success: true, message: "Connection request sent." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send request.";
    return { success: false, message };
  }
}

export async function acceptConnectionAction(
  connectionId: string,
): Promise<ApiResponse> {
  try {
    await connectionService.acceptRequest(connectionId);
    return { success: true, message: "Connection accepted." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to accept request.";
    return { success: false, message };
  }
}

export async function rejectConnectionAction(
  connectionId: string,
): Promise<ApiResponse> {
  try {
    await connectionService.rejectRequest(connectionId);
    return { success: true, message: "Connection rejected." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reject request.";
    return { success: false, message };
  }
}

export async function cancelConnectionAction(
  connectionId: string,
): Promise<ApiResponse> {
  try {
    await connectionService.cancelRequest(connectionId);
    return { success: true, message: "Request cancelled." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel request.";
    return { success: false, message };
  }
}

export async function toggleFavoriteAction(
  connectionId: string,
): Promise<ApiResponse> {
  try {
    await connectionService.toggleFavorite(connectionId);
    return { success: true, message: "Favorite updated." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update favorite.";
    return { success: false, message };
  }
}

export async function removeConnectionAction(
  connectionId: string,
): Promise<ApiResponse> {
  try {
    await connectionService.removeConnection(connectionId);
    return { success: true, message: "Connection removed." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove connection.";
    return { success: false, message };
  }
}

export async function blockUserAction(blockedId: string): Promise<ApiResponse> {
  try {
    await connectionService.blockUser(blockedId);
    return { success: true, message: "User blocked." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to block user.";
    return { success: false, message };
  }
}

export async function unblockUserAction(
  blockedId: string,
): Promise<ApiResponse> {
  try {
    await connectionService.unblockUser(blockedId);
    return { success: true, message: "User unblocked." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to unblock user.";
    return { success: false, message };
  }
}

export async function getActiveUsersAction(
  limit = 8,
): Promise<ApiResponse> {
  try {
    const data = await connectionService.getActiveUsers(limit);
    return { success: true, message: "Active users fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch active users.";
    return { success: false, message };
  }
}

export async function getProfileCompletenessAction(): Promise<ApiResponse> {
  try {
    const data = await connectionService.getProfileCompleteness();
    return { success: true, message: "Profile completeness fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch profile completeness.";
    return { success: false, message };
  }
}

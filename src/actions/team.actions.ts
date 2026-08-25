"use server";

import { teamService } from "@/services/team.service";
import type { ApiResponse } from "@/types";
import type {
  ApplicationFormConfig,
  ListTeamRequestsParams,
  TeamRequestStatus,
} from "@/types/team.types";

/** List team requests with pagination and filtering. */
export async function listTeamRequests(
  params: ListTeamRequestsParams = {},
): Promise<ApiResponse> {
  try {
    const data = await teamService.listTeamRequests(params);
    return { success: true, message: "Team requests fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch team requests.";
    return { success: false, message };
  }
}

/** Get a single team request by ID. */
export async function getTeamRequest(id: string): Promise<ApiResponse> {
  try {
    const data = await teamService.getTeamRequestById(id);
    return { success: true, message: "Team request fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch team request.";
    return { success: false, message };
  }
}

/** Create a new team request. */
export async function createTeamRequest(data: {
  title: string;
  description: string;
  lookingForCount: number;
  projectName?: string;
  deadline?: string;
  category?: string;
  difficulty?: string;
  meetingPreference?: string;
  contactInfo?: string;
  applicationForm?: ApplicationFormConfig;
  skillTagIds: string[];
}): Promise<ApiResponse> {
  try {
    const teamRequest = await teamService.createTeamRequest(data);
    return { success: true, message: "Team request created.", data: teamRequest };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create team request.";
    return { success: false, message };
  }
}

/** Update a team request. */
export async function updateTeamRequest(id: string, data: {
  title?: string;
  description?: string;
  category?: string;
  projectName?: string;
  deadline?: string;
  lookingForCount?: number;
  status?: TeamRequestStatus;
  difficulty?: string;
  meetingPreference?: string;
  contactInfo?: string;
  applicationForm?: ApplicationFormConfig;
  skillTagIds?: string[];
}): Promise<ApiResponse> {
  try {
    const teamRequest = await teamService.updateTeamRequest(id, data);
    return { success: true, message: "Team request updated.", data: teamRequest };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update team request.";
    return { success: false, message };
  }
}

/** Delete a team request. */
export async function deleteTeamRequest(id: string): Promise<ApiResponse> {
  try {
    await teamService.deleteTeamRequest(id);
    return { success: true, message: "Team request deleted." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete team request.";
    return { success: false, message };
  }
}

/** Apply to a team request. */
export async function applyToTeam(
  teamRequestId: string,
  data: { message?: string; responses?: Record<string, string> },
): Promise<ApiResponse> {
  try {
    const application = await teamService.applyToTeam(teamRequestId, data);
    return { success: true, message: "Application submitted.", data: application };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit application.";
    return { success: false, message };
  }
}

/** Review (accept/reject) a team application. */
export async function reviewTeamApplication(
  teamRequestId: string,
  applicationId: string,
  status: "ACCEPTED" | "REJECTED",
): Promise<ApiResponse> {
  try {
    const application = await teamService.reviewApplication(
      teamRequestId,
      applicationId,
      { status },
    );
    return { success: true, message: "Application reviewed.", data: application };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to review application.";
    return { success: false, message };
  }
}

/** Withdraw a team application. */
export async function withdrawTeamApplication(
  teamRequestId: string,
): Promise<ApiResponse> {
  try {
    await teamService.withdrawApplication(teamRequestId);
    return { success: true, message: "Application withdrawn." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to withdraw application.";
    return { success: false, message };
  }
}

/** Get team members. */
export async function getTeamMembers(teamRequestId: string): Promise<ApiResponse> {
  try {
    const members = await teamService.getTeamMembers(teamRequestId);
    return { success: true, message: "Members fetched.", data: members };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch members.";
    return { success: false, message };
  }
}

/** Leave a team. */
export async function leaveTeam(teamRequestId: string): Promise<ApiResponse> {
  try {
    await teamService.leaveTeam(teamRequestId);
    return { success: true, message: "Left team." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to leave team.";
    return { success: false, message };
  }
}

/** Remove a member from a team. */
export async function removeTeamMember(teamRequestId: string, memberId: string): Promise<ApiResponse> {
  try {
    await teamService.removeMember(teamRequestId, memberId);
    return { success: true, message: "Member removed." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove member.";
    return { success: false, message };
  }
}

/** Toggle bookmark for a team request. */
export async function toggleTeamBookmark(teamRequestId: string): Promise<ApiResponse> {
  try {
    const data = await teamService.toggleBookmark(teamRequestId);
    return { success: true, message: data.bookmarked ? "Team bookmarked." : "Bookmark removed.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle bookmark.";
    return { success: false, message };
  }
}

/** Get teams created by current user. */
export async function getMyTeams(): Promise<ApiResponse> {
  try {
    const data = await teamService.getMyTeams();
    return { success: true, message: "My teams fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch my teams.";
    return { success: false, message };
  }
}

/** Get applications made by current user. */
export async function getMyApplications(): Promise<ApiResponse> {
  try {
    const data = await teamService.getMyApplications();
    return { success: true, message: "My applications fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch my applications.";
    return { success: false, message };
  }
}

/** Get category counts for sidebar. */
export async function getCategoryCounts(): Promise<ApiResponse> {
  try {
    const data = await teamService.getCategoryCounts();
    return { success: true, message: "Category counts fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch category counts.";
    return { success: false, message };
  }
}

/** Get popular skills for sidebar. */
export async function getPopularSkills(): Promise<ApiResponse> {
  try {
    const data = await teamService.getPopularSkills();
    return { success: true, message: "Popular skills fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch popular skills.";
    return { success: false, message };
  }
}

/** Get applications for a team (creator only). */
export async function getTeamApplications(teamRequestId: string): Promise<ApiResponse> {
  try {
    const data = await teamService.getTeamApplications(teamRequestId);
    return { success: true, message: "Team applications fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch team applications.";
    return { success: false, message };
  }
}

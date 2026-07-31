"use server";

import { mentorshipService } from "@/services/mentorship.service";
import type { ApiResponse } from "@/types";
import type {
  ListMentorsParams,
  ListMentorshipRequestsParams,
  CreateMentorshipRequestPayload,
} from "@/types";

export async function listMentorsAction(
  params: ListMentorsParams = {},
): Promise<ApiResponse> {
  try {
    const data = await mentorshipService.listMentors(params);
    return { success: true, message: "Mentors fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch mentors.";
    return { success: false, message };
  }
}

export async function createMentorshipRequestAction(
  data: CreateMentorshipRequestPayload,
): Promise<ApiResponse> {
  try {
    const request = await mentorshipService.createMentorshipRequest(data);
    return {
      success: true,
      message: "Mentorship request sent.",
      data: request,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send mentorship request.";
    return { success: false, message };
  }
}

export async function listMentorshipRequestsAction(
  params: ListMentorshipRequestsParams,
): Promise<ApiResponse> {
  try {
    const data = await mentorshipService.listRequests(params);
    return { success: true, message: "Requests fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch requests.";
    return { success: false, message };
  }
}

export async function updateMentorshipRequestAction(
  id: string,
  status: string,
): Promise<ApiResponse> {
  try {
    const data = await mentorshipService.updateRequest(id, status);
    return { success: true, message: "Request updated.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update request.";
    return { success: false, message };
  }
}

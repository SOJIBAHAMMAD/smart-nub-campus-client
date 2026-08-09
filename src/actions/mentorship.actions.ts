"use server";

import { mentorshipService } from "@/services/mentorship.service";
import type { ApiResponse } from "@/types";
import type {
  ListMentorsParams,
  ListMentorshipRequestsParams,
  ListMentorshipsParams,
  CreateMentorshipRequestPayload,
  CreateMentorshipGoalPayload,
  UpdateMentorshipGoalPayload,
  CreateMentorshipSessionPayload,
  UpdateMentorshipSessionPayload,
  SendMentorshipMessagePayload,
  CompleteMentorshipPayload,
  RateMentorPayload,
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

export async function listMentorshipsAction(
  params: ListMentorshipsParams = {},
): Promise<ApiResponse> {
  try {
    const data = await mentorshipService.listMentorships(params);
    return { success: true, message: "Mentorships fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch mentorships.";
    return { success: false, message };
  }
}

export async function getMentorshipAction(id: string): Promise<ApiResponse> {
  try {
    const data = await mentorshipService.getMentorship(id);
    return { success: true, message: "Mentorship fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch mentorship.";
    return { success: false, message };
  }
}

export async function createMentorshipGoalAction(
  mentorshipId: string,
  data: CreateMentorshipGoalPayload,
): Promise<ApiResponse> {
  try {
    const goal = await mentorshipService.createGoal(mentorshipId, data);
    return { success: true, message: "Goal added.", data: goal };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add goal.";
    return { success: false, message };
  }
}

export async function updateMentorshipGoalAction(
  goalId: string,
  data: UpdateMentorshipGoalPayload,
): Promise<ApiResponse> {
  try {
    const goal = await mentorshipService.updateGoal(goalId, data);
    return { success: true, message: "Goal updated.", data: goal };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update goal.";
    return { success: false, message };
  }
}

export async function deleteMentorshipGoalAction(
  goalId: string,
): Promise<ApiResponse> {
  try {
    const data = await mentorshipService.deleteGoal(goalId);
    return { success: true, message: "Goal removed.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove goal.";
    return { success: false, message };
  }
}

export async function createMentorshipSessionAction(
  mentorshipId: string,
  data: CreateMentorshipSessionPayload,
): Promise<ApiResponse> {
  try {
    const session = await mentorshipService.createSession(mentorshipId, data);
    return { success: true, message: "Session scheduled.", data: session };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to schedule session.";
    return { success: false, message };
  }
}

export async function updateMentorshipSessionAction(
  sessionId: string,
  data: UpdateMentorshipSessionPayload,
): Promise<ApiResponse> {
  try {
    const session = await mentorshipService.updateSession(sessionId, data);
    return { success: true, message: "Session updated.", data: session };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update session.";
    return { success: false, message };
  }
}

export async function listMentorshipMessagesAction(
  mentorshipId: string,
  limit?: number,
): Promise<ApiResponse> {
  try {
    const data = await mentorshipService.listMessages(mentorshipId, limit);
    return { success: true, message: "Messages fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch messages.";
    return { success: false, message };
  }
}

export async function sendMentorshipMessageAction(
  mentorshipId: string,
  data: SendMentorshipMessagePayload,
): Promise<ApiResponse> {
  try {
    const message = await mentorshipService.sendMessage(mentorshipId, data);
    return { success: true, message: "Message sent.", data: message };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send message.";
    return { success: false, message };
  }
}

export async function completeMentorshipAction(
  mentorshipId: string,
  data: CompleteMentorshipPayload,
): Promise<ApiResponse> {
  try {
    const mentorship = await mentorshipService.completeMentorship(
      mentorshipId,
      data,
    );
    return {
      success: true,
      message: "Mentorship marked as complete.",
      data: mentorship,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to complete mentorship.";
    return { success: false, message };
  }
}

export async function rateMentorAction(
  mentorshipId: string,
  data: RateMentorPayload,
): Promise<ApiResponse> {
  try {
    const mentorship = await mentorshipService.rateMentor(mentorshipId, data);
    return {
      success: true,
      message: "Mentor rated successfully.",
      data: mentorship,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to rate mentor.";
    return { success: false, message };
  }
}

export async function endMentorshipAction(
  mentorshipId: string,
): Promise<ApiResponse> {
  try {
    const mentorship = await mentorshipService.endMentorship(mentorshipId);
    return { success: true, message: "Mentorship ended.", data: mentorship };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to end mentorship.";
    return { success: false, message };
  }
}

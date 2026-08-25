"use server";

import { discussionService } from "@/services/discussion.service";
import type { ApiResponse } from "@/types";
import type { ListDiscussionsParams } from "@/types/discussion.types";

/** Create a new discussion. */
export async function createDiscussion(data: {
  title: string;
  content: string;
  categoryId: string;
  courseId?: string;
  visibility?: "PUBLIC" | "DEPARTMENT" | "BATCH";
  tagIds?: string[];
}): Promise<ApiResponse> {
  try {
    const result = await discussionService.createDiscussion(data);
    return { success: true, message: "Discussion created.", data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create discussion.";
    return { success: false, message };
  }
}

/** List discussions with pagination and filtering. */
export async function listDiscussions(
  params: ListDiscussionsParams = {},
): Promise<ApiResponse> {
  try {
    const data = await discussionService.listDiscussions(params);
    return { success: true, message: "Discussions fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch discussions.";
    return { success: false, message };
  }
}

/** Get a single discussion by ID. */
export async function getDiscussion(id: string): Promise<ApiResponse> {
  try {
    const data = await discussionService.getDiscussionById(id);
    return { success: true, message: "Discussion fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch discussion.";
    return { success: false, message };
  }
}

/** Upvote or downvote a discussion. */
export async function voteDiscussion(
  discussionId: string,
  type: "UP" | "DOWN",
): Promise<ApiResponse> {
  try {
    const data = await discussionService.voteDiscussion(discussionId, type);
    return { success: true, message: "Vote recorded.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record vote.";
    return { success: false, message };
  }
}

/** Toggle bookmark on a discussion. */
export async function bookmarkDiscussion(
  discussionId: string,
): Promise<ApiResponse> {
  try {
    await discussionService.toggleBookmark(discussionId);
    return { success: true, message: "Bookmark toggled." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle bookmark.";
    return { success: false, message };
  }
}

/** Update a discussion (title, content, tags). */
export async function updateDiscussion(
  id: string,
  data: { title?: string; content?: string; tagIds?: string[] },
): Promise<ApiResponse> {
  try {
    const result = await discussionService.updateDiscussion(id, data);
    return { success: true, message: "Discussion updated.", data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update discussion.";
    return { success: false, message };
  }
}

/** List bookmarked discussions for the current user. */
export async function listBookmarks(): Promise<ApiResponse> {
  try {
    const data = await discussionService.listBookmarks();
    return { success: true, message: "Bookmarks fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch bookmarks.";
    return { success: false, message };
  }
}

/** Post a reply to a discussion. */
export async function postDiscussionReply(
  discussionId: string,
  data: { content: string; parentId?: string },
): Promise<ApiResponse> {
  try {
    const reply = await discussionService.postReply(discussionId, data);
    return { success: true, message: "Reply posted.", data: reply };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to post reply.";
    return { success: false, message };
  }
}

/** Upvote or downvote a reply. */
export async function voteReply(
  replyId: string,
  type: "UP" | "DOWN",
): Promise<ApiResponse> {
  try {
    const data = await discussionService.voteReply(replyId, type);
    return { success: true, message: "Vote recorded.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record vote.";
    return { success: false, message };
  }
}

/** List the current user's discussions. */
export async function myDiscussions(
  page = 1,
  limit = 12,
): Promise<ApiResponse> {
  try {
    const data = await discussionService.myDiscussions(page, limit);
    return { success: true, message: "Discussions fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch discussions.";
    return { success: false, message };
  }
}

/** List discussions the current user has replied to. */
export async function myReplies(
  page = 1,
  limit = 12,
): Promise<ApiResponse> {
  try {
    const data = await discussionService.myReplies(page, limit);
    return { success: true, message: "Discussions fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch discussions.";
    return { success: false, message };
  }
}

/** List replies for a discussion. */
export async function listReplies(
  discussionId: string,
  page = 1,
  limit = 100,
): Promise<ApiResponse> {
  try {
    const data = await discussionService.listReplies(discussionId, page, limit);
    return { success: true, message: "Replies fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch replies.";
    return { success: false, message };
  }
}

/** Toggle pin status (admin). */
export async function togglePin(id: string): Promise<ApiResponse> {
  try {
    const data = await discussionService.togglePin(id);
    return { success: true, message: "Pin toggled.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle pin.";
    return { success: false, message };
  }
}

/** Toggle lock status (admin). */
export async function toggleLock(id: string): Promise<ApiResponse> {
  try {
    const data = await discussionService.toggleLock(id);
    return { success: true, message: "Lock toggled.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle lock.";
    return { success: false, message };
  }
}

/** Mark/unmark solved (author). */
export async function markSolved(
  id: string,
): Promise<ApiResponse> {
  try {
    const data = await discussionService.markSolved(id);
    return { success: true, message: "Solved status toggled.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle solved.";
    return { success: false, message };
  }
}

/** Edit a reply. */
export async function editReply(
  discussionId: string,
  replyId: string,
  content: string,
): Promise<ApiResponse> {
  try {
    const data = await discussionService.updateReply(discussionId, replyId, { content });
    return { success: true, message: "Reply updated.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update reply.";
    return { success: false, message };
  }
}

/** Accept a reply as the solution. */
export async function acceptAnswer(
  discussionId: string,
  replyId: string,
): Promise<ApiResponse> {
  try {
    const data = await discussionService.acceptAnswer(discussionId, replyId);
    return { success: true, message: data.message, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to accept answer.";
    return { success: false, message };
  }
}

/** Report a reply. */
export async function reportReply(
  discussionId: string,
  replyId: string,
  data: { reason: string; details?: string },
): Promise<ApiResponse> {
  try {
    await discussionService.reportReply(replyId, data);
    return { success: true, message: "Reply reported." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to report reply.";
    return { success: false, message };
  }
}

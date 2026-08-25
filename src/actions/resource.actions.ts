"use server";

import { resourceService } from "@/services/resource.service";
import type { ApiResponse } from "@/types";
import type { ListResourcesParams } from "@/types/resource.types";

export async function listResources(
  params: ListResourcesParams = {},
): Promise<ApiResponse> {
  try {
    const data = await resourceService.listResources(params);
    return { success: true, message: "Resources fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch resources.";
    return { success: false, message };
  }
}

export async function getResource(id: string): Promise<ApiResponse> {
  try {
    const data = await resourceService.getResourceById(id);
    return { success: true, message: "Resource fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch resource.";
    return { success: false, message };
  }
}

export async function createResource(data: {
  title: string;
  description?: string;
  fileUrl: string;
  filePublicId?: string;
  fileType: string;
  fileSize: number;
  courseId: string;
  categoryId?: string;
  tags?: string[];
}): Promise<ApiResponse> {
  try {
    const resource = await resourceService.createResource(data);
    return { success: true, message: "Resource created.", data: resource };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create resource.";
    return { success: false, message };
  }
}

export async function updateResource(
  id: string,
  data: Partial<{ title: string; description: string; categoryId: string; tags: string[] }>,
): Promise<ApiResponse> {
  try {
    const resource = await resourceService.updateResource(id, data);
    return { success: true, message: "Resource updated.", data: resource };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update resource.";
    return { success: false, message };
  }
}

export async function deleteResource(id: string): Promise<ApiResponse> {
  try {
    await resourceService.deleteResource(id);
    return { success: true, message: "Resource deleted." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete resource.";
    return { success: false, message };
  }
}

export async function voteResource(
  resourceId: string,
  type: "UP" | "DOWN" = "UP",
): Promise<ApiResponse> {
  try {
    const data = await resourceService.toggleVote(resourceId, type);
    return { success: true, message: "Vote toggled.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record vote.";
    return { success: false, message };
  }
}

export async function bookmarkResource(
  resourceId: string,
): Promise<ApiResponse> {
  try {
    const data = await resourceService.toggleBookmark(resourceId);
    return { success: true, message: "Bookmark toggled.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle bookmark.";
    return { success: false, message };
  }
}

export async function addResourceComment(
  resourceId: string,
  data: { content: string; parentId?: string },
): Promise<ApiResponse> {
  try {
    const comment = await resourceService.addComment(resourceId, data);
    return { success: true, message: "Comment added.", data: comment };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add comment.";
    return { success: false, message };
  }
}

export async function reportResource(
  resourceId: string,
  data: { reason: string; description?: string },
): Promise<ApiResponse> {
  try {
    await resourceService.reportResource(resourceId, data);
    return { success: true, message: "Report submitted." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit report.";
    return { success: false, message };
  }
}

export async function listResourceComments(
  resourceId: string,
  page = 1,
  limit = 50,
): Promise<ApiResponse> {
  try {
    const data = await resourceService.listComments(resourceId, page, limit);
    return { success: true, message: "Comments fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch comments.";
    return { success: false, message };
  }
}

export async function deleteResourceComment(
  commentId: string,
): Promise<ApiResponse> {
  try {
    await resourceService.deleteComment(commentId);
    return { success: true, message: "Comment deleted." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete comment.";
    return { success: false, message };
  }
}

export async function voteComment(
  commentId: string,
  type: "UP" | "DOWN" = "UP",
): Promise<ApiResponse> {
  try {
    const data = await resourceService.toggleCommentVote(commentId, type);
    return { success: true, message: "Vote toggled.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record vote.";
    return { success: false, message };
  }
}

export async function editResourceComment(
  commentId: string,
  content: string,
): Promise<ApiResponse> {
  try {
    const data = await resourceService.editComment(commentId, content);
    return { success: true, message: "Comment updated.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update comment.";
    return { success: false, message };
  }
}

export async function recordResourceDownload(
  resourceId: string,
): Promise<ApiResponse> {
  try {
    const data = await resourceService.recordDownload(resourceId);
    return { success: true, message: "Download recorded.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record download.";
    return { success: false, message };
  }
}

export async function listTagsAction(): Promise<ApiResponse> {
  try {
    const data = await resourceService.listTags();
    return { success: true, message: "Tags fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch tags.";
    return { success: false, message };
  }
}

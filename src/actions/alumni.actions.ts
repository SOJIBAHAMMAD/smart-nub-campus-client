"use server";

import { alumniService } from "@/services/alumni.service";
import type { ApiResponse } from "@/types";
import type { DirectoryListParams } from "@/types/alumni.types";

/**
 * Server Action wrapping the alumni transition mutation.
 * Returns an `ApiResponse` envelope so client components can check `success`
 * and show toasts consistently. Invalidates the transition-status cache tag.
 */

export async function transitionToAlumniAction(): Promise<ApiResponse> {
  try {
    const data = await alumniService.transitionToAlumni();
    return {
      success: true,
      message: "You are now an alumnus of Northern University Bangladesh.",
      data,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to complete transition.";
    return { success: false, message };
  }
}

/** Fetch a page of alumni directory cards (URL-driven filters). */
export async function listDirectoryAction(
  params: DirectoryListParams = {},
): Promise<ApiResponse> {
  try {
    const data = await alumniService.listDirectory(params);
    return { success: true, message: "Directory fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch directory.";
    return { success: false, message };
  }
}

/** Fetch one directory member (self or visible via privacy rules). */
export async function getDirectoryMemberAction(
  userId: string,
): Promise<ApiResponse> {
  try {
    const data = await alumniService.getDirectoryMember(userId);
    return { success: true, message: "Member fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch member.";
    return { success: false, message };
  }
}

/** Fetch directory facet stats for the sidebar. */
export async function getDirectoryStatsAction(): Promise<ApiResponse> {
  try {
    const data = await alumniService.getDirectoryStats();
    return { success: true, message: "Directory stats fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch directory stats.";
    return { success: false, message };
  }
}

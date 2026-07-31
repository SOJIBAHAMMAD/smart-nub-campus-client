"use server";

import { revalidatePath } from "next/cache";
import { profileService, type EmploymentPayload } from "@/services/profile.service";
import type { ApiResponse } from "@/types";
import type { UpdateProfilePayload } from "@/types/profile.types";

export async function getMyProfile(): Promise<ApiResponse> {
  try {
    const data = await profileService.getMyProfile();
    return { success: true, message: "Profile fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch profile.";
    return { success: false, message };
  }
}

export async function getPublicProfile(userId: string, preview = false): Promise<ApiResponse> {
  try {
    const data = await profileService.getPublicProfile(userId, preview);
    return { success: true, message: "Profile fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch profile.";
    return { success: false, message };
  }
}

export async function updateProfile(
  data: UpdateProfilePayload,
): Promise<ApiResponse> {
  try {
    const result = await profileService.updateProfile(data);
    revalidatePath("/profile");
    return { success: true, message: "Profile updated.", data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile.";
    return { success: false, message };
  }
}

export async function getUserStats(userId: string): Promise<ApiResponse> {
  try {
    const data = await profileService.getUserStats(userId);
    return { success: true, message: "Stats fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch stats.";
    return { success: false, message };
  }
}

export async function getUserBadges(userId: string): Promise<ApiResponse> {
  try {
    const data = await profileService.getUserBadges(userId);
    return { success: true, message: "Badges fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch badges.";
    return { success: false, message };
  }
}

export async function addSkill(tagId: string): Promise<ApiResponse> {
  try {
    const data = await profileService.addSkill(tagId);
    revalidatePath("/profile");
    return { success: true, message: "Skill added.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add skill.";
    return { success: false, message };
  }
}

export async function removeSkill(userSkillId: string): Promise<ApiResponse> {
  try {
    await profileService.removeSkill(userSkillId);
    revalidatePath("/profile");
    return { success: true, message: "Skill removed." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove skill.";
    return { success: false, message };
  }
}

export async function createEmploymentAction(
  data: EmploymentPayload,
): Promise<ApiResponse> {
  try {
    const result = await profileService.createEmployment(data);
    revalidatePath("/profile");
    revalidatePath("/alumni");
    return { success: true, message: "Employment record added.", data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add employment record.";
    return { success: false, message };
  }
}

export async function updateEmploymentAction(
  id: string,
  data: Partial<EmploymentPayload>,
): Promise<ApiResponse> {
  try {
    const result = await profileService.updateEmployment(id, data);
    revalidatePath("/profile");
    revalidatePath("/alumni");
    return { success: true, message: "Employment record updated.", data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update employment record.";
    return { success: false, message };
  }
}

export async function deleteEmploymentAction(id: string): Promise<ApiResponse> {
  try {
    await profileService.deleteEmployment(id);
    revalidatePath("/profile");
    revalidatePath("/alumni");
    return { success: true, message: "Employment record removed." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove employment record.";
    return { success: false, message };
  }
}

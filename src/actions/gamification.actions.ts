"use server";

import { gamificationService } from "@/services/gamification.service";
import type { ApiResponse } from "@/types";

/** Get the current user's reputation points. */
export async function getMyPoints(): Promise<ApiResponse> {
  try {
    const data = await gamificationService.getMyPoints();
    return { success: true, message: "Points fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch points.";
    return { success: false, message };
  }
}

/** Get my reputation log. */
export async function getMyReputationHistory(
  page = 1,
  limit = 20,
): Promise<ApiResponse> {
  try {
    const data = await gamificationService.getMyReputationHistory(page, limit);
    return { success: true, message: "Reputation history fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch reputation history.";
    return { success: false, message };
  }
}

/** Get badges earned by the current user. */
export async function getMyBadges(): Promise<ApiResponse> {
  try {
    const data = await gamificationService.getMyBadges();
    return { success: true, message: "Badges fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch badges.";
    return { success: false, message };
  }
}

/** Get a specific user's points. */
export async function getUserPoints(userId: string): Promise<ApiResponse> {
  try {
    const data = await gamificationService.getUserPoints(userId);
    return { success: true, message: "User points fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch user points.";
    return { success: false, message };
  }
}

/** Get a specific user's reputation history. */
export async function getUserReputationHistory(
  userId: string,
  page = 1,
  limit = 20,
): Promise<ApiResponse> {
  try {
    const data = await gamificationService.getUserReputationHistory(userId, page, limit);
    return { success: true, message: "Reputation history fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch reputation history.";
    return { success: false, message };
  }
}

/** Get the leaderboard. */
export async function getLeaderboard(
  page = 1,
  limit = 50,
): Promise<ApiResponse> {
  try {
    const data = await gamificationService.getLeaderboard({ page, limit });
    return { success: true, message: "Leaderboard fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch leaderboard.";
    return { success: false, message };
  }
}

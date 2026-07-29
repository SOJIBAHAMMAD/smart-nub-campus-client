"use server";

import { qaService } from "@/services/qa.service";
import type { ApiResponse } from "@/types";
import type { ListQuestionsParams } from "@/types/qa.types";

/** Create a new question. */
export async function createQuestion(data: {
  title: string;
  content: string;
  categoryId: string;
  courseId?: string;
  tagIds?: string[];
}): Promise<ApiResponse> {
  try {
    const result = await qaService.createQuestion(data);
    return { success: true, message: "Question created.", data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create question.";
    return { success: false, message };
  }
}

/** Update an existing question. */
export async function updateQuestion(
  id: string,
  data: {
    title?: string;
    content?: string;
    tagIds?: string[];
  },
): Promise<ApiResponse> {
  try {
    const result = await qaService.updateQuestion(id, data);
    return { success: true, message: "Question updated.", data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update question.";
    return { success: false, message };
  }
}

/** List questions with pagination and filtering. */
export async function listQuestions(
  params: ListQuestionsParams = {},
): Promise<ApiResponse> {
  try {
    const data = await qaService.listQuestions(params);
    return { success: true, message: "Questions fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch questions.";
    return { success: false, message };
  }
}

/** Get a single question by ID. */
export async function getQuestion(id: string): Promise<ApiResponse> {
  try {
    const data = await qaService.getQuestionById(id);
    return { success: true, message: "Question fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch question.";
    return { success: false, message };
  }
}

/** Upvote or downvote a question. */
export async function voteQuestion(
  questionId: string,
  type: "UP" | "DOWN",
): Promise<ApiResponse> {
  try {
    const data = await qaService.voteQuestion(questionId, type);
    return { success: true, message: "Vote recorded.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record vote.";
    return { success: false, message };
  }
}

/** Toggle bookmark on a question. */
export async function bookmarkQuestion(
  questionId: string,
): Promise<ApiResponse> {
  try {
    await qaService.bookmarkQuestion(questionId);
    return { success: true, message: "Bookmark toggled." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle bookmark.";
    return { success: false, message };
  }
}

/** List answers for a question. */
export async function listAnswers(
  questionId: string,
): Promise<ApiResponse> {
  try {
    const data = await qaService.listAnswers(questionId);
    return { success: true, message: "Answers fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch answers.";
    return { success: false, message };
  }
}

/** List bookmarked questions for the current user. */
export async function listBookmarkedQuestions(
  page = 1,
  limit = 12,
): Promise<ApiResponse> {
  try {
    const data = await qaService.listBookmarks(page, limit);
    return { success: true, message: "Bookmarks fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch bookmarks.";
    return { success: false, message };
  }
}

/** Post an answer to a question. */
export async function postAnswer(
  questionId: string,
  content: string,
): Promise<ApiResponse> {
  try {
    const answer = await qaService.createAnswer(questionId, { content });
    return { success: true, message: "Answer posted.", data: answer };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to post answer.";
    return { success: false, message };
  }
}

/** Upvote or downvote an answer. */
export async function voteAnswer(
  answerId: string,
  type: "UP" | "DOWN",
): Promise<ApiResponse> {
  try {
    const data = await qaService.voteAnswer(answerId, type);
    return { success: true, message: "Vote recorded.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record vote.";
    return { success: false, message };
  }
}

/** Accept an answer (question author only). */
export async function acceptAnswer(
  questionId: string,
  answerId: string,
): Promise<ApiResponse> {
  try {
    const data = await qaService.acceptAnswer(questionId, answerId);
    return { success: true, message: "Answer accepted.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to accept answer.";
    return { success: false, message };
  }
}

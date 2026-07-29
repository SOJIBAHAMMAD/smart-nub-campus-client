import { z } from "zod";

// ── Create Question ──────────────────────────────────────────────────────────

export const createQuestionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must be at most 200 characters"),
    content: z.string().trim().min(1, "Content is required"),
    categoryId: z.string().uuid("Invalid category ID"),
    courseId: z.string().uuid("Invalid course ID").optional(),
    tagIds: z.array(z.string().uuid("Invalid tag ID")).optional(),
  })
  .strict();

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

// ── Update Question ──────────────────────────────────────────────────────────

export const updateQuestionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1)
      .max(200, "Title must be at most 200 characters")
      .optional(),
    content: z.string().trim().optional(),
    categoryId: z.string().uuid("Invalid category ID").optional(),
    courseId: z.string().uuid("Invalid course ID").optional(),
    isClosed: z.boolean().optional(),
    tagIds: z.array(z.string().uuid("Invalid tag ID")).optional(),
  })
  .strict();

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;

// ── Create Answer ────────────────────────────────────────────────────────────

export const createAnswerSchema = z
  .object({
    content: z.string().trim().min(1, "Answer content is required"),
  })
  .strict();

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;

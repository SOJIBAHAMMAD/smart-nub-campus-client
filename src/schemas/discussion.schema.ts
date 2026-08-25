import { z } from "zod";

// ── Create Discussion ────────────────────────────────────────────────────────

export const createDiscussionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must be at most 200 characters"),
    content: z.string().trim().min(1, "Content is required"),
    categoryId: z.string().uuid("Invalid category ID"),
    courseId: z.string().uuid("Invalid course ID").optional(),
    visibility: z.enum(["PUBLIC", "DEPARTMENT", "BATCH"]).optional(),
    tagIds: z.array(z.string().uuid("Invalid tag ID")).min(1).optional(),
  })
  .strict();

export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;

// ── Update Discussion ────────────────────────────────────────────────────────

export const updateDiscussionSchema = z
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
    visibility: z.enum(["PUBLIC", "DEPARTMENT", "BATCH"]).optional(),
    tagIds: z.array(z.string().uuid("Invalid tag ID")).min(1).optional(),
  })
  .strict();

export type UpdateDiscussionInput = z.infer<typeof updateDiscussionSchema>;

// ── Create Reply ─────────────────────────────────────────────────────────────

export const createReplySchema = z
  .object({
    content: z.string().trim().min(1, "Reply content is required"),
    parentId: z.string().uuid("Invalid parent reply ID").optional(),
  })
  .strict();

export type CreateReplyInput = z.infer<typeof createReplySchema>;

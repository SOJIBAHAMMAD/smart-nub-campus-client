import { z } from "zod";

// ── Send Connection Request ──────────────────────────────────────────────────

export const sendConnectionRequestSchema = z
  .object({
    // Better Auth user IDs are not UUIDs, so accept any non-empty string.
    receiverId: z.string().min(1, "Invalid receiver ID"),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export type SendConnectionRequestInput = z.infer<
  typeof sendConnectionRequestSchema
>;

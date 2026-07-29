import { z } from "zod";

// ── Send AI Message ──────────────────────────────────────────────────────────

export const sendAIMessageSchema = z
  .object({
    content: z.string().trim().min(1, "Message content is required"),
  })
  .strict();

export type SendAIMessageInput = z.infer<typeof sendAIMessageSchema>;

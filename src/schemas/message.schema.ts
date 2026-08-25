import { z } from "zod";

// ── Send Message ─────────────────────────────────────────────────────────────

export const sendMessageSchema = z
  .object({
    conversationId: z.string().uuid("Invalid conversation ID"),
    content: z.string().trim().min(1, "Message content is required"),
    type: z.enum(["TEXT", "FILE", "IMAGE"]).optional(),
    replyToId: z.string().uuid("Invalid message ID").optional(),
  })
  .strict();

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ── Create Conversation ──────────────────────────────────────────────────────

export const createConversationSchema = z
  .object({
    type: z.enum(["DIRECT", "GROUP"]).optional(),
    name: z.string().trim().optional(),
    description: z.string().trim().optional(),
    participantIds: z
      .array(z.string().uuid("Invalid user ID"))
      .min(1, "At least one participant is required"),
  })
  .strict();

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

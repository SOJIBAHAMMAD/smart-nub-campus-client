import { describe, expect, it } from "vitest";
import { sendMessageSchema, createConversationSchema } from "../message.schema";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("sendMessageSchema", () => {
  const valid = {
    conversationId: UUID,
    content: "Hello there",
  };

  it("accepts a valid message", () => {
    expect(sendMessageSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an image message with a reply", () => {
    expect(
      sendMessageSchema.safeParse({
        ...valid,
        type: "IMAGE",
        replyToId: UUID,
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid conversation id", () => {
    expect(sendMessageSchema.safeParse({ ...valid, conversationId: "abc" }).success).toBe(false);
  });

  it("rejects empty content", () => {
    expect(sendMessageSchema.safeParse({ ...valid, content: " " }).success).toBe(false);
  });

  it("rejects an unsupported message type", () => {
    expect(sendMessageSchema.safeParse({ ...valid, type: "VIDEO" }).success).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(sendMessageSchema.safeParse({ ...valid, readAt: "now" }).success).toBe(false);
  });
});

describe("createConversationSchema", () => {
  it("accepts a direct conversation with one participant", () => {
    expect(createConversationSchema.safeParse({ participantIds: [UUID] }).success).toBe(true);
  });

  it("accepts a group conversation", () => {
    expect(
      createConversationSchema.safeParse({
        type: "GROUP",
        name: "Study Group",
        description: "Finals prep",
        participantIds: [UUID, UUID],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty participant list", () => {
    expect(createConversationSchema.safeParse({ participantIds: [] }).success).toBe(false);
  });

  it("rejects an invalid participant id", () => {
    expect(createConversationSchema.safeParse({ participantIds: ["not-a-uuid"] }).success).toBe(false);
  });

  it("rejects an unsupported conversation type", () => {
    expect(
      createConversationSchema.safeParse({ type: "SINGLE", participantIds: [UUID] }).success,
    ).toBe(false);
  });
});

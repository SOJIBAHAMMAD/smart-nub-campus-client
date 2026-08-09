import { describe, expect, it } from "vitest";
import {
  createDiscussionSchema,
  updateDiscussionSchema,
  createReplySchema,
} from "../discussion.schema";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("createDiscussionSchema", () => {
  const valid = {
    title: "How do you study for finals?",
    content: "Looking for the best study strategies.",
    categoryId: UUID,
  };

  it("accepts a valid payload", () => {
    expect(createDiscussionSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all optional fields", () => {
    expect(
      createDiscussionSchema.safeParse({
        ...valid,
        courseId: UUID,
        visibility: "BATCH",
        tagIds: [UUID, UUID],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(createDiscussionSchema.safeParse({ ...valid, title: "   " }).success).toBe(false);
  });

  it("rejects a title longer than 200 characters", () => {
    expect(createDiscussionSchema.safeParse({ ...valid, title: "x".repeat(201) }).success).toBe(false);
  });

  it("rejects an invalid category id", () => {
    expect(createDiscussionSchema.safeParse({ ...valid, categoryId: "not-a-uuid" }).success).toBe(false);
  });

  it("rejects an unsupported visibility", () => {
    expect(createDiscussionSchema.safeParse({ ...valid, visibility: "PRIVATE" }).success).toBe(false);
  });

  it("rejects an empty tagIds array", () => {
    expect(createDiscussionSchema.safeParse({ ...valid, tagIds: [] }).success).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(createDiscussionSchema.safeParse({ ...valid, pinned: true }).success).toBe(false);
  });
});

describe("updateDiscussionSchema", () => {
  it("accepts an empty object", () => {
    expect(updateDiscussionSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a partial update", () => {
    expect(
      updateDiscussionSchema.safeParse({ title: "New title", visibility: "PUBLIC" }).success,
    ).toBe(true);
  });

  it("rejects a title longer than 200 characters", () => {
    expect(updateDiscussionSchema.safeParse({ title: "x".repeat(201) }).success).toBe(false);
  });

  it("rejects an invalid course id", () => {
    expect(updateDiscussionSchema.safeParse({ courseId: "nope" }).success).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(updateDiscussionSchema.safeParse({ isPinned: true }).success).toBe(false);
  });
});

describe("createReplySchema", () => {
  it("accepts content without a parent", () => {
    expect(createReplySchema.safeParse({ content: "Great point!" }).success).toBe(true);
  });

  it("accepts content with a parent id", () => {
    expect(createReplySchema.safeParse({ content: "Agreed", parentId: UUID }).success).toBe(true);
  });

  it("rejects empty content", () => {
    expect(createReplySchema.safeParse({ content: "   " }).success).toBe(false);
  });

  it("rejects an invalid parent id", () => {
    expect(createReplySchema.safeParse({ content: "Agreed", parentId: "123" }).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  createQuestionSchema,
  updateQuestionSchema,
  createAnswerSchema,
} from "../qa.schema";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("createQuestionSchema", () => {
  const valid = {
    title: "What is a closure?",
    content: "I need an explanation with examples.",
    categoryId: UUID,
  };

  it("accepts a valid payload", () => {
    expect(createQuestionSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional course and tags", () => {
    expect(
      createQuestionSchema.safeParse({
        ...valid,
        courseId: UUID,
        tagIds: [UUID, UUID],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(createQuestionSchema.safeParse({ ...valid, title: "" }).success).toBe(false);
  });

  it("rejects a title longer than 200 characters", () => {
    expect(createQuestionSchema.safeParse({ ...valid, title: "x".repeat(201) }).success).toBe(false);
  });

  it("rejects an invalid category id", () => {
    expect(createQuestionSchema.safeParse({ ...valid, categoryId: "bad-id" }).success).toBe(false);
  });

  it("rejects an invalid tag id", () => {
    expect(createQuestionSchema.safeParse({ ...valid, tagIds: ["not-uuid"] }).success).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(createQuestionSchema.safeParse({ ...valid, isClosed: true }).success).toBe(false);
  });
});

describe("updateQuestionSchema", () => {
  it("accepts an empty object", () => {
    expect(updateQuestionSchema.safeParse({}).success).toBe(true);
  });

  it("accepts closing a question", () => {
    expect(updateQuestionSchema.safeParse({ isClosed: true }).success).toBe(true);
  });

  it("rejects a non-boolean isClosed", () => {
    expect(updateQuestionSchema.safeParse({ isClosed: "yes" }).success).toBe(false);
  });

  it("rejects a title longer than 200 characters", () => {
    expect(updateQuestionSchema.safeParse({ title: "x".repeat(201) }).success).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(updateQuestionSchema.safeParse({ views: 3 }).success).toBe(false);
  });
});

describe("createAnswerSchema", () => {
  it("accepts non-empty content", () => {
    expect(createAnswerSchema.safeParse({ content: "A closure captures..." }).success).toBe(true);
  });

  it("rejects empty content", () => {
    expect(createAnswerSchema.safeParse({ content: "  " }).success).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(createAnswerSchema.safeParse({ content: "Answer", isAccepted: true }).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  applicationFormSchema,
  createTeamRequestSchema,
  updateTeamRequestSchema,
  createApplicationSchema,
  reviewApplicationSchema,
} from "../team.schema";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("applicationFormSchema", () => {
  it("accepts an empty form config", () => {
    expect(applicationFormSchema.safeParse({ fields: [], questions: [] }).success).toBe(true);
  });

  it("accepts fields and questions with defaults", () => {
    expect(
      applicationFormSchema.safeParse({
        fields: [{ key: "name", required: true }, { key: "email" }],
        questions: [{ id: "q1", label: "Why join?", type: "PARAGRAPH" }],
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown field key", () => {
    expect(
      applicationFormSchema.safeParse({ fields: [{ key: "bogus", required: false }], questions: [] })
        .success,
    ).toBe(false);
  });

  it("rejects a blank question label", () => {
    expect(
      applicationFormSchema.safeParse({
        fields: [],
        questions: [{ id: "q1", label: "   ", type: "SHORT_TEXT", required: false }],
      }).success,
    ).toBe(false);
  });

  it("rejects an unsupported question type", () => {
    expect(
      applicationFormSchema.safeParse({
        fields: [],
        questions: [{ id: "q1", label: "Why?", type: "MULTIPLE_CHOICE", required: false }],
      }).success,
    ).toBe(false);
  });

  it("rejects more than 20 fields", () => {
    expect(
      applicationFormSchema.safeParse({
        fields: Array.from({ length: 21 }, () => ({ key: "name", required: false })),
        questions: [],
      }).success,
    ).toBe(false);
  });
});

describe("createTeamRequestSchema", () => {
  const valid = {
    title: "Looking for a backend developer",
    description: "We are building a campus marketplace app for final year project.",
    lookingForCount: 3,
    skillTagIds: [UUID],
  };

  it("accepts a valid payload", () => {
    expect(createTeamRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all optional fields", () => {
    expect(
      createTeamRequestSchema.safeParse({
        ...valid,
        projectName: "Campus Market",
        deadline: "2025-12-31T23:59:59.000Z",
        category: "Web",
        difficulty: "INTERMEDIATE",
        meetingPreference: "HYBRID",
        contactInfo: "me@example.com",
        applicationForm: { fields: [{ key: "github", required: false }], questions: [] },
        skillTagIds: [UUID, UUID, UUID],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(createTeamRequestSchema.safeParse({ ...valid, title: "" }).success).toBe(false);
  });

  it("rejects a description shorter than 10 characters", () => {
    expect(createTeamRequestSchema.safeParse({ ...valid, description: "Too short" }).success).toBe(false);
  });

  it("rejects a lookingForCount outside 1-20", () => {
    expect(createTeamRequestSchema.safeParse({ ...valid, lookingForCount: 0 }).success).toBe(false);
    expect(createTeamRequestSchema.safeParse({ ...valid, lookingForCount: 21 }).success).toBe(false);
  });

  it("rejects a non-integer lookingForCount", () => {
    expect(createTeamRequestSchema.safeParse({ ...valid, lookingForCount: 2.5 }).success).toBe(false);
  });

  it("rejects an empty skillTagIds array", () => {
    expect(createTeamRequestSchema.safeParse({ ...valid, skillTagIds: [] }).success).toBe(false);
  });

  it("rejects more than 10 skill tags", () => {
    expect(
      createTeamRequestSchema.safeParse({ ...valid, skillTagIds: Array.from({ length: 11 }, () => UUID) })
        .success,
    ).toBe(false);
  });

  it("rejects an invalid deadline format", () => {
    expect(createTeamRequestSchema.safeParse({ ...valid, deadline: "2025-12-31" }).success).toBe(false);
  });

  it("rejects an unsupported difficulty", () => {
    expect(createTeamRequestSchema.safeParse({ ...valid, difficulty: "PRO" }).success).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(createTeamRequestSchema.safeParse({ ...valid, isRemote: true }).success).toBe(false);
  });
});

describe("updateTeamRequestSchema", () => {
  it("accepts an empty object", () => {
    expect(updateTeamRequestSchema.safeParse({}).success).toBe(true);
  });

  it("accepts closing the request", () => {
    expect(updateTeamRequestSchema.safeParse({ status: "CLOSED" }).success).toBe(true);
  });

  it("rejects an unsupported status", () => {
    expect(updateTeamRequestSchema.safeParse({ status: "DRAFT" }).success).toBe(false);
  });

  it("rejects a description shorter than 10 characters", () => {
    expect(updateTeamRequestSchema.safeParse({ description: "short" }).success).toBe(false);
  });

  it("rejects a title longer than 200 characters", () => {
    expect(updateTeamRequestSchema.safeParse({ title: "x".repeat(201) }).success).toBe(false);
  });
});

describe("createApplicationSchema", () => {
  it("accepts an empty application", () => {
    expect(createApplicationSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a message and responses", () => {
    expect(
      createApplicationSchema.safeParse({
        message: "I am excited to join",
        responses: { "q1": "3 years of React", "q2": "Yes" },
      }).success,
    ).toBe(true);
  });

  it("rejects a message longer than 1000 characters", () => {
    expect(createApplicationSchema.safeParse({ message: "x".repeat(1001) }).success).toBe(false);
  });

  it("rejects a response longer than 5000 characters", () => {
    expect(
      createApplicationSchema.safeParse({ responses: { q1: "x".repeat(5001) } }).success,
    ).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(createApplicationSchema.safeParse({ resumeUrl: "https://x.com/r.pdf" }).success).toBe(false);
  });
});

describe("reviewApplicationSchema", () => {
  it("accepts ACCEPTED and REJECTED", () => {
    expect(reviewApplicationSchema.safeParse({ status: "ACCEPTED" }).success).toBe(true);
    expect(reviewApplicationSchema.safeParse({ status: "REJECTED" }).success).toBe(true);
  });

  it("rejects any other status", () => {
    expect(reviewApplicationSchema.safeParse({ status: "PENDING" }).success).toBe(false);
  });

  it("rejects a missing status", () => {
    expect(reviewApplicationSchema.safeParse({}).success).toBe(false);
  });
});

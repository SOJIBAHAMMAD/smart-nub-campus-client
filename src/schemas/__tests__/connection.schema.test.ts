import { describe, expect, it } from "vitest";
import { sendConnectionRequestSchema } from "../connection.schema";

describe("sendConnectionRequestSchema", () => {
  it("accepts a receiver id without a note", () => {
    expect(sendConnectionRequestSchema.safeParse({ receiverId: "user_abc123" }).success).toBe(true);
  });

  it("accepts a receiver id with a short note", () => {
    expect(
      sendConnectionRequestSchema.safeParse({ receiverId: "user_abc123", note: "Hi!" }).success,
    ).toBe(true);
  });

  it("accepts a non-uuid receiver id", () => {
    expect(sendConnectionRequestSchema.safeParse({ receiverId: "a1b2c3d4" }).success).toBe(true);
  });

  it("rejects an empty receiver id", () => {
    expect(sendConnectionRequestSchema.safeParse({ receiverId: "" }).success).toBe(false);
  });

  it("rejects a note longer than 500 characters", () => {
    expect(
      sendConnectionRequestSchema.safeParse({
        receiverId: "user_abc123",
        note: "x".repeat(501),
      }).success,
    ).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(
      sendConnectionRequestSchema.safeParse({ receiverId: "user_abc123", extra: true }).success,
    ).toBe(false);
  });
});

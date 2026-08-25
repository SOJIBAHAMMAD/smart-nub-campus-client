import { describe, expect, it } from "vitest";
import { sendAIMessageSchema } from "../ai.schema";

describe("sendAIMessageSchema", () => {
  it("accepts a non-empty message", () => {
    expect(sendAIMessageSchema.safeParse({ content: "Explain closures" }).success).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    expect(sendAIMessageSchema.safeParse({ content: "  Hello  " }).success).toBe(true);
  });

  it("rejects an empty or whitespace-only message", () => {
    expect(sendAIMessageSchema.safeParse({ content: "" }).success).toBe(false);
    expect(sendAIMessageSchema.safeParse({ content: "   " }).success).toBe(false);
  });

  it("rejects a missing content field", () => {
    expect(sendAIMessageSchema.safeParse({}).success).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(sendAIMessageSchema.safeParse({ content: "Hi", extra: 1 }).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "../profile.schema";

describe("updateProfileSchema", () => {
  it("accepts an empty object", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a full valid profile update", () => {
    expect(
      updateProfileSchema.safeParse({
        bio: "Full-stack developer",
        coverImage: "https://example.com/cover.jpg",
        githubUrl: "https://github.com/jane",
        linkedinUrl: "https://linkedin.com/in/jane",
        portfolioUrl: "https://jane.dev",
        websiteUrl: "https://example.com",
        location: "Dhaka",
        phoneNumber: "+8801700000000",
        currentSemester: 8,
        batchYear: 2022,
      }).success,
    ).toBe(true);
  });

  it("rejects a bio longer than 500 characters", () => {
    expect(updateProfileSchema.safeParse({ bio: "x".repeat(501) }).success).toBe(false);
  });

  it("rejects an invalid url field", () => {
    expect(updateProfileSchema.safeParse({ githubUrl: "not-a-url" }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ coverImage: "cover.jpg" }).success).toBe(false);
  });

  it("rejects a currentSemester outside 1-16", () => {
    expect(updateProfileSchema.safeParse({ currentSemester: 0 }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ currentSemester: 17 }).success).toBe(false);
  });

  it("rejects a non-integer currentSemester", () => {
    expect(updateProfileSchema.safeParse({ currentSemester: 3.5 }).success).toBe(false);
  });

  it("rejects a batchYear outside 2000-2030", () => {
    expect(updateProfileSchema.safeParse({ batchYear: 1999 }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ batchYear: 2031 }).success).toBe(false);
  });

  it("rejects a location longer than 100 characters", () => {
    expect(updateProfileSchema.safeParse({ location: "x".repeat(101) }).success).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(updateProfileSchema.safeParse({ displayName: "Jane" }).success).toBe(false);
  });
});

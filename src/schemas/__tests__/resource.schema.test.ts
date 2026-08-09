import { describe, expect, it } from "vitest";
import {
  createResourceSchema,
  updateResourceSchema,
  queryResourcesSchema,
  createCommentSchema,
  reportResourceSchema,
} from "../resource.schema";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("createResourceSchema", () => {
  const valid = {
    title: "Data Structures Notes",
    fileUrl: "https://files.example.com/notes.pdf",
    filePublicId: "resources/notes-1",
    fileType: "application/pdf",
    fileSize: 2048,
    courseId: UUID,
    categoryId: UUID,
    tags: ["DSA", "CSE"],
  };

  it("accepts a valid payload", () => {
    expect(createResourceSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an optional description", () => {
    expect(createResourceSchema.safeParse({ ...valid, description: "Exam prep" }).success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(createResourceSchema.safeParse({ ...valid, title: "  " }).success).toBe(false);
  });

  it("rejects a file url that is not a url", () => {
    expect(createResourceSchema.safeParse({ ...valid, fileUrl: "notes.pdf" }).success).toBe(false);
  });

  it("rejects a non-positive file size", () => {
    expect(createResourceSchema.safeParse({ ...valid, fileSize: 0 }).success).toBe(false);
    expect(createResourceSchema.safeParse({ ...valid, fileSize: -5 }).success).toBe(false);
  });

  it("rejects a non-integer file size", () => {
    expect(createResourceSchema.safeParse({ ...valid, fileSize: 2.5 }).success).toBe(false);
  });

  it("rejects an empty tags array", () => {
    expect(createResourceSchema.safeParse({ ...valid, tags: [] }).success).toBe(false);
  });

  it("rejects a blank tag inside the tags array", () => {
    expect(createResourceSchema.safeParse({ ...valid, tags: ["DSA", "  "] }).success).toBe(false);
  });

  it("rejects unknown keys because the schema is strict", () => {
    expect(createResourceSchema.safeParse({ ...valid, downloads: 5 }).success).toBe(false);
  });
});

describe("updateResourceSchema", () => {
  it("accepts an empty object", () => {
    expect(updateResourceSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a partial update", () => {
    expect(updateResourceSchema.safeParse({ title: "Updated", tags: ["Math"] }).success).toBe(true);
  });

  it("rejects a blank tag inside the tags array", () => {
    expect(updateResourceSchema.safeParse({ tags: [""] }).success).toBe(false);
  });

  it("rejects a title longer than 200 characters", () => {
    expect(updateResourceSchema.safeParse({ title: "x".repeat(201) }).success).toBe(false);
  });
});

describe("queryResourcesSchema", () => {
  it("accepts an empty filter", () => {
    expect(queryResourcesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid pagination and sorting", () => {
    expect(
      queryResourcesSchema.safeParse({
        page: 2,
        limit: 50,
        sortBy: "upvoteCount",
        sortOrder: "desc",
        search: "algorithms",
        tag: "DSA",
      }).success,
    ).toBe(true);
  });

  it("rejects a page of 0", () => {
    expect(queryResourcesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects a limit outside 1-100", () => {
    expect(queryResourcesSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(queryResourcesSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects an unknown sortBy", () => {
    expect(queryResourcesSchema.safeParse({ sortBy: "size" }).success).toBe(false);
  });

  it("rejects an unknown sortOrder", () => {
    expect(queryResourcesSchema.safeParse({ sortOrder: "up" }).success).toBe(false);
  });

  it("rejects an invalid course id", () => {
    expect(queryResourcesSchema.safeParse({ courseId: "123" }).success).toBe(false);
  });
});

describe("createCommentSchema", () => {
  it("accepts content without a parent", () => {
    expect(createCommentSchema.safeParse({ content: "Nice share" }).success).toBe(true);
  });

  it("accepts content with a parent id", () => {
    expect(createCommentSchema.safeParse({ content: "Reply", parentId: UUID }).success).toBe(true);
  });

  it("rejects empty content", () => {
    expect(createCommentSchema.safeParse({ content: " " }).success).toBe(false);
  });

  it("rejects an invalid parent id", () => {
    expect(createCommentSchema.safeParse({ content: "Reply", parentId: "abc" }).success).toBe(false);
  });
});

describe("reportResourceSchema", () => {
  it("accepts every supported reason", () => {
    const reasons = [
      "SPAM",
      "COPYRIGHT",
      "OFFENSIVE_CONTENT",
      "DUPLICATE",
      "WRONG_CATEGORY",
      "BROKEN_FILE",
      "MALWARE",
      "OTHER",
    ];
    for (const reason of reasons) {
      expect(reportResourceSchema.safeParse({ reason }).success).toBe(true);
    }
  });

  it("accepts an optional description", () => {
    expect(
      reportResourceSchema.safeParse({ reason: "SPAM", description: "It is spam" }).success,
    ).toBe(true);
  });

  it("rejects an unknown reason", () => {
    expect(reportResourceSchema.safeParse({ reason: "SCAM" }).success).toBe(false);
  });

  it("rejects a missing reason", () => {
    expect(reportResourceSchema.safeParse({}).success).toBe(false);
  });
});

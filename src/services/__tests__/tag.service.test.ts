import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";

const mocks = vi.hoisted(() => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    postForm: vi.fn(),
  },
}));

vi.mock("@/lib/api-client", () => ({
  default: mocks.apiClient,
  apiClient: mocks.apiClient,
}));

import { tagService } from "@/services/tag.service";
import type { TagBasic, TagItem } from "@/services/tag.service";

const TAGS: TagItem[] = [
  {
    id: "tag-1",
    name: "Databases",
    slug: "databases",
    totalCount: 4,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "tag-2",
    name: "Networking",
    slug: "networking",
    totalCount: 2,
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

describe("tagService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listTags", () => {
    it("calls GET /tags and returns the tags", async () => {
      (mocks.apiClient.get as Mock).mockResolvedValue({
        data: { success: true, message: "", data: TAGS },
      });

      const result = await tagService.listTags();

      expect(mocks.apiClient.get).toHaveBeenCalledTimes(1);
      expect(mocks.apiClient.get).toHaveBeenCalledWith("/tags");
      expect(result).toEqual(TAGS);
    });

    it("appends an encoded search query when provided", async () => {
      (mocks.apiClient.get as Mock).mockResolvedValue({
        data: { success: true, message: "", data: TAGS },
      });

      await tagService.listTags("database systems");

      expect(mocks.apiClient.get).toHaveBeenCalledWith(
        "/tags?search=database%20systems",
      );
    });

    it("returns an empty array when the response has no data", async () => {
      (mocks.apiClient.get as Mock).mockResolvedValue({
        data: { success: false, message: "nope" },
      });

      await expect(tagService.listTags()).resolves.toEqual([]);
    });

    it("propagates network errors", async () => {
      (mocks.apiClient.get as Mock).mockRejectedValue(
        new Error("Failed to fetch tags"),
      );

      await expect(tagService.listTags()).rejects.toThrow("Failed to fetch tags");
    });
  });

  describe("createTag", () => {
    it("POSTs the name to /tags and returns the created tag", async () => {
      const created: TagBasic = { id: "tag-9", name: "AI", slug: "ai" };
      (mocks.apiClient.post as Mock).mockResolvedValue({
        data: { success: true, message: "", data: created },
      });

      const result = await tagService.createTag("AI");

      expect(mocks.apiClient.post).toHaveBeenCalledTimes(1);
      expect(mocks.apiClient.post).toHaveBeenCalledWith("/tags", { name: "AI" });
      expect(result).toEqual(created);
    });

    it("throws when the response contains no tag data", async () => {
      (mocks.apiClient.post as Mock).mockResolvedValue({
        data: { success: false, message: "Tag not found" },
      });

      await expect(tagService.createTag("AI")).rejects.toThrow("Tag not found");
    });
  });

  describe("createTags", () => {
    it("POSTs names to the batch endpoint and returns created tags", async () => {
      const created: TagBasic[] = [
        { id: "tag-3", name: "AI", slug: "ai" },
        { id: "tag-4", name: "ML", slug: "ml" },
      ];
      (mocks.apiClient.post as Mock).mockResolvedValue({
        data: { success: true, message: "", data: created },
      });

      const result = await tagService.createTags(["AI", "ML"]);

      expect(mocks.apiClient.post).toHaveBeenCalledTimes(1);
      expect(mocks.apiClient.post).toHaveBeenCalledWith("/tags/batch", {
        names: ["AI", "ML"],
      });
      expect(result).toEqual(created);
    });

    it("returns an empty array when the response has no data", async () => {
      (mocks.apiClient.post as Mock).mockResolvedValue({
        data: { success: false, message: "nope" },
      });

      await expect(tagService.createTags(["AI"])).resolves.toEqual([]);
    });
  });
});

import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";

const mocks = vi.hoisted(() => ({
  serverApi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    postForm: vi.fn(),
  },
}));

vi.mock("@/lib/server-api", () => ({
  default: mocks.serverApi,
  serverApi: mocks.serverApi,
}));

import { resourceService } from "@/services/resource.service";
import { TAGS, RESOURCE_MUTATION_TAGS } from "@/lib/cache-tags";
import type { Resource, Comment } from "@/types/resource.types";

const RESOURCE: Resource = {
  id: "res-1",
  title: "Database Notes",
  fileUrl: "https://cdn.example.com/db.pdf",
  fileType: "PDF",
  fileSize: 2048,
  courseId: "course-1",
  categoryId: "cat-1",
  uploaderId: "user-1",
  upvoteCount: 2,
  downvoteCount: 0,
  downloadCount: 5,
  viewCount: 20,
  reportCount: 0,
  isVerified: false,
  isDeleted: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const COMMENT: Comment = {
  id: "c-1",
  content: "Thanks!",
  resourceId: "res-1",
  userId: "user-2",
  upvoteCount: 1,
  downvoteCount: 0,
  isDeleted: false,
  createdAt: "2026-01-02T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

function apiData<T>(data: T) {
  return { success: true, message: "", data };
}

describe("resourceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createResource POSTs to /resources and returns the resource", async () => {
    const payload = {
      title: "Database Notes",
      fileUrl: "https://cdn.example.com/db.pdf",
      fileType: "PDF",
      fileSize: 2048,
      courseId: "course-1",
      tags: ["sql"],
    };
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData(RESOURCE));

    const result = await resourceService.createResource(payload);

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/resources", payload, {
      invalidatesTags: [...RESOURCE_MUTATION_TAGS, TAGS.LEADERBOARD],
    });
    expect(result).toEqual(RESOURCE);
  });

  describe("listResources", () => {
    it("calls GET /resources with no query string by default", async () => {
      const response = { data: [RESOURCE], meta: { total: 1 } };
      (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

      const result = await resourceService.listResources();

      expect(mocks.serverApi.get).toHaveBeenCalledWith("/resources", {
        tags: [TAGS.RESOURCES],
      });
      expect(result).toEqual(response);
    });

    it("serializes filters and joins array tags into the query string", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [], meta: { total: 0 } }),
      );

      await resourceService.listResources({
        page: 2,
        limit: 20,
        search: "sql",
        tag: ["db", "sql"],
      });

      expect(mocks.serverApi.get).toHaveBeenCalledWith(
        "/resources?page=2&limit=20&search=sql&tag=db%2Csql",
        { tags: [TAGS.RESOURCES] },
      );
    });

    it("propagates API errors", async () => {
      (mocks.serverApi.get as Mock).mockRejectedValue(
        new Error("Failed to load resources"),
      );

      await expect(resourceService.listResources()).rejects.toThrow(
        "Failed to load resources",
      );
    });
  });

  it("listCategories calls GET /resources/categories", async () => {
    const categories = [
      { id: "cat-1", name: "Notes", slug: "notes", _count: { resources: 3 } },
    ];
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(categories));

    const result = await resourceService.listCategories();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/resources/categories", {
      tags: [TAGS.RESOURCES],
    });
    expect(result).toEqual(categories);
  });

  it("listCourses calls GET /resources/courses", async () => {
    const courses = [
      { id: "course-1", code: "CSE", name: "DB", department: "CSE", _count: { resources: 2 } },
    ];
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(courses));

    const result = await resourceService.listCourses();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/resources/courses", {
      tags: [TAGS.RESOURCES],
    });
    expect(result).toEqual(courses);
  });

  it("listTags calls GET /resources/tags", async () => {
    const tags = [
      { id: "tag-1", name: "SQL", slug: "sql", _count: { resourceTags: 2 } },
    ];
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(tags));

    const result = await resourceService.listTags();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/resources/tags", {
      tags: [TAGS.RESOURCES],
    });
    expect(result).toEqual(tags);
  });

  it("getResourceById calls GET /resources/:id with the detail tag", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(RESOURCE));

    const result = await resourceService.getResourceById("res-1");

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/resources/res-1", {
      tags: [TAGS.RESOURCE_DETAIL],
    });
    expect(result).toEqual(RESOURCE);
  });

  it("updateResource PATCHes the payload to /resources/:id", async () => {
    (mocks.serverApi.patch as Mock).mockResolvedValue(apiData(RESOURCE));

    const result = await resourceService.updateResource("res-1", {
      title: "Updated notes",
    });

    expect(mocks.serverApi.patch).toHaveBeenCalledWith("/resources/res-1", {
      title: "Updated notes",
    }, { invalidatesTags: [...RESOURCE_MUTATION_TAGS, TAGS.RESOURCE_DETAIL] });
    expect(result).toEqual(RESOURCE);
  });

  it("deleteResource calls DELETE /resources/:id", async () => {
    (mocks.serverApi.del as Mock).mockResolvedValue({ success: true, message: "" });

    await resourceService.deleteResource("res-1");

    expect(mocks.serverApi.del).toHaveBeenCalledWith("/resources/res-1", {
      invalidatesTags: [...RESOURCE_MUTATION_TAGS, TAGS.RESOURCE_DETAIL],
    });
  });

  it("toggleVote POSTs the vote type to the upvote endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(
      apiData({ action: "UP", upvoteCount: 3, downvoteCount: 0 }),
    );

    const result = await resourceService.toggleVote("res-1", "UP");

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/resources/res-1/upvote",
      { type: "UP" },
      { invalidatesTags: [TAGS.LEADERBOARD] },
    );
    expect(result).toEqual({ action: "UP", upvoteCount: 3, downvoteCount: 0 });
  });

  it("toggleBookmark POSTs to the bookmark endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData({ action: "added" }));

    const result = await resourceService.toggleBookmark("res-1");

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/resources/res-1/bookmark", {}, { invalidatesTags: [TAGS.RESOURCE_DETAIL] });
    expect(result).toEqual({ action: "added" });
  });

  it("recordDownload POSTs to the download endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(
      apiData({ fileUrl: "https://cdn.example.com/db.pdf" }),
    );

    const result = await resourceService.recordDownload("res-1");

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/resources/res-1/download",
      {},
    );
    expect(result).toEqual({ fileUrl: "https://cdn.example.com/db.pdf" });
  });

  it("addComment POSTs the comment body", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData(COMMENT));

    const result = await resourceService.addComment("res-1", {
      content: "Thanks!",
      parentId: "c-0",
    });

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/resources/res-1/comments", {
      content: "Thanks!",
      parentId: "c-0",
    });
    expect(result).toEqual(COMMENT);
  });

  it("listComments calls GET with page and limit", async () => {
    const response = {
      comments: [COMMENT],
      meta: { total: 1, page: 2, limit: 50, totalPages: 1 },
    };
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

    const result = await resourceService.listComments("res-1", 2, 50);

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/resources/res-1/comments?page=2&limit=50",
    );
    expect(result).toEqual(response);
  });

  it("deleteComment calls DELETE /resources/comments/:id", async () => {
    (mocks.serverApi.del as Mock).mockResolvedValue({ success: true, message: "" });

    await resourceService.deleteComment("c-1");

    expect(mocks.serverApi.del).toHaveBeenCalledWith("/resources/comments/c-1");
  });

  it("toggleCommentVote POSTs to the comment upvote endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(
      apiData({ action: "UP", upvoteCount: 2, downvoteCount: 0 }),
    );

    const result = await resourceService.toggleCommentVote("c-1", "UP");

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/resources/comments/c-1/upvote",
      { type: "UP" },
    );
    expect(result).toEqual({ action: "UP", upvoteCount: 2, downvoteCount: 0 });
  });

  it("editComment PATCHes the content", async () => {
    (mocks.serverApi.patch as Mock).mockResolvedValue(apiData(COMMENT));

    const result = await resourceService.editComment("c-1", "Updated");

    expect(mocks.serverApi.patch).toHaveBeenCalledWith("/resources/comments/c-1", {
      content: "Updated",
    });
    expect(result).toEqual(COMMENT);
  });

  it("reportResource POSTs the report payload", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue({ success: true, message: "" });

    await resourceService.reportResource("res-1", {
      reason: "SPAM",
      description: "Spammy",
    });

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/resources/res-1/report", {
      reason: "SPAM",
      description: "Spammy",
    });
  });
});

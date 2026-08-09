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

import { discussionService } from "@/services/discussion.service";
import { TAGS, DISCUSSION_MUTATION_TAGS } from "@/lib/cache-tags";
import type { Discussion } from "@/types/discussion.types";

const DISCUSSION: Discussion = {
  id: "d-1",
  title: "Sem 4 study group",
  content: "Who's in?",
  categoryId: "cat-1",
  authorId: "user-1",
  replyCount: 2,
  viewCount: 8,
  upvoteCount: 1,
  visibility: "PUBLIC",
  isPinned: false,
  isLocked: false,
  isSolved: false,
  isDeleted: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const REPLY = {
  id: "r-1",
  content: "I'm in",
  discussionId: "d-1",
  authorId: "user-2",
  upvoteCount: 0,
  isEdited: false,
  isDeleted: false,
  createdAt: "2026-01-02T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

function apiData<T>(data: T) {
  return { success: true, message: "", data };
}

describe("discussionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createDiscussion POSTs to /discussions", async () => {
    const payload = {
      title: "Sem 4 study group",
      content: "Who's in?",
      categoryId: "cat-1",
      visibility: "PUBLIC" as const,
    };
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData(DISCUSSION));

    const result = await discussionService.createDiscussion(payload);

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/discussions", payload, {
      invalidatesTags: DISCUSSION_MUTATION_TAGS,
    });
    expect(result).toEqual(DISCUSSION);
  });

  it("listCategories calls GET /discussions/categories", async () => {
    const categories = [
      { id: "cat-1", name: "General", slug: "general", _count: { discussions: 4 } },
    ];
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(categories));

    const result = await discussionService.listCategories();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/discussions/categories", {
      tags: [TAGS.DISCUSSIONS],
    });
    expect(result).toEqual(categories);
  });

  it("listTags calls GET /discussions/tags", async () => {
    const tags = [
      { id: "tag-1", name: "CS", slug: "cs", _count: { discussionTags: 3 } },
    ];
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(tags));

    const result = await discussionService.listTags();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/discussions/tags", {
      tags: [TAGS.DISCUSSIONS],
    });
    expect(result).toEqual(tags);
  });

  it("getTrending uses the default limit of 3", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData([DISCUSSION]));

    const result = await discussionService.getTrending();

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/discussions/trending?limit=3",
      { tags: [TAGS.DISCUSSIONS_TRENDING] },
    );
    expect(result).toEqual([DISCUSSION]);
  });

  it("getTopContributors uses the default limit of 5", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData([]));

    await discussionService.getTopContributors();

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/discussions/contributors?limit=5",
      { tags: [TAGS.DISCUSSIONS] },
    );
  });

  describe("listDiscussions", () => {
    it("calls GET /discussions with no query string by default", async () => {
      const response = { data: [DISCUSSION], meta: { total: 1 } };
      (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

      const result = await discussionService.listDiscussions();

      expect(mocks.serverApi.get).toHaveBeenCalledWith("/discussions", {
        tags: [TAGS.DISCUSSIONS],
      });
      expect(result).toEqual(response);
    });

    it("serializes filters into the query string", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [], meta: { total: 0 } }),
      );

      await discussionService.listDiscussions({
        page: 2,
        limit: 10,
        category: "general",
        search: "study",
        visibility: "DEPARTMENT",
      });

      expect(mocks.serverApi.get).toHaveBeenCalledWith(
        "/discussions?page=2&limit=10&category=general&search=study&visibility=DEPARTMENT",
        { tags: [TAGS.DISCUSSIONS] },
      );
    });
  });

  it("getDiscussionById calls GET /discussions/:id with the detail tag", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(DISCUSSION));

    const result = await discussionService.getDiscussionById("d-1");

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/discussions/d-1", {
      tags: [TAGS.DISCUSSION_DETAIL],
    });
    expect(result).toEqual(DISCUSSION);
  });

  it("updateDiscussion PUTs to /discussions/:id", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue(apiData(DISCUSSION));

    const result = await discussionService.updateDiscussion("d-1", {
      title: "Updated title",
    });

    expect(mocks.serverApi.put).toHaveBeenCalledWith("/discussions/d-1", {
      title: "Updated title",
    });
    expect(result).toEqual(DISCUSSION);
  });

  it("deleteDiscussion calls DELETE /discussions/:id", async () => {
    (mocks.serverApi.del as Mock).mockResolvedValue({ success: true, message: "" });

    await discussionService.deleteDiscussion("d-1");

    expect(mocks.serverApi.del).toHaveBeenCalledWith("/discussions/d-1");
  });

  it("voteDiscussion POSTs the vote type", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(
      apiData({ action: "UP", upvoteCount: 2 }),
    );

    const result = await discussionService.voteDiscussion("d-1", "UP");

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/discussions/d-1/vote", {
      type: "UP",
    }, { invalidatesTags: DISCUSSION_MUTATION_TAGS });
    expect(result).toEqual({ action: "UP", upvoteCount: 2 });
  });

  it("toggleBookmark POSTs to the bookmark endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData({ action: "added" }));

    const result = await discussionService.toggleBookmark("d-1");

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/discussions/d-1/bookmark",
      {},
      { invalidatesTags: DISCUSSION_MUTATION_TAGS },
    );
    expect(result).toEqual({ action: "added" });
  });

  it("listBookmarks calls GET /discussions/bookmarks", async () => {
    const response = { data: [DISCUSSION], meta: { total: 1 } };
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

    const result = await discussionService.listBookmarks();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/discussions/bookmarks", {
      tags: [TAGS.DISCUSSIONS],
    });
    expect(result).toEqual(response);
  });

  it("myDiscussions calls GET /discussions/me with page and limit", async () => {
    const response = { data: [DISCUSSION], meta: { total: 1 } };
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

    const result = await discussionService.myDiscussions(2, 12);

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/discussions/me?page=2&limit=12");
    expect(result).toEqual(response);
  });

  it("myReplies calls GET /discussions/replies/mine with page and limit", async () => {
    const response = { data: [DISCUSSION], meta: { total: 1 } };
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

    const result = await discussionService.myReplies(1, 12);

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/discussions/replies/mine?page=1&limit=12",
    );
    expect(result).toEqual(response);
  });

  it("togglePin PUTs to the pin route", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue(apiData({ isPinned: true }));

    const result = await discussionService.togglePin("d-1");

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/discussions/d-1/pin",
      {},
      { invalidatesTags: DISCUSSION_MUTATION_TAGS },
    );
    expect(result).toEqual({ isPinned: true });
  });

  it("toggleLock PUTs to the lock route", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue(apiData({ isLocked: true }));

    const result = await discussionService.toggleLock("d-1");

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/discussions/d-1/lock",
      {},
      { invalidatesTags: DISCUSSION_MUTATION_TAGS },
    );
    expect(result).toEqual({ isLocked: true });
  });

  it("markSolved PUTs to the solved route", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue(apiData({ isSolved: true }));

    const result = await discussionService.markSolved("d-1");

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/discussions/d-1/solved",
      {},
      { invalidatesTags: DISCUSSION_MUTATION_TAGS },
    );
    expect(result).toEqual({ isSolved: true });
  });

  it("postReply POSTs to the replies endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData(REPLY));

    const result = await discussionService.postReply("d-1", {
      content: "I'm in",
    });

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/discussions/d-1/replies",
      { content: "I'm in" },
      { invalidatesTags: DISCUSSION_MUTATION_TAGS },
    );
    expect(result).toEqual(REPLY);
  });

  it("listReplies calls GET with page and limit", async () => {
    const response = { replies: [REPLY], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

    const result = await discussionService.listReplies("d-1", 1, 20);

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/discussions/d-1/replies?page=1&limit=20",
    );
    expect(result).toEqual(response);
  });

  it("deleteReply calls DELETE on the nested reply route", async () => {
    (mocks.serverApi.del as Mock).mockResolvedValue({ success: true, message: "" });

    await discussionService.deleteReply("d-1", "r-1");

    expect(mocks.serverApi.del).toHaveBeenCalledWith("/discussions/d-1/replies/r-1", {
      invalidatesTags: DISCUSSION_MUTATION_TAGS,
    });
  });

  it("voteReply POSTs to the reply vote endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(
      apiData({ action: "DOWN", upvoteCount: 0 }),
    );

    const result = await discussionService.voteReply("r-1", "DOWN");

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/discussions/replies/r-1/vote",
      { type: "DOWN" },
      { invalidatesTags: DISCUSSION_MUTATION_TAGS },
    );
    expect(result).toEqual({ action: "DOWN", upvoteCount: 0 });
  });

  it("updateReply PUTs the content to the nested reply route", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue(apiData(REPLY));

    const result = await discussionService.updateReply("d-1", "r-1", {
      content: "Edited",
    });

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/discussions/d-1/replies/r-1",
      { content: "Edited" },
      { invalidatesTags: DISCUSSION_MUTATION_TAGS },
    );
    expect(result).toEqual(REPLY);
  });

  it("acceptAnswer PUTs the replyId to the accept route", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue(
      apiData({ message: "Solved", isSolved: true, solutionReplyId: "r-1" }),
    );

    const result = await discussionService.acceptAnswer("d-1", "r-1");

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/discussions/d-1/accept",
      { replyId: "r-1" },
      { invalidatesTags: DISCUSSION_MUTATION_TAGS },
    );
    expect(result).toEqual({ message: "Solved", isSolved: true, solutionReplyId: "r-1" });
  });

  it("reportReply POSTs to the reply report endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue({ success: true, message: "" });

    await discussionService.reportReply("r-1", { reason: "SPAM" });

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/discussions/replies/r-1/report",
      { reason: "SPAM" },
    );
  });

  it("propagates API errors from getDiscussionById", async () => {
    (mocks.serverApi.get as Mock).mockRejectedValue(
      new Error("Discussion not found"),
    );

    await expect(discussionService.getDiscussionById("missing")).rejects.toThrow(
      "Discussion not found",
    );
  });
});

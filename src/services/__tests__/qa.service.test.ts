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

import { qaService } from "@/services/qa.service";
import { TAGS, QA_MUTATION_TAGS } from "@/lib/cache-tags";
import type { Question } from "@/types/qa.types";

const QUESTION: Question = {
  id: "q-1",
  title: "How does indexing work?",
  content: "Body",
  categoryId: "cat-1",
  authorId: "user-1",
  upvoteCount: 3,
  answerCount: 1,
  viewCount: 10,
  isAnswered: false,
  isClosed: false,
  isDeleted: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function apiData<T>(data: T) {
  return { success: true, message: "", data };
}

describe("qaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createQuestion POSTs to /qa and returns the question", async () => {
    const payload = {
      title: "How does indexing work?",
      content: "Body",
      categoryId: "cat-1",
      courseId: "course-1",
      tagIds: ["tag-1"],
    };
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData(QUESTION));

    const result = await qaService.createQuestion(payload);

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/qa", payload, {
      invalidatesTags: QA_MUTATION_TAGS,
    });
    expect(result).toEqual(QUESTION);
  });

  it("listCategories calls GET /qa/categories with the QA tag", async () => {
    const categories = [
      { id: "cat-1", name: "Databases", slug: "databases", _count: { questions: 5 } },
    ];
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(categories));

    const result = await qaService.listCategories();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/qa/categories", {
      tags: [TAGS.QA],
    });
    expect(result).toEqual(categories);
  });

  it("listTags calls GET /qa/tags with the QA tag", async () => {
    const tags = [
      { id: "tag-1", name: "SQL", slug: "sql", _count: { questionTags: 2 } },
    ];
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(tags));

    const result = await qaService.listTags();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/qa/tags", {
      tags: [TAGS.QA],
    });
    expect(result).toEqual(tags);
  });

  it("getTopContributors uses a default limit of 5", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData([]));

    await qaService.getTopContributors();

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/qa/contributors?limit=5",
      { tags: [TAGS.QA] },
    );
  });

  it("getTopContributors honors a custom limit", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData([]));

    await qaService.getTopContributors(10);

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/qa/contributors?limit=10",
      { tags: [TAGS.QA] },
    );
  });

  it("getTrending calls GET /qa/trending with the trending tag", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData([QUESTION]));

    const result = await qaService.getTrending(3);

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/qa/trending?limit=3", {
      tags: [TAGS.QA_TRENDING],
    });
    expect(result).toEqual([QUESTION]);
  });

  describe("listQuestions sort mapping", () => {
    it("maps trending to the popular sort", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [QUESTION], meta: { total: 1 } }),
      );

      await qaService.listQuestions({ sort: "trending" });

      expect(mocks.serverApi.get).toHaveBeenCalledWith("/qa?sort=popular", {
        tags: [TAGS.QA],
      });
    });

    it("maps most_answered to popular sort with answered=true", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [QUESTION], meta: { total: 1 } }),
      );

      await qaService.listQuestions({ sort: "most_answered" });

      expect(mocks.serverApi.get).toHaveBeenCalledWith(
        "/qa?answered=true&sort=popular",
        { tags: [TAGS.QA] },
      );
    });

    it("maps unanswered to the unanswered sort", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [QUESTION], meta: { total: 1 } }),
      );

      await qaService.listQuestions({ sort: "unanswered" });

      expect(mocks.serverApi.get).toHaveBeenCalledWith("/qa?sort=unanswered", {
        tags: [TAGS.QA],
      });
    });

    it("maps latest (and undefined) to the latest sort", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [QUESTION], meta: { total: 1 } }),
      );

      await qaService.listQuestions();

      expect(mocks.serverApi.get).toHaveBeenCalledWith("/qa?sort=latest", {
        tags: [TAGS.QA],
      });
    });

    it("serializes pagination and filter params into the query string", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [QUESTION], meta: { total: 1 } }),
      );

      await qaService.listQuestions({
        page: 1,
        limit: 10,
        category: "cat-1",
        courseId: "course-1",
        tag: "db",
        search: "sql",
      });

      expect(mocks.serverApi.get).toHaveBeenCalledWith(
        "/qa?page=1&limit=10&category=cat-1&courseId=course-1&tag=db&search=sql&sort=latest",
        { tags: [TAGS.QA] },
      );
    });
  });

  it("getQuestionById calls GET /qa/:id with the detail tag", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(QUESTION));

    const result = await qaService.getQuestionById("q-1");

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/qa/q-1", {
      tags: [TAGS.QA_DETAIL],
    });
    expect(result).toEqual(QUESTION);
  });

  it("listAnswers calls GET /qa/:id/answers with the detail tag", async () => {
    const answers = [
      {
        id: "a-1",
        content: "Answer",
        questionId: "q-1",
        authorId: "user-2",
        upvoteCount: 1,
        isAccepted: false,
        isDeleted: false,
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ];
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(answers));

    const result = await qaService.listAnswers("q-1");

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/qa/q-1/answers", {
      tags: [TAGS.QA_DETAIL],
    });
    expect(result).toEqual(answers);
  });

  it("listBookmarks calls GET /qa/bookmarks with page and limit", async () => {
    const response = { data: [QUESTION], meta: { total: 1 } };
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

    const result = await qaService.listBookmarks(2, 12);

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/qa/bookmarks?page=2&limit=12",
      { tags: [TAGS.QA] },
    );
    expect(result).toEqual(response);
  });

  it("voteQuestion POSTs the vote type", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(
      apiData({ action: "UP", upvoteCount: 4 }),
    );

    const result = await qaService.voteQuestion("q-1", "UP");

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/qa/q-1/vote", {
      type: "UP",
    }, { invalidatesTags: QA_MUTATION_TAGS });
    expect(result).toEqual({ action: "UP", upvoteCount: 4 });
  });

  it("bookmarkQuestion POSTs to the bookmark endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData({ action: "added" }));

    const result = await qaService.bookmarkQuestion("q-1");

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/qa/q-1/bookmark",
      {},
      { invalidatesTags: QA_MUTATION_TAGS },
    );
    expect(result).toEqual({ action: "added" });
  });

  it("updateQuestion PUTs the patch data to /qa/:id", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue(apiData(QUESTION));

    const result = await qaService.updateQuestion("q-1", {
      title: "Updated title",
    });

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/qa/q-1",
      { title: "Updated title" },
      { invalidatesTags: QA_MUTATION_TAGS },
    );
    expect(result).toEqual(QUESTION);
  });

  it("createAnswer POSTs to the answers endpoint", async () => {
    const answer = {
      id: "a-2",
      content: "My answer",
      questionId: "q-1",
      authorId: "user-1",
      upvoteCount: 0,
      isAccepted: false,
      isDeleted: false,
      createdAt: "2026-01-03T00:00:00.000Z",
      updatedAt: "2026-01-03T00:00:00.000Z",
    };
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData(answer));

    const result = await qaService.createAnswer("q-1", { content: "My answer" });

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/qa/q-1/answers",
      { content: "My answer" },
      { invalidatesTags: QA_MUTATION_TAGS },
    );
    expect(result).toEqual(answer);
  });

  it("voteAnswer POSTs to the answer vote endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue(
      apiData({ action: "DOWN", upvoteCount: 1 }),
    );

    const result = await qaService.voteAnswer("a-1", "DOWN");

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/qa/answers/a-1/vote",
      { type: "DOWN" },
      { invalidatesTags: QA_MUTATION_TAGS },
    );
    expect(result).toEqual({ action: "DOWN", upvoteCount: 1 });
  });

  it("updateAnswer PUTs the content to the nested answer route", async () => {
    const answer = {
      id: "a-1",
      content: "Edited",
      questionId: "q-1",
      authorId: "user-1",
      upvoteCount: 0,
      isAccepted: false,
      isDeleted: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-04T00:00:00.000Z",
    };
    (mocks.serverApi.put as Mock).mockResolvedValue(apiData(answer));

    const result = await qaService.updateAnswer("q-1", "a-1", { content: "Edited" });

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/qa/q-1/answers/a-1",
      { content: "Edited" },
      { invalidatesTags: QA_MUTATION_TAGS },
    );
    expect(result).toEqual(answer);
  });

  it("acceptAnswer PUTs to the accept route", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue(
      apiData({ isAccepted: true, isAnswered: true }),
    );

    const result = await qaService.acceptAnswer("q-1", "a-1");

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/qa/q-1/answers/a-1/accept",
      {},
      { invalidatesTags: QA_MUTATION_TAGS },
    );
    expect(result).toEqual({ isAccepted: true, isAnswered: true });
  });

  it("propagates API errors from getQuestionById", async () => {
    (mocks.serverApi.get as Mock).mockRejectedValue(
      new Error("Question not found"),
    );

    await expect(qaService.getQuestionById("missing")).rejects.toThrow(
      "Question not found",
    );
  });
});

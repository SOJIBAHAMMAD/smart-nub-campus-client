import serverApi from "@/lib/server-api";
import { TAGS, QA_MUTATION_TAGS } from "@/lib/cache-tags";
import { buildQueryString } from "@/lib/utils";
import type {
  Question,
  QuestionCategory,
  Answer,
  ListQuestionsParams,
  QuestionListResponse,
} from "@/types/qa.types";

/**
 * Maps the client-facing sort aliases to the server's accepted `sort`
 * parameter and the `answered` filter.
 */
function mapSort(sort?: ListQuestionsParams["sort"]): {
  sort: string;
  answered?: string;
} {
  switch (sort) {
    case "trending":
      return { sort: "popular" };
    case "most_answered":
      return { sort: "popular", answered: "true" };
    case "unanswered":
      return { sort: "unanswered" };
    case "latest":
    default:
      return { sort: "latest" };
  }
}

export const qaService = {
  async createQuestion(data: {
    title: string;
    content: string;
    categoryId: string;
    courseId?: string;
    tagIds?: string[];
  }): Promise<Question> {
    const response = await serverApi.post<Question>("/qa", data, {
      invalidatesTags: [...QA_MUTATION_TAGS],
    });
    return response.data!;
  },

  async listCategories(): Promise<
    (QuestionCategory & { _count: { questions: number } })[]
  > {
    const response = await serverApi.get<
      (QuestionCategory & { _count: { questions: number } })[]
    >("/qa/categories", { tags: [TAGS.QA] });
    return response.data!;
  },

  async listTags(): Promise<
    { id: string; name: string; slug: string; _count: { questionTags: number } }[]
  > {
    const response = await serverApi.get<
      { id: string; name: string; slug: string; _count: { questionTags: number } }[]
    >("/qa/tags", { tags: [TAGS.QA] });
    return response.data!;
  },

  async getTopContributors(
    limit = 5,
  ): Promise<{ rank: number; name: string; image?: string | null; questionCount: number }[]> {
    const response = await serverApi.get<
      { rank: number; name: string; image?: string | null; questionCount: number }[]
    >(`/qa/contributors?limit=${limit}`, { tags: [TAGS.QA] });
    return response.data!;
  },

  async getTrending(limit = 5): Promise<Question[]> {
    const response = await serverApi.get<Question[]>(
      `/qa/trending?limit=${limit}`,
      { tags: [TAGS.QA_TRENDING] },
    );
    return response.data!;
  },

  async listQuestions(
    params: ListQuestionsParams = {},
  ): Promise<QuestionListResponse> {
    const { sort, answered } = mapSort(params.sort);
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      category: params.category,
      tag: params.tag,
      search: params.search,
      answered,
      sort,
    });
    const response = await serverApi.get<QuestionListResponse>(`/qa${query}`, {
      tags: [TAGS.QA],
    });
    return response.data!;
  },

  async getQuestionById(id: string): Promise<Question> {
    const response = await serverApi.get<Question>(`/qa/${id}`, {
      tags: [TAGS.QA_DETAIL],
    });
    return response.data!;
  },

  async listAnswers(questionId: string): Promise<Answer[]> {
    const response = await serverApi.get<Answer[]>(`/qa/${questionId}/answers`, {
      tags: [TAGS.QA_DETAIL],
    });
    return response.data!;
  },

  async listBookmarks(
    page = 1,
    limit = 12,
  ): Promise<QuestionListResponse> {
    const response = await serverApi.get<QuestionListResponse>(
      `/qa/bookmarks?page=${page}&limit=${limit}`,
      { tags: [TAGS.QA] },
    );
    return response.data!;
  },

  async voteQuestion(
    questionId: string,
    type: "UP" | "DOWN",
  ): Promise<{ action: string; upvoteCount: number }> {
    const response = await serverApi.post<{ action: string; upvoteCount: number }>(
      `/qa/${questionId}/vote`,
      { type },
      { invalidatesTags: [...QA_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async bookmarkQuestion(questionId: string): Promise<{ action: string }> {
    const response = await serverApi.post<{ action: string }>(
      `/qa/${questionId}/bookmark`,
      {},
      { invalidatesTags: [...QA_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async updateQuestion(
    id: string,
    data: {
      title?: string;
      content?: string;
      tagIds?: string[];
    },
  ): Promise<Question> {
    const response = await serverApi.put<Question>(`/qa/${id}`, data, {
      invalidatesTags: [...QA_MUTATION_TAGS],
    });
    return response.data!;
  },

  async createAnswer(
    questionId: string,
    data: { content: string },
  ): Promise<Answer> {
    const response = await serverApi.post<Answer>(
      `/qa/${questionId}/answers`,
      data,
      { invalidatesTags: [...QA_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async voteAnswer(
    answerId: string,
    type: "UP" | "DOWN",
  ): Promise<{ action: string; upvoteCount: number }> {
    const response = await serverApi.post<{ action: string; upvoteCount: number }>(
      `/qa/answers/${answerId}/vote`,
      { type },
      { invalidatesTags: [...QA_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async updateAnswer(
    questionId: string,
    answerId: string,
    data: { content: string },
  ): Promise<Answer> {
    const response = await serverApi.put<Answer>(
      `/qa/${questionId}/answers/${answerId}`,
      data,
      { invalidatesTags: [...QA_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async acceptAnswer(
    questionId: string,
    answerId: string,
  ): Promise<{ isAccepted: boolean; isAnswered: boolean }> {
    const response = await serverApi.put<{ isAccepted: boolean; isAnswered: boolean }>(
      `/qa/${questionId}/answers/${answerId}/accept`,
      {},
      { invalidatesTags: [...QA_MUTATION_TAGS] },
    );
    return response.data!;
  },
};

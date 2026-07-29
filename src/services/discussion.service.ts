import serverApi from "@/lib/server-api";
import { TAGS, DISCUSSION_MUTATION_TAGS } from "@/lib/cache-tags";
import { buildQueryString } from "@/lib/utils";
import type {
  Discussion,
  DiscussionCategory,
  DiscussionReply,
  ListDiscussionsParams,
  DiscussionListResponse,
} from "@/types/discussion.types";

export const discussionService = {
  async createDiscussion(data: {
    title: string;
    content: string;
    categoryId: string;
    courseId?: string;
    tagIds?: string[];
    visibility?: "PUBLIC" | "DEPARTMENT" | "BATCH";
  }): Promise<Discussion> {
    const response = await serverApi.post<Discussion>("/discussions", data, {
      invalidatesTags: [...DISCUSSION_MUTATION_TAGS],
    });
    return response.data!;
  },

  async listCategories(): Promise<
    (DiscussionCategory & { _count: { discussions: number } })[]
  > {
    const response = await serverApi.get<
      (DiscussionCategory & { _count: { discussions: number } })[]
    >("/discussions/categories", { tags: [TAGS.DISCUSSIONS] });
    return response.data!;
  },

  async listTags(): Promise<
    { id: string; name: string; slug: string; _count: { discussionTags: number } }[]
  > {
    const response = await serverApi.get<
      { id: string; name: string; slug: string; _count: { discussionTags: number } }[]
    >("/discussions/tags", { tags: [TAGS.DISCUSSIONS] });
    return response.data!;
  },

  async getTrending(limit = 3): Promise<Discussion[]> {
    const response = await serverApi.get<Discussion[]>(
      `/discussions/trending?limit=${limit}`,
      { tags: [TAGS.DISCUSSIONS_TRENDING] },
    );
    return response.data!;
  },

  async getTopContributors(
    limit = 5,
  ): Promise<{ rank: number; name: string; image?: string | null; discussionCount: number }[]> {
    const response = await serverApi.get<
      { rank: number; name: string; image?: string | null; discussionCount: number }[]
    >(`/discussions/contributors?limit=${limit}`, { tags: [TAGS.DISCUSSIONS] });
    return response.data!;
  },

  async listDiscussions(
    params: ListDiscussionsParams = {},
  ): Promise<DiscussionListResponse> {
    const query = buildQueryString(params);
    const response = await serverApi.get<DiscussionListResponse>(
      `/discussions${query}`,
      { tags: [TAGS.DISCUSSIONS] },
    );
    return response.data!;
  },

  async getDiscussionById(id: string): Promise<Discussion> {
    const response = await serverApi.get<Discussion>(`/discussions/${id}`, {
      tags: [TAGS.DISCUSSION_DETAIL],
    });
    return response.data!;
  },

  async updateDiscussion(
    id: string,
    data: { title?: string; content?: string; tagIds?: string[] },
  ): Promise<Discussion> {
    const response = await serverApi.put<Discussion>(`/discussions/${id}`, data);
    return response.data!;
  },

  async deleteDiscussion(id: string): Promise<void> {
    await serverApi.del(`/discussions/${id}`);
  },

  async voteDiscussion(
    discussionId: string,
    type: "UP" | "DOWN",
  ): Promise<{ action: string; upvoteCount: number }> {
    const response = await serverApi.post<{ action: string; upvoteCount: number }>(
      `/discussions/${discussionId}/vote`,
      { type },
      { invalidatesTags: [...DISCUSSION_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async toggleBookmark(discussionId: string): Promise<{ action: string }> {
    const response = await serverApi.post<{ action: string }>(
      `/discussions/${discussionId}/bookmark`,
      {},
      { invalidatesTags: [...DISCUSSION_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async listBookmarks(): Promise<DiscussionListResponse> {
    const response = await serverApi.get<DiscussionListResponse>("/discussions/bookmarks", {
      tags: [TAGS.DISCUSSIONS],
    });
    return response.data!;
  },

  async myDiscussions(
    page = 1,
    limit = 12,
  ): Promise<DiscussionListResponse> {
    const response = await serverApi.get<DiscussionListResponse>(
      `/discussions/me?page=${page}&limit=${limit}`,
    );
    return response.data!;
  },

  async myReplies(
    page = 1,
    limit = 12,
  ): Promise<DiscussionListResponse> {
    const response = await serverApi.get<DiscussionListResponse>(
      `/discussions/replies/mine?page=${page}&limit=${limit}`,
    );
    return response.data!;
  },

  async togglePin(id: string): Promise<{ isPinned: boolean }> {
    const response = await serverApi.put<{ isPinned: boolean }>(`/discussions/${id}/pin`, {}, { invalidatesTags: [...DISCUSSION_MUTATION_TAGS] });
    return response.data!;
  },

  async toggleLock(id: string): Promise<{ isLocked: boolean }> {
    const response = await serverApi.put<{ isLocked: boolean }>(`/discussions/${id}/lock`, {}, { invalidatesTags: [...DISCUSSION_MUTATION_TAGS] });
    return response.data!;
  },

  async markSolved(id: string): Promise<{ isSolved: boolean }> {
    const response = await serverApi.put<{ isSolved: boolean }>(`/discussions/${id}/solved`, {}, { invalidatesTags: [...DISCUSSION_MUTATION_TAGS] });
    return response.data!;
  },

  async postReply(
    discussionId: string,
    data: { content: string; parentId?: string },
  ): Promise<DiscussionReply> {
    const response = await serverApi.post<DiscussionReply>(
      `/discussions/${discussionId}/replies`,
      data,
      { invalidatesTags: [...DISCUSSION_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async listReplies(
    discussionId: string,
    page = 1,
    limit = 20,
  ): Promise<{ replies: DiscussionReply[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const response = await serverApi.get<{ replies: DiscussionReply[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/discussions/${discussionId}/replies?page=${page}&limit=${limit}`,
    );
    return response.data!;
  },

  async deleteReply(discussionId: string, replyId: string): Promise<void> {
    await serverApi.del(`/discussions/${discussionId}/replies/${replyId}`, { invalidatesTags: [...DISCUSSION_MUTATION_TAGS] });
  },

  async voteReply(
    replyId: string,
    type: "UP" | "DOWN",
  ): Promise<{ action: string; upvoteCount: number }> {
    const response = await serverApi.post<{ action: string; upvoteCount: number }>(
      `/discussions/replies/${replyId}/vote`,
      { type },
      { invalidatesTags: [...DISCUSSION_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async updateReply(
    discussionId: string,
    replyId: string,
    data: { content: string },
  ): Promise<DiscussionReply> {
    const response = await serverApi.put<DiscussionReply>(
      `/discussions/${discussionId}/replies/${replyId}`,
      data,
      { invalidatesTags: [...DISCUSSION_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async acceptAnswer(
    discussionId: string,
    replyId: string,
  ): Promise<{ message: string; isSolved: boolean; solutionReplyId: string | null }> {
    const response = await serverApi.put<{ message: string; isSolved: boolean; solutionReplyId: string | null }>(
      `/discussions/${discussionId}/accept`,
      { replyId },
      { invalidatesTags: [...DISCUSSION_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async reportReply(
    replyId: string,
    data: { reason: string; details?: string },
  ): Promise<void> {
    // We need the discussionId for the route; we'll find the discussion from context
    // The route is /discussions/:id/replies/:replyId/report
    // We pass it differently — the action will handle it
    await serverApi.post(`/discussions/replies/${replyId}/report`, data);
  },
};

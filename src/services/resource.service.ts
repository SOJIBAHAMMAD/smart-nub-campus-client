import serverApi from "@/lib/server-api";
import { TAGS, RESOURCE_MUTATION_TAGS } from "@/lib/cache-tags";
import { buildQueryString } from "@/lib/utils";
import type {
  Resource,
  Comment,
  ListResourcesParams,
  ResourceListResponse,
} from "@/types/resource.types";
import type { PaginationMeta } from "@/types/resource.types";

export const resourceService = {
  async createResource(data: {
    title: string;
    description?: string;
    fileUrl: string;
    filePublicId?: string;
    fileType: string;
    fileSize: number;
    courseId: string;
    categoryId?: string;
    tags?: string[];
  }): Promise<Resource> {
    const response = await serverApi.post<Resource>("/resources", data, {
      invalidatesTags: [...RESOURCE_MUTATION_TAGS, TAGS.LEADERBOARD],
    });
    return response.data!;
  },

  async listResources(
    params: ListResourcesParams = {},
  ): Promise<ResourceListResponse> {
    const query = buildQueryString(params);
    const response = await serverApi.get<ResourceListResponse>(
      `/resources${query}`,
      { tags: [TAGS.RESOURCES] },
    );
    return response.data!;
  },

  async listCategories(): Promise<{ id: string; name: string; slug: string; _count: { resources: number } }[]> {
    const response = await serverApi.get<{ id: string; name: string; slug: string; _count: { resources: number } }[]>(
      "/resources/categories",
      { tags: [TAGS.RESOURCES] },
    );
    return response.data!;
  },

  async listCourses(): Promise<{ id: string; code: string; name: string; department: string; _count: { resources: number } }[]> {
    const response = await serverApi.get<{ id: string; code: string; name: string; department: string; _count: { resources: number } }[]>(
      "/resources/courses",
      { tags: [TAGS.RESOURCES] },
    );
    return response.data!;
  },

  async listTags(): Promise<{ id: string; name: string; slug: string; _count: { resourceTags: number } }[]> {
    const response = await serverApi.get<{ id: string; name: string; slug: string; _count: { resourceTags: number } }[]>(
      "/resources/tags",
      { tags: [TAGS.RESOURCES] },
    );
    return response.data!;
  },

  async getResourceById(id: string): Promise<Resource> {
    const response = await serverApi.get<Resource>(`/resources/${id}`, {
      tags: [TAGS.RESOURCE_DETAIL],
    });
    return response.data!;
  },

  async updateResource(id: string, data: Partial<{
    title: string;
    description: string;
    categoryId: string;
    tags: string[];
  }>): Promise<Resource> {
    const response = await serverApi.patch<Resource>(`/resources/${id}`, data, {
      invalidatesTags: [...RESOURCE_MUTATION_TAGS, TAGS.RESOURCE_DETAIL],
    });
    return response.data!;
  },

  async deleteResource(id: string): Promise<void> {
    await serverApi.del(`/resources/${id}`, {
      invalidatesTags: [...RESOURCE_MUTATION_TAGS, TAGS.RESOURCE_DETAIL],
    });
  },

  async toggleVote(resourceId: string, type: "UP" | "DOWN" = "UP"): Promise<{ action: string; upvoteCount: number; downvoteCount: number }> {
    const response = await serverApi.post<{ action: string; upvoteCount: number; downvoteCount: number }>(
      `/resources/${resourceId}/upvote`,
      { type },
      { invalidatesTags: [TAGS.LEADERBOARD] },
    );
    return response.data!;
  },

  async toggleBookmark(resourceId: string): Promise<{ action: string }> {
    const response = await serverApi.post<{ action: string }>(
      `/resources/${resourceId}/bookmark`,
      {},
      { invalidatesTags: [TAGS.RESOURCE_DETAIL] },
    );
    return response.data!;
  },

  async recordDownload(resourceId: string): Promise<{ fileUrl: string }> {
    const response = await serverApi.post<{ fileUrl: string }>(
      `/resources/${resourceId}/download`,
      {},
    );
    return response.data!;
  },

  async addComment(
    resourceId: string,
    data: { content: string; parentId?: string },
  ): Promise<Comment> {
    const response = await serverApi.post<Comment>(
      `/resources/${resourceId}/comments`,
      data,
    );
    return response.data!;
  },

  async listComments(
    resourceId: string,
    page = 1,
    limit = 20,
  ): Promise<{ comments: Comment[]; meta: PaginationMeta }> {
    const response = await serverApi.get<{ comments: Comment[]; meta: PaginationMeta }>(
      `/resources/${resourceId}/comments?page=${page}&limit=${limit}`,
    );
    return response.data!;
  },

  async deleteComment(commentId: string): Promise<void> {
    await serverApi.del(`/resources/comments/${commentId}`);
  },

  async toggleCommentVote(
    commentId: string,
    type: "UP" | "DOWN" = "UP",
  ): Promise<{ action: string; upvoteCount: number; downvoteCount: number }> {
    const response = await serverApi.post<{ action: string; upvoteCount: number; downvoteCount: number }>(
      `/resources/comments/${commentId}/upvote`,
      { type },
    );
    return response.data!;
  },

  async editComment(
    commentId: string,
    content: string,
  ): Promise<Comment> {
    const response = await serverApi.patch<Comment>(
      `/resources/comments/${commentId}`,
      { content },
    );
    return response.data!;
  },

  async reportResource(
    resourceId: string,
    data: { reason: string; description?: string },
  ): Promise<void> {
    await serverApi.post(`/resources/${resourceId}/report`, data);
  },
};

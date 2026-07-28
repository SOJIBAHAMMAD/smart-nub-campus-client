import apiClient from "@/lib/api-client";

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  totalCount: number;
  createdAt: string;
}

export interface TagBasic {
  id: string;
  name: string;
  slug: string;
}

export const tagService = {
  async listTags(search?: string): Promise<TagItem[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const response = await apiClient.get<{ success: boolean; data: TagItem[] }>(
      `/tags${query}`,
    );
    return response.data?.data ?? [];
  },

  async createTag(name: string): Promise<TagBasic> {
    const response = await apiClient.post<{ success: boolean; data: TagBasic }>(
      "/tags",
      { name },
    );
    if (!response.data?.data) {
      throw new Error("Tag not found");
    }
    return response.data.data;
  },

  async createTags(names: string[]): Promise<TagBasic[]> {
    const response = await apiClient.post<{ success: boolean; data: TagBasic[] }>(
      "/tags/batch",
      { names },
    );
    return response.data?.data ?? [];
  },
};

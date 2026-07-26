import serverApi from "@/lib/server-api";
import { TAGS } from "@/lib/cache-tags";

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
    const response = await serverApi.get<TagItem[]>(
      `/tags${query}`,
      { tags: [TAGS.TAGS] },
    );
    return response.data ?? [];
  },

  async createTag(name: string): Promise<TagBasic> {
    const response = await serverApi.post<TagBasic>(
      "/tags",
      { name },
      { invalidatesTags: [TAGS.TAGS] },
    );
    return response.data!;
  },

  async createTags(names: string[]): Promise<TagBasic[]> {
    const response = await serverApi.post<TagBasic[]>(
      "/tags/batch",
      { names },
      { invalidatesTags: [TAGS.TAGS] },
    );
    return response.data!;
  },
};

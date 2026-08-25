"use server";

import { serverApi } from "@/lib/server-api";
import type { ApiResponse } from "@/types";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  totalCount: number;
  createdAt: string;
}

interface TagBasic {
  id: string;
  name: string;
  slug: string;
}

export async function listTags(search?: string): Promise<ApiResponse> {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const result = await serverApi.get<TagItem[]>(`/tags${query}`);
    return { success: true, message: "Tags fetched.", data: result.data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch tags.";
    return { success: false, message, data: [] };
  }
}

export async function createTag(name: string): Promise<ApiResponse> {
  try {
    const result = await serverApi.post<TagBasic>("/tags", { name });
    return { success: true, message: "Tag created.", data: result.data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create tag.";
    return { success: false, message };
  }
}

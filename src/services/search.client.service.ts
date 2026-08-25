import { apiClient } from "@/lib/api-client";
import { buildQueryString } from "@/lib/utils";
import type {
  SearchClickInput,
  SearchParams,
  SearchResponse,
} from "@/types/search.types";

function unwrap<T>(data: unknown): T {
  return ((data as { data?: T })?.data ?? (data as T)) as T;
}

/**
 * Browser-side wrapper around the Global Search endpoints. Uses `apiClient`
 * (cookie-forwarding fetch) so it is safe to import from client components —
 * including the command-palette typeahead.
 */
export const searchClientService = {
  async search(params: SearchParams): Promise<SearchResponse> {
    const query = buildQueryString(params);
    const res = await apiClient.get<SearchResponse>(`/search${query}`);
    return unwrap<SearchResponse>(res.data);
  },

  /** Best-effort click logging — never throws. */
  async recordClick(input: SearchClickInput): Promise<void> {
    try {
      await apiClient.post("/search/click", input);
    } catch {
      // Analytics is optional; ignore failures.
    }
  },
};

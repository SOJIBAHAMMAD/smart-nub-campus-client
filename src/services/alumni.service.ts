import serverApi from "@/lib/server-api";
import { TAGS } from "@/lib/cache-tags";
import type {
  TransitionResponse,
  TransitionStatusResponse,
  DirectoryListParams,
  DirectoryListResponse,
  DirectoryMemberDetail,
  DirectoryStats,
} from "@/types";

export const alumniService = {
  /**
   * Get the current user's alumni transition status (STUDENT only).
   * Matches backend GET /alumni/transition-status.
   */
  async getTransitionStatus(): Promise<TransitionStatusResponse> {
    const response = await serverApi.get<TransitionStatusResponse>(
      "/alumni/transition-status",
      { tags: [TAGS.ALUMNI_TRANSITION_STATUS] },
    );
    return response.data!;
  },

  /**
   * Confirm the alumni transition (STUDENT with academicStatus=GRADUATED).
   * Matches backend POST /alumni/transition.
   */
  async transitionToAlumni(): Promise<TransitionResponse> {
    const response = await serverApi.post<TransitionResponse>(
      "/alumni/transition",
      {},
      { invalidatesTags: [TAGS.ALUMNI_TRANSITION_STATUS] },
    );
    return response.data!;
  },

  /**
   * List alumni directory cards with filters + pagination.
   * Matches backend GET /alumni/directory.
   */
  async listDirectory(query: DirectoryListParams = {}): Promise<DirectoryListResponse> {
    const params = new URLSearchParams();
    if (query.department) params.set("department", query.department);
    if (query.graduationYear) params.set("graduationYear", String(query.graduationYear));
    if (query.industry) params.set("industry", query.industry);
    if (query.location) params.set("location", query.location);
    if (query.q) params.set("q", query.q);
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const queryString = params.toString();
    const response = await serverApi.get<DirectoryListResponse>(
      `/alumni/directory${queryString ? `?${queryString}` : ""}`,
      { tags: [TAGS.ALUMNI_DIRECTORY] },
    );
    return response.data!;
  },

  /**
   * Get a single directory member (visible via privacy rules).
   * Matches backend GET /alumni/directory/:id.
   */
  async getDirectoryMember(userId: string): Promise<DirectoryMemberDetail> {
    const response = await serverApi.get<DirectoryMemberDetail>(
      `/alumni/directory/${userId}`,
      { tags: [TAGS.ALUMNI_DIRECTORY_DETAIL] },
    );
    return response.data!;
  },

  /**
   * Get directory facet counts (sidebar).
   * Matches backend GET /alumni/directory/stats.
   */
  async getDirectoryStats(): Promise<DirectoryStats> {
    const response = await serverApi.get<DirectoryStats>(
      "/alumni/directory/stats",
      { tags: [TAGS.ALUMNI_DIRECTORY_STATS] },
    );
    return response.data!;
  },
};

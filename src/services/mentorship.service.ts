import serverApi from "@/lib/server-api";
import { TAGS } from "@/lib/cache-tags";
import type {
  MentorListResponse,
  MentorshipRequest,
  MentorshipRequestListResponse,
  ListMentorsParams,
  ListMentorshipRequestsParams,
  CreateMentorshipRequestPayload,
} from "@/types";

export const mentorshipService = {
  /**
   * List available alumni mentors with filters + pagination.
   * Matches backend GET /mentorship/mentors.
   */
  async listMentors(query: ListMentorsParams = {}): Promise<MentorListResponse> {
    const params = new URLSearchParams();
    if (query.department) params.set("department", query.department);
    if (query.industry) params.set("industry", query.industry);
    if (query.topic) params.set("topic", query.topic);
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const queryString = params.toString();
    const response = await serverApi.get<MentorListResponse>(
      `/mentorship/mentors${queryString ? `?${queryString}` : ""}`,
      { tags: [TAGS.MENTORS] },
    );
    return response.data!;
  },

  /**
   * Send a mentorship request (STUDENT only).
   * Matches backend POST /mentorship/requests.
   */
  async createMentorshipRequest(
    data: CreateMentorshipRequestPayload,
  ): Promise<MentorshipRequest> {
    const response = await serverApi.post<MentorshipRequest>(
      "/mentorship/requests",
      data,
      { invalidatesTags: [TAGS.MENTORSHIP_REQUESTS] },
    );
    return response.data!;
  },

  /**
   * List my mentorship requests (as mentor or mentee).
   * Matches backend GET /mentorship/requests.
   */
  async listRequests(
    query: ListMentorshipRequestsParams,
  ): Promise<MentorshipRequestListResponse> {
    const params = new URLSearchParams();
    params.set("role", query.role);
    if (query.status) params.set("status", query.status);
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const queryString = params.toString();
    const response = await serverApi.get<MentorshipRequestListResponse>(
      `/mentorship/requests?${queryString}`,
      { tags: [TAGS.MENTORSHIP_REQUESTS] },
    );
    return response.data!;
  },

  /**
   * Update a mentorship request (accept/reject as mentor, withdraw as mentee).
   * Matches backend PATCH /mentorship/requests/:id.
   */
  async updateRequest(
    id: string,
    status: string,
  ): Promise<MentorshipRequest> {
    const response = await serverApi.patch<MentorshipRequest>(
      `/mentorship/requests/${id}`,
      { status },
      { invalidatesTags: [TAGS.MENTORSHIP_REQUESTS] },
    );
    return response.data!;
  },
};

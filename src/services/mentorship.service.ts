import serverApi from "@/lib/server-api";
import { TAGS } from "@/lib/cache-tags";
import type {
  MentorListResponse,
  MentorshipRequest,
  MentorshipRequestListResponse,
  MentorshipListResponse,
  Mentorship,
  MentorshipGoal,
  MentorshipSession,
  MentorshipMessage,
  MentorshipMessageList,
  ListMentorsParams,
  ListMentorshipRequestsParams,
  ListMentorshipsParams,
  CreateMentorshipRequestPayload,
  CreateMentorshipGoalPayload,
  UpdateMentorshipGoalPayload,
  CreateMentorshipSessionPayload,
  UpdateMentorshipSessionPayload,
  SendMentorshipMessagePayload,
  CompleteMentorshipPayload,
  RateMentorPayload,
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
    if (query.sort) params.set("sort", query.sort);
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
      { invalidatesTags: [TAGS.MENTORSHIP_REQUESTS, TAGS.MENTORS] },
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
      {
        invalidatesTags: [
          TAGS.MENTORSHIP_REQUESTS,
          TAGS.MENTORS,
          TAGS.MENTORSHIPS,
        ],
      },
    );
    return response.data!;
  },

  /**
   * List my mentorship relationships (as mentor or mentee).
   * Matches backend GET /mentorship/relationships.
   */
  async listMentorships(
    query: ListMentorshipsParams = {},
  ): Promise<MentorshipListResponse> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const queryString = params.toString();
    const response = await serverApi.get<MentorshipListResponse>(
      `/mentorship/relationships${queryString ? `?${queryString}` : ""}`,
      { tags: [TAGS.MENTORSHIPS] },
    );
    return response.data!;
  },

  /**
   * Get a single mentorship relationship (participants only).
   * Matches backend GET /mentorship/relationships/:id.
   */
  async getMentorship(id: string): Promise<Mentorship> {
    const response = await serverApi.get<Mentorship>(
      `/mentorship/relationships/${id}`,
      { cache: "no-store" },
    );
    return response.data!;
  },

  /**
   * Add a goal to a relationship.
   * Matches backend POST /mentorship/relationships/:id/goals.
   */
  async createGoal(
    mentorshipId: string,
    data: CreateMentorshipGoalPayload,
  ): Promise<MentorshipGoal> {
    const response = await serverApi.post<MentorshipGoal>(
      `/mentorship/relationships/${mentorshipId}/goals`,
      data,
      { invalidatesTags: [TAGS.MENTORSHIPS] },
    );
    return response.data!;
  },

  /**
   * Update a goal (title/description/dueDate/status).
   * Matches backend PATCH /mentorship/goals/:goalId.
   */
  async updateGoal(
    goalId: string,
    data: UpdateMentorshipGoalPayload,
  ): Promise<MentorshipGoal> {
    const response = await serverApi.patch<MentorshipGoal>(
      `/mentorship/goals/${goalId}`,
      data,
      { invalidatesTags: [TAGS.MENTORSHIPS] },
    );
    return response.data!;
  },

  /**
   * Delete a goal.
   * Matches backend DELETE /mentorship/goals/:goalId.
   */
  async deleteGoal(goalId: string): Promise<{ deleted: boolean }> {
    const response = await serverApi.del<{ deleted: boolean }>(
      `/mentorship/goals/${goalId}`,
      { invalidatesTags: [TAGS.MENTORSHIPS] },
    );
    return response.data!;
  },

  /**
   * Schedule a session in a relationship.
   * Matches backend POST /mentorship/relationships/:id/sessions.
   */
  async createSession(
    mentorshipId: string,
    data: CreateMentorshipSessionPayload,
  ): Promise<MentorshipSession> {
    const response = await serverApi.post<MentorshipSession>(
      `/mentorship/relationships/${mentorshipId}/sessions`,
      data,
      { invalidatesTags: [TAGS.MENTORSHIPS] },
    );
    return response.data!;
  },

  /**
   * Update a session (notes/actionItems/status etc.).
   * Matches backend PATCH /mentorship/sessions/:sessionId.
   */
  async updateSession(
    sessionId: string,
    data: UpdateMentorshipSessionPayload,
  ): Promise<MentorshipSession> {
    const response = await serverApi.patch<MentorshipSession>(
      `/mentorship/sessions/${sessionId}`,
      data,
      { invalidatesTags: [TAGS.MENTORSHIPS] },
    );
    return response.data!;
  },

  /**
   * List messages in a relationship (ascending).
   * Matches backend GET /mentorship/relationships/:id/messages.
   */
  async listMessages(
    mentorshipId: string,
    limit = 50,
  ): Promise<MentorshipMessageList> {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    const response = await serverApi.get<MentorshipMessageList>(
      `/mentorship/relationships/${mentorshipId}/messages?${params.toString()}`,
      { cache: "no-store" },
    );
    return response.data!;
  },

  /**
   * Send a message in a relationship.
   * Matches backend POST /mentorship/relationships/:id/messages.
   */
  async sendMessage(
    mentorshipId: string,
    data: SendMentorshipMessagePayload,
  ): Promise<MentorshipMessage> {
    const response = await serverApi.post<MentorshipMessage>(
      `/mentorship/relationships/${mentorshipId}/messages`,
      data,
      { invalidatesTags: [TAGS.MENTORSHIPS] },
    );
    return response.data!;
  },

  /**
   * Mark a relationship as complete with an optional private closing note
   * from the mentor to the mentee.
   * Matches backend POST /mentorship/relationships/:id/complete.
   */
  async completeMentorship(
    mentorshipId: string,
    data: CompleteMentorshipPayload,
  ): Promise<Mentorship> {
    const response = await serverApi.post<Mentorship>(
      `/mentorship/relationships/${mentorshipId}/complete`,
      data,
      { invalidatesTags: [TAGS.MENTORSHIPS] },
    );
    return response.data!;
  },

  /**
   * Rate the mentor after the mentorship has been completed (mentee only).
   * Matches backend POST /mentorship/relationships/:id/rate.
   */
  async rateMentor(
    mentorshipId: string,
    data: RateMentorPayload,
  ): Promise<Mentorship> {
    const response = await serverApi.post<Mentorship>(
      `/mentorship/relationships/${mentorshipId}/rate`,
      data,
      {
        invalidatesTags: [TAGS.MENTORSHIPS, TAGS.MENTORS],
      },
    );
    return response.data!;
  },

  /**
   * End a relationship early.
   * Matches backend POST /mentorship/relationships/:id/end.
   */
  async endMentorship(mentorshipId: string): Promise<Mentorship> {
    const response = await serverApi.post<Mentorship>(
      `/mentorship/relationships/${mentorshipId}/end`,
      {},
      { invalidatesTags: [TAGS.MENTORSHIPS] },
    );
    return response.data!;
  },
};

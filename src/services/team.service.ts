import serverApi from "@/lib/server-api";
import { TAGS, TEAM_MUTATION_TAGS } from "@/lib/cache-tags";
import { buildQueryString } from "@/lib/utils";
import type {
  TeamRequest,
  TeamApplication,
  TeamMember,
  TeamRequestStatus,
  ListTeamRequestsParams,
  TeamRequestListResponse,
  TeamCategoryCount,
  TeamPopularSkill,
} from "@/types/team.types";
import type { Tag } from "@/types/resource.types";

export const teamService = {
  async createTeamRequest(data: {
    title: string;
    description: string;
    lookingForCount: number;
    projectName?: string;
    deadline?: string;
    category?: string;
    difficulty?: string;
    meetingPreference?: string;
    contactInfo?: string;
    skillTagIds: string[];
  }): Promise<TeamRequest> {
    const response = await serverApi.post<TeamRequest>("/teams", data, {
      invalidatesTags: [...TEAM_MUTATION_TAGS],
    });
    return response.data!;
  },

  async listTeamRequests(
    params: ListTeamRequestsParams = {},
  ): Promise<TeamRequestListResponse> {
    const query = buildQueryString(params);
    const response = await serverApi.get<TeamRequestListResponse>(`/teams${query}`, {
      tags: [TAGS.TEAMS_LIST],
    });
    return response.data!;
  },

  async listTags(): Promise<Tag[]> {
    const response = await serverApi.get<Tag[]>("/resources/tags", {
      tags: [TAGS.TEAMS_LIST],
    });
    return response.data!;
  },

  async getTeamRequestById(id: string): Promise<TeamRequest> {
    const response = await serverApi.get<TeamRequest>(`/teams/${id}`, {
      tags: [TAGS.TEAM_DETAIL],
    });
    return response.data!;
  },

  async updateTeamRequest(
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      projectName?: string;
      deadline?: string;
      lookingForCount?: number;
      status?: TeamRequestStatus;
      difficulty?: string;
      meetingPreference?: string;
      contactInfo?: string;
      skillTagIds?: string[];
    },
  ): Promise<TeamRequest> {
    const response = await serverApi.put<TeamRequest>(`/teams/${id}`, data, {
      invalidatesTags: [...TEAM_MUTATION_TAGS],
    });
    return response.data!;
  },

  async deleteTeamRequest(id: string): Promise<void> {
    await serverApi.del(`/teams/${id}`, {
      invalidatesTags: [...TEAM_MUTATION_TAGS],
    });
  },

  async applyToTeam(
    teamRequestId: string,
    data: { message?: string },
  ): Promise<TeamApplication> {
    const response = await serverApi.post<TeamApplication>(
      `/teams/${teamRequestId}/apply`,
      data,
      { invalidatesTags: [...TEAM_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async reviewApplication(
    teamRequestId: string,
    applicationId: string,
    data: { status: "ACCEPTED" | "REJECTED" },
  ): Promise<TeamApplication> {
    const response = await serverApi.put<TeamApplication>(
      `/teams/${teamRequestId}/applications/${applicationId}`,
      data,
      { invalidatesTags: [...TEAM_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async withdrawApplication(teamRequestId: string): Promise<void> {
    await serverApi.del(`/teams/${teamRequestId}/applications/withdraw`, {
      invalidatesTags: [...TEAM_MUTATION_TAGS],
    });
  },

  async getTeamMembers(teamRequestId: string): Promise<TeamMember[]> {
    const response = await serverApi.get<TeamMember[]>(
      `/teams/${teamRequestId}/members`,
    );
    return response.data!;
  },

  async leaveTeam(teamRequestId: string): Promise<void> {
    await serverApi.post(`/teams/${teamRequestId}/leave`, {}, {
      invalidatesTags: [...TEAM_MUTATION_TAGS],
    });
  },

  async removeMember(teamRequestId: string, memberId: string): Promise<void> {
    await serverApi.del(`/teams/${teamRequestId}/members/${memberId}`, {
      invalidatesTags: [...TEAM_MUTATION_TAGS],
    });
  },

  async toggleBookmark(teamRequestId: string): Promise<{ bookmarked: boolean }> {
    const response = await serverApi.post<{ bookmarked: boolean }>(
      `/teams/${teamRequestId}/bookmark`,
      {},
      { invalidatesTags: [...TEAM_MUTATION_TAGS] },
    );
    return response.data!;
  },

  async getMyTeams(): Promise<TeamRequest[]> {
    const response = await serverApi.get<TeamRequest[]>("/teams/my-teams", {
      tags: [TAGS.TEAMS_LIST],
    });
    return response.data!;
  },

  async getMyApplications(): Promise<TeamApplication[]> {
    const response = await serverApi.get<TeamApplication[]>("/teams/my-applications", {
      tags: [TAGS.TEAMS_LIST],
    });
    return response.data!;
  },

  async getCategoryCounts(): Promise<TeamCategoryCount[]> {
    const response = await serverApi.get<TeamCategoryCount[]>("/teams/categories/counts", {
      tags: [TAGS.TEAMS_LIST],
    });
    return response.data!;
  },

  async getPopularSkills(): Promise<TeamPopularSkill[]> {
    const response = await serverApi.get<TeamPopularSkill[]>("/teams/skills/popular", {
      tags: [TAGS.TEAMS_LIST],
    });
    return response.data!;
  },

  async getTeamApplications(teamRequestId: string): Promise<TeamApplication[]> {
    const response = await serverApi.get<TeamApplication[]>(
      `/teams/${teamRequestId}/applications`,
      { tags: [TAGS.TEAM_DETAIL] },
    );
    return response.data!;
  },
};

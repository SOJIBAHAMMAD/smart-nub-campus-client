import serverApi from "@/lib/server-api";
import { TAGS } from "@/lib/cache-tags";
import type { UserProfile, ProfileUser, UpdateProfilePayload, ProfileStats, ProfileBadge, ProfileSkill } from "@/types/profile.types";

export const profileService = {
  async getMyProfile(): Promise<UserProfile | null> {
    const response = await serverApi.get<UserProfile | null>("/identity/profile", {
      tags: [TAGS.PROFILE],
    });
    return response.data ?? null;
  },

  async getPublicProfile(userId: string, preview = false): Promise<ProfileUser> {
    const query = preview ? "?preview=true" : "";
    const response = await serverApi.get<ProfileUser>(`/identity/profile/${userId}${query}`, {
      tags: [TAGS.PROFILE],
    });
    return response.data!;
  },

  async updateProfile(data: UpdateProfilePayload): Promise<UserProfile> {
    const response = await serverApi.patch<UserProfile>("/identity/profile", data, {
      invalidatesTags: [TAGS.PROFILE],
    });
    return response.data!;
  },

  async getUserStats(userId: string): Promise<ProfileStats> {
    const response = await serverApi.get<ProfileStats>(`/gamification/stats/${userId}`, {
      tags: [TAGS.PROFILE_STATS],
    });
    return response.data!;
  },

  async getUserBadges(userId: string): Promise<ProfileBadge[]> {
    const response = await serverApi.get<ProfileBadge[]>(`/gamification/badges/${userId}`, {
      tags: [TAGS.PROFILE_BADGES],
    });
    return response.data!;
  },

  async addSkill(tagId: string): Promise<ProfileSkill> {
    const response = await serverApi.post<{ id: string; tag: { id: string; name: string } }>(
      "/connections/skills",
      { tagId },
      { invalidatesTags: [TAGS.PROFILE] },
    );
    const data = response.data!;
    return { id: data.tag.id, name: data.tag.name, userSkillId: data.id };
  },

  async removeSkill(userSkillId: string): Promise<void> {
    await serverApi.del(`/connections/skills/${userSkillId}`, {
      invalidatesTags: [TAGS.PROFILE],
    });
  },
};

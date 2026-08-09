import serverApi from "@/lib/server-api";
import { TAGS } from "@/lib/cache-tags";
import { buildQueryString } from "@/lib/utils";
import type {
  ActivityFeedResult,
  ListActivitiesParams,
} from "@/types/activity.types";

export const activityService = {
  async listActivities(
    params: ListActivitiesParams = {},
  ): Promise<ActivityFeedResult> {
    const query = buildQueryString(params);
    const response = await serverApi.get<ActivityFeedResult>(
      `/activities${query}`,
      { tags: [TAGS.ACTIVITIES] },
    );
    return response.data!;
  },
};

import serverApi from "@/lib/server-api";
import { buildQueryString } from "@/lib/utils";
import type {
  ListNotificationsParams,
  NotificationListResponse,
  UnreadCountResponse,
} from "@/types/notification.types";

export const notificationService = {
  async listNotifications(
    params: ListNotificationsParams = {},
  ): Promise<NotificationListResponse> {
    const query = buildQueryString(params);
    const response = await serverApi.get<NotificationListResponse>(
      `/notifications${query}`,
      { tags: ["notifications-list"] },
    );
    return response.data!;
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await serverApi.get<UnreadCountResponse>(
      "/notifications/unread-count",
      { tags: ["unread-count"] },
    );
    return response.data!;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await serverApi.patch(`/notifications/${notificationId}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    await serverApi.patch("/notifications/read-all", {});
  },
};

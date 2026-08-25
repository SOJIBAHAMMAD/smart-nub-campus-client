"use server";

import { notificationService } from "@/services/notification.service";
import type { ApiResponse } from "@/types";
import type { ListNotificationsParams } from "@/types/notification.types";

/** List notifications with pagination and filtering. */
export async function listNotifications(
  params: ListNotificationsParams = {},
): Promise<ApiResponse> {
  try {
    const data = await notificationService.listNotifications(params);
    return { success: true, message: "Notifications fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch notifications.";
    return { success: false, message };
  }
}

/** Get unread notification count. */
export async function getUnreadCount(): Promise<ApiResponse> {
  try {
    const data = await notificationService.getUnreadCount();
    return { success: true, message: "Unread count fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch unread count.";
    return { success: false, message };
  }
}

/** Mark a notification as read. */
export async function markNotificationAsRead(
  notificationId: string,
): Promise<ApiResponse> {
  try {
    await notificationService.markAsRead(notificationId);
    return { success: true, message: "Notification marked as read." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark as read.";
    return { success: false, message };
  }
}

/** Mark all notifications as read. */
export async function markAllNotificationsAsRead(): Promise<ApiResponse> {
  try {
    await notificationService.markAllAsRead();
    return { success: true, message: "All notifications marked as read." };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to mark all as read.";
    return { success: false, message };
  }
}

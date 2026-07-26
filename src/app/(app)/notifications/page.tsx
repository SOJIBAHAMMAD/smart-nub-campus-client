import type { Metadata } from "next";
import { Suspense } from "react";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import { NotificationPageSkeleton } from "@/components/notifications/notification-skeleton";

export const metadata: Metadata = {
  title: "Notifications | Smart NUB Campus",
  description:
    "View your notifications — stay updated on connections, messages, discussions, and more.",
  openGraph: {
    title: "Notifications | Smart NUB Campus",
    description: "View your notifications on Smart NUB Campus.",
    type: "website",
  },
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationPageSkeleton />}>
      <NotificationsClient />
    </Suspense>
  );
}

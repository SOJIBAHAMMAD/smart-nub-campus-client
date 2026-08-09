import type { Metadata } from "next";
import { Suspense } from "react";
import { activityService } from "@/services/activity.service";
import { ActivityClient } from "@/components/activity/activity-client";
import { ActivityFeedSkeleton } from "@/components/activity/activity-skeleton";

export const metadata: Metadata = {
  title: "Activity | Smart NUB Campus",
  description:
    "A live feed of campus activity — resources, discussions, Q&A, teams, and events at Northern University Bangladesh.",
  openGraph: {
    title: "Activity | Smart NUB Campus",
    description: "See what's happening across Smart NUB Campus right now.",
    type: "website",
  },
};

async function ActivityFeed() {
  const result = await activityService
    .listActivities({ limit: 20 })
    .catch(() => null);

  return <ActivityClient initialResult={result} />;
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<ActivityFeedSkeleton />}>
      <ActivityFeed />
    </Suspense>
  );
}

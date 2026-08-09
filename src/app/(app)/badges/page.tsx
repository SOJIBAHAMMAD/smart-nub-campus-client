import type { Metadata } from "next";
import { Suspense } from "react";
import { gamificationService } from "@/services/gamification.service";
import { BadgesClient } from "@/components/leaderboard/badges-client";
import { BadgesSkeleton } from "@/components/leaderboard/badges-skeleton";
import type { UserBadge } from "@/types/gamification.types";

export const metadata: Metadata = {
  title: "Badges | Smart NUB Campus",
  description:
    "Your achievement badges on Smart NUB Campus — earn badges by contributing resources, discussions, Q&A, and more.",
  openGraph: {
    title: "Badges | Smart NUB Campus",
    description: "Your achievement badges at Northern University Bangladesh.",
    type: "website",
  },
};

export default async function BadgesPage() {
  let badges: UserBadge[] = [];
  let points: number = 0;

  try {
    const [badgesResult, pointsResult] = await Promise.all([
      gamificationService.getMyBadges(),
      gamificationService.getMyPoints(),
    ]);
    badges = badgesResult ?? [];
    points = pointsResult?.totalPoints ?? 0;
  } catch {
    // Client handles empty state
  }

  return (
    <Suspense fallback={<BadgesSkeleton />}>
      <BadgesClient badges={badges} totalPoints={points} />
    </Suspense>
  );
}

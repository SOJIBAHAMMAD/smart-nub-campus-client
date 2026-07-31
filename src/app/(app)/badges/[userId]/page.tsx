import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { profileService } from "@/services/profile.service";
import { gamificationService } from "@/services/gamification.service";
import { BadgesClient } from "@/components/leaderboard/badges-client";
import { BadgesSkeleton } from "@/components/leaderboard/badges-skeleton";
import type { ProfileBadge, ProfileUser } from "@/types/profile.types";

interface UserBadgesPageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({
  params,
}: UserBadgesPageProps): Promise<Metadata> {
  const { userId } = await params;
  try {
    const result = await profileService.getPublicProfile(userId);
    return {
      title: `${result.name} — Badges`,
      description: `${result.name}'s achievement badges on Smart NUB Campus.`,
    };
  } catch {
    return { title: "Badges" };
  }
}

export default async function UserBadgesPage({
  params,
}: UserBadgesPageProps) {
  const { userId } = await params;

  let userName: string | undefined;
  let badges: ProfileBadge[] = [];
  let points = 0;

  try {
    const [profile, badgesResult, pointsResult] = await Promise.all([
      profileService.getPublicProfile(userId),
      profileService.getUserBadges(userId),
      gamificationService.getUserPoints(userId),
    ]);
    userName = profile.name;
    badges = badgesResult ?? [];
    points = pointsResult?.totalPoints ?? 0;
  } catch {
    notFound();
  }

  return (
    <Suspense fallback={<BadgesSkeleton />}>
      <BadgesClient
        badges={badges}
        totalPoints={points}
        userName={userName}
      />
    </Suspense>
  );
}

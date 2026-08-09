import type { Metadata } from "next";
import { Suspense } from "react";
import { gamificationService } from "@/services/gamification.service";
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";
import { LeaderboardSkeleton } from "@/components/leaderboard/leaderboard-skeleton";
import type { Leaderboard } from "@/types/gamification.types";
import type { PaginationMeta } from "@/types/resource.types";

export const metadata: Metadata = {
  title: "Leaderboard | Smart NUB Campus",
  description:
    "Top contributors at Northern University Bangladesh — see who leads in resources, discussions, Q&A, and more.",
  openGraph: {
    title: "Leaderboard | Smart NUB Campus",
    description: "Top contributors at Northern University Bangladesh.",
    type: "website",
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;
  const role = typeof params.role === "string" ? params.role : undefined;

  let data: Leaderboard[] = [];
  let meta: PaginationMeta | null = null;

  try {
    const result = await gamificationService.getLeaderboard({ page, limit: 50, role });
    data = result.data ?? [];
    meta = result.meta ?? null;
  } catch {
    // Client handles empty state
  }

  return (
    <Suspense fallback={<LeaderboardSkeleton />}>
      <LeaderboardClient
        initialData={data}
        initialMeta={meta}
        initialRole={role ?? null}
        currentPage={page}
      />
    </Suspense>
  );
}

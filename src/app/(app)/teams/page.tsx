import type { Metadata } from "next";
import { Suspense } from "react";
import { listTeamRequests } from "@/actions/team.actions";

export const metadata: Metadata = {
  title: "Teams | Smart NUB Campus",
  description:
    "Find teammates, join projects and collaborate on academic work at Northern University Bangladesh.",
  openGraph: {
    title: "Teams | Smart NUB Campus",
    description: "Find teammates and collaborate at NUB.",
    type: "website",
  },
};
import { TeamsClient } from "@/components/teams/teams-client";
import { PageLayoutSkeleton } from "@/components/skeletons/page-layout-skeleton";
import type { TeamRequest, TeamRequestListResponse } from "@/types/team.types";
import type { PaginationMeta } from "@/types/resource.types";

/**
 * Teams list page — Server Component.
 * Pre-fetches the initial list (excluding own requests) and suggested teams, then
 * renders the interactive TeamsClient inside PageLayout.
 */
export default async function TeamsPage() {
  let initialTeams: TeamRequest[] = [];
  let initialMeta: PaginationMeta | null = null;
  let suggested: TeamRequest[] = [];

  try {
    const [listResult, suggestedResult] = await Promise.all([
      listTeamRequests({ page: 1, limit: 12 }),
      listTeamRequests({ page: 1, limit: 3, status: "OPEN" }),
    ]);

    if (listResult.success && listResult.data) {
      const data = listResult.data as TeamRequestListResponse;
      initialTeams = data.data ?? [];
      initialMeta = data.meta ?? null;
    }
    if (suggestedResult.success && suggestedResult.data) {
      const data = suggestedResult.data as TeamRequestListResponse;
      suggested = data.data ?? [];
    }
  } catch {
    // Client component handles empty state gracefully
  }

  return (
    <Suspense fallback={<PageLayoutSkeleton />}>
      <TeamsClient
        initialTeams={initialTeams}
        initialMeta={initialMeta}
        suggested={suggested}
      />
    </Suspense>
  );
}

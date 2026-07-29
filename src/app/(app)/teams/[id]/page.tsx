import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamRequest } from "@/actions/team.actions";
import { TeamDetailWrapper } from "@/components/teams/team-detail-wrapper";
import type { TeamRequest } from "@/types/team.types";

export const metadata: Metadata = {
  title: "Team Details | Smart NUB Campus",
  description: "View team details and apply to join at Smart NUB Campus.",
};

/**
 * Team detail page — Server Component.
 * Fetches team data server-side and passes to client wrapper for interactivity.
 */
export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let team: TeamRequest | null = null;

  try {
    const result = await getTeamRequest(id);
    if (result.success && result.data) {
      const data = result.data as { data?: TeamRequest } | TeamRequest;
      team = "data" in data && data.data ? data.data : (data as TeamRequest);
    }
  } catch {
    notFound();
  }

  if (!team) {
    notFound();
  }

  return <TeamDetailWrapper team={team} />;
}

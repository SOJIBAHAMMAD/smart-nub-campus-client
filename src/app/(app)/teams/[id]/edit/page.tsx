import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamRequest } from "@/actions/team.actions";
import { EditTeamWrapper } from "@/components/teams/edit-team-wrapper";
import type { TeamRequest } from "@/types/team.types";

export const metadata: Metadata = {
  title: "Edit Team | Smart NUB Campus",
  description: "Edit your team request on Smart NUB Campus.",
};

export default async function EditTeamPage({
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

  return <EditTeamWrapper team={team} />;
}

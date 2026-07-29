"use client";

import { authClient } from "@/lib/auth-client";
import { TeamDetail } from "./team-detail";
import type { TeamRequest } from "@/types/team.types";

interface TeamDetailWrapperProps {
  team: TeamRequest;
}

/**
 * Client wrapper that provides session context to TeamDetail.
 * The page itself is a Server Component that fetches data server-side.
 */
export function TeamDetailWrapper({ team }: TeamDetailWrapperProps) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? null;

  return <TeamDetail team={team} currentUserId={currentUserId} />;
}

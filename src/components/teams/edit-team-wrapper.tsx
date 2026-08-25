"use client";

import { UnsavedGuardProvider } from "@/components/ui/unsaved-guard";
import { TeamEditForm } from "./team-edit-form";
import type { TeamRequest } from "@/types/team.types";

interface EditTeamWrapperProps {
  team: TeamRequest;
}

export function EditTeamWrapper({ team }: EditTeamWrapperProps) {
  return (
    <UnsavedGuardProvider>
      <TeamEditForm team={team} />
    </UnsavedGuardProvider>
  );
}

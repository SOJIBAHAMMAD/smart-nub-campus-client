"use client";

import { UnsavedGuardProvider } from "@/components/ui/unsaved-guard";
import { TeamCreateForm } from "./team-create-form";
import type { Tag } from "@/types/resource.types";

interface CreateTeamWrapperProps {
  tags: Tag[];
}

export function CreateTeamWrapper({ tags }: CreateTeamWrapperProps) {
  return (
    <UnsavedGuardProvider>
      <TeamCreateForm tags={tags} />
    </UnsavedGuardProvider>
  );
}

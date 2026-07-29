import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { teamService } from "@/services/team.service";
import { CreateTeamWrapper } from "@/components/teams/create-team-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tag } from "@/types/resource.types";

export const dynamic = "force-dynamic";

function CreateTeamSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-96" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CreateTeamPage() {
  let tags: Tag[] = [];

  try {
    const fetched = await teamService.listTags();
    tags = fetched ?? [];
  } catch (err) {
    console.error("[CreateTeamPage] Failed to fetch tags:", err);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/teams" className="transition-colors hover:text-primary">
          Teams
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">Create Team</span>
      </nav>
      <Suspense fallback={<CreateTeamSkeleton />}>
        <CreateTeamWrapper tags={tags} />
      </Suspense>
    </div>
  );
}

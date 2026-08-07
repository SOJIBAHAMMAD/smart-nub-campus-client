import type { Metadata } from "next";
import { Suspense } from "react";
import { serverApi } from "@/lib/server-api";
import { mentorshipService } from "@/services/mentorship.service";
import { MentorshipRelationshipsClient } from "@/components/mentorship/mentorship-relationships-client";
import { PageLayoutSkeleton } from "@/components/skeletons/page-layout-skeleton";
import type { Mentorship } from "@/types";
import type { PaginationMeta } from "@/types/resource.types";

export const metadata: Metadata = {
  title: "My Mentorships",
  description:
    "Manage your active and past mentorship relationships on Smart NUB Campus.",
};

const EMPTY_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

interface IdentityMeResponse {
  user: { id: string; name: string; email: string; role: string };
}

export default async function MentorshipRelationshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status =
    typeof params.status === "string" ? params.status : undefined;
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;

  let userId: string | undefined;
  try {
    const me = await serverApi.get<IdentityMeResponse>("/identity/me", {
      cache: "no-store",
    });
    userId = me.data?.user?.id;
  } catch {
    // Proxy handles auth redirect.
  }

  let initialMentorships: Mentorship[] = [];
  let initialMeta: PaginationMeta = EMPTY_META;

  try {
    const result = await mentorshipService.listMentorships({
      status: status as "ACTIVE" | "COMPLETED" | "ENDED" | undefined,
      page,
      limit: 20,
    });
    initialMentorships = result.data ?? [];
    initialMeta = result.meta ?? EMPTY_META;
  } catch {
    // Client component handles empty/error state gracefully
  }

  return (
    <Suspense fallback={<PageLayoutSkeleton hasRightSidebar={false} />}>
      <MentorshipRelationshipsClient
        initialMentorships={initialMentorships}
        initialMeta={initialMeta}
        initialFilters={{ status: status ?? null, page }}
        userId={userId}
      />
    </Suspense>
  );
}

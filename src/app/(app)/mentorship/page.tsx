import type { Metadata } from "next";
import { Suspense } from "react";
import { serverApi } from "@/lib/server-api";
import { mentorshipService } from "@/services/mentorship.service";
import { MentorshipListClient } from "@/components/mentorship/mentorship-list-client";
import { PageLayoutSkeleton } from "@/components/skeletons/page-layout-skeleton";
import type { Mentor } from "@/types";
import type { PaginationMeta } from "@/types/resource.types";

export const metadata: Metadata = {
  title: "Mentorship",
  description:
    "Connect with NUB alumni mentors for career guidance, skill building and professional growth.",
  openGraph: {
    title: "Mentorship | Smart NUB Campus",
    description: "Find NUB alumni mentors.",
    type: "website",
  },
};

const EMPTY_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
};

interface IdentityMeResponse {
  user: { id: string; name: string; email: string; role: string };
}

export default async function MentorshipPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const department =
    typeof params.department === "string" ? params.department : undefined;
  const topic = typeof params.topic === "string" ? params.topic : undefined;
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;

  let userRole: string | undefined;
  try {
    const me = await serverApi.get<IdentityMeResponse>("/identity/me", {
      cache: "no-store",
    });
    userRole = me.data?.user?.role;
  } catch {
    // Proxy handles auth redirect.
  }

  let initialMentors: Mentor[] = [];
  let initialMeta: PaginationMeta = EMPTY_META;

  try {
    const result = await mentorshipService.listMentors({
      department,
      topic,
      page,
      limit: 12,
    });
    initialMentors = result.data ?? [];
    initialMeta = result.meta ?? EMPTY_META;
  } catch {
    // Client component handles empty/error state gracefully
  }

  return (
    <Suspense fallback={<PageLayoutSkeleton hasRightSidebar={false} />}>
      <MentorshipListClient
        initialMentors={initialMentors}
        initialMeta={initialMeta}
        initialFilters={{ department: department ?? null, topic: topic ?? null, page }}
        userRole={userRole}
      />
    </Suspense>
  );
}

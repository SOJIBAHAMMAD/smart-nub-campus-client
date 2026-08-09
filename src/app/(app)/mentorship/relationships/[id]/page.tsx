import type { Metadata } from "next";
import { Suspense } from "react";
import { serverApi } from "@/lib/server-api";
import { mentorshipService } from "@/services/mentorship.service";
import { MentorshipDetailClient } from "@/components/mentorship/mentorship-detail-client";
import { PageLayoutSkeleton } from "@/components/skeletons/page-layout-skeleton";
import type { Mentorship } from "@/types";

export const metadata: Metadata = {
  title: "Mentorship",
  description: "Manage a mentorship relationship on Smart NUB Campus.",
};

interface IdentityMeResponse {
  user: { id: string; name: string; email: string; role: string };
}

export default async function MentorshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let userId: string | undefined;
  try {
    const me = await serverApi.get<IdentityMeResponse>("/identity/me", {
      cache: "no-store",
    });
    userId = me.data?.user?.id;
  } catch {
    // Proxy handles auth redirect.
  }

  let mentorship: Mentorship | null = null;
  let error: string | null = null;
  try {
    mentorship = await mentorshipService.getMentorship(id);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load mentorship.";
  }

  return (
    <Suspense fallback={<PageLayoutSkeleton />}>
      <MentorshipDetailClient
        mentorshipId={id}
        initialMentorship={mentorship}
        initialError={error}
        userId={userId}
      />
    </Suspense>
  );
}

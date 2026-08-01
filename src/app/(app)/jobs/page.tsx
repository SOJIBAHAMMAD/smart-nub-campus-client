import type { Metadata } from "next";
import { Suspense } from "react";
import { serverApi } from "@/lib/server-api";
import { jobsService } from "@/services/jobs.service";
import { JobsListClient } from "@/components/jobs/jobs-list-client";
import { JobBoardSkeleton } from "@/components/skeletons/job-card-skeleton";
import type { Job } from "@/types";
import type { PaginationMeta } from "@/types/resource.types";

export const metadata: Metadata = {
  title: "Job Board",
  description:
    "Browse and share job opportunities at Northern University Bangladesh — posted by NUB alumni and administrators.",
  openGraph: {
    title: "Job Board | Smart NUB Campus",
    description: "Jobs and internships shared by the NUB community.",
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

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const status =
    typeof params.status === "string" ? params.status : undefined;
  const employmentType =
    typeof params.employmentType === "string" ? params.employmentType : undefined;
  const department =
    typeof params.department === "string" ? params.department : undefined;
  const location =
    typeof params.location === "string" ? params.location : undefined;
  const view = params.view === "list" ? "list" : "grid";
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;

  let userRole: string | undefined;
  try {
    const me = await serverApi.get<IdentityMeResponse>("/identity/me", {
      cache: "no-store",
    });
    userRole = me.data?.user?.role;
  } catch {
    // The proxy handles auth; role is only used for the "Post a job" affordance.
  }

  let initialJobs: Job[] = [];
  let initialMeta: PaginationMeta = EMPTY_META;

  try {
    const result = await jobsService.listJobs({
      q,
      status: status as "OPEN" | "FILLED" | "CLOSED" | undefined,
      employmentType: employmentType as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "REMOTE" | undefined,
      department: department as string | undefined,
      location,
      page,
      limit: 12,
    });
    initialJobs = result.data ?? [];
    initialMeta = result.meta ?? EMPTY_META;
  } catch {
    // Client component handles empty/error state gracefully
  }

  return (
    <Suspense fallback={<JobBoardSkeleton />}>
      <JobsListClient
        initialJobs={initialJobs}
        initialMeta={initialMeta}
        initialFilters={{
          search: q ?? "",
          status: status ?? null,
          employmentType: employmentType ?? null,
          department: department ?? null,
          location: location ?? null,
          view,
          page,
        }}
        userRole={userRole}
      />
    </Suspense>
  );
}

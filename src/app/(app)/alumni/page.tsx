import type { Metadata } from "next";
import { Suspense } from "react";
import { alumniService } from "@/services/alumni.service";
import { DirectoryClient } from "@/components/alumni/directory-client";
import { PageLayoutSkeleton } from "@/components/skeletons/page-layout-skeleton";
import type {
  DirectoryMember,
  DirectoryStats,
  PaginationMeta,
} from "@/types";

export const metadata: Metadata = {
  title: "Alumni Directory | Smart NUB Campus",
  description:
    "Browse the Northern University Bangladesh alumni community — departments, graduating classes and career industries.",
  openGraph: {
    title: "Alumni Directory | Smart NUB Campus",
    description: "Browse NUB alumni by department, class and industry.",
    type: "website",
  },
};

const EMPTY_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
};

const EMPTY_STATS: DirectoryStats = {
  total: 0,
  byDepartment: [],
  byGraduationYear: [],
  byIndustry: [],
};

/**
 * Alumni directory — Server Component.
 * Reads URL search params for initial filters, fetches list + facet stats
 * on the server, and hands the data to a URL-driven client component.
 */
export default async function AlumniDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const department =
    typeof params.department === "string" ? params.department : undefined;
  const graduationYear =
    typeof params.graduationYear === "string"
      ? parseInt(params.graduationYear, 10) || undefined
      : undefined;
  const industry =
    typeof params.industry === "string" ? params.industry : undefined;
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;

  let initialMembers: DirectoryMember[] = [];
  let initialMeta: PaginationMeta = EMPTY_META;
  let initialStats: DirectoryStats = EMPTY_STATS;

  try {
    const [listResult, statsResult] = await Promise.all([
      alumniService.listDirectory({
        q,
        department,
        graduationYear,
        industry,
        page,
        limit: 12,
      }),
      alumniService.getDirectoryStats(),
    ]);
    initialMembers = listResult.data ?? [];
    initialMeta = listResult.meta ?? EMPTY_META;
    initialStats = statsResult ?? EMPTY_STATS;
  } catch {
    // Client component handles empty/error state gracefully
  }

  return (
    <Suspense fallback={<PageLayoutSkeleton />}>
      <DirectoryClient
        initialMembers={initialMembers}
        initialMeta={initialMeta}
        initialStats={initialStats}
      />
    </Suspense>
  );
}

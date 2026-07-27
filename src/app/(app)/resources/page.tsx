import type { Metadata } from "next";
import { Suspense } from "react";
import { resourceService } from "@/services/resource.service";

export const metadata: Metadata = {
  title: "Resources | Smart NUB Campus",
  description:
    "Browse and share study resources — notes, slides, assignments and more at Northern University Bangladesh.",
  openGraph: {
    title: "Resources | Smart NUB Campus",
    description: "Browse and share study resources at NUB.",
    type: "website",
  },
};
import { gamificationService } from "@/services/gamification.service";
import { ResourcesClient } from "@/components/resources/resources-client";
import { PageLayoutSkeleton } from "@/components/skeletons/page-layout-skeleton";
import type {
  Resource,
  ResourceCategory,
  PaginationMeta,
} from "@/types/resource.types";

interface CourseWithCount {
  id: string;
  code: string;
  name: string;
  department: string;
  _count: { resources: number };
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  image?: string | null;
  totalPoints: number;
}

/**
 * Resources list page — Server Component.
 * Reads URL search params for initial filters, fetches data on the server.
 */
export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;
  const search = typeof params.search === "string" ? params.search : undefined;
  const categorySlug =
    typeof params.category === "string" ? params.category : undefined;
  const courseId =
    typeof params.courseId === "string" ? params.courseId : undefined;
  const tags =
    typeof params.tags === "string"
      ? params.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const view = typeof params.view === "string" ? params.view : "grid";

  let initialResources: Resource[] = [];
  let initialMeta: PaginationMeta | null = null;
  let categories: (ResourceCategory & { _count: { resources: number } })[] = [];
  let courses: CourseWithCount[] = [];
  let allTags: {
    id: string;
    name: string;
    slug: string;
    _count: { resourceTags: number };
  }[] = [];
  let trending: Resource[] = [];
  let contributors: LeaderboardEntry[] = [];

  try {
    // Fetch reference data first so we can resolve the category slug → id
    const [categoriesResult, coursesResult, tagsResult] = await Promise.all([
      resourceService.listCategories(),
      resourceService.listCourses(),
      resourceService.listTags(),
    ]);

    categories =
      (categoriesResult as unknown as (ResourceCategory & {
        _count: { resources: number };
      })[]) ?? [];
    courses = (coursesResult as unknown as CourseWithCount[]) ?? [];
    allTags =
      (tagsResult as unknown as {
        id: string;
        name: string;
        slug: string;
        _count: { resourceTags: number };
      }[]) ?? [];

    const resolvedCategoryId = categorySlug
      ? (categories.find((c) => c.slug === categorySlug)?.id ?? undefined)
      : undefined;

    const [resourcesResult, trendingResult, leaderboardResult] =
      await Promise.all([
        resourceService.listResources({
          page,
          limit: 12,
          search,
          categoryId: resolvedCategoryId,
          courseId,
          tag: tags.length > 0 ? tags : undefined,
          sort: sort as "newest" | "popular" | "downloads",
        }),
        resourceService.listResources({ sort: "popular", limit: 3 }),
        gamificationService.getLeaderboard({ page: 1, limit: 5, role: "STUDENT" }),
      ]);

    initialResources = resourcesResult.data ?? [];
    initialMeta = resourcesResult.meta ?? null;
    trending = trendingResult.data ?? [];
    const lb = leaderboardResult as unknown as {
      data?: {
        rank: number;
        user: { id: string; name: string; image?: string | null } | null;
        totalPoints: number;
      }[];
    };
    contributors = (lb.data ?? []).map((entry) => ({
      rank: entry.rank,
      name: entry.user?.name ?? "Unknown",
      image: entry.user?.image ?? null,
      totalPoints: entry.totalPoints,
    }));
  } catch {
    // Client component handles empty state gracefully
  }

  return (
    <Suspense fallback={<PageLayoutSkeleton />}>
      <ResourcesClient
        initialResources={initialResources}
        initialMeta={initialMeta}
        categories={categories}
        courses={courses}
        allTags={allTags}
        trendingResources={trending}
        contributors={contributors}
      />
    </Suspense>
  );
}

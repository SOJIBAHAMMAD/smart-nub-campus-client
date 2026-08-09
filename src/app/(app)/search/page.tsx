import type { Metadata } from "next";
import { Suspense } from "react";
import { resourceService } from "@/services/resource.service";
import { SearchResultsPage } from "@/components/search/search-results-page";

export const metadata: Metadata = {
  title: "Search | Smart NUB Campus",
  description:
    "Search resources, discussions, questions, teams, events, courses, jobs, alumni and mentorship across Smart NUB Campus.",
};

/**
 * Search results page (SERP).
 *
 * The query / entity / filter / pagination state lives entirely in the URL
 * (`q`, `entity`, `page`, `department`, `categoryId`, `courseId`) so the
 * browser back button and deep links work. Facet reference data (categories,
 * courses) is fetched on the server; the actual search runs client-side
 * through the global search API so results react to URL changes instantly.
 */
export default async function SearchPage() {
  let categories: { id: string; name: string }[] = [];
  let courses: { id: string; code: string; name: string }[] = [];

  try {
    const [cats, cors] = await Promise.all([
      resourceService.listCategories(),
      resourceService.listCourses(),
    ]);
    categories =
      (cats as unknown as { id: string; name: string; slug: string }[])?.map(
        (c) => ({ id: c.id, name: c.name }),
      ) ?? [];
    courses =
      (cors as unknown as {
        id: string;
        code: string;
        name: string;
        department: string;
      }[])?.map((c) => ({ id: c.id, code: c.code, name: c.name })) ?? [];
  } catch {
    // Facets are optional; the search page still works without them.
  }

  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading search...</div>}>
      <SearchResultsPage categories={categories} courses={courses} />
    </Suspense>
  );
}

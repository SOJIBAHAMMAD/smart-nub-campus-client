"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X, LayoutGrid, List, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { ResourcesSidebar } from "@/components/resources/resources-sidebar";
import { ResourcesTrending } from "@/components/resources/resources-trending";
import { ResourceCard } from "@/components/resources/resource-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  listResources,
  voteResource,
  bookmarkResource,
} from "@/actions/resource.actions";
import type {
  Resource,
  ResourceCategory,
  PaginationMeta,
} from "@/types/resource.types";
import { cn } from "@/lib/utils";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";
import Link from "next/link";

type TabOption = "all" | "bookmarks" | "uploads";
type ViewMode = "grid" | "list";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Upvoted" },
  { value: "downloads", label: "Most Downloads" },
] as const;

function ResourceCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-5 w-12 rounded-full bg-muted" />
            <div className="h-5 w-16 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DepartmentGroup({
  department,
  courses,
  selectedCourseId,
  onSelect,
}: {
  department: string;
  courses: { id: string; code: string; name: string; _count: { resources: number } }[];
  selectedCourseId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasSelection = courses.some((c) => c.id === selectedCourseId);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors",
          hasSelection ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span>{department}</span>
        <div className="flex items-center gap-1">
          <span className="tabular-nums opacity-60">{courses.length}</span>
          {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        </div>
      </button>
      {expanded && (
        <div className="ml-1 space-y-0.5 border-l pl-1.5">
          {courses.map((course) => {
            const active = course.id === selectedCourseId;
            return (
              <button
                key={course.id}
                onClick={() => onSelect(course.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="truncate">{course.code}</span>
                <span className={cn("shrink-0 ml-1 tabular-nums text-[10px]", active ? "text-primary/70" : "opacity-50")}>
                  {course._count.resources}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ResourcesClientProps {
  initialResources: Resource[];
  initialMeta: PaginationMeta | null;
  categories: (ResourceCategory & { _count: { resources: number } })[];
  courses: {
    id: string;
    code: string;
    name: string;
    department: string;
    _count: { resources: number };
  }[];
  allTags: {
    id: string;
    name: string;
    slug: string;
    _count: { resourceTags: number };
  }[];
  trendingResources: Resource[];
  contributors: {
    rank: number;
    name: string;
    image?: string | null;
    totalPoints: number;
  }[];
}

export function ResourcesClient({
  initialResources,
  initialMeta,
  categories,
  courses,
  allTags,
  trendingResources,
  contributors,
}: ResourcesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = searchParams.get("search") ?? "";
  const categorySlug = searchParams.get("category");
  const courseIdParam = searchParams.get("courseId");
  const tagsParam = searchParams.get("tags") ?? "";
  const tags = useMemo(
    () => (tagsParam ? tagsParam.split(",").filter(Boolean) : []),
    [tagsParam],
  );
  const sort = searchParams.get("sort") ?? "newest";
  const view: ViewMode = searchParams.get("view") === "list" ? "list" : "grid";
  const activeTab: TabOption =
    searchParams.get("tab") === "bookmarks" || searchParams.get("tab") === "uploads"
      ? (searchParams.get("tab") as TabOption)
      : "all";

  // Resolve category slug → id for the API (URL uses slug for readability)
  const categoryId = categorySlug
    ? (categories.find((c) => c.slug === categorySlug)?.id ?? null)
    : null;

  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount = [categorySlug, courseIdParam, ...tags].filter(Boolean).length + (search ? 1 : 0) + (sort !== "newest" ? 1 : 0);

  // ── Socket.IO for real-time resource updates ────────────────────────────
  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  // When someone uploads a new resource, prepend to list (only if no active filters)
  useSocketEvent(socket, "resource:new", (data) => {
    setResources((prev) => {
      const resource = data.resource as unknown as Resource;
      if (prev.some((r) => r.id === resource.id)) return prev;
      if (search || categorySlug || courseIdParam || tags.length > 0)
        return prev;
      return [resource, ...prev];
    });
  });

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset to page 1 when filters change (unless changing page itself)
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Sync search input with URL on initial load
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounced search → update URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  // Fetch resources when URL params change
  useEffect(() => {
    // Skip the very first render — data comes from server
    if (!initialized) {
      setInitialized(true);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const params: Record<string, unknown> = { page, limit: 12 };
        if (search) params.search = search;
        if (categoryId) params.categoryId = categoryId;
        if (courseIdParam) params.courseId = courseIdParam;
        if (tags.length > 0) params.tag = tags.join(",");
        if (sort) params.sort = sort;
        if (activeTab === "bookmarks" || activeTab === "uploads") {
          params.tab = activeTab;
        }

        const result = await listResources(
          params as Parameters<typeof listResources>[0],
        );
        if (!cancelled && result.success && result.data) {
          const data = result.data as {
            data?: Resource[];
            meta?: PaginationMeta;
          };
          setResources(data.data ?? []);
          setMeta(data.meta ?? null);
        }
      } catch {
        // Empty state handled by checking resources.length
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tags is derived from tagsParam
  }, [
    page,
    search,
    categorySlug,
    categoryId,
    courseIdParam,
    tagsParam,
    sort,
    activeTab,
    initialized,
  ]);

  // ── Optimistic vote toggle ─────────────────────────────────────
  const handleVote = useCallback(
    async (resourceId: string, type: "UP" | "DOWN") => {
      const currentVote =
        resources.find((r) => r.id === resourceId)?.userVote ?? null;
      const wasUp = currentVote === "UP";
      const wasDown = currentVote === "DOWN";

      let optimisticUp = 0;
      let optimisticDown = 0;
      let optimisticVote: "UP" | "DOWN" | null = type;

      if (type === "UP") {
        optimisticUp = wasUp ? -1 : wasDown ? 1 : 1;
        optimisticDown = wasDown ? -1 : 0;
      } else {
        optimisticUp = wasUp ? -1 : 0;
        optimisticDown = wasDown ? -1 : wasUp ? 1 : 1;
      }

      if (wasUp && type === "UP") optimisticVote = null;
      if (wasDown && type === "DOWN") optimisticVote = null;

      setResources((prev) =>
        prev.map((r) => {
          if (r.id !== resourceId) return r;
          return {
            ...r,
            userVote: optimisticVote,
            upvoteCount: r.upvoteCount + optimisticUp,
            downvoteCount: r.downvoteCount + optimisticDown,
          };
        }),
      );

      try {
        const result = await voteResource(resourceId, type);
        if (result.success && result.data) {
          const data = result.data as {
            upvoteCount: number;
            downvoteCount: number;
            action: string;
          };
          setResources((prev) =>
            prev.map((r) =>
              r.id === resourceId
                ? {
                    ...r,
                    upvoteCount: data.upvoteCount,
                    downvoteCount: data.downvoteCount,
                    userVote: data.action === "removed" ? null : type,
                  }
                : r,
            ),
          );
        }
      } catch {
        setResources((prev) =>
          prev.map((r) => {
            if (r.id !== resourceId) return r;
            return {
              ...r,
              userVote: currentVote,
              upvoteCount: r.upvoteCount - optimisticUp,
              downvoteCount: r.downvoteCount - optimisticDown,
            };
          }),
        );
      }
    },
    [resources],
  );

  // ── Optimistic bookmark toggle ─────────────────────────────────
  const handleBookmark = useCallback(
    async (resourceId: string, currentBookmarked: boolean) => {
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId ? { ...r, isBookmarked: !currentBookmarked } : r,
        ),
      );

      try {
        const result = await bookmarkResource(resourceId);
        if (!result.success) {
          // Revert on failure
          setResources((prev) =>
            prev.map((r) =>
              r.id === resourceId
                ? { ...r, isBookmarked: currentBookmarked }
                : r,
            ),
          );
        }
      } catch {
        setResources((prev) =>
          prev.map((r) =>
            r.id === resourceId ? { ...r, isBookmarked: currentBookmarked } : r,
          ),
        );
      }
    },
    [],
  );

  const toggleTag = useCallback(
    (slug: string) => {
      const current = new Set(tags);
      if (current.has(slug)) {
        current.delete(slug);
      } else {
        current.add(slug);
      }
      const next = Array.from(current);
      updateParams({ tags: next.length > 0 ? next.join(",") : null });
    },
    [tags, updateParams],
  );

  return (
    <PageLayout
      leftSidebar={
        <ResourcesSidebar
          activeTab={activeTab}
          onTabChange={(tab) => updateParams({ tab: tab === "all" ? null : tab })}
          selectedCategorySlug={categorySlug}
          onCategoryChange={(slug) => updateParams({ category: slug })}
          selectedTags={tags}
          onTagToggle={toggleTag}
          categories={categories}
          courses={courses}
          allTags={allTags}
          selectedCourseId={courseIdParam}
          onCourseChange={(id) => updateParams({ courseId: id })}
        />
      }
      rightSidebar={
        <ResourcesTrending
          trendingResources={trendingResources}
          contributors={contributors}
          selectedTags={tags}
          onTagToggle={toggleTag}
        />
      }
    >
      <div className="space-y-4">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Resources</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover and access study materials shared by the community.
            </p>
          </div>

          {/* List / Grid view toggle */}
          <Card className="shrink-0 flex flex-row items-center gap-2 rounded-lg p-0.5">
            <button
              onClick={() => updateParams({ view: "grid" })}
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors",
                view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Grid view"
              title="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => updateParams({ view: "list" })}
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors",
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="List view"
              title="List view"
            >
              <List className="size-4" />
            </button>
          </Card>
        </div>

        {/* ── Search + Filters Bar ────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for notes..."
              className="h-9 pl-9"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/resources/upload"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand/90 lg:hidden"
            >
              <Plus className="size-3.5" />
              Upload
            </Link>

            {/* Mobile filter trigger */}
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="relative inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-foreground/10 lg:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 p-4">
                  {/* Category */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Category</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => updateParams({ category: categorySlug === cat.slug ? null : cat.slug })}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                            categorySlug === cat.slug
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground bg-muted hover:text-foreground",
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Courses grouped by Department */}
                  {courses.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Course</h4>
                      <div className="space-y-1">
                        {(() => {
                          const grouped = new Map<string, typeof courses>();
                          for (const course of courses) {
                            const dept = course.department || "Other";
                            const arr = grouped.get(dept) ?? [];
                            arr.push(course);
                            grouped.set(dept, arr);
                          }
                          return Array.from(grouped.entries()).map(([dept, deptCourses]) => (
                            <DepartmentGroup
                              key={dept}
                              department={dept}
                              courses={deptCourses}
                              selectedCourseId={courseIdParam}
                              onSelect={(id) => updateParams({ courseId: courseIdParam === id ? null : id })}
                            />
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {allTags.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {allTags.slice(0, 20).map((tag) => {
                          const active = tags.includes(tag.slug);
                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.slug)}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground hover:text-foreground",
                              )}
                            >
                              #{tag.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sort */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Sort</h4>
                    <div className="space-y-1">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateParams({ sort: opt.value })}
                          className={cn(
                            "flex w-full items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                            sort === opt.value
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear all */}
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        updateParams({
                          category: null,
                          courseId: null,
                          tags: null,
                          sort: "newest",
                          search: null,
                        });
                        setShowMobileFilters(false);
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Select
              value={sort}
              onValueChange={(val) => updateParams({ sort: val })}
            >
              <SelectTrigger className="h-9 w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Active Filters Display ──────────────────────────────── */}
        {(search || categorySlug || courseIdParam || tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            {search && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                Search: &ldquo;{search}&rdquo;
                <button onClick={() => updateParams({ search: null })}>
                  <X className="size-3" />
                </button>
              </span>
            )}
            {categorySlug && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                {categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug}
                <button onClick={() => updateParams({ category: null })}>
                  <X className="size-3" />
                </button>
              </span>
            )}
            {courseIdParam && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                {courses.find((c) => c.id === courseIdParam)?.code ?? "Course"}
                <button onClick={() => updateParams({ courseId: null })}>
                  <X className="size-3" />
                </button>
              </span>
            )}
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
              >
                #{t}
                <button onClick={() => toggleTag(t)}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ── Resource Cards ──────────────────────────────────────── */}
        {loading ? (
          view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          )
        ) : resources.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <Search className="size-10" />
              </EmptyMedia>
              <EmptyTitle>No resources found</EmptyTitle>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </EmptyHeader>
          </Empty>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onVote={handleVote}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                variant="list"
                onVote={handleVote}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────── */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: String(page - 1) })}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (meta.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= meta.totalPages - 2) {
                  pageNum = meta.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() =>
                      updateParams({
                        page: pageNum === 1 ? null : String(pageNum),
                      })
                    }
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      pageNum === page
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: String(page + 1) })}
              disabled={page >= meta.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

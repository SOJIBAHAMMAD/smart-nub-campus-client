"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { ResourcesSidebar } from "@/components/resources/resources-sidebar";
import { ResourcesTrending } from "@/components/resources/resources-trending";
import { ResourceCard } from "@/components/resources/resource-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listResources, voteResource, bookmarkResource } from "@/actions/resource.actions";
import type { Resource, ResourceCategory, PaginationMeta } from "@/types/resource.types";
import { cn } from "@/lib/utils";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";

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

interface ResourcesClientProps {
  initialResources: Resource[];
  initialMeta: PaginationMeta | null;
  categories: (ResourceCategory & { _count: { resources: number } })[];
  courses: { id: string; code: string; name: string; department: string; _count: { resources: number } }[];
  allTags: { id: string; name: string; slug: string; _count: { resourceTags: number } }[];
  trendingResources: Resource[];
  contributors: { rank: number; name: string; image?: string | null; totalPoints: number }[];
  initialFilters: {
    search: string;
    category: string | null;
    tags: string[];
    sort: string;
    view: ViewMode;
  };
}

export function ResourcesClient({
  initialResources,
  initialMeta,
  categories,
  courses,
  allTags,
  trendingResources,
  contributors,
  initialFilters: _initialFilters,
}: ResourcesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = searchParams.get("search") ?? "";
  const categorySlug = searchParams.get("category");
  const courseIdParam = searchParams.get("courseId");
  const tagsParam = searchParams.get("tags") ?? "";
  const tags = useMemo(() => (tagsParam ? tagsParam.split(",").filter(Boolean) : []), [tagsParam]);
  const sort = searchParams.get("sort") ?? "newest";
  const view: ViewMode = searchParams.get("view") === "list" ? "list" : "grid";

  // Resolve category slug → id for the API (URL uses slug for readability)
  const categoryId = categorySlug
    ? (categories.find((c) => c.slug === categorySlug)?.id ?? null)
    : null;

  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabOption>("all");
  const [searchInput, setSearchInput] = useState(search);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── Socket.IO for real-time resource updates ────────────────────────────
  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  // When someone uploads a new resource, prepend to list
  useSocketEvent(socket, "resource:new", (data) => {
    setResources((prev) => {
      const resource = data.resource as unknown as Resource;
      // Avoid duplicates
      if (prev.some((r) => r.id === resource.id)) return prev;
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
        if (tags.length > 0) params.tags = tags;
        if (sort) params.sort = sort;

        const result = await listResources(params as Parameters<typeof listResources>[0]);
        if (!cancelled && result.success && result.data) {
          const data = result.data as { data?: Resource[]; meta?: PaginationMeta };
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
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- tags is derived from tagsParam; including it would cause re-fetch on every render
  }, [page, search, categorySlug, categoryId, courseIdParam, tagsParam, sort, initialized]);

  // ── Optimistic vote toggle ─────────────────────────────────────
  const handleVote = useCallback(async (resourceId: string, currentVote: Resource["userVote"]) => {
    // Update UI instantly
    setResources((prev) =>
      prev.map((r) => {
        if (r.id !== resourceId) return r;
        const wasUp = currentVote === "UP";
        return {
          ...r,
          userVote: wasUp ? null : "UP",
          upvoteCount: r.upvoteCount + (wasUp ? -1 : 1),
        };
      }),
    );

    try {
      const result = await voteResource(resourceId);
      if (result.success && result.data) {
        const data = result.data as { upvoteCount: number; action: string };
        setResources((prev) =>
          prev.map((r) =>
            r.id === resourceId
              ? { ...r, upvoteCount: data.upvoteCount, userVote: data.action === "added" ? "UP" : data.action === "updated" ? "UP" : null }
              : r,
          ),
        );
      }
    } catch {
      // Revert on failure
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId
            ? { ...r, userVote: currentVote, upvoteCount: r.upvoteCount + (currentVote === "UP" ? 1 : -1) }
            : r,
        ),
      );
    }
  }, []);

  // ── Optimistic bookmark toggle ─────────────────────────────────
  const handleBookmark = useCallback(async (resourceId: string, currentBookmarked: boolean) => {
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
            r.id === resourceId ? { ...r, isBookmarked: currentBookmarked } : r,
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
  }, []);

  const toggleTag = useCallback((slug: string) => {
    const current = new Set(tags);
    if (current.has(slug)) {
      current.delete(slug);
    } else {
      current.add(slug);
    }
    const next = Array.from(current);
    updateParams({ tags: next.length > 0 ? next.join(",") : null });
  }, [tags, updateParams]);

  return (
    <PageLayout
      leftSidebar={
        <ResourcesSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedCategorySlug={categorySlug}
          onCategoryChange={(slug) => updateParams({ category: slug })}
          selectedTags={tags}
          onTagToggle={toggleTag}
          categories={categories}
          courses={courses}
          allTags={allTags}
          onCourseChange={(_id) => updateParams({ category: null, tags: null })}
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
          <div className="flex shrink-0 items-center gap-1 rounded-lg border bg-card p-0.5 ring-1 ring-foreground/10">
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
          </div>
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

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>

          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="h-9 rounded-md border bg-transparent px-2.5 text-sm outline-none ring-1 ring-foreground/10"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Mobile Filters Panel ────────────────────────────────── */}
        {showMobileFilters && (
          <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10 lg:hidden">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select
                  value={categorySlug ?? ""}
                  onChange={(e) => updateParams({ category: e.target.value || null })}
                  className="mt-1 h-8 w-full rounded-md border bg-transparent px-2 text-xs outline-none ring-1 ring-foreground/10"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Active Filters Display ──────────────────────────────── */}
        {(search || categorySlug || tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Active filters:</span>
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
                Category: {categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug}
                <button onClick={() => updateParams({ category: null })}>
                  <X className="size-3" />
                </button>
              </span>
            )}
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
              >
                Tag: {t}
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
          <div className="rounded-xl border bg-card p-12 text-center ring-1 ring-foreground/10">
            <Search className="mx-auto size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">No resources found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
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
                    onClick={() => updateParams({ page: pageNum === 1 ? null : String(pageNum) })}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      pageNum === page
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

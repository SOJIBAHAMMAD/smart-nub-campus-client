"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUp,
  Loader2,
  Search,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { searchClientService } from "@/services/search.client.service";
import { DEPARTMENT_LIST } from "@/constants/departments";
import {
  SEARCH_ENTITY_CONFIG,
  SEARCH_ENTITY_ORDER,
  SEARCH_TABS,
} from "./search-entity-config";
import { SearchResultRow } from "./search-result-row";
import {
  SearchFacets,
  type SearchFacetGroup,
} from "./search-facets";
import type {
  SearchEntity,
  SearchEntityFilter,
  SearchResponse,
  SearchResultItem,
} from "@/types/search.types";

const ALL_LIMIT = 5;
const SCOPED_LIMIT = 10;

type FacetKey = "department" | "categoryId" | "courseId";

const ENTITY_FACETS: Record<SearchEntity, FacetKey[]> = {
  people: ["department"],
  resources: ["categoryId", "courseId"],
  discussions: ["categoryId"],
  questions: [],
  teams: ["department"],
  events: ["department"],
  courses: ["department"],
  jobs: ["department"],
  mentorship: [],
};

interface FacetRefData {
  categories: { id: string; name: string }[];
  courses: { id: string; code: string; name: string }[];
}

function parseEntity(value: string | null): SearchEntityFilter {
  if (value && SEARCH_ENTITY_ORDER.includes(value as SearchEntity)) {
    return value as SearchEntity;
  }
  return "all";
}

function getMainScrollElement(): HTMLElement | null {
  return document.getElementById("main-content");
}

function scrollMainToTop() {
  getMainScrollElement()?.scrollTo({ top: 0, behavior: "smooth" });
}

export function SearchResultsPage({ categories, courses }: FacetRefData) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const entity = parseEntity(searchParams.get("entity"));
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const department = searchParams.get("department") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const courseId = searchParams.get("courseId") ?? "";

  const [draftQ, setDraftQ] = React.useState(q);
  const [data, setData] = React.useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<SearchResultItem[]>([]);
  const [loadedPage, setLoadedPage] = React.useState(page);
  const [nonce, setNonce] = React.useState(0);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const seqRef = React.useRef(0);

  React.useEffect(() => {
    setDraftQ(q);
  }, [q]);

  const fetchParams = React.useMemo(
    () => ({
      q,
      entity,
      page,
      department: department || undefined,
      categoryId: categoryId || undefined,
      courseId: courseId || undefined,
    }),
    [q, entity, page, department, categoryId, courseId],
  );

  React.useEffect(() => {
    if (!q.trim()) {
      seqRef.current += 1;
      setData(null);
      setError(null);
      setIsLoading(false);
      setItems([]);
      return;
    }

    const seq = ++seqRef.current;
    setIsLoading(true);
    setError(null);
    const limit = entity === "all" ? ALL_LIMIT : SCOPED_LIMIT;

    searchClientService
      .search({ ...fetchParams, limit })
      .then((result) => {
        if (seq !== seqRef.current) return;
        setData(result);
        setItems(
          entity === "all"
            ? []
            : (result.data[entity as SearchEntity]?.items ?? []),
        );
        setLoadedPage(page);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (seq !== seqRef.current) return;
        setError(
          err instanceof Error ? err.message : "Search failed. Please retry.",
        );
        setData(null);
        setItems([]);
        setIsLoading(false);
      });

    scrollMainToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, entity, page, department, categoryId, courseId, nonce]);

  const total = data?.meta.total ?? 0;
  const hasMore =
    entity !== "all" && !!data && items.length < total && total > 0;
  const totalPages =
    entity !== "all" && data ? Math.max(1, Math.ceil(total / SCOPED_LIMIT)) : 0;

  const loadMore = React.useCallback(async () => {
    if (entity === "all" || !data || isLoading) return;
    const nextPage = loadedPage + 1;
    const seq = ++seqRef.current;
    setIsLoading(true);
    try {
      const result = await searchClientService.search({
        ...fetchParams,
        page: nextPage,
        limit: SCOPED_LIMIT,
      });
      if (seq !== seqRef.current) return;
      setData(result);
      setItems((prev) => [
        ...prev,
        ...(result.data[entity as SearchEntity]?.items ?? []),
      ]);
      setLoadedPage(nextPage);
    } catch {
      // Ignore — the Load more button / sentinel can retry.
    } finally {
      setIsLoading(false);
    }
  }, [entity, data, isLoading, loadedPage, fetchParams]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    loadMore,
  });

  React.useEffect(() => {
    const el = getMainScrollElement();
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 500);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const buildParams = React.useCallback(
    (
      next: Partial<{
        q: string;
        entity: SearchEntityFilter;
        page: number;
        department: string;
        categoryId: string;
        courseId: string;
        clearFilters: boolean;
      }>,
    ) => {
      const params = new URLSearchParams();
      const qVal = next.q ?? q;
      const entityVal = next.entity ?? entity;
      const resetPage =
        next.entity !== undefined ||
        next.department !== undefined ||
        next.categoryId !== undefined ||
        next.courseId !== undefined ||
        next.clearFilters === true;
      const pageVal = next.page ?? (resetPage ? 1 : page);
      const dep = next.clearFilters ? "" : next.department ?? department;
      const cat = next.clearFilters ? "" : next.categoryId ?? categoryId;
      const cou = next.clearFilters ? "" : next.courseId ?? courseId;

      if (qVal.trim()) params.set("q", qVal.trim());
      if (entityVal !== "all") params.set("entity", entityVal);
      if (pageVal > 1) params.set("page", String(pageVal));
      if (dep) params.set("department", dep);
      if (cat) params.set("categoryId", cat);
      if (cou) params.set("courseId", cou);
      return params;
    },
    [q, entity, page, department, categoryId, courseId],
  );

  const navigate = React.useCallback(
    (
      next: Parameters<typeof buildParams>[0],
      opts: { push?: boolean } = {},
    ) => {
      const href = `/search?${buildParams(next).toString()}`;
      (opts.push ? router.push : router.replace)(href);
      scrollMainToTop();
    },
    [router, buildParams],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftQ.trim()) return;
    navigate({ q: draftQ, page: 1 }, { push: true });
  };

  const handleTabSelect = (nextEntity: SearchEntityFilter) => {
    navigate({ entity: nextEntity }, { push: true });
  };

  const handleFacetChange = (key: FacetKey, value: string) => {
    setSheetOpen(false);
    navigate({ [key]: value }, { push: true });
  };

  const handleClearFilters = () => {
    setSheetOpen(false);
    navigate({ clearFilters: true }, { push: true });
  };

  const facetValues = { department, categoryId, courseId };
  const hasFilters = Boolean(department || categoryId || courseId);

  const facetGroups: SearchFacetGroup[] = [
    {
      key: "department",
      title: "Department",
      options: DEPARTMENT_LIST.map((d) => ({
        value: d.value,
        label: d.shortName,
      })),
    },
    {
      key: "categoryId",
      title: "Category",
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      key: "courseId",
      title: "Course",
      options: courses.map((c) => ({
        value: c.id,
        label: `${c.code} · ${c.name}`,
      })),
    },
  ];

  const visibleFacets =
    entity === "all"
      ? facetGroups
      : facetGroups.filter((group) =>
          ENTITY_FACETS[entity as SearchEntity].includes(group.key),
        );

  const facetsPanel = (
    <SearchFacets
      groups={visibleFacets}
      values={facetValues}
      onChange={handleFacetChange}
      onClear={handleClearFilters}
      resultsCount={total}
      hasFilters={hasFilters}
    />
  );

  const showPrompt = !q.trim();
  const showErrorState = !showPrompt && error !== null;
  const showEmptyState =
    !showPrompt && !error && data !== null && data.meta.total === 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-20 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <form onSubmit={handleSearchSubmit} role="search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
              placeholder="Search resources, people, teams..."
              aria-label="Search campus"
              className="h-10 pl-9 pr-20"
            />
            {draftQ && (
              <button
                type="button"
                onClick={() => {
                  setDraftQ("");
                  navigate({ q: "", clearFilters: true }, { push: true });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {showPrompt ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <SearchX className="size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Type a query above to search across resources, discussions, teams,
            events, courses, jobs, alumni and more.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div
            className="-mx-4 flex gap-1 overflow-x-auto border-b px-4 no-scrollbar sm:-mx-6 sm:px-6"
            role="tablist"
            aria-label="Search results by category"
          >
            {SEARCH_TABS.map((tab) => {
              const group =
                tab.entity === "all"
                  ? undefined
                  : data?.data[tab.entity as SearchEntity];
              const count = group?.total;
              const active = entity === tab.entity;
              return (
                <button
                  key={tab.entity}
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleTabSelect(tab.entity)}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                  {typeof count === "number" && (
                    <span className="ml-1 text-xs opacity-70">
                      ({count})
                    </span>
                  )}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Result summary + mobile filter button */}
          <div className="flex items-center justify-between py-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {isLoading && !data ? (
                "Searching..."
              ) : (
                <>
                  {total} result{total === 1 ? "" : "s"} for{" "}
                  <span className="font-medium text-foreground">&quot;{q}&quot;</span>
                  {entity !== "all" && (
                    <span className="text-muted-foreground/70">
                      {" "}
                      in {SEARCH_ENTITY_CONFIG[entity as SearchEntity].pluralLabel}
                    </span>
                  )}
                </>
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {hasFilters && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {[department, categoryId, courseId].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Desktop facets */}
            <aside className="hidden lg:block">
              <div className="sticky top-[7.5rem]">{facetsPanel}</div>
            </aside>

            {/* Results */}
            <div className="min-w-0">
              {showErrorState && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setNonce((n) => n + 1)}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {showEmptyState && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <SearchX className="size-10 text-muted-foreground/50" />
                  <p className="text-sm text-foreground">
                    No results for &quot;{q}&quot;
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try different keywords or fewer filters.
                  </p>
                  {hasFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}

              {!showErrorState &&
                !showEmptyState &&
                (entity === "all" ? (
                  /* All tab: grouped sections */
                  <div className="space-y-8">
                    {data?.meta.bestMatch && (
                      <section>
                        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Best match
                        </h2>
                        <SearchResultRow
                          item={data.meta.bestMatch}
                          query={q}
                          bestMatch
                          position={1}
                        />
                      </section>
                    )}

                    {SEARCH_ENTITY_ORDER.map((entityKey) => {
                      const group = data?.data[entityKey];
                      if (!group || group.total === 0) return null;
                      const config = SEARCH_ENTITY_CONFIG[entityKey];
                      const Icon = config.icon;
                      const viewAllHref = `/search?${buildParams({
                        entity: entityKey,
                      }).toString()}`;
                      return (
                        <section key={entityKey}>
                          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                            <Icon className="size-4 text-muted-foreground" />
                            {config.pluralLabel}
                            <span className="text-xs font-normal text-muted-foreground">
                              {group.total}
                            </span>
                          </h2>
                          <div className="space-y-2">
                            {group.items
                              .filter(
                                (item) =>
                                  item.id !== data?.meta.bestMatch?.id,
                              )
                              .map((item, index) => (
                                <SearchResultRow
                                  key={`${item.type}:${item.id}`}
                                  item={item}
                                  query={q}
                                  position={index + 1}
                                />
                              ))}
                          </div>
                          <Link
                            href={viewAllHref}
                            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                          >
                            View all {group.total}{" "}
                            {config.pluralLabel.toLowerCase()} →
                          </Link>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  /* Scoped tab: paginated list */
                  <>
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <SearchResultRow
                          key={`${item.type}:${item.id}`}
                          item={item}
                          query={q}
                          position={index + 1}
                        />
                      ))}
                    </div>

                    {isLoading && items.length > 0 && (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading more...
                      </div>
                    )}

                    {totalPages > 1 && (
                      <>
                        {/* Desktop pagination */}
                        <div className="mt-8 hidden md:block">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  href={
                                    page > 1
                                      ? `/search?${buildParams({ page: page - 1 }).toString()}`
                                      : undefined
                                  }
                                  aria-disabled={page <= 1}
                                  onClick={(e: React.MouseEvent) => {
                                    if (page <= 1) {
                                      e.preventDefault();
                                      return;
                                    }
                                    e.preventDefault();
                                    navigate({ page: page - 1 });
                                  }}
                                  className={cn(page <= 1 && "pointer-events-none opacity-50")}
                                />
                              </PaginationItem>
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (p) => (
                                  <PaginationItem key={p}>
                                    <PaginationLink
                                      href={`/search?${buildParams({ page: p }).toString()}`}
                                      isActive={p === page}
                                      onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        navigate({ page: p });
                                      }}
                                    >
                                      {p}
                                    </PaginationLink>
                                  </PaginationItem>
                                ),
                              )}
                              <PaginationItem>
                                <PaginationNext
                                  href={
                                    page < totalPages
                                      ? `/search?${buildParams({ page: page + 1 }).toString()}`
                                      : undefined
                                  }
                                  aria-disabled={page >= totalPages}
                                  onClick={(e: React.MouseEvent) => {
                                    if (page >= totalPages) {
                                      e.preventDefault();
                                      return;
                                    }
                                    e.preventDefault();
                                    navigate({ page: page + 1 });
                                  }}
                                  className={cn(
                                    page >= totalPages && "pointer-events-none opacity-50",
                                  )}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>

                        {/* Mobile: infinite scroll + load more */}
                        <div className="mt-6 flex flex-col items-center gap-2 md:hidden">
                          {hasMore && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void loadMore()}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                "Load more"
                              )}
                            </Button>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Loaded {items.length} of {total}
                          </p>
                        </div>
                        <div ref={sentinelRef} className="h-1 md:hidden" />
                      </>
                    )}
                  </>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Mobile facets tray */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{facetsPanel}</div>
        </SheetContent>
      </Sheet>

      {/* Scroll to top (mobile) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollMainToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-20 right-4 z-40 flex size-10 items-center justify-center rounded-full border bg-background text-foreground shadow-lg md:hidden"
        >
          <ArrowUp className="size-4" />
        </button>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  ChevronDown,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { JobCard } from "./job-card";
import ROUTES from "@/constants/routes";
import { JobType, UserRole } from "@/constants/enums";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { departmentLabel, employmentLabel } from "@/lib/job-utils";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";
import type { PaginationMeta } from "@/types/resource.types";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "FILLED", label: "Filled" },
  { value: "CLOSED", label: "Closed" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: JobType.FULL_TIME, label: "Full-time" },
  { value: JobType.PART_TIME, label: "Part-time" },
  { value: JobType.CONTRACT, label: "Contract" },
  { value: JobType.INTERNSHIP, label: "Internship" },
  { value: JobType.REMOTE, label: "Remote" },
];

const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABELS).map(
  ([value, label]) => ({ value, label }),
);

interface JobsListClientProps {
  initialJobs: Job[];
  initialMeta: PaginationMeta | null;
  initialFilters: {
    search: string;
    status: string | null;
    employmentType: string | null;
    department: string | null;
    location: string | null;
    view: "grid" | "list";
    page: number;
  };
  userRole?: string;
}

interface FilterValues {
  employmentType: string;
  department: string;
  location: string;
}

export function JobsListClient({
  initialJobs,
  initialMeta,
  initialFilters,
  userRole,
}: JobsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchParam = searchParams.get("q") ?? "";
  const statusParam = searchParams.get("status");
  const employmentTypeParam = searchParams.get("employmentType") ?? "";
  const departmentParam = searchParams.get("department") ?? "";
  const locationParam = searchParams.get("location") ?? "";
  const viewParam = searchParams.get("view") === "list" ? "list" : "grid";

  const [search, setSearch] = useState(initialFilters.search);
  const [locationDraft, setLocationDraft] = useState(locationParam);
  const [view, setView] = useState<"grid" | "list">(viewParam);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    setSearch(initialFilters.search);
  }, [initialFilters.search]);

  useEffect(() => {
    setLocationDraft(locationParam);
  }, [locationParam]);

  useEffect(() => {
    setView(viewParam);
  }, [viewParam]);

  // Press "/" anywhere (except while typing) to focus the search box.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
      if (!("page" in updates)) {
        params.delete("page");
      }
      startTransition(() => {
        router.push(`/jobs?${params.toString()}`);
      });
    },
    [searchParams, router],
  );

  // Debounced keyword search — live as the user types.
  useEffect(() => {
    if (search === searchParam) return;
    const timer = setTimeout(() => {
      updateParams({ q: search || null });
    }, 450);
    return () => clearTimeout(timer);
  }, [search, searchParam, updateParams]);

  // Debounced location filter.
  useEffect(() => {
    if (locationDraft === locationParam) return;
    const timer = setTimeout(() => {
      updateParams({ location: locationDraft || null });
    }, 450);
    return () => clearTimeout(timer);
  }, [locationDraft, locationParam, updateParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: search || null });
  };

  const handleViewChange = (next: "grid" | "list") => {
    setView(next);
    updateParams({ view: next });
  };

  const setFilter = (key: "employmentType" | "department", value: string) => {
    updateParams({ [key]: value || null });
  };

  const clearSearch = () => {
    setSearch("");
    updateParams({ q: null });
  };

  const clearFilters = () => {
    setSearch("");
    setLocationDraft("");
    updateParams({
      q: null,
      status: null,
      employmentType: null,
      department: null,
      location: null,
    });
  };

  const removeFilter = (
    key: "employmentType" | "department" | "location" | "search",
  ) => {
    if (key === "search") {
      clearSearch();
      return;
    }
    updateParams({ [key]: null });
  };

  const meta = initialMeta;
  const total = meta?.total ?? initialJobs.length;
  const resultStart =
    meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const resultEnd = meta ? Math.min(meta.page * meta.limit, meta.total) : total;

  const hasFilters = Boolean(
    searchParam ||
      statusParam ||
      employmentTypeParam ||
      departmentParam ||
      locationParam,
  );
  const activeFilterCount =
    (employmentTypeParam ? 1 : 0) +
    (departmentParam ? 1 : 0) +
    (locationParam ? 1 : 0);
  const canPost = userRole === UserRole.ALUMNI || userRole === UserRole.ADMIN;

  const filterValues: FilterValues = {
    employmentType: employmentTypeParam,
    department: departmentParam,
    location: locationDraft,
  };

  const FilterPanel = (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" aria-hidden="true" />
            Clear all
          </Button>
        )}
      </div>

      <FilterSection title="Employment type">
        <Select
          value={filterValues.employmentType}
          onValueChange={(v) => setFilter("employmentType", v ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Department">
        <Select
          value={filterValues.department}
          onValueChange={(v) => setFilter("department", v ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any department</SelectItem>
            {DEPARTMENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Location">
        <div className="relative">
          <MapPin
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={filterValues.location}
            onChange={(e) => setLocationDraft(e.target.value)}
            placeholder="City or country"
            className="pl-9 pr-8"
            aria-label="Filter by location"
          />
          {filterValues.location && (
            <button
              type="button"
              onClick={() => setLocationDraft("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear location filter"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </FilterSection>
    </div>
  );

  const ActiveFilterChips = (
    <div
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Active filters"
    >
      {searchParam && (
        <FilterChip
          label={`Search: "${searchParam}"`}
          onRemove={() => removeFilter("search")}
        />
      )}
      {employmentTypeParam && (
        <FilterChip
          label={employmentLabel(employmentTypeParam)}
          onRemove={() => removeFilter("employmentType")}
        />
      )}
      {departmentParam && (
        <FilterChip
          label={departmentLabel(departmentParam) ?? departmentParam}
          onRemove={() => removeFilter("department")}
        />
      )}
      {locationParam && (
        <FilterChip
          label={locationParam}
          onRemove={() => removeFilter("location")}
        />
      )}
    </div>
  );

  const resultSummary = () => {
    if (total === 0) return "No jobs found";
    if (total === 1) return "1 job found";
    if (meta && meta.totalPages > 1) {
      return `Showing ${resultStart}–${resultEnd} of ${total.toLocaleString()} jobs`;
    }
    return `${total.toLocaleString()} jobs found`;
  };

  const renderPagination = () => {
    if (!meta || meta.totalPages <= 1) return null;
    const current = meta.page;
    const totalPages = meta.totalPages;

    return (
      <Pagination className="pt-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-label="Previous page"
              onClick={(e) => {
                e.preventDefault();
                updateParams({ page: String(current - 1) });
              }}
              className={current <= 1 ? "pointer-events-none opacity-50" : ""}
              aria-disabled={current <= 1}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - current) <= 1,
            )
            .map((p, idx, arr) => {
              const items: React.ReactNode[] = [];
              if (idx > 0 && arr[idx - 1] !== p - 1) {
                items.push(
                  <PaginationItem key={`ellipsis-${p}`}>
                    <PaginationEllipsis />
                  </PaginationItem>,
                );
              }
              items.push(
                <PaginationItem key={p}>
                  <Button
                    variant={p === current ? "outline" : "ghost"}
                    size="icon"
                    aria-current={p === current ? "page" : undefined}
                    aria-label={`Page ${p}`}
                    className="size-9 text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      updateParams({ page: String(p) });
                    }}
                  >
                    {p}
                  </Button>
                </PaginationItem>,
              );
              return items;
            })
            .flat()}

          <PaginationItem>
            <PaginationNext
              href="#"
              aria-label="Next page"
              onClick={(e) => {
                e.preventDefault();
                updateParams({ page: String(current + 1) });
              }}
              className={
                current >= totalPages ? "pointer-events-none opacity-50" : ""
              }
              aria-disabled={current >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <PageLayout>
      <a
        href="#jobs-results"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        Skip to job listings
      </a>

      <div className="space-y-6">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                NUB Alumni Network
              </p>
              <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                <Briefcase className="size-7 text-primary" aria-hidden="true" />
                Job Board
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Opportunities shared by NUB alumni and administrators — search,
                filter, and apply in a few taps.
              </p>
              <form
                role="search"
                onSubmit={handleSearchSubmit}
                className="relative mt-5 max-w-md"
              >
                <Search
                  className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, company, keywords..."
                  className="h-12 pl-10 pr-12 text-base shadow-sm"
                  aria-label="Search jobs by title, company, or keyword"
                  autoComplete="off"
                />
                {isPending && search !== searchParam ? (
                  <Loader2
                    className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : search ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:block">
                    /
                  </kbd>
                )}
              </form>
            </div>
            {canPost && (
              <Button
                size="lg"
                className="w-fit shrink-0"
                render={<Link href={ROUTES.NEW_JOB} />}
                nativeButton={false}
              >
                <Plus className="size-4" aria-hidden="true" />
                Post a job
              </Button>
            )}
          </div>
        </section>

        {/* ── Status tabs ──────────────────────────────────────────── */}
        <Tabs
          value={statusParam ?? "all"}
          onValueChange={(value) =>
            updateParams({ status: value === "all" ? null : value })
          }
        >
          <TabsList
            aria-label="Filter jobs by status"
            className="w-full justify-start overflow-x-auto lg:w-auto"
          >
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* ── Filter sidebar (desktop) + content ───────────────────── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside
            className="hidden w-64 shrink-0 lg:block"
            role="complementary"
            aria-label="Job filters"
          >
            <div className="sticky top-4 rounded-xl border border-border/60 bg-card p-4">
              {FilterPanel}
            </div>
          </aside>

          <div
            id="jobs-results"
            className="scroll-mt-24 min-w-0 flex-1 space-y-4"
          >
            <h2 className="sr-only">Job listings</h2>

            {ActiveFilterChips}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {resultSummary()}
                </p>
                {isPending && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Loader2
                      className="size-3 animate-spin"
                      aria-hidden="true"
                    />
                    Updating…
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>

                <div
                  role="group"
                  aria-label="Layout view"
                  className="inline-flex shrink-0 overflow-hidden rounded-md border border-border"
                >
                  <Button
                    type="button"
                    variant={view === "grid" ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() => handleViewChange("grid")}
                    aria-pressed={view === "grid"}
                    title="Grid view"
                    className="rounded-none"
                  >
                    <LayoutGrid className="size-4" aria-hidden="true" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    type="button"
                    variant={view === "list" ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() => handleViewChange("list")}
                    aria-pressed={view === "list"}
                    title="List view"
                    className="rounded-none border-l border-border"
                  >
                    <List className="size-4" aria-hidden="true" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Screen-reader announcement of result changes */}
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {resultSummary()}
            </p>

            {jobs.length === 0 ? (
              <Empty className="border border-dashed">
                <EmptyMedia variant="icon">
                  <Briefcase className="size-6" aria-hidden="true" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>
                    {hasFilters
                      ? "No jobs match your filters"
                      : "No job posts yet"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {hasFilters
                      ? "Try adjusting your search, clearing a filter, or switching to another status."
                      : canPost
                        ? "Be the first to share an opportunity with the NUB community."
                        : "Check back soon — new opportunities will appear here."}
                  </EmptyDescription>
                </EmptyHeader>
                {hasFilters ? (
                  <EmptyContent>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </EmptyContent>
                ) : canPost ? (
                  <EmptyContent>
                    <Button
                      size="sm"
                      render={<Link href={ROUTES.NEW_JOB} />}
                      nativeButton={false}
                    >
                      Post a job
                    </Button>
                  </EmptyContent>
                ) : null}
              </Empty>
            ) : (
              <div
                className={cn(
                  "transition-opacity duration-150",
                  isPending && "pointer-events-none opacity-60",
                )}
                aria-busy={isPending}
              >
                {view === "grid" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} view="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} view="list" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {renderPagination()}
          </div>
        </div>
      </div>

      {/* ── Mobile filters (drawer) ────────────────────────────────── */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] gap-0 p-0">
          <SheetHeader className="border-b border-border/60 pb-3">
            <SheetTitle className="text-left text-base">Filters</SheetTitle>
            <SheetDescription className="text-left">
              Narrow the board to roles you care about.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">{FilterPanel}</div>
          <SheetFooter className="border-t border-border/60 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Button
              className="w-full"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Show {total.toLocaleString()} {total === 1 ? "job" : "jobs"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-md py-1 text-left text-sm font-semibold text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50">
        {title}
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-open:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 pt-1.5">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={`Remove filter ${label}`}
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </span>
  );
}

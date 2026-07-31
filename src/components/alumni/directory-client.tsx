"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Users, SlidersHorizontal, X } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AlumniCard } from "./alumni-card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { listDirectoryAction } from "@/actions/alumni.actions";
import { cn } from "@/lib/utils";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import type {
  DirectoryMember,
  DirectoryStats,
  PaginationMeta,
} from "@/types";

const PAGE_SIZE = 12;

interface DirectoryClientProps {
  initialMembers: DirectoryMember[];
  initialMeta: PaginationMeta | null;
  initialStats: DirectoryStats | null;
}

function FacetButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span className="truncate text-left">{label}</span>
      <span
        className={cn(
          "shrink-0 tabular-nums text-[10px]",
          active ? "text-primary/70" : "text-muted-foreground/60",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function FacetGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-start gap-3">
            <div className="size-11 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DirectoryClient({
  initialMembers,
  initialMeta,
  initialStats,
}: DirectoryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );
  const search = searchParams.get("q") ?? "";
  const department = searchParams.get("department");
  const graduationYearParam = searchParams.get("graduationYear");
  const industry = searchParams.get("industry");

  const [members, setMembers] = useState<DirectoryMember[]>(initialMembers);
  const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  const hasFilters = Boolean(search || department || graduationYearParam || industry);

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
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ q: searchInput || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const result = await listDirectoryAction({
          page,
          limit: PAGE_SIZE,
          q: search || undefined,
          department: department ?? undefined,
          graduationYear: graduationYearParam
            ? parseInt(graduationYearParam, 10)
            : undefined,
          industry: industry ?? undefined,
        });
        if (!cancelled && result.success && result.data) {
          const data = result.data as {
            data?: DirectoryMember[];
            meta?: PaginationMeta;
          };
          setMembers(data.data ?? []);
          setMeta(data.meta ?? null);
        }
      } catch {
        // Empty state handled by checking members.length
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [page, search, department, graduationYearParam, industry, initialized]);

  const total = meta?.total ?? initialStats?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const stats = initialStats;

  const facets = useMemo(() => {
    const byDepartment = stats?.byDepartment ?? [];
    const byGraduationYear = [...(stats?.byGraduationYear ?? [])].sort(
      (a, b) => b.value - a.value,
    );
    const byIndustry = stats?.byIndustry ?? [];
    return { byDepartment, byGraduationYear, byIndustry };
  }, [stats]);

  const pageNumbers = useMemo(() => {
    const items: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    const pages = Math.max(totalPages, 1);
    for (let i = 1; i <= pages; i++) {
      if (
        i === 1 ||
        i === pages ||
        (i >= page - 1 && i <= page + 1)
      ) {
        items.push(i);
      } else if (i === page - 2) {
        items.push("ellipsis-start");
      } else if (i === page + 2) {
        items.push("ellipsis-end");
      }
    }
    return items;
  }, [totalPages, page]);

  const sidebar = (
    <div className="space-y-6">
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={() =>
            updateParams({ q: null, department: null, graduationYear: null, industry: null })
          }
        >
          <X className="size-3.5" />
          Clear all filters
        </Button>
      )}

      {facets.byDepartment.length > 0 && (
        <FacetGroup title="Department">
          {facets.byDepartment.map((facet) => (
            <FacetButton
              key={facet.value}
              label={
                DEPARTMENT_LABELS[facet.value as keyof typeof DEPARTMENT_LABELS] ??
                facet.value
              }
              count={facet.count}
              active={department === facet.value}
              onClick={() =>
                updateParams({
                  department: department === facet.value ? null : facet.value,
                })
              }
            />
          ))}
        </FacetGroup>
      )}

      {facets.byGraduationYear.length > 0 && (
        <FacetGroup title="Graduation Year">
          {facets.byGraduationYear.map((facet) => (
            <FacetButton
              key={facet.value}
              label={`Class of ${facet.value}`}
              count={facet.count}
              active={graduationYearParam === String(facet.value)}
              onClick={() =>
                updateParams({
                  graduationYear:
                    graduationYearParam === String(facet.value)
                      ? null
                      : String(facet.value),
                })
              }
            />
          ))}
        </FacetGroup>
      )}

      {facets.byIndustry.length > 0 && (
        <FacetGroup title="Industry">
          {facets.byIndustry.map((facet) => (
            <FacetButton
              key={facet.value}
              label={facet.value}
              count={facet.count}
              active={industry === facet.value}
              onClick={() =>
                updateParams({ industry: industry === facet.value ? null : facet.value })
              }
            />
          ))}
        </FacetGroup>
      )}

      {facets.byDepartment.length === 0 &&
        facets.byGraduationYear.length === 0 &&
        facets.byIndustry.length === 0 && (
          <p className="px-2 text-xs text-muted-foreground">
            No directory stats available yet.
          </p>
        )}
    </div>
  );

  const showFirstUseEmpty =
    !loading && members.length === 0 && !hasFilters && total === 0;
  const showNoResultsEmpty =
    !loading && members.length === 0 && (hasFilters || total > 0);

  return (
    <PageLayout leftSidebar={sidebar} leftSidebarTitle="Filters">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Users className="size-5 text-primary" />
            Alumni Directory
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {total > 0
              ? `${total} alumn${total === 1 ? "" : "i"} of Northern University Bangladesh`
              : "Browse the NUB alumni community"}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search name, role, company..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 pl-8 pr-8 text-sm"
            aria-label="Search alumni"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile filter affordance (below search) */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <SlidersHorizontal className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Use the Filters button to refine by department, year or industry.
        </span>
      </div>

      {loading ? (
        <DirectorySkeleton />
      ) : showFirstUseEmpty ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No alumni yet</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>
            The directory fills up as graduated students confirm their alumni
            transition. Check back soon.
          </EmptyDescription>
        </Empty>
      ) : showNoResultsEmpty ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No alumni match your filters</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>
            Try adjusting your search or clearing a filter.
          </EmptyDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateParams({ q: null, department: null, graduationYear: null, industry: null })
            }
          >
            Clear filters
          </Button>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <AlumniCard key={member.id} member={member} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) updateParams({ page: String(page - 1) });
                    }}
                    aria-disabled={page <= 1}
                    className={cn(page <= 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {pageNumbers.map((item, index) =>
                  item === "ellipsis-start" || item === "ellipsis-end" ? (
                    <PaginationItem key={`${item}-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === page}
                        onClick={(e) => {
                          e.preventDefault();
                          if (item !== page) updateParams({ page: String(item) });
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) updateParams({ page: String(page + 1) });
                    }}
                    aria-disabled={page >= totalPages}
                    className={cn(
                      page >= totalPages && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </PageLayout>
  );
}

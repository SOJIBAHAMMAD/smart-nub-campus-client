"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { UserRole } from "@/constants/enums";
import type { Job } from "@/types";
import type { PaginationMeta } from "@/types/resource.types";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "FILLED", label: "Filled" },
  { value: "CLOSED", label: "Closed" },
];

interface JobsListClientProps {
  initialJobs: Job[];
  initialMeta: PaginationMeta | null;
  initialFilters: {
    search: string;
    status: string | null;
    page: number;
  };
  userRole?: string;
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

  const searchParam = searchParams.get("q") ?? "";
  const statusParam = searchParams.get("status");

  const [search, setSearch] = useState(initialFilters.search);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    setSearch(initialFilters.search);
  }, [initialFilters.search]);

  const updateParams = (updates: Record<string, string | null>) => {
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
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: search || null });
  };

  const clearSearch = () => {
    setSearch("");
    updateParams({ q: null });
  };

  const clearFilters = () => {
    setSearch("");
    updateParams({ q: null, status: null });
  };

  const meta = initialMeta;
  const total = meta?.total ?? initialJobs.length;
  const hasFilters = Boolean(searchParam) || Boolean(statusParam);
  const canPost = userRole === UserRole.ALUMNI || userRole === UserRole.ADMIN;

  const renderPagination = () => {
    if (!meta || meta.totalPages <= 1) return null;
    const current = meta.page;
    const totalPages = meta.totalPages;

    return (
      <Pagination className="pt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
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
      <div className="space-y-6">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <Briefcase className="size-7 text-primary" />
              Job Board
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Opportunities shared by NUB alumni and administrators.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {meta && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Building2 className="size-3.5" aria-hidden="true" />
                {total.toLocaleString()} job{total === 1 ? "" : "s"}
              </span>
            )}
            {canPost && (
              <Button
                render={<Link href={ROUTES.NEW_JOB} />}
                nativeButton={false}
              >
                Post a job
              </Button>
            )}
          </div>
        </div>

        {/* ── Status tabs + search ────────────────────────────────── */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            value={statusParam ?? "all"}
            onValueChange={(value) =>
              updateParams({ status: value === "all" ? null : value })
            }
          >
            <TabsList
              aria-label="Filter jobs by status"
              className="w-full justify-start lg:w-auto"
            >
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex w-full items-center gap-2 lg:w-auto">
            <form
              role="search"
              onSubmit={handleSearchSubmit}
              className="relative w-full lg:w-72"
            >
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search title, company, keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9"
                aria-label="Search jobs"
              />
              {isPending && search !== searchParam ? (
                <Loader2
                  className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              ) : search ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </form>

            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* ── Jobs grid ─────────────────────────────────────────── */}
        {jobs.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyMedia variant="icon">
              <Briefcase className="size-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>
                {hasFilters ? "No jobs match your filters" : "No job posts yet"}
              </EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "Try adjusting your search or switching to another status."
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
            className={
              isPending
                ? "pointer-events-none opacity-50 transition-opacity duration-150"
                : "transition-opacity duration-150"
            }
            aria-busy={isPending}
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        {renderPagination()}
      </div>
    </PageLayout>
  );
}

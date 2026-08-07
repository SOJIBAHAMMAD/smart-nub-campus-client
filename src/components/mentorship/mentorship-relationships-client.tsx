"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Handshake,
  MessagesSquare,
  Sparkles,
  Target,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Metric } from "@/components/ui/metric";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { listMentorshipsAction } from "@/actions/mentorship.actions";
import ROUTES from "@/constants/routes";
import { MentorshipStatus } from "@/constants/enums";
import { cn } from "@/lib/utils";
import type { Mentorship, PaginationMeta } from "@/types";

const PAGE_SIZE = 20;

const STATUS_META: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  [MentorshipStatus.ACTIVE]: { label: "Active", variant: "default" },
  [MentorshipStatus.COMPLETED]: { label: "Completed", variant: "secondary" },
  [MentorshipStatus.ENDED]: { label: "Ended", variant: "outline" },
};

function MentorshipSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface MentorshipRelationshipsClientProps {
  initialMentorships: Mentorship[];
  initialMeta: PaginationMeta | null;
  initialFilters: { status: string | null; page: number };
  userId?: string;
}

export function MentorshipRelationshipsClient({
  initialMentorships,
  initialMeta,
  initialFilters: _initialFilters,
  userId: _userId,
}: MentorshipRelationshipsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const status = searchParams.get("status");

  const [mentorships, setMentorships] = useState<Mentorship[]>(initialMentorships);
  const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
    if (!initialized) {
      setInitialized(true);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const result = await listMentorshipsAction({
          page,
          limit: PAGE_SIZE,
          status: status as "ACTIVE" | "COMPLETED" | "ENDED" | undefined,
        });
        if (!cancelled && result.success && result.data) {
          const data = result.data as {
            data?: Mentorship[];
            meta?: PaginationMeta;
          };
          setMentorships(data.data ?? []);
          setMeta(data.meta ?? null);
        }
      } catch {
        // Empty state handled by checking length
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [page, status, initialized]);

  const total = meta?.total ?? initialMentorships.length;
  const totalPages = meta?.totalPages ?? 1;

  const pageNumbers = (() => {
    const items: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    const pages = Math.max(totalPages, 1);
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
        items.push(i);
      } else if (i === page - 2) {
        items.push("ellipsis-start");
      } else if (i === page + 2) {
        items.push("ellipsis-end");
      }
    }
    return items;
  })();

  const statusTabs: { value: string | null; label: string }[] = [
    { value: null, label: "All" },
    { value: MentorshipStatus.ACTIVE, label: "Active" },
    { value: MentorshipStatus.COMPLETED, label: "Completed" },
    { value: MentorshipStatus.ENDED, label: "Ended" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={ROUTES.MENTORSHIP}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to mentorship
        </Link>
        <Link
          href={ROUTES.MENTORSHIP_REQUESTS}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Requests
        </Link>
      </div>

      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Handshake className="size-5 text-primary" />
          My mentorships
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {total > 0
            ? `${total} relationship${total === 1 ? "" : "s"} with NUB alumni`
            : "Active mentorship relationships live here once a request is accepted."}
        </p>
      </div>

      {/* Segmented status control */}
      <div
        role="group"
        aria-label="Filter by status"
        className="inline-flex w-full items-center gap-0.5 rounded-full border border-border bg-card p-0.5 sm:w-fit"
      >
        {statusTabs.map((tab) => (
          <button
            key={tab.value ?? "all"}
            type="button"
            onClick={() =>
              updateParams({
                status: status === tab.value ? null : tab.value,
              })
            }
            className={cn(
              "flex-1 rounded-full px-4 py-1.5 text-xs font-medium transition-colors sm:flex-none",
              status === tab.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <MentorshipSkeleton />
      ) : mentorships.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Handshake className="size-6" />
            </EmptyMedia>
            <EmptyTitle>
              {status ? "No mentorships in this state" : "No mentorships yet"}
            </EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>
            {status
              ? "Try a different status filter."
              : "When a mentor accepts your request, the relationship and your shared goals will appear here."}
          </EmptyDescription>
          {!status && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 gap-1.5"
              render={<Link href={ROUTES.MENTORSHIP} />}
              nativeButton={false}
            >
              Browse mentors
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </Empty>
      ) : (
        <>
          <div className="space-y-3">
            {mentorships.map((mentorship) => {
              const statusMeta =
                STATUS_META[mentorship.status] ?? {
                  label: mentorship.status,
                  variant: "outline",
                };
              const goalPct =
                mentorship.stats.goalCount > 0
                  ? Math.round(
                      (mentorship.stats.completedGoalCount /
                        mentorship.stats.goalCount) *
                        100,
                    )
                  : 0;

              return (
                <Card
                  key={mentorship.id}
                  size="sm"
                  className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-primary/25"
                >
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                    <div className="relative shrink-0">
                      <Avatar
                        id={mentorship.other.id}
                        name={mentorship.other.name}
                        src={mentorship.other.image}
                        className="size-12"
                      />
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background",
                          mentorship.status === MentorshipStatus.ACTIVE
                            ? "bg-emerald-500"
                            : "bg-muted",
                        )}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {mentorship.other.name}
                        </p>
                        <Badge variant={statusMeta.variant}>
                          {statusMeta.label}
                        </Badge>
                        {mentorship.role === "mentor" ? (
                          <Badge variant="ghost">You&apos;re the mentor</Badge>
                        ) : (
                          <Badge variant="ghost">Your mentor</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {mentorship.role === "mentor"
                          ? "Your mentee"
                          : "Your mentor"}{" "}
                        {mentorship.other.name.split(" ")[0]} ·{" "}
                        {mentorship.other.student?.department ??
                          mentorship.other.profile?.jobTitle ??
                          "NUB"}
                        {mentorship.other.profile?.location
                          ? ` · ${mentorship.other.profile.location}`
                          : ""}
                      </p>

                      {/* Goal progress */}
                      {mentorship.stats.goalCount > 0 && (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Target className="size-3" />
                              Goal progress
                            </span>
                            <span className="font-medium tabular-nums">
                              {mentorship.stats.completedGoalCount}/
                              {mentorship.stats.goalCount} done
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-400 transition-all"
                              style={{ width: `${goalPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {mentorship.stats.upcomingSession && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                          <CalendarDays className="size-3.5 shrink-0" />
                          Next session{" "}
                          {new Date(
                            mentorship.stats.upcomingSession.scheduledAt,
                          ).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      )}

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/60 pt-2.5">
                        <Metric
                          icon={Target}
                          value={`${mentorship.stats.completedGoalCount}/${mentorship.stats.goalCount}`}
                          label="goals"
                        />
                        <Metric
                          icon={Sparkles}
                          value={`${mentorship.stats.completedSessionCount}/${mentorship.stats.sessionCount}`}
                          label="sessions"
                        />
                        <Metric
                          icon={MessagesSquare}
                          value={mentorship._count.messages}
                          label="messages"
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1"
                      render={
                        <Link href={ROUTES.MENTORSHIP_RELATIONSHIP(mentorship.id)} />
                      }
                      nativeButton={false}
                    >
                      Open
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
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
                          if (item !== page)
                            updateParams({ page: String(item) });
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
                      if (page < totalPages)
                        updateParams({ page: String(page + 1) });
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
    </div>
  );
}

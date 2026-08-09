"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  ArrowRight,
  Compass,
  Handshake,
  Plus,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MentorCard } from "./mentor-card";
import { MentorshipNav } from "./mentorship-nav";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { listMentorsAction, createMentorshipRequestAction } from "@/actions/mentorship.actions";
import { cn } from "@/lib/utils";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { UserRole } from "@/constants/enums";
import type { Mentor, PaginationMeta } from "@/types";
import { toast } from "sonner";

const PAGE_SIZE = 12;
const MAX_GOALS = 5;

function FacetButton({
  label,
  active,
  onClick,
}: {
  label: string;
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
      {active && <X className="size-3 shrink-0" />}
    </button>
  );
}

function MentorSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-start gap-3">
            <div className="size-14 rounded-full bg-muted" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
          <div className="mt-4 h-8 w-full rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface MentorshipListClientProps {
  initialMentors: Mentor[];
  initialMeta: PaginationMeta | null;
  initialFilters: {
    department: string | null;
    topic: string | null;
    page: number;
  };
  userRole?: string;
}

export function MentorshipListClient({
  initialMentors,
  initialMeta,
  initialFilters: _initialFilters,
  userRole,
}: MentorshipListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const department = searchParams.get("department");
  const topic = searchParams.get("topic");
  const sort = searchParams.get("sort") === "name" ? "name" : "relevance";

  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [query, setQuery] = useState(topic ?? "");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestTopic, setRequestTopic] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestGoals, setRequestGoals] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);

  const hasFilters = Boolean(department || topic);
  const isStudent = userRole === UserRole.STUDENT;

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
        const result = await listMentorsAction({
          page,
          limit: PAGE_SIZE,
          department: department ?? undefined,
          topic: topic ?? undefined,
          sort,
        });
        if (!cancelled && result.success && result.data) {
          const data = result.data as {
            data?: Mentor[];
            meta?: PaginationMeta;
          };
          setMentors(data.data ?? []);
          setMeta(data.meta ?? null);
        }
      } catch {
        // Empty state handled by checking mentors.length
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [page, department, topic, sort, initialized]);

  const total = meta?.total ?? initialMentors.length;
  const totalPages = meta?.totalPages ?? 1;

  // Quick-browse topics surfaced from the currently visible mentors.
  const trendingTopics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const mentor of mentors) {
      for (const t of mentor.profile?.mentorshipTopics ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
  }, [mentors]);

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

  const submitSearch = () => {
    const trimmed = query.trim();
    updateParams({ topic: trimmed || null, page: null });
  };

  const clearAll = () => {
    setQuery("");
    updateParams({ department: null, topic: null, sort: null });
  };

  const openRequestDialog = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setRequestTopic(topic ?? "");
    setRequestMessage("");
    setRequestGoals([""]);
  };

  const updateGoal = (index: number, value: string) => {
    setRequestGoals((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addGoal = () => {
    setRequestGoals((prev) =>
      prev.length < MAX_GOALS ? [...prev, ""] : prev,
    );
  };

  const removeGoal = (index: number) => {
    setRequestGoals((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmitRequest = async () => {
    if (!selectedMentor) return;
    const goals = requestGoals.map((g) => g.trim()).filter(Boolean);
    if (goals.length === 0) {
      toast.error("Add at least one goal you'd like to work on.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createMentorshipRequestAction({
        mentorId: selectedMentor.id,
        topic: requestTopic.trim() || undefined,
        message: requestMessage.trim() || undefined,
        goals,
      });
      if (result.success) {
        toast.success("Mentorship request sent!");
        setSelectedMentor(null);
      } else {
        toast.error(result.message || "Failed to send request.");
      }
    } catch {
      toast.error("Failed to send request.");
    } finally {
      setSubmitting(false);
    }
  };

  const sidebar = (
    <div className="space-y-4">
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={clearAll}
        >
          <X className="size-3.5" />
          Clear all filters
        </Button>
      )}

      <Card size="sm">
        <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
          <CardTitle>Filter by department</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-2 pb-3 sm:px-2">
          {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
            <FacetButton
              key={value}
              label={label}
              active={department === value}
              onClick={() =>
                updateParams({ department: department === value ? null : value })
              }
            />
          ))}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
          <CardTitle>Browse by topic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-2 pb-3 sm:px-2">
          {trendingTopics.length > 0 ? (
            trendingTopics.map((t) => (
              <FacetButton
                key={t}
                label={t}
                active={topic === t}
                onClick={() => {
                  setQuery(topic === t ? "" : t);
                  updateParams({ topic: topic === t ? null : t });
                }}
              />
            ))
          ) : (
            <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
              No topics on the current results yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 px-4 pb-4 text-xs sm:px-5 sm:pb-5">
          {[
            {
              n: 1,
              title: "Browse mentors",
              desc: "Filter by department or topic to find a good fit.",
            },
            {
              n: 2,
              title: "Send a request",
              desc: "Pick up to 5 goals you want to work on together.",
            },
            {
              n: 3,
              title: "Track progress",
              desc: "Once accepted, manage the relationship in My mentorships.",
            },
          ].map((step) => (
            <div key={step.n} className="flex gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {step.n}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {step.title}
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {isStudent && (
        <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
          <p className="text-xs font-semibold text-foreground">
            Ready to start?
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Send a request with 1–5 goals and track the relationship once a
            mentor accepts.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <PageLayout leftSidebar={sidebar} leftSidebarTitle="Filters">
      {/* ── Section navigation ────────────────────────────────── */}
      <MentorshipNav />

      {/* ── Hero band ─────────────────────────────────────────── */}
      <section className="mt-4 rounded-2xl border bg-card px-5 py-7 sm:px-8 sm:py-9">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Handshake className="size-3.5" />
            Alumni mentorship program
          </span>

          <h1 className="mt-3.5 max-w-xl text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Find a mentor who has walked your path
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Get free, 1-on-1 career guidance from NUB alumni. Tell us what you
            want to work on, and we&apos;ll match you with the mentors best
            equipped to help.
          </p>

          {/* Search */}
          <form
            className="mt-5 flex max-w-xl items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by topic — e.g. resume review, interview prep, freelancing"
                className="h-10 pl-9 pr-9"
                aria-label="Search mentors by topic"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    if (topic) updateParams({ topic: null, page: null });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" className="h-10 gap-1.5 px-4">
              <Sparkles className="size-4" />
              Find mentors
            </Button>
          </form>

          {/* Trust stats */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-foreground">
                {total}
              </span>
              mentor{total === 1 ? "" : "s"} available
            </span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span className="flex items-center gap-1.5">
              <Target className="size-3.5 text-primary" />
              Goal-based matching
            </span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span className="flex items-center gap-1.5">
              <Compass className="size-3.5 text-primary" />
              Free &amp; 1-on-1
            </span>
          </div>
        </div>
      </section>

      {/* ── Toolbar: active filters + sort ────────────────────── */}
      <div className="mt-6 flex flex-col gap-3">
        {(hasFilters || sort !== "relevance") && (
          <div className="flex flex-wrap items-center gap-1.5">
            {department && (
              <button
                type="button"
                onClick={() => updateParams({ department: null })}
                className="group inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {DEPARTMENT_LABELS[department as keyof typeof DEPARTMENT_LABELS] ?? department}
                <X className="size-3 group-hover:opacity-80" />
              </button>
            )}
            {topic && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  updateParams({ topic: null });
                }}
                className="group inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {topic}
                <X className="size-3 group-hover:opacity-80" />
              </button>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {loading ? (
              "Searching mentors..."
            ) : (
              <>
                <span className="font-semibold text-foreground">{total}</span>{" "}
                mentor{total === 1 ? "" : "s"}
                {topic ? <> matching &quot;{topic}&quot;</> : null}
                {department ? <> in{" "}{DEPARTMENT_LABELS[department as keyof typeof DEPARTMENT_LABELS]}</> : null}
              </>
            )}
          </p>

          <div
            role="group"
            aria-label="Sort mentors"
            className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5"
          >
            {(["relevance", "name"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  updateParams({
                    sort: sort === option ? null : option,
                  })
                }
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  sort === option
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option === "relevance" ? "Best match" : "Name"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick-browse topic chips ──────────────────────────── */}
      {trendingTopics.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3" />
            Popular topics
          </span>
          {trendingTopics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setQuery(t);
                updateParams({ topic: topic === t ? null : t });
              }}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                topic === t
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* ── Mentor grid ───────────────────────────────────────── */}
      {loading ? (
        <MentorSkeleton />
      ) : mentors.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-6" />
            </EmptyMedia>
            <EmptyTitle>
              {hasFilters ? "No mentors match your filters" : "No mentors yet"}
            </EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>
            {hasFilters
              ? "Try clearing a filter or adjusting your search."
              : "Alumni who opt in as mentors will appear here."}
          </EmptyDescription>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={clearAll}
            >
              Clear filters
            </Button>
          )}
        </Empty>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onRequest={isStudent ? openRequestDialog : () => {}}
                canRequest={isStudent}
              />
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

      {/* ── Request dialog ─────────────────────────────────────── */}
      <Dialog open={selectedMentor !== null} onOpenChange={(open) => { if (!open) setSelectedMentor(null); }}>
        <DialogContent>
          {selectedMentor && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="relative shrink-0">
                    <Avatar
                      id={selectedMentor.id}
                      name={selectedMentor.name}
                      src={selectedMentor.image}
                      className="size-11"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background bg-amber-400" />
                  </span>
                  <div className="min-w-0">
                    <DialogTitle className="text-base">
                      Request mentorship from {selectedMentor.name}
                    </DialogTitle>
                    <DialogDescription className="truncate">
                      {selectedMentor.profile?.jobTitle
                        ? `${selectedMentor.profile.jobTitle}${selectedMentor.profile.currentEmployer ? ` at ${selectedMentor.profile.currentEmployer}` : ""}`
                        : "NUB alumnus"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mentor-topic">Topic (optional)</Label>
                  <Input
                    id="mentor-topic"
                    value={requestTopic}
                    onChange={(e) => setRequestTopic(e.target.value)}
                    placeholder="e.g. Career guidance, resume review, interview prep"
                    maxLength={100}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      What do you want to work on?{" "}
                      <span className="text-[11px] text-muted-foreground">
                        (1-{MAX_GOALS})
                      </span>
                    </Label>
                    {requestGoals.filter((g) => g.trim()).length < MAX_GOALS && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-2 text-xs"
                        onClick={addGoal}
                        disabled={submitting}
                      >
                        <Plus className="size-3" />
                        Add goal
                      </Button>
                    )}
                  </div>
                  {requestGoals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <Input
                        value={goal}
                        onChange={(e) => updateGoal(index, e.target.value)}
                        placeholder={`Goal ${index + 1} — e.g. "Land a software internship"`}
                        maxLength={200}
                        disabled={submitting}
                      />
                      {requestGoals.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeGoal(index)}
                          disabled={submitting}
                          aria-label="Remove goal"
                        >
                          <X className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Mentors accept requests that align with their expertise —
                    clear goals make it easier to match you.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mentor-message">Message (optional)</Label>
                  <Textarea
                    id="mentor-message"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Introduce yourself and what you'd like to learn..."
                    rows={4}
                    maxLength={1000}
                    disabled={submitting}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMentor(null)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitRequest} disabled={submitting} className="gap-1.5">
                  {submitting ? "Sending..." : "Send request"}
                  {!submitting && <ArrowRight className="size-4" />}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

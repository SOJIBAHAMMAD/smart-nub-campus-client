"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Bookmark, MessageCircle, SearchX, Plus, LayoutGrid, List, Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layout/page-layout";
import { ModuleLayout } from "@/components/layout/module-layout";
import {
  QASidebar,
  type QATab,
} from "@/components/qa/qa-sidebar";
import { QATrending, type TopContributor } from "@/components/qa/qa-trending";
import { QuestionCard } from "@/components/qa/question-card";
import {
  QuestionFilters,
  type QASortOption,
} from "@/components/qa/question-filters";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  listQuestions,
  voteQuestion,
  bookmarkQuestion,
  listBookmarkedQuestions,
} from "@/actions/qa.actions";
import type { Question, QuestionCategory } from "@/types/qa.types";
import type { PaginationMeta } from "@/types/resource.types";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface QAClientProps {
  initialQuestions: Question[];
  initialMeta: PaginationMeta | null;
  categories: (QuestionCategory & { _count: { questions: number } })[];
  trendingQuestions: Question[];
  popularTags: { id: string; name: string; slug: string }[];
  contributors: TopContributor[];
}

function QuestionCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="size-6 rounded" />
          <Skeleton className="h-4 w-6" />
          <Skeleton className="size-6 rounded" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Skeleton className="h-9 w-20 rounded-md" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-20 rounded-md" />
    </div>
  );
}

export function QAClient({
  initialQuestions,
  initialMeta,
  categories = [],
  trendingQuestions,
  popularTags,
  contributors,
}: QAClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = searchParams.get("search") ?? "";
  const categorySlug = searchParams.get("category");
  const sort = (searchParams.get("sort") as QASortOption) ?? "latest";
  const tab = (searchParams.get("tab") as QATab) ?? "all";

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => (typeof localStorage !== "undefined" ? !localStorage.getItem("qa:onboarding-dismissed") : false));
  const [viewMode, setViewMode] = useState<"detailed" | "compact">(() =>
    (typeof localStorage !== "undefined" ? localStorage.getItem("qa:viewMode") as "detailed" | "compact" : null) ?? "detailed",
  );
  const hasFetched = useRef(false);

  function dismissOnboarding() {
    localStorage.setItem("qa:onboarding-dismissed", "1");
    setShowOnboarding(false);
  }

  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  useSocketEvent(socket, "qa:newQuestion", (data) => {
    setQuestions((prev) => {
      if (prev.some((q) => q.id === data.id)) return prev;
      return [data as unknown as Question, ...prev];
    });
  });

  useSocketEvent(socket, "qa:voteUpdate", (data) => {
    if (data.entityType !== "question") return;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== data.entityId) return q;
        return { ...q, upvoteCount: data.upvoteCount };
      }),
    );
  });

  const safeCategories = categories ?? [];

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
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "bookmarked") {
        const res = await listBookmarkedQuestions(page, 12);
        if (res.success && res.data) {
          const data = res.data as {
            data?: Question[];
            questions?: Question[];
            meta?: PaginationMeta;
          };
          const list = data.data ?? data.questions ?? [];
          setQuestions(list);
          setMeta(data.meta ?? null);
        }
      } else {
        const answered =
          tab === "answered" ? "true" : tab === "unanswered" ? "false" : null;
        const res = await listQuestions({
          page,
          limit: 12,
          search: search || undefined,
          category: categorySlug || undefined,
          sort,
          answered: answered as "true" | "false" | null | undefined,
        });
        if (res.success && res.data) {
          const data = res.data as {
            data?: Question[];
            questions?: Question[];
            meta?: PaginationMeta;
          };
          setQuestions(data.data ?? data.questions ?? []);
          setMeta(data.meta ?? null);
        }
      }
    } catch {
      // Empty state handles errors
    } finally {
      setLoading(false);
    }
  }, [page, search, categorySlug, sort, tab]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      return;
    }
    void loadQuestions();
  }, [loadQuestions]);

  const handleVote = useCallback(
    async (questionId: string, type: "UP" | "DOWN") => {
      const original = questions.find((q) => q.id === questionId);
      const wasUp = original?.userVote === "UP";
      const wasDown = original?.userVote === "DOWN";
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q;
          if (type === "UP") {
            const delta = wasUp ? -1 : wasDown ? 2 : 1;
            return { ...q, userVote: wasUp ? null : "UP", upvoteCount: q.upvoteCount + delta };
          }
          const delta = wasDown ? 1 : wasUp ? -2 : -1;
          return { ...q, userVote: wasDown ? null : "DOWN", upvoteCount: q.upvoteCount + delta };
        }),
      );
      try {
        const result = await voteQuestion(questionId, type);
        if (result.success && result.data) {
          const data = result.data as { upvoteCount: number };
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId ? { ...q, upvoteCount: data.upvoteCount } : q,
            ),
          );
        } else {
          if (original) {
            setQuestions((prev) =>
              prev.map((q) =>
                q.id === questionId ? { ...q, userVote: original.userVote, upvoteCount: original.upvoteCount } : q,
              ),
            );
          } else {
            void loadQuestions();
          }
          toast.error(result.message || "Failed to record vote.");
        }
      } catch (err) {
        if (original) {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId ? { ...q, userVote: original.userVote, upvoteCount: original.upvoteCount } : q,
            ),
          );
        } else {
          void loadQuestions();
        }
        toast.error(err instanceof Error ? err.message : "Failed to record vote.");
      }
    },
    [loadQuestions, questions],
  );

  const handleBookmark = useCallback(
    async (questionId: string, currentBookmarked: boolean) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, isBookmarked: !currentBookmarked } : q,
        ),
      );
      try {
        const result = await bookmarkQuestion(questionId);
        if (!result.success) {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId ? { ...q, isBookmarked: currentBookmarked } : q,
            ),
          );
          toast.error(result.message || "Failed to toggle bookmark.");
        }
      } catch (err) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId ? { ...q, isBookmarked: currentBookmarked } : q,
          ),
        );
        toast.error(err instanceof Error ? err.message : "Failed to toggle bookmark.");
      }
    },
    [],
  );

  const activeFilterCount = [search, categorySlug].filter(Boolean).length;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "a") {
        e.preventDefault();
        router.push("/qa/ask");
      } else if (e.key === "s") {
        e.preventDefault();
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  function renderPagination() {
    if (!meta || meta.totalPages <= 1) return null;
    const current = meta.page;
    const total = meta.totalPages;

    return (
      <Pagination className="pt-4">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              disabled={current <= 1}
              onClick={() => updateParams({ page: String(current - 1) })}
            >
              Previous
            </Button>
          </PaginationItem>

          {Array.from({ length: total }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === total || Math.abs(p - current) <= 1)
            .map((p, idx, arr) => (
              <PaginationItem key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <PaginationEllipsis />
                )}
                <Button
                  variant={p === current ? "default" : "outline"}
                  size="sm"
                  className="min-w-9"
                  onClick={() => updateParams({ page: String(p) })}
                >
                  {p}
                </Button>
              </PaginationItem>
            ))}

          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= total}
              onClick={() => updateParams({ page: String(current + 1) })}
            >
              Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }

  function renderEmptyState() {
    const isFiltered = activeFilterCount > 0 || tab !== "all";

    if (tab === "bookmarked") {
      return (
        <Empty>
          <EmptyMedia variant="icon">
            <Bookmark className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No bookmarked questions</EmptyTitle>
            <EmptyDescription>
              Bookmark questions you find useful to find them later.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }

    if (isFiltered) {
      return (
        <Empty>
          <EmptyMedia variant="icon">
            <SearchX className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search or filters, or ask a new question.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams();
                router.push(`${pathname}?${params.toString()}`);
              }}
            >
              Clear all filters
            </Button>
          </EmptyContent>
        </Empty>
      );
    }

    return (
      <Empty>
        <EmptyMedia variant="icon">
          <MessageCircle className="size-6" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No questions yet</EmptyTitle>
          <EmptyDescription>
            Be the first to ask a question and help build our knowledge base.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/qa/ask">
            <Button size="sm">
              <Plus className="size-4" />
              Ask a Question
            </Button>
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ModuleLayout
      title="Q&A"
      subtitle="Get answers from the NUB community."
      newHref="/qa/ask"
      leftSidebar={
        <QASidebar
          activeTab={tab}
          onTabChange={(t) => updateParams({ tab: t === "all" ? null : t })}
          selectedCategorySlug={categorySlug}
          onCategoryChange={(slug) => updateParams({ category: slug })}
          categories={safeCategories}
          contributors={contributors}
        />
      }
      rightSidebar={
        <QATrending
          trendingQuestions={trendingQuestions}
          popularTags={popularTags}
        />
      }
    >

        {/* ── Onboarding guide ──────────────────────────────────── */}
        {showOnboarding && (
          <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-4 pr-10">
            <button onClick={dismissOnboarding} className="absolute right-3 top-3 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground" aria-label="Dismiss">
              <X className="size-4" />
            </button>
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">Welcome to Q&A</p>
                <p className="text-muted-foreground">
                  Ask questions, vote on answers, and mark the best answer as accepted.
                  <span className="hidden sm:inline"> Use <kbd className="rounded bg-muted px-1 font-mono text-xs">a</kbd> to ask, <kbd className="rounded bg-muted px-1 font-mono text-xs">s</kbd> to share.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────── */}
        <QuestionFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          categorySlug={categorySlug}
          onCategoryChange={(slug) => updateParams({ category: slug })}
          sort={sort}
          onSortChange={(s) => updateParams({ sort: s === "latest" ? null : s })}
          categories={safeCategories}
          mobileFiltersOpen={showMobileFilters}
          onOpenMobileFilters={() => setShowMobileFilters(true)}
          onCloseMobileFilters={() => setShowMobileFilters(false)}
        />

        {/* ── Quick-filter pills ──────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => updateParams({ sort: null, tab: null })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              sort === "latest" && tab === "all"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            All
          </button>
          <button
            onClick={() => updateParams({ sort: "trending", tab: null })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              sort === "trending"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            Trending
          </button>
          <button
            onClick={() => updateParams({ sort: "unanswered", tab: null })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              sort === "unanswered"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            Unanswered
          </button>
        </div>

        {/* ── List heading ───────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {tab === "all" && "All Questions"}
            {tab === "answered" && "Answered Questions"}
            {tab === "unanswered" && "Unanswered Questions"}
            {tab === "bookmarked" && "Bookmarked Questions"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = viewMode === "detailed" ? "compact" : "detailed";
                setViewMode(next);
                localStorage.setItem("qa:viewMode", next);
              }}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={viewMode === "detailed" ? "Compact view" : "Detailed view"}
            >
              {viewMode === "detailed" ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
            </button>
            {meta && (
              <span className="text-xs text-muted-foreground">
                {meta.total} result{meta.total === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        {/* ── Question cards ──────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <QuestionCardSkeleton key={i} />
            ))}
          </div>
        ) : questions.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onVote={handleVote}
                onBookmark={handleBookmark}
                compact={viewMode === "compact"}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────── */}
        {loading ? (
          <PaginationSkeleton />
        ) : (
          renderPagination()
        )}
    </ModuleLayout>
  );
}
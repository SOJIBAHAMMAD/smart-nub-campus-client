"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
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
    <div className="animate-pulse rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex gap-3">
        <div className="size-12 shrink-0 rounded-lg bg-muted" />
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

/**
 * Interactive Q&A list page.
 * Uses PageLayout with QASidebar (left) and QATrending (right).
 * Supports tabs (All / Answered / Unanswered / Bookmarked), search,
 * category + tag filters, sort tabs, voting, bookmarks, and pagination.
 */
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
  const tagSlug = searchParams.get("tag");
  const sort = (searchParams.get("sort") as QASortOption) ?? "latest";
  const tab = (searchParams.get("tab") as QATab) ?? "all";

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const hasFetched = useRef(false);

  // ── Socket.IO for real-time Q&A updates ─────────────────────────────────
  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  // When someone posts a new question, prepend to list
  useSocketEvent(socket, "qa:newQuestion", (data) => {
    setQuestions((prev) => {
      // Avoid duplicates
      if (prev.some((q) => q.id === data.id)) return prev;
      return [data as unknown as Question, ...prev];
    });
  });

  // When vote counts change, update the relevant question
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

  // Debounced search → update URL
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
        // Map the client tab onto the server `answered` flag.
        const answered =
          tab === "answered" ? "true" : tab === "unanswered" ? "false" : null;
        const res = await listQuestions({
          page,
          limit: 12,
          search: search || undefined,
          category: categorySlug || undefined,
          tag: tagSlug || undefined,
          sort,
          answered: answered as ListAnsweredParam,
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
  }, [page, search, categorySlug, tagSlug, sort, tab]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      return;
    }
    void loadQuestions();
  }, [loadQuestions]);

  // ── Optimistic vote toggle ─────────────────────────────────────
  const handleVote = useCallback(
    async (questionId: string, currentVote: Question["userVote"]) => {
      const wasUp = currentVote === "UP";
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q;
          if (wasUp) {
            return {
              ...q,
              userVote: null,
              upvoteCount: q.upvoteCount - 1,
            };
          }
          // Switching from DOWN→UP or adding UP both net +1 / +2.
          const delta = q.userVote === "DOWN" ? 2 : 1;
          return {
            ...q,
            userVote: "UP",
            upvoteCount: q.upvoteCount + delta,
          };
        }),
      );
      try {
        const result = await voteQuestion(questionId, "UP");
        if (result.success && result.data) {
          const data = result.data as { upvoteCount: number };
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId ? { ...q, upvoteCount: data.upvoteCount } : q,
            ),
          );
        } else {
          void loadQuestions();
          toast.error(result.message || "Failed to record vote.");
        }
      } catch (err) {
        void loadQuestions();
        toast.error(err instanceof Error ? err.message : "Failed to record vote.");
      }
    },
    [loadQuestions],
  );

  // ── Optimistic bookmark toggle ─────────────────────────────────
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

  const activeFilters = search || categorySlug || tagSlug;

  return (
    <PageLayout
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
          contributors={contributors}
        />
      }
    >
      <div className="space-y-4">
        {/* ── Page Header ─────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Q&A</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Get answers from the NUB community.
          </p>
        </div>

        {/* ── Filters ─────────────────────────────────────────── */}
        <QuestionFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          categorySlug={categorySlug}
          onCategoryChange={(slug) => updateParams({ category: slug })}
          selectedTags={tagSlug ? tagSlug.split(",").filter(Boolean) : []}
          onTagsChange={(slugs) => updateParams({ tag: slugs.length ? slugs.join(",") : null })}
          sort={sort}
          onSortChange={(s) => updateParams({ sort: s === "latest" ? null : s })}
          categories={safeCategories}
          tags={popularTags}
          showMobileFilters={showMobileFilters}
          onToggleMobileFilters={() => setShowMobileFilters((v) => !v)}
        />

        {/* ── Active filters ─────────────────────────────────── */}
        {activeFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {search && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                Search: &ldquo;{search}&rdquo;
              </span>
            )}
            {categorySlug && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                Category: {categories?.find((c) => c.slug === categorySlug)?.name ?? categorySlug}
              </span>
            )}
            {tagSlug && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                Tag: {popularTags.find((t) => t.slug === tagSlug)?.name ?? tagSlug}
              </span>
            )}
          </div>
        )}

        {/* ── List heading ───────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {tab === "all" && "All Questions"}
            {tab === "answered" && "Answered Questions"}
            {tab === "unanswered" && "Unanswered Questions"}
            {tab === "bookmarked" && "Bookmarked Questions"}
          </h2>
          {meta && (
            <span className="text-xs text-muted-foreground">
              {meta.total} result{meta.total === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {/* ── Question cards ──────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <QuestionCardSkeleton key={i} />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center ring-1 ring-foreground/10">
            <AlertCircle className="mx-auto size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">No questions found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or filters, or ask a new question.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onVote={handleVote}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────── */}
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
            <span className="text-sm text-muted-foreground">
              Page {page} of {meta.totalPages}
            </span>
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

type ListAnsweredParam = "true" | "false" | null | undefined;

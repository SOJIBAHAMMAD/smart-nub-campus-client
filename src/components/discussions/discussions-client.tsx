"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AlertCircle, X } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import {
  DiscussionsSidebar,
  type DiscussionTab,
} from "@/components/discussions/discussions-sidebar";
import { DiscussionsTrending } from "@/components/discussions/discussions-trending";
import { DiscussionCard } from "@/components/discussions/discussion-card";
import { DiscussionFilters, type SortOption } from "@/components/discussions/discussion-filters";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  listDiscussions,
  voteDiscussion,
  bookmarkDiscussion,
  listBookmarks,
  myDiscussions,
  myReplies,
} from "@/actions/discussion.actions";
import type {
  Discussion,
  DiscussionCategory,
} from "@/types/discussion.types";
import type { PaginationMeta } from "@/types/resource.types";
import type { TopContributor } from "@/components/discussions/discussions-trending";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";

interface DiscussionsClientProps {
  initialDiscussions: Discussion[];
  initialMeta: PaginationMeta | null;
  categories: (DiscussionCategory & { _count: { discussions: number } })[];
  trendingDiscussions: Discussion[];
  popularTags: { id: string; name: string; slug: string }[];
  contributors: TopContributor[];
}

function DiscussionCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start gap-3">
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
 * Interactive Discussions list page.
 * Uses PageLayout with DiscussionsSidebar (left) and DiscussionsTrending (right).
 * Supports tabs (All / My Discussions / Bookmarks / My Replies), search,
 * category + tag filters, sort tabs, voting, bookmarks, and pagination.
 */
export function DiscussionsClient({
  initialDiscussions,
  initialMeta,
  categories = [],
  trendingDiscussions,
  popularTags,
  contributors,
}: DiscussionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = searchParams.get("search") ?? "";
  const categorySlug = searchParams.get("category");
  const tagSlug = searchParams.get("tag");
  const sort = (searchParams.get("sort") as SortOption) ?? "latest";
  const tab = (searchParams.get("tab") as DiscussionTab) ?? "all";

  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const hasFetched = useRef(false);

  // ── Socket.IO for real-time discussion updates ──────────────────────────
  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  // When someone replies to a discussion, update the reply count
  useSocketEvent(socket, "discussion:reply", (data) => {
    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id !== data.discussionId) return d;
        return {
          ...d,
          replyCount: (d.replyCount ?? 0) + 1,
        };
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

  // Fetch when URL params change (skip the first render — data comes from server)
  const loadDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "all") {
        const res = await listDiscussions({
          page,
          limit: 12,
          search: search || undefined,
          category: categorySlug || undefined,
          tag: tagSlug || undefined,
          sort,
        });
        if (res.success && res.data) {
          const data = res.data as {
            discussions?: Discussion[];
            data?: Discussion[];
            meta?: PaginationMeta;
          };
          setDiscussions(data.discussions ?? data.data ?? []);
          setMeta(data.meta ?? null);
        }
      } else if (tab === "bookmarks") {
        const res = await listBookmarks();
        if (res.success && res.data) {
          const data = res.data as
            | Discussion[]
            | { discussions?: Discussion[]; data?: Discussion[] };
          const list = Array.isArray(data)
            ? data
            : (data.discussions ?? data.data ?? []);
          setDiscussions(list);
          setMeta(null);
        }
      } else {
        // mine / replies via dedicated server actions
        const res =
          tab === "mine"
            ? await myDiscussions(page, 12)
            : await myReplies(page, 12);
        if (res.success && res.data) {
          const data = res.data as {
            discussions?: Discussion[];
            data?: Discussion[];
            meta?: PaginationMeta;
          };
          setDiscussions(data.discussions ?? data.data ?? []);
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
    void loadDiscussions();
  }, [loadDiscussions]);

  // ── Optimistic vote toggle ─────────────────────────────────────
  const handleVote = useCallback(
    async (discussionId: string, currentVote: Discussion["userVote"]) => {
      const original = discussions.find((d) => d.id === discussionId);
      const wasUp = currentVote === "UP";
      setDiscussions((prev) =>
        prev.map((d) => {
          if (d.id !== discussionId) return d;
          return {
            ...d,
            userVote: wasUp ? null : "UP",
            upvoteCount: d.upvoteCount + (wasUp ? -1 : 1),
          };
        }),
      );
      try {
        const result = await voteDiscussion(discussionId, "UP");
        if (result.success && result.data) {
          const data = result.data as { upvoteCount: number };
          setDiscussions((prev) =>
            prev.map((d) =>
              d.id === discussionId ? { ...d, upvoteCount: data.upvoteCount } : d,
            ),
          );
        } else {
          if (original) {
            setDiscussions((prev) =>
              prev.map((d) =>
                d.id === discussionId
                  ? { ...d, userVote: original.userVote, upvoteCount: original.upvoteCount }
                  : d,
              ),
            );
          }
          toast.error(result.message || "Failed to record vote.");
        }
      } catch (err) {
        if (original) {
          setDiscussions((prev) =>
            prev.map((d) =>
              d.id === discussionId
                ? { ...d, userVote: original.userVote, upvoteCount: original.upvoteCount }
                : d,
            ),
          );
        }
        toast.error(err instanceof Error ? err.message : "Failed to record vote.");
      }
    },
    [discussions],
  );

  // ── Optimistic bookmark toggle ─────────────────────────────────
  const handleBookmark = useCallback(
    async (discussionId: string, currentBookmarked: boolean) => {
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId ? { ...d, isBookmarked: !currentBookmarked } : d,
        ),
      );
      try {
        const result = await bookmarkDiscussion(discussionId);
        if (!result.success) {
          setDiscussions((prev) =>
            prev.map((d) =>
              d.id === discussionId ? { ...d, isBookmarked: currentBookmarked } : d,
            ),
          );
          toast.error(result.message || "Failed to toggle bookmark.");
        }
      } catch (err) {
        setDiscussions((prev) =>
          prev.map((d) =>
            d.id === discussionId ? { ...d, isBookmarked: currentBookmarked } : d,
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
        <DiscussionsSidebar
          activeTab={tab}
          onTabChange={(t) => updateParams({ tab: t === "all" ? null : t })}
          selectedCategorySlug={categorySlug}
          onCategoryChange={(slug) => updateParams({ category: slug })}
          selectedTags={tagSlug ? tagSlug.split(",").filter(Boolean) : []}
          onTagsChange={(slugs) => updateParams({ tag: slugs.length ? slugs.join(",") : null })}
          categories={safeCategories}
          tags={popularTags}
        />
      }
      rightSidebar={
        <DiscussionsTrending
          trendingDiscussions={trendingDiscussions}
          popularTags={popularTags}
          contributors={contributors}
        />
      }
    >
      <div className="space-y-4">
        {/* ── Page Header ───────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discussions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join the conversation with fellow students.
          </p>
        </div>

        {/* ── Filters ──────────────────────────────────────────── */}
        <DiscussionFilters
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

        {/* ── Active filters ───────────────────────────────────── */}
        {activeFilters && (
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
                Category: {categories?.find((c) => c.slug === categorySlug)?.name ?? categorySlug}
                <button onClick={() => updateParams({ category: null })}>
                  <X className="size-3" />
                </button>
              </span>
            )}
            {tagSlug && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                Tag: {popularTags.find((t) => t.slug === tagSlug)?.name ?? tagSlug}
                <button onClick={() => updateParams({ tag: null })}>
                  <X className="size-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* ── List heading ─────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {tab === "all" && "All Discussions"}
            {tab === "mine" && "My Discussions"}
            {tab === "bookmarks" && "Bookmarked Discussions"}
            {tab === "replies" && "Discussions I Replied To"}
          </h2>
          {meta && (
            <span className="text-xs text-muted-foreground">
              {meta.total} result{meta.total === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {/* ── Discussion Cards ──────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <DiscussionCardSkeleton key={i} />
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center ring-1 ring-foreground/10">
            <AlertCircle className="mx-auto size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">No discussions found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or filters, or start a new discussion.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {discussions.map((discussion) => (
              <DiscussionCard
                key={discussion.id}
                discussion={discussion}
                onVote={handleVote}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────── */}
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

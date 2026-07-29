"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Plus, X } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import {
  DiscussionsSidebar,
  type DiscussionTab,
} from "@/components/discussions/discussions-sidebar";
import { DiscussionsTrending } from "@/components/discussions/discussions-trending";
import { DiscussionCard } from "@/components/discussions/discussion-card";
import { DiscussionFilters, type SortOption } from "@/components/discussions/discussion-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  useSocketEvent(socket, "discussion:reply", (data) => {
    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id !== data.discussionId) return d;
        return { ...d, replyCount: data.replyCount };
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

  const renderPagination = () => {
    if (!meta || meta.totalPages <= 1) return null;
    const current = page;
    const total = meta.totalPages;

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

          {Array.from({ length: total }, (_, i) => i + 1)
            .filter((p) => {
              if (p === 1 || p === total) return true;
              if (Math.abs(p - current) <= 1) return true;
              return false;
            })
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
              className={current >= total ? "pointer-events-none opacity-50" : ""}
              aria-disabled={current >= total}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Discussions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join the conversation with fellow students.
            </p>
          </div>
          <Button
            render={<Link href="/discussions/create" />}
            nativeButton={false}
            size="sm"
            className="shrink-0 lg:hidden"
          >
            <Plus className="size-4" />
            New
          </Button>
        </div>

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

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <DiscussionCardSkeleton key={i} />
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                <AlertCircle className="size-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-foreground">No discussions found</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                {search || categorySlug || tagSlug
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Be the first to start a discussion and get the conversation going."}
              </p>
              {!search && !categorySlug && !tagSlug && (
                <Button render={<a href="/discussions/create" />} nativeButton={false} className="mt-4" size="sm">
                  Start a Discussion
                </Button>
              )}
            </CardContent>
          </Card>
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

        {renderPagination()}
      </div>
    </PageLayout>
  );
}

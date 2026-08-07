"use client";

import { useCallback, useState } from "react";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import type {
  ActivityFeedResult,
  ActivityItem,
  ActivityType,
} from "@/types/activity.types";
import { ActivityItemRow } from "./activity-item";
import { ActivityFeedSkeleton } from "./activity-skeleton";
import {
  ACTIVITY_FILTERS,
  ACTIVITY_TYPE_META,
  groupByTime,
} from "./activity-utils";

type FilterValue = ActivityType | "all";

const PAGE_SIZE = 20;

const EMPTY_STATES: Record<FilterValue, { title: string; description: string }> = {
  all: {
    title: "No campus activity yet",
    description:
      "When students upload resources, start discussions, ask questions, join teams, or connect, it will show up here.",
  },
  resource: {
    title: "No resource activity",
    description: "New study resources uploaded by students will appear here.",
  },
  discussion: {
    title: "No discussion activity",
    description: "New discussions and replies will appear here.",
  },
  question: {
    title: "No Q&A activity",
    description: "New questions and answers will appear here.",
  },
  team: {
    title: "No team activity",
    description: "Team requests looking for members will appear here.",
  },
  event: {
    title: "No event activity",
    description: "Newly announced campus events will appear here.",
  },
  job: {
    title: "No job activity",
    description: "Job posts shared by alumni and the careers team will appear here.",
  },
};

interface ActivityClientProps {
  initialResult?: ActivityFeedResult | null;
}

export function ActivityClient({ initialResult }: ActivityClientProps) {
  const [items, setItems] = useState<ActivityItem[]>(
    initialResult?.items ?? [],
  );
  const [hasMore, setHasMore] = useState(initialResult?.hasMore ?? false);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialResult?.nextCursor ?? null,
  );
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (
      append: boolean,
      cursor: string | null,
      filter: FilterValue,
    ) => {
      try {
        setIsLoading(true);
        setError(false);
        const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
        if (filter !== "all") {
          params.set("type", filter);
        }
        if (cursor) {
          params.set("cursor", cursor);
        }
        const result = await apiClient.get<{
          success: boolean;
          message: string;
          data: ActivityFeedResult;
        }>(`/activities?${params.toString()}`);
        const feed = result.data?.data;
        if (!feed) return;
        setItems((prev) => (append ? [...prev, ...feed.items] : feed.items));
        setHasMore(feed.hasMore);
        setNextCursor(feed.nextCursor);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleFilterChange = useCallback(
    (value: FilterValue) => {
      if (value === activeFilter) return;
      setActiveFilter(value);
      setItems([]);
      void load(false, null, value);
    },
    [activeFilter, load],
  );

  const handleLoadMore = useCallback(() => {
    void load(true, nextCursor, activeFilter);
  }, [load, nextCursor, activeFilter]);

  const handleRefresh = useCallback(() => {
    void load(false, null, activeFilter);
  }, [load, activeFilter]);

  const groups = groupByTime(items);
  const emptyState = EMPTY_STATES[activeFilter];
  const EmptyIcon =
    activeFilter === "all"
      ? Activity
      : ACTIVITY_TYPE_META[activeFilter].icon;
  const showInitialLoading = isLoading && items.length === 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Campus Activity
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A live feed of what&apos;s happening at NUB
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1">
        {ACTIVITY_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const active = activeFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleFilterChange(filter.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-pressed={active}
            >
              <Icon className="size-3.5" />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      <div className="mt-4">
        {showInitialLoading ? (
          <ActivityFeedSkeleton />
        ) : error && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <RefreshCw className="size-7 text-destructive" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">
              Couldn&apos;t load activity
            </h3>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground leading-relaxed">
              Something went wrong while fetching the feed.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
              onClick={handleRefresh}
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted/80">
              <EmptyIcon className="size-7 text-muted-foreground/50" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">
              {emptyState.title}
            </h3>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground leading-relaxed">
              {emptyState.description}
            </p>
          </div>
        ) : (
          <div>
            {groups.map((group, groupIdx) => (
              <div key={group.label} className={groupIdx > 0 ? "mt-6" : ""}>
                <div className="flex items-center gap-2 px-1 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {group.items.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <ActivityItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}

            {error && items.length > 0 && (
              <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                Failed to load more activity. Please try again.
              </p>
            )}

            {hasMore && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}

            {!hasMore && (
              <div className="pt-6 text-center text-xs text-muted-foreground">
                You&apos;re all caught up
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

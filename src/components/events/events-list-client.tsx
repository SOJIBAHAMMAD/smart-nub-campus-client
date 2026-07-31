"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CalendarX2,
  Loader2,
  Search,
  Sparkles,
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
import { EventCard } from "./event-card";
import { FeaturedEventCard } from "./featured-event-card";
import { toggleRsvpEvent } from "@/actions/event.actions";
import { toast } from "sonner";
import type { Event, EventStatus } from "@/types/event.types";
import type { PaginationMeta } from "@/types/resource.types";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { useDebounce } from "@/hooks/use-debounce";
import { env } from "@/env";

const STATUS_TABS: {
  value: string;
  label: string;
  status: EventStatus | null;
}[] = [
  { value: "all", label: "All", status: null },
  { value: "UPCOMING", label: "Upcoming", status: "UPCOMING" },
  { value: "ONGOING", label: "Ongoing", status: "ONGOING" },
  { value: "COMPLETED", label: "Completed", status: "COMPLETED" },
  { value: "CANCELLED", label: "Cancelled", status: "CANCELLED" },
];

interface EventsListClientProps {
  initialEvents: Event[];
  initialMeta: PaginationMeta | null;
  initialFilters: {
    search: string;
    status: string | null;
    page: number;
  };
}

export function EventsListClient({
  initialEvents,
  initialMeta,
  initialFilters,
}: EventsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const searchParam = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status");

  const [search, setSearch] = useState(initialFilters.search);
  const [events, setEvents] = useState<Event[]>(initialEvents);

  // Keep local state in sync when the server re-renders with new filters.
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Keep the input in sync with the URL (back/forward, filter resets).
  useEffect(() => {
    setSearch(initialFilters.search);
  }, [initialFilters.search]);

  // ── Socket.IO for real-time event updates ───────────────────────────────
  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  // When someone creates a new event, prepend to list
  useSocketEvent(socket, "event:new", (data) => {
    setEvents((prev) => {
      // Avoid duplicates
      if (prev.some((e) => e.id === data.id)) return prev;
      return [data as unknown as Event, ...prev];
    });
  });

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
      router.push(`/events?${params.toString()}`);
    });
  };

  // Debounced auto-search: the URL only updates after the user pauses typing.
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (debouncedSearch === searchParam) return;
    updateParams({ search: debouncedSearch || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, searchParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: search || null });
  };

  const clearSearch = () => {
    setSearch("");
    updateParams({ search: null });
  };

  const clearFilters = () => {
    setSearch("");
    updateParams({ search: null, status: null });
  };

  const handleRsvp = async (eventId: string) => {
    const original = events.find((e) => e.id === eventId);
    const wasRsvpd = original?.isRsvpd ?? false;

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              isRsvpd: !wasRsvpd,
              _count: {
                rsvps: e._count.rsvps + (wasRsvpd ? -1 : 1),
              },
            }
          : e,
      ),
    );

    try {
      const result = await toggleRsvpEvent(eventId);
      if (!result.success) {
        if (original) {
          setEvents((prev) =>
            prev.map((e) => (e.id === eventId ? original : e)),
          );
        }
        toast.error(result.message || "Couldn't update your status.");
        return;
      }
      const data = result.data as { action?: "added" | "removed" } | undefined;
      toast.success(
        data?.action === "added" ? "You're going!" : "You're not going.",
      );
    } catch (err) {
      if (original) {
        setEvents((prev) => prev.map((e) => (e.id === eventId ? original : e)));
      }
      toast.error(
        err instanceof Error ? err.message : "Couldn't update your status.",
      );
    }
  };

  const meta = initialMeta;
  const total = meta?.total ?? initialEvents.length;
  const hasFilters = Boolean(searchParam) || Boolean(statusParam);

  // Featured events surface in a spotlight above the grid; the grid shows
  // everything else so featured events are not duplicated.
  const featuredEvents = events.filter((e) => e.isFeatured);
  const regularEvents = events.filter((e) => !e.isFeatured);

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
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Events
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Workshops, seminars and campus life at NUB.
            </p>
          </div>
          {meta && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {total.toLocaleString()} event{total === 1 ? "" : "s"}
            </span>
          )}
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
              aria-label="Filter events by status"
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
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9"
                aria-label="Search events"
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

        {/* ── Events grid ─────────────────────────────────────────── */}
        {events.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyMedia variant="icon">
              <CalendarX2 className="size-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>
                {hasFilters ? "No events match your filters" : "No events yet"}
              </EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "Try adjusting your search or switching to another status."
                  : "Check back soon — new campus events will appear here."}
              </EmptyDescription>
            </EmptyHeader>
            {hasFilters && (
              <EmptyContent>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </EmptyContent>
            )}
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
            <div className="space-y-8">
              {featuredEvents.length > 0 && (
                <section
                  aria-labelledby="featured-events-heading"
                  className="space-y-4"
                >
                  <h2
                    id="featured-events-heading"
                    className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    <Sparkles
                      className="size-4 text-amber-500"
                      aria-hidden="true"
                    />
                    Featured events
                  </h2>
                  <div className="grid gap-5 md:grid-cols-2">
                    {featuredEvents.map((event) => (
                      <FeaturedEventCard
                        key={event.id}
                        event={event}
                        onRsvp={handleRsvp}
                      />
                    ))}
                  </div>
                </section>
              )}

              {regularEvents.length > 0 && (
                <section aria-label="All events" className="space-y-4">
                  {featuredEvents.length > 0 && (
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      All events
                    </h2>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {regularEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onRsvp={handleRsvp}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {renderPagination()}
      </div>
    </PageLayout>
  );
}

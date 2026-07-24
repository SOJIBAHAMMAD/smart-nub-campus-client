"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLayout } from "@/components/layout/page-layout";
import type { Event, EventStatus } from "@/types/event.types";
import type { PaginationMeta } from "@/types/resource.types";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusBadge(status: EventStatus) {
  switch (status) {
    case "UPCOMING":
      return <Badge variant="outline" className="border-blue-300 text-blue-700">Upcoming</Badge>;
    case "ONGOING":
      return <Badge variant="outline" className="border-green-300 text-green-700">Ongoing</Badge>;
    case "COMPLETED":
      return <Badge variant="secondary">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="outline" className="border-red-300 text-red-700">Cancelled</Badge>;
    default:
      return null;
  }
}

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
  const [search, setSearch] = useState(initialFilters.search);
  const [events, setEvents] = useState<Event[]>(initialEvents);

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

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    if (initialFilters.search) params.set("search", initialFilters.search);
    if (initialFilters.status) params.set("status", initialFilters.status);
    if (initialFilters.page > 1) params.set("page", String(initialFilters.page));

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/events?${params.toString()}`);
  };

  const handleSearch = () => {
    updateParams("search", search || null);
  };

  const meta = initialMeta;

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground">
            Browse upcoming campus events at North South University
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Select
            value={initialFilters.status ?? "all"}
            onValueChange={(val) => updateParams("status", val === "all" ? null : val)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center ring-1 ring-foreground/10">
            <CalendarDays className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No events found.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group rounded-xl border bg-card p-4 ring-1 ring-foreground/10 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary line-clamp-1">
                    {event.title}
                  </h3>
                  {event.isFeatured && (
                    <Badge variant="secondary" className="ml-2 shrink-0 bg-amber-100 text-amber-700">
                      Featured
                    </Badge>
                  )}
                </div>

                {event.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {formatDate(event.eventDate)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    {event._count.rsvps} RSVP{event._count.rsvps !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {getStatusBadge(event.status)}
                  {event.isRsvpd && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Going</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(meta.page - 1) * meta.limit + 1}–
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParams("page", String(Math.max(1, meta.page - 1)))}
                disabled={meta.page === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParams("page", String(Math.min(meta.totalPages, meta.page + 1)))}
                disabled={meta.page === meta.totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

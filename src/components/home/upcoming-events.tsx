import Link from "next/link";
import { CalendarDays, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Event } from "@/types/event.types";

interface UpcomingEventsProps {
  events: Event[];
  error?: boolean;
}

/** Format a date string to a readable short format. */
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Upcoming events section — renders next upcoming events (server-fetched). */
export function UpcomingEvents({ events, error }: UpcomingEventsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Upcoming Events
        </h2>
        <Link
          href="/events"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      {/* ── Error state ───────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Failed to load upcoming events.</span>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!error && events.length === 0 && (
        <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          No upcoming events.
        </p>
      )}

      {/* ── Event cards ───────────────────────────────────────────── */}
      {!error && events.length > 0 && (
        <div className="space-y-2">
          {events.map((event) => (
            <Card key={event.id} interactive>
              <Link href={`/events/${event.id}`} className="contents">
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarDays className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-foreground">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.eventDate)}
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

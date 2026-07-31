import Link from "next/link";
import { CalendarDays, MapPin, AlertTriangle, Users } from "lucide-react";
import type { Event } from "@/types/event.types";

interface UpcomingEventsProps {
  events: Event[];
  error?: boolean;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }),
    day: date.getDate(),
    full: date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function UpcomingEvents({ events, error }: UpcomingEventsProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Failed to load upcoming events.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Upcoming Events
        </h2>
        <Link
          href="/events"
          className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all &rarr;
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/50 p-8 text-center">
          <CalendarDays className="mx-auto size-6 text-muted-foreground/30" />
          <p className="mt-2 text-xs text-muted-foreground">
            No upcoming events.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const { month, day, full, time } = formatDate(event.eventDate);
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group flex items-start gap-3 rounded-lg border border-border/40 bg-card p-3 transition-all duration-200 hover:border-primary/20 hover:bg-muted/30"
              >
                <div className="flex w-10 shrink-0 flex-col items-center rounded-md border border-border/50 bg-muted/50 py-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {month}
                  </span>
                  <span className="text-sm font-bold leading-tight text-foreground">
                    {day}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    {event.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {full} &middot; {time}
                  </p>
                  {event.location && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      <MapPin className="size-2.5" />
                      {event.location}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users className="size-2.5" />
                    {event._count?.rsvps ?? 0} attending
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

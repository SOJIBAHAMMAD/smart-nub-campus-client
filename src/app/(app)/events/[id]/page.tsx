"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Users, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEvent, toggleRsvpEvent } from "@/actions/event.actions";
import { toast } from "sonner";
import type { Event } from "@/types/event.types";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function EventDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-48 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvent() {
      try {
        const result = await getEvent(eventId);
        if (!cancelled) {
          if (result.success && result.data) {
            const data = result.data as { data?: Event };
            setEvent(data.data ?? (result.data as Event));
          } else {
            setError(result.message || "Event not found.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load event.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEvent();
    return () => { cancelled = true; };
  }, [eventId]);

  const handleRsvp = async () => {
    if (!event || rsvpLoading) return;
    setRsvpLoading(true);
    try {
      const result = await toggleRsvpEvent(event.id);
      if (result.success) {
        const data = result.data as { action: "added" | "removed" } | undefined;
        const isAdding = data?.action === "added";
        setEvent((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isRsvpd: isAdding,
            _count: {
              rsvps: isAdding
                ? prev._count.rsvps + 1
                : Math.max(0, prev._count.rsvps - 1),
            },
          };
        });
        toast.success(isAdding ? "RSVP confirmed!" : "RSVP removed.");
      } else {
        toast.error(result.message || "Failed to update RSVP.");
      }
    } catch {
      toast.error("Failed to update RSVP.");
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
        <AlertCircle className="mx-auto size-12 text-destructive/50" />
        <p className="mt-4 text-lg font-medium text-foreground">
          {error || "Event not found."}
        </p>
        <Link
          href="/events"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Events
      </Link>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            {event.isFeatured && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">Featured</Badge>
            )}
            {event.status === "UPCOMING" && (
              <Badge variant="outline" className="border-blue-300 text-blue-700">Upcoming</Badge>
            )}
            {event.status === "ONGOING" && (
              <Badge variant="outline" className="border-green-300 text-green-700">Ongoing</Badge>
            )}
            {event.status === "COMPLETED" && (
              <Badge variant="secondary">Completed</Badge>
            )}
            {event.status === "CANCELLED" && (
              <Badge variant="outline" className="border-red-300 text-red-700">Cancelled</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 ring-1 ring-foreground/10 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          {formatDate(event.eventDate)}
        </div>

        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {event.location}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          {event._count.rsvps} RSVP{event._count.rsvps !== 1 ? "s" : ""}
        </div>

        {event.organizer && (
          <div className="text-sm text-muted-foreground">
            Organized by <span className="font-medium text-foreground">{event.organizer.name}</span>
          </div>
        )}
      </div>

      {event.description && (
        <div className="rounded-xl border bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="mb-2 text-sm font-semibold text-foreground">About this event</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      {event.status === "UPCOMING" && (
        <Button
          onClick={handleRsvp}
          disabled={rsvpLoading}
          variant={event.isRsvpd ? "outline" : "default"}
          className="w-full"
        >
          {rsvpLoading
            ? "Updating..."
            : event.isRsvpd
              ? "Cancel RSVP"
              : "RSVP to this event"}
        </Button>
      )}
    </div>
  );
}

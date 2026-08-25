"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  UserRound,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { EventImage } from "@/components/events/event-image";
import {
  EventAudienceBadge,
  EventReunionBadge,
} from "@/components/events/event-audience-badge";
import {
  formatEventDate,
  getRelativeDay,
} from "@/components/events/event-card";
import { getEvent, toggleRsvpEvent } from "@/actions/event.actions";
import { toast } from "sonner";
import type { Event } from "@/types/event.types";

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0 pt-1 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-56 w-full rounded-2xl sm:h-72" />
      <Skeleton className="h-8 w-3/4" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
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
    return () => {
      cancelled = true;
    };
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
        toast.success(isAdding ? "You're going!" : "You're not going.");
      } else {
        toast.error(result.message || "Couldn't update your status.");
      }
    } catch {
      toast.error("Couldn't update your status.");
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

  const { full, time } = formatEventDate(event.eventDate);
  const relative = getRelativeDay(event.eventDate);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Events
      </Link>

      {/* ── Hero media — always rendered, falls back to a branded gradient ── */}
      <div className="relative mt-4 overflow-hidden rounded-2xl sm:mt-6">
        <EventImage
          id={event.id}
          title={event.title}
          src={event.imageUrl}
          aspect="aspect-[16/9]"
          className="rounded-none sm:aspect-[21/9]"
          iconClassName="size-14"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          {event.isFeatured && (
            <Badge
              variant="secondary"
              className="gap-1 border-transparent bg-amber-400/95 text-amber-950 shadow-sm"
            >
              <Sparkles className="size-3" aria-hidden="true" />
              Featured
            </Badge>
          )}
          <EventStatusBadge
            status={event.status}
            withDot={false}
            className="border-transparent bg-black/45 text-white shadow-sm backdrop-blur-sm"
          />
          {event.audience !== "EVERYONE" && (
            <EventAudienceBadge
              audience={event.audience}
              className="border-transparent bg-black/45 text-white shadow-sm backdrop-blur-sm"
            />
          )}
          {event.reunionBatchYear && (
            <EventReunionBadge batchYear={event.reunionBatchYear} />
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {event.title}
          </h1>
          {relative && (
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {relative}
            </span>
          )}
        </div>
      </div>

      {/* ── Key facts ─────────────────────────────────────────────── */}
      <Card className="mt-6">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <InfoRow icon={CalendarDays}>
            <p className="font-medium text-foreground">
              {full} &middot; {time}
            </p>
          </InfoRow>
          {event.location && (
            <InfoRow icon={MapPin}>
              <p className="font-medium text-foreground">{event.location}</p>
            </InfoRow>
          )}
          <InfoRow icon={Users}>
            <p className="font-medium text-foreground">
              {event._count.rsvps.toLocaleString()}{" "}
              {event._count.rsvps === 1 ? "person going" : "people going"}
            </p>
          </InfoRow>
          {event.organizer && (
            <InfoRow icon={UserRound}>
              <div className="flex items-center gap-2">
                <Avatar
                  id={event.organizer.id}
                  name={event.organizer.name}
                  src={event.organizer.image}
                  className="size-6 text-[10px]"
                />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Organized by
                  </p>
                  <p className="font-medium text-foreground">
                    {event.organizer.name}
                  </p>
                </div>
              </div>
            </InfoRow>
          )}
        </CardContent>
      </Card>

      {/* ── About ─────────────────────────────────────────────────── */}
      {event.description && (
        <Card className="mt-6">
          <CardContent className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">
              About this event
            </h2>
            <Separator className="my-3" />
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── CTA ───────────────────────────────────────────────────── */}
      {event.status === "UPCOMING" && (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:p-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-foreground">
              {event.isRsvpd ? "You're going!" : "Don't miss out"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {event.isRsvpd
                ? "You're on the list."
                : `${event._count.rsvps.toLocaleString()} ${
                    event._count.rsvps === 1 ? "person is" : "people are"
                  } already going.`}
            </p>
          </div>
          <Button
            onClick={handleRsvp}
            disabled={rsvpLoading}
            variant={event.isRsvpd ? "outline" : "default"}
            className="w-full sm:w-auto"
          >
            {rsvpLoading
              ? "Updating..."
              : event.isRsvpd
                ? "Cancel"
                : "Going to this event"}
          </Button>
        </div>
      )}

      {event.status !== "UPCOMING" && (
        <div className="mt-6 rounded-xl border border-border/60 bg-card p-4 text-center text-sm text-muted-foreground">
          {event.status === "COMPLETED"
            ? "This event has ended."
            : event.status === "CANCELLED"
              ? "This event was cancelled."
              : "This event is happening right now."}
        </div>
      )}
    </div>
  );
}

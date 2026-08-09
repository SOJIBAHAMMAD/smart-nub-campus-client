"use client";

import Link from "next/link";
import { CalendarDays, Check, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event.types";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "./event-status-badge";
import { EventAudienceBadge, EventReunionBadge } from "./event-audience-badge";

export function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }),
    day: date.getDate(),
    full: date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function getRelativeDay(dateStr: string): string | null {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dateStr);
  const startOfTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const diff = Math.round(
    (startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000,
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  return null;
}

/** Compact "Today / Tomorrow / Jul 14 · 3:00 PM" date line. */
export function EventDateLine({ event }: { event: Event }) {
  const { month, day, time } = formatEventDate(event.eventDate);
  const relative = getRelativeDay(event.eventDate);
  return (
    <span className="truncate">
      {relative ?? `${month} ${day}`} &middot; {time}
    </span>
  );
}

/** Minimal meta: date · time, then location · X going. */
export function EventMetaRows({ event }: { event: Event }) {
  return (
    <div className="space-y-1.5 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
        <EventDateLine event={event} />
      </div>
      <div className="flex items-center gap-1.5">
        {event.location && (
          <>
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </>
        )}
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1",
            event.location && "ml-auto",
          )}
        >
          <Users className="size-3.5" aria-hidden="true" />
          {event._count.rsvps.toLocaleString()} going
        </span>
      </div>
    </div>
  );
}

/** "Going" toggle, labelled in plain language students understand. */
export function EventCardFooterActions({
  event,
  onRsvp,
  rsvpLoading,
  className,
}: {
  event: Event;
  onRsvp?: (eventId: string) => void;
  rsvpLoading?: boolean;
  className?: string;
}) {
  const isUpcoming = event.status === "UPCOMING";
  return (
    <div className={cn("flex w-full items-center justify-between gap-2", className)}>
      {isUpcoming ? (
        <Button
          size="sm"
          variant={event.isRsvpd ? "outline" : "default"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRsvp?.(event.id);
          }}
          disabled={rsvpLoading}
          className="relative z-20 shrink-0 gap-1.5"
        >
          {event.isRsvpd && <Check className="size-3.5" aria-hidden="true" />}
          Going
        </Button>
      ) : (
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {event.status === "COMPLETED"
            ? "Ended"
            : event.status === "CANCELLED"
              ? "Cancelled"
              : "Happening now"}
        </span>
      )}
    </div>
  );
}

interface EventCardProps {
  event: Event;
  onRsvp?: (eventId: string) => void;
  rsvpLoading?: boolean;
}

export function EventCard({ event, onRsvp, rsvpLoading }: EventCardProps) {
  return (
    <Card interactive className="relative flex h-full flex-col overflow-hidden">
      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={`View details for ${event.title}`}
      />

      <CardContent className="flex flex-1 flex-col gap-3 pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="min-w-0 text-[15px]">{event.title}</CardTitle>
          <EventStatusBadge
            status={event.status}
            withDot
            className="shrink-0"
          />
        </div>
        {event.reunionBatchYear ? (
          <EventReunionBadge batchYear={event.reunionBatchYear} className="w-fit" />
        ) : event.audience !== "EVERYONE" ? (
          <EventAudienceBadge audience={event.audience} className="w-fit" />
        ) : null}
        <EventMetaRows event={event} />
      </CardContent>

      {event.status === "UPCOMING" && (
        <CardFooter>
          <EventCardFooterActions
            event={event}
            onRsvp={onRsvp}
            rsvpLoading={rsvpLoading}
          />
        </CardFooter>
      )}
    </Card>
  );
}

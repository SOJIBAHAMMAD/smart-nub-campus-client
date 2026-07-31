"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Event } from "@/types/event.types";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCardFooterActions, EventMetaRows } from "./event-card";
import { EventStatusBadge } from "./event-status-badge";
import { EventAudienceBadge, EventReunionBadge } from "./event-audience-badge";

interface FeaturedEventCardProps {
  event: Event;
  onRsvp?: (eventId: string) => void;
  rsvpLoading?: boolean;
}

/**
 * Minimal spotlight card for featured events. Text-first — no media — with
 * an amber accent bar and the same scannability anchors as the grid cards.
 */
export function FeaturedEventCard({
  event,
  onRsvp,
  rsvpLoading,
}: FeaturedEventCardProps) {
  return (
    <Card interactive className="relative h-full overflow-hidden">
      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={`View details for ${event.title}`}
      />
      <div
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400 to-amber-500"
        aria-hidden="true"
      />

      <CardContent className="flex flex-1 flex-col gap-3 pb-3 pl-6 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="gap-1 border-transparent bg-amber-400/95 text-amber-950 shadow-sm"
          >
            <Sparkles className="size-3" aria-hidden="true" />
            Featured
          </Badge>
          <EventStatusBadge status={event.status} withDot />
          {event.reunionBatchYear ? (
            <EventReunionBadge batchYear={event.reunionBatchYear} />
          ) : event.audience !== "EVERYONE" ? (
            <EventAudienceBadge audience={event.audience} />
          ) : null}
        </div>

        <CardTitle className="text-lg md:text-xl">{event.title}</CardTitle>

        {event.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}

        <div className="mt-auto pt-2">
          <EventMetaRows event={event} />
        </div>
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

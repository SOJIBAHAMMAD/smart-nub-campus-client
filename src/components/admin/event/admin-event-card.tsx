"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventDateBlock } from "./event-date-block";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import {
  EventAudienceBadge,
  EventReunionBadge,
} from "@/components/events/event-audience-badge";
import ROUTES from "@/constants/routes";
import type { AdminEvent } from "@/types/admin.types";

interface AdminEventCardProps {
  event: AdminEvent;
  onDelete: (id: string) => void;
  className?: string;
}

/**
 * Card row for the admin events list: calendar date block, title, meta,
 * audience/reunion badges and row actions. Stacks on mobile, stays a
 * horizontal row on desktop.
 */
export function AdminEventCard({
  event,
  onDelete,
  className,
}: AdminEventCardProps) {
  const eventDate = new Date(event.eventDate);
  const fullDate = format(eventDate, "EEE, MMM d, yyyy");
  const time = format(eventDate, "h:mm a");

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-[var(--card-shadow)] transition-shadow hover:shadow-[var(--card-shadow-hover)] sm:flex-row sm:items-start sm:gap-5 sm:p-5",
        className,
      )}
    >
      <EventDateBlock eventDate={event.eventDate} className="sm:mt-0.5" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 truncate text-sm font-semibold text-foreground sm:text-[15px]">
            {event.title}
          </h2>
          <EventStatusBadge status={event.status} className="shrink-0" />
          {event.isFeatured && (
            <Badge
              variant="secondary"
              className="shrink-0 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
            >
              Featured
            </Badge>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
            <time dateTime={event.eventDate}>{fullDate}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            {time}
          </span>
          {event.location && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
          {event.organizer?.name && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{event.organizer.name}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" aria-hidden="true" />
            {event._count.rsvps.toLocaleString()} going
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <EventAudienceBadge audience={event.audience} />
          {event.reunionBatchYear != null && (
            <EventReunionBadge batchYear={event.reunionBatchYear} />
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-1 sm:flex-col sm:items-end sm:gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link
              href={ROUTES.EVENT(event.id)}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
          className="gap-1.5 text-muted-foreground"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          View
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete event "${event.title}"`}
          onClick={() => onDelete(event.id)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

/**
 * Event module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/event.prisma
 */

import type { PaginationMeta } from "./resource.types";
import type { UserReference } from "./common.types";

// ── Shared references ────────────────────────────────────────────────────────

export type EventOrganizer = UserReference;

// ── Core models ──────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  eventDate: string;
  location?: string | null;
  imageUrl?: string | null;
  organizerId?: string | null;
  organizer?: EventOrganizer;
  status: EventStatus;
  isFeatured: boolean;
  _count: { rsvps: number };
  isRsvpd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventRSVP {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
}

// ── Enums ────────────────────────────────────────────────────────────────────

export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

// ── API query / list types ───────────────────────────────────────────────────

export interface ListEventsParams {
  page?: number;
  limit?: number;
  status?: EventStatus;
  search?: string;
  upcoming?: boolean;
}

export interface EventListResponse {
  data: Event[];
  meta: PaginationMeta;
}

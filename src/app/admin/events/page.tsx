"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarX2, Plus } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { AdminEventCard } from "@/components/admin/event/admin-event-card";
import { CreateEventDialog } from "@/components/admin/event/create-event-dialog";
import { EventsListSkeleton } from "@/components/admin/event/events-list-skeleton";
import { EventsPagination } from "@/components/admin/event/events-pagination";
import type { AdminEvent } from "@/types/admin.types";
import { toast } from "sonner";

const PAGE_SIZE = 20;

// ── Page Component ───────────────────────────────────────────────────────────

/**
 * Admin events management page.
 * Card-based list with a calendar date block, create dialog and delete
 * confirmation. Fetching/mutations are handled via adminService and are
 * intentionally identical to the previous table implementation.
 */
export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.listEvents(page, PAGE_SIZE);
      setEvents(result.data);
      setMeta(result.meta);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteEvent(id);
      toast.success("Event deleted");
      fetchEvents();
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground">
            Create, review and remove campus events.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Create Event
        </Button>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <EventsListSkeleton />
      ) : events.length === 0 ? (
        <Empty className="border border-border/60 bg-card">
          <EmptyMedia variant="icon">
            <CalendarX2 className="size-6" aria-hidden="true" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No events yet</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first campus event. It will appear
              here and on the public events page.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Create Event
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <AdminEventCard
              key={event.id}
              event={event}
              onDelete={() => setDeleteTarget(event)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {!isLoading && events.length > 0 && (
        <EventsPagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={setPage}
        />
      )}

      {/* ── Create Dialog ───────────────────────────────────────────── */}
      <CreateEventDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={fetchEvents}
      />

      {/* ── Delete Confirm ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Event"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this event?"
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
        }}
      />
    </div>
  );
}

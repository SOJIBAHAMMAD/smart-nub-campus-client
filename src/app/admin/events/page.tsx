"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { adminService } from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ChevronLeft, ChevronRight, Trash2, Calendar, Users } from "lucide-react";
import type { AdminEvent } from "@/types/admin.types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

// ── Page Component ───────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    status: "UPCOMING" as string,
    isFeatured: false,
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.listEvents(page, 20);
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

  const handleCreate = async () => {
    if (!form.title || !form.eventDate) {
      toast.error("Title and date are required");
      return;
    }
    try {
      await adminService.createEvent({
        title: form.title,
        description: form.description || undefined,
        eventDate: new Date(form.eventDate).toISOString(),
        location: form.location || undefined,
        status: form.status as "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED",
        isFeatured: form.isFeatured,
      });
      toast.success("Event created");
      setShowCreate(false);
      setForm({ title: "", description: "", eventDate: "", location: "", status: "UPCOMING", isFeatured: false });
      fetchEvents();
    } catch {
      toast.error("Failed to create event");
    }
  };

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

  const getStatusBadge = (status: string) => {
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
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Manage platform events
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4 mr-1" /> Add Event
        </Button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden dark:bg-gray-800">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No events found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-700/50 text-left text-sm text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Organizer</th>
                  <th className="px-4 py-3 font-medium">RSVPs</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{event.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        {format(new Date(event.eventDate), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {event.location ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {event.organizer?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="size-3.5 text-muted-foreground" />
                        {event._count.rsvps}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(event.status)}</td>
                    <td className="px-4 py-3">
                      {event.isFeatured && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          Featured
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => setDeleteTarget(event.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * meta.limit + 1}–
              {Math.min(page * meta.limit, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm">
                Page {page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Event Dialog ──────────────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>Create a new event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Event title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g. Hall 101"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => setForm({ ...form, status: val ?? "UPCOMING" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.isFeatured}
                    onCheckedChange={(checked) => setForm({ ...form, isFeatured: checked === true })}
                  />
                  Featured event
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Event"
        description="Are you sure you want to delete this event?"
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
      />
    </div>
  );
}

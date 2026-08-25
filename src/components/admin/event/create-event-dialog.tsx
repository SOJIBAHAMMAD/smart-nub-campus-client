"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { EventAudience, EventStatus } from "@/types/event.types";

// ── Types ────────────────────────────────────────────────────────────────────

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful create so the parent can refetch. */
  onCreated: () => void | Promise<void>;
}

type EventFormState = {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  status: EventStatus;
  audience: EventAudience;
  reunionBatchYear: string;
  isFeatured: boolean;
};

const INITIAL_FORM: EventFormState = {
  title: "",
  description: "",
  eventDate: "",
  location: "",
  status: "UPCOMING",
  audience: "EVERYONE",
  reunionBatchYear: "",
  isFeatured: false,
};

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const AUDIENCE_OPTIONS: { value: EventAudience; label: string }[] = [
  { value: "EVERYONE", label: "Everyone" },
  { value: "STUDENTS_ONLY", label: "Students only" },
  { value: "ALUMNI_ONLY", label: "Alumni only" },
];

// ── Validation ───────────────────────────────────────────────────────────────

function validateForm(
  form: EventFormState,
): Partial<Record<keyof EventFormState, string>> {
  const errors: Partial<Record<keyof EventFormState, string>> = {};

  if (!form.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!form.eventDate) {
    errors.eventDate = "Date and time are required.";
  } else if (Number.isNaN(new Date(form.eventDate).getTime())) {
    errors.eventDate = "Enter a valid date and time.";
  }

  if (form.reunionBatchYear) {
    const year = Number(form.reunionBatchYear);
    if (!Number.isInteger(year) || year < 1990 || year > 2100) {
      errors.reunionBatchYear =
        "Batch year must be a number between 1990 and 2100.";
    }
  }

  return errors;
}

// ── Small helpers ────────────────────────────────────────────────────────────

function FieldShell({
  htmlFor,
  label,
  error,
  required = false,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-sm font-normal text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function CreateEventDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateEventDialogProps) {
  const [form, setForm] = useState<EventFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EventFormState, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isSubmitting) {
      setForm(INITIAL_FORM);
      setErrors({});
    }
    onOpenChange(nextOpen);
  };

  const updateField = <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await adminService.createEvent({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        eventDate: new Date(form.eventDate).toISOString(),
        location: form.location.trim() || undefined,
        status: form.status,
        audience: form.audience,
        reunionBatchYear: form.reunionBatchYear
          ? Number(form.reunionBatchYear)
          : null,
        isFeatured: form.isFeatured,
      });
      toast.success("Event created");
      setForm(INITIAL_FORM);
      setErrors({});
      onOpenChange(false);
      await onCreated();
    } catch {
      toast.error("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Add a new event to the campus calendar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* ── Schedule ─────────────────────────────────────────────── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Schedule
            </legend>

            <FieldShell
              htmlFor="event-date"
              label="Date &amp; time"
              required
              error={errors.eventDate}
            >
              <Input
                id="event-date"
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => updateField("eventDate", e.target.value)}
                aria-invalid={!!errors.eventDate}
                aria-describedby={
                  errors.eventDate ? "event-date-error" : undefined
                }
              />
            </FieldShell>

            <FieldShell htmlFor="event-location" label="Location">
              <Input
                id="event-location"
                placeholder="e.g. Hall 101"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </FieldShell>
          </fieldset>

          {/* ── Details ──────────────────────────────────────────────── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Details
            </legend>

            <FieldShell
              htmlFor="event-title"
              label="Title"
              required
              error={errors.title}
            >
              <Input
                id="event-title"
                placeholder="e.g. Alumni Reunion 2026"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "event-title-error" : undefined}
              />
            </FieldShell>

            <FieldShell htmlFor="event-description" label="Description">
              <Textarea
                id="event-description"
                placeholder="Optional details about the event"
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </FieldShell>
          </fieldset>

          {/* ── Audience & status ────────────────────────────────────── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Audience &amp; status
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldShell htmlFor="event-status" label="Status">
                <Select
                  value={form.status}
                  onValueChange={(val) =>
                    updateField("status", (val ?? "UPCOMING") as EventStatus)
                  }
                >
                  <SelectTrigger id="event-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>

              <FieldShell htmlFor="event-audience" label="Audience">
                <Select
                  value={form.audience}
                  onValueChange={(val) =>
                    updateField(
                      "audience",
                      (val ?? "EVERYONE") as EventAudience,
                    )
                  }
                >
                  <SelectTrigger id="event-audience" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
            </div>

            {form.audience === "ALUMNI_ONLY" && (
              <FieldShell
                htmlFor="event-batch-year"
                label="Reunion batch year"
                error={errors.reunionBatchYear}
              >
                <Input
                  id="event-batch-year"
                  type="number"
                  min={1990}
                  max={2100}
                  placeholder="e.g. 2020"
                  value={form.reunionBatchYear}
                  onChange={(e) =>
                    updateField("reunionBatchYear", e.target.value)
                  }
                  aria-invalid={!!errors.reunionBatchYear}
                  aria-describedby={
                    errors.reunionBatchYear
                      ? "event-batch-year-error"
                      : undefined
                  }
                />
              </FieldShell>
            )}
          </fieldset>

          {/* ── Options ──────────────────────────────────────────────── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Options
            </legend>

            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={form.isFeatured}
                onCheckedChange={(checked) => updateField("isFeatured", checked)}
              />
              Featured event
            </label>
          </fieldset>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-4" aria-hidden="true" />
                  Create Event
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

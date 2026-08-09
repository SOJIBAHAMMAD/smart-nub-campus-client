"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { DEPARTMENT_LIST } from "@/constants/departments";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CourseFormValues {
  code: string;
  name: string;
  department: string;
  semester?: number;
  description?: string;
}

interface CourseCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CourseFormValues) => Promise<void>;
}

type CourseFormState = {
  code: string;
  name: string;
  department: string;
  semester: string;
  description: string;
};

const INITIAL_FORM: CourseFormState = {
  code: "",
  name: "",
  department: "CSE",
  semester: "",
  description: "",
};

// ── Validation ───────────────────────────────────────────────────────────────

function validateForm(
  form: CourseFormState,
): Partial<Record<keyof CourseFormState, string>> {
  const errors: Partial<Record<keyof CourseFormState, string>> = {};

  if (!form.code.trim()) {
    errors.code = "Course code is required.";
  }

  if (!form.name.trim()) {
    errors.name = "Course name is required.";
  }

  if (form.semester) {
    const value = Number(form.semester);
    if (!Number.isInteger(value) || value < 1) {
      errors.semester = "Semester must be a positive whole number.";
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

export function CourseCreateDialog({
  open,
  onOpenChange,
  onSubmit,
}: CourseCreateDialogProps) {
  const [form, setForm] = useState<CourseFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CourseFormState, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isSubmitting) {
      setForm(INITIAL_FORM);
      setErrors({});
    }
    onOpenChange(nextOpen);
  };

  const updateField = <K extends keyof CourseFormState>(
    key: K,
    value: CourseFormState[K],
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
      await onSubmit({
        code: form.code.trim(),
        name: form.name.trim(),
        department: form.department,
        semester: form.semester ? Number(form.semester) : undefined,
        description: form.description.trim() || undefined,
      });
    } catch {
      // Parent shows the error toast and keeps the dialog open.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Course</DialogTitle>
          <DialogDescription>
            Create a new course that students can attach resources and discussions to.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Course details
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldShell
                htmlFor="course-code"
                label="Code"
                required
                error={errors.code}
              >
                <Input
                  id="course-code"
                  placeholder="e.g. CSE101"
                  autoComplete="off"
                  value={form.code}
                  onChange={(e) => updateField("code", e.target.value)}
                  aria-invalid={!!errors.code}
                  aria-describedby={errors.code ? "course-code-error" : undefined}
                />
              </FieldShell>

              <FieldShell
                htmlFor="course-name"
                label="Name"
                required
                error={errors.name}
              >
                <Input
                  id="course-name"
                  placeholder="e.g. Programming Fundamentals"
                  autoComplete="off"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "course-name-error" : undefined}
                />
              </FieldShell>

              <FieldShell htmlFor="course-department" label="Department" required>
                <Select
                  value={form.department}
                  onValueChange={(val) => updateField("department", val ?? "CSE")}
                >
                  <SelectTrigger id="course-department" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_LIST.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.shortName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>

              <FieldShell
                htmlFor="course-semester"
                label="Semester (optional)"
                error={errors.semester}
              >
                <Input
                  id="course-semester"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="e.g. 3"
                  value={form.semester}
                  onChange={(e) => updateField("semester", e.target.value)}
                  aria-invalid={!!errors.semester}
                  aria-describedby={
                    errors.semester ? "course-semester-error" : undefined
                  }
                />
              </FieldShell>
            </div>

            <FieldShell htmlFor="course-description" label="Description (optional)">
              <Textarea
                id="course-description"
                placeholder="Short description of the course…"
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </FieldShell>
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
                  Create Course
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CategoryFormValues {
  name: string;
  description?: string;
}

interface CategoryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  itemLabel: string;
  showDescription?: boolean;
}

type CategoryFormState = {
  name: string;
  description: string;
};

const INITIAL_FORM: CategoryFormState = { name: "", description: "" };

// ── Validation ───────────────────────────────────────────────────────────────

function validateForm(
  form: CategoryFormState,
): Partial<Record<keyof CategoryFormState, string>> {
  const errors: Partial<Record<keyof CategoryFormState, string>> = {};

  if (!form.name.trim()) {
    errors.name = "Category name is required.";
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

export function CategoryCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  itemLabel,
  showDescription = false,
}: CategoryCreateDialogProps) {
  const [form, setForm] = useState<CategoryFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CategoryFormState, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isSubmitting) {
      setForm(INITIAL_FORM);
      setErrors({});
    }
    onOpenChange(nextOpen);
  };

  const updateField = <K extends keyof CategoryFormState>(
    key: K,
    value: CategoryFormState[K],
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
        name: form.name.trim(),
        description: showDescription
          ? form.description.trim() || undefined
          : undefined,
      });
    } catch {
      // Parent shows the error toast and keeps the dialog open.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {itemLabel}</DialogTitle>
          <DialogDescription>
            Create a new {itemLabel.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Category details
            </legend>

            <FieldShell htmlFor="category-name" label="Name" required error={errors.name}>
              <Input
                id="category-name"
                placeholder="e.g. Web Development"
                autoComplete="off"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "category-name-error" : undefined}
              />
            </FieldShell>

            {showDescription && (
              <FieldShell htmlFor="category-description" label="Description (optional)">
                <Textarea
                  id="category-description"
                  placeholder="Short description of this category…"
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </FieldShell>
            )}
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
                  Create
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

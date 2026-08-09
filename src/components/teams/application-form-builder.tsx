"use client";

import { Plus, Trash2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  APPLICATION_FIELD_KEYS,
  APPLICATION_FIELD_META,
  type ApplicationFieldKey,
} from "@/constants/team";
import type {
  ApplicationFormConfig,
  ApplicationFormField,
  ApplicationFormQuestion,
} from "@/types/team.types";
import { cn } from "@/lib/utils";

interface ApplicationFormBuilderProps {
  value: ApplicationFormConfig;
  onChange: (value: ApplicationFormConfig) => void;
  disabled?: boolean;
}

function sortFields(fields: ApplicationFormField[]): ApplicationFormField[] {
  const order = new Map<ApplicationFieldKey, number>(
    APPLICATION_FIELD_KEYS.map((key, index) => [key, index]),
  );
  return [...fields].sort(
    (a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0),
  );
}

export function ApplicationFormBuilder({
  value,
  onChange,
  disabled,
}: ApplicationFormBuilderProps) {
  function toggleField(key: ApplicationFieldKey, checked: boolean) {
    if (checked) {
      const exists = value.fields.some((f) => f.key === key);
      if (exists) return;
      onChange({
        ...value,
        fields: sortFields([...value.fields, { key, required: false }]),
      });
    } else {
      onChange({
        ...value,
        fields: value.fields.filter((f) => f.key !== key),
      });
    }
  }

  function toggleRequired(key: ApplicationFieldKey) {
    onChange({
      ...value,
      fields: value.fields.map((f) =>
        f.key === key ? { ...f, required: !f.required } : f,
      ),
    });
  }

  function addQuestion() {
    onChange({
      ...value,
      questions: [
        ...value.questions,
        {
          id: crypto.randomUUID(),
          label: "",
          type: "SHORT_TEXT",
          required: false,
        },
      ],
    });
  }

  function updateQuestion(
    id: string,
    patch: Partial<ApplicationFormQuestion>,
  ) {
    onChange({
      ...value,
      questions: value.questions.map((q) =>
        q.id === id ? { ...q, ...patch } : q,
      ),
    });
  }

  function removeQuestion(id: string) {
    onChange({
      ...value,
      questions: value.questions.filter((q) => q.id !== id),
    });
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start gap-2">
        <ClipboardList className="mt-0.5 size-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Application Form
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Choose what you want applicants to provide. Profile fields are
            pre-filled from their profile, and custom questions let you ask for
            anything else you need.
          </p>
        </div>
      </div>

      {/* Built-in profile fields */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Profile fields</Label>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {APPLICATION_FIELD_KEYS.map((key) => {
            const meta = APPLICATION_FIELD_META[key];
            const field = value.fields.find((f) => f.key === key);
            return (
              <div
                key={key}
                className="flex items-center gap-2 rounded-md border px-2 py-1.5"
              >
                <Checkbox
                  checked={!!field}
                  onCheckedChange={(c) => toggleField(key, !!c)}
                  disabled={disabled}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {meta.label}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {meta.description ?? "Typed by the applicant"}
                  </p>
                </div>
                {field && (
                  <button
                    type="button"
                    onClick={() => toggleRequired(key)}
                    disabled={disabled}
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
                      field.required
                        ? "bg-destructive/10 text-destructive ring-1 ring-destructive/30"
                        : "bg-muted text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground",
                    )}
                  >
                    {field.required ? "Required" : "Optional"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom questions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Custom questions</Label>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={addQuestion}
            disabled={disabled || value.questions.length >= 20}
          >
            <Plus className="size-3" />
            Add question
          </Button>
        </div>

        {value.questions.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            No custom questions. Add one to ask for availability, experience,
            or anything else.
          </p>
        )}

        {value.questions.map((question) => (
          <div
            key={question.id}
            className="space-y-2 rounded-md border bg-muted/30 p-2.5"
          >
            <Input
              value={question.label}
              onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
              placeholder="e.g. How many hours per week can you commit?"
              maxLength={200}
              disabled={disabled}
            />
            <div className="flex items-center justify-between gap-2">
              <select
                value={question.type}
                onChange={(e) =>
                  updateQuestion(question.id, {
                    type: e.target.value as "SHORT_TEXT" | "PARAGRAPH",
                  })
                }
                disabled={disabled}
                className="h-8 w-auto rounded-md border bg-transparent px-2 text-xs outline-none ring-1 ring-foreground/10 focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
              >
                <option value="SHORT_TEXT">Short answer</option>
                <option value="PARAGRAPH">Paragraph</option>
              </select>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    updateQuestion(question.id, {
                      required: !question.required,
                    })
                  }
                  disabled={disabled}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
                    question.required
                      ? "bg-destructive/10 text-destructive ring-1 ring-destructive/30"
                      : "bg-muted text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground",
                  )}
                >
                  {question.required ? "Required" : "Optional"}
                </button>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  disabled={disabled}
                  aria-label="Remove question"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

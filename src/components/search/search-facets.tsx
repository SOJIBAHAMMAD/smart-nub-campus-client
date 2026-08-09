"use client";

import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchFacetOption {
  value: string;
  label: string;
}

export interface SearchFacetGroup {
  key: "department" | "categoryId" | "courseId";
  title: string;
  options: SearchFacetOption[];
}

interface SearchFacetsProps {
  groups: SearchFacetGroup[];
  values: Record<"department" | "categoryId" | "courseId", string>;
  onChange: (key: "department" | "categoryId" | "courseId", value: string) => void;
  onClear: () => void;
  resultsCount: number;
  hasFilters: boolean;
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function SearchFacets({
  groups,
  values,
  onChange,
  onClear,
  resultsCount,
  hasFilters,
}: SearchFacetsProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="size-4" />
          Filters
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {resultsCount} result{resultsCount === 1 ? "" : "s"}
      </p>

      {groups.map((group) =>
        group.options.length === 0 ? null : (
          <div key={group.key}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((option) => (
                <Chip
                  key={option.value}
                  active={values[group.key] === option.value}
                  label={option.label}
                  onClick={() =>
                    onChange(
                      group.key,
                      values[group.key] === option.value ? "" : option.value,
                    )
                  }
                />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

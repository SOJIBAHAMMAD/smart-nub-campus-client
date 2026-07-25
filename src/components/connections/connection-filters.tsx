"use client";

import { X } from "lucide-react";
import { DEPARTMENTS, SEMESTER_OPTIONS } from "@/lib/constants";
import { TagPill } from "@/components/ui/tag-pill";

export interface ConnectionFilterState {
  department: string;
  semester: string;
  skills: string[];
  search: string;
}

interface ConnectionFiltersProps {
  filters: ConnectionFilterState;
  onChange: (next: ConnectionFilterState) => void;
  /** Available skill options (tags). */
  skills?: { id: string; name: string; slug: string }[];
}

/**
 * Filter controls for the Connections discover/search view: department,
 * semester, skill multi-select, and name search. Renders removable active
 * filter chips for quick clearing.
 */
export function ConnectionFilters({
  filters,
  onChange,
  skills = [],
}: ConnectionFiltersProps) {
  const set = (patch: Partial<ConnectionFilterState>) =>
    onChange({ ...filters, ...patch });

  const toggleSkill = (id: string) => {
    const exists = filters.skills.includes(id);
    set({
      skills: exists
        ? filters.skills.filter((s) => s !== id)
        : [...filters.skills, id],
    });
  };

  const clearAll = () =>
    onChange({ department: "", semester: "", skills: [], search: "" });

  const hasActiveFilters =
    filters.department ||
    filters.semester ||
    filters.skills.length > 0 ||
    filters.search;

  const selectClass =
    "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Department
        </h3>
        <select
          value={filters.department}
          onChange={(e) => set({ department: e.target.value })}
          className={selectClass}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Semester
        </h3>
        <select
          value={filters.semester}
          onChange={(e) => set({ semester: e.target.value })}
          className={selectClass}
        >
          <option value="">All Semesters</option>
          {SEMESTER_OPTIONS.map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Skills
        </h3>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => {
              const active = filters.skills.includes(skill.id);
              return (
                <TagPill
                  key={skill.id}
                  name={skill.name}
                  active={active}
                  onClick={() => toggleSkill(skill.id)}

                />
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No skills available.</p>
        )}
      </div>

      {hasActiveFilters && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {filters.department && (
              <FilterChip
                label={`Dept: ${filters.department}`}
                onRemove={() => set({ department: "" })}
              />
            )}
            {filters.semester && (
              <FilterChip
                label={`Sem: ${filters.semester}`}
                onRemove={() => set({ semester: "" })}
              />
            )}
            {filters.skills.map((id) => {
              const name = skills.find((s) => s.id === id)?.name ?? id;
              return (
                <FilterChip
                  key={id}
                  label={name}
                  onRemove={() => toggleSkill(id)}
                />
              );
            })}
          </div>
          <button
            onClick={clearAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
      {label}
      <button
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-primary/20"
        aria-label={`Remove ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

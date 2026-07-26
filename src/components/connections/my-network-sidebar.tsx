"use client";

import { useState } from "react";
import {
  UserPlus,
  Users,
  Clock,
  Send,
  Ban,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DEPARTMENTS, SEMESTER_OPTIONS } from "@/lib/constants";
import { TagPill } from "@/components/ui/tag-pill";
import type { ConnectionFilterState } from "./connection-filters";

export type ConnectionTab = "all" | "pending" | "sent" | "blocked";

interface MyNetworkSidebarProps {
  activeTab: ConnectionTab;
  onTabChange: (tab: ConnectionTab) => void;
  counts: { all: number; pending: number; sent: number; blocked: number };
  filters: ConnectionFilterState;
  onFiltersChange: (filters: ConnectionFilterState) => void;
  skills?: { id: string; name: string; slug: string }[];
  onFindPeople: () => void;
}

const TABS: { id: ConnectionTab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <Users className="size-4" /> },
  { id: "pending", label: "Pending", icon: <Clock className="size-4" /> },
  { id: "sent", label: "Sent", icon: <Send className="size-4" /> },
  { id: "blocked", label: "Blocked", icon: <Ban className="size-4" /> },
];

export function MyNetworkSidebar({
  activeTab,
  onTabChange,
  counts,
  filters,
  onFiltersChange,
  skills = [],
  onFindPeople,
}: MyNetworkSidebarProps) {
  const [showFilters, setShowFilters] = useState(true);

  const set = (patch: Partial<ConnectionFilterState>) =>
    onFiltersChange({ ...filters, ...patch });

  const toggleSkill = (id: string) => {
    const exists = filters.skills.includes(id);
    set({
      skills: exists
        ? filters.skills.filter((s) => s !== id)
        : [...filters.skills, id],
    });
  };

  const clearAll = () =>
    onFiltersChange({
      department: "",
      semester: "",
      skills: [],
      search: "",
    });

  const hasActiveFilters =
    filters.department ||
    filters.semester ||
    filters.skills.length > 0;

  return (
    <div className="space-y-6">
      <Button className="w-full" onClick={onFindPeople}>
        <UserPlus className="size-4" />
        Find People
      </Button>

      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as ConnectionTab)}
      >
        <TabsList className="w-full">
          {TABS.map((t) => {
            const count =
              t.id === "pending"
                ? counts.pending
                : t.id === "sent"
                  ? counts.sent
                  : t.id === "blocked"
                    ? counts.blocked
                    : counts.all;
            return (
              <TabsTrigger key={t.id} value={t.id} className="flex-1">
                <span className="flex items-center gap-1.5">
                  {t.icon}
                  {t.label}
                </span>
                {count > 0 && (
                  <Badge
                    variant={t.id === "pending" ? "default" : "secondary"}
                    className="ml-1 h-4 min-w-4 justify-center px-1 text-[10px]"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5" />
            Filters
          </span>
          <span>{showFilters ? "Hide" : "Show"}</span>
        </button>
        {showFilters && (
          <div className="mt-3 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Department
              </label>
              <Select
                value={filters.department || undefined}
                onValueChange={(v) => set({ department: v ?? "" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Semester
              </label>
              <Select
                value={filters.semester || undefined}
                onValueChange={(v) => set({ semester: v ?? "" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTER_OPTIONS.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      Semester {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {skills.length > 0 && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Skills
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <TagPill
                      key={skill.id}
                      name={skill.name}
                      active={filters.skills.includes(skill.id)}
                      onClick={() => toggleSkill(skill.id)}
                    />
                  ))}
                </div>
              </div>
            )}

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
        )}
      </div>

      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="size-4" />
          Grow Your Network
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Connect with classmates, seniors, and juniors to expand your campus
          network.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={onFindPeople}
        >
          <UserPlus className="size-3.5" />
          Connect with classmates
        </Button>
      </div>
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

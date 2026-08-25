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
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DEPARTMENTS, SEMESTER_OPTIONS } from "@/lib/constants";
import { TagPill } from "@/components/ui/tag-pill";
import { NetworkStrength } from "./network-strength";
import type { ConnectionFilterState } from "./connection-filters";
import type { ConnectionOverview } from "@/types";

export type ConnectionTab = "all" | "pending" | "sent" | "blocked";

interface MyNetworkSidebarProps {
  activeTab: ConnectionTab;
  onTabChange: (tab: ConnectionTab) => void;
  counts: { all: number; pending: number; sent: number; blocked: number };
  filters: ConnectionFilterState;
  onFiltersChange: (filters: ConnectionFilterState) => void;
  skills?: { id: string; name: string; slug: string }[];
  onFindPeople: () => void;
  overview: ConnectionOverview;
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
  overview,
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
    filters.department || filters.semester || filters.skills.length > 0;

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
        <TabsList className="grid w-full grid-cols-4">
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
              <Tooltip key={t.id}>
                <TooltipTrigger
                  render={
                    <TabsTrigger value={t.id} className="relative px-0">
                      {t.icon}
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                          {count > 9 ? "9+" : count}
                        </span>
                      )}
                    </TabsTrigger>
                  }
                />
                <TooltipContent side="bottom">{t.label}</TooltipContent>
              </Tooltip>
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

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="size-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Network Strength
            </h3>
          </div>
          <NetworkStrength overview={overview} />
        </CardContent>
      </Card>

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

"use client";

import Link from "next/link";
import { SlidersHorizontal, Sparkles, Plus, ChevronRight, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TEAM_CATEGORIES } from "@/constants/team";
import type { TeamRequest } from "@/types/team.types";

interface TeamsTrendingProps {
  /** Suggested team requests (top 3). */
  suggested: TeamRequest[];
  /** Currently active category filter (value or null). */
  category?: string | null;
  onCategoryChange?: (category: string | null) => void;
  /** Currently active status filter (value or null). */
  status?: string | null;
  onStatusChange?: (status: string | null) => void;
  /** Currently active deadline filter (value or null). */
  deadline?: string | null;
  onDeadlineChange?: (deadline: string | null) => void;
}

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "FILLED", label: "Filled" },
  { value: "CLOSED", label: "Closed" },
];

const DEADLINE_OPTIONS = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "none", label: "No deadline" },
];

/**
 * Right sidebar for the Teams page.
 * Filter requests (category/status/deadline), suggested requests, and a create button.
 */
export function TeamsTrending({
  suggested,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  deadline,
  onDeadlineChange,
}: TeamsTrendingProps) {
  return (
    <div className="space-y-6">
      {/* ── Filter Requests ─────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 ring-1 ring-foreground/10">
          <div className="mb-3 flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Filter Requests</h3>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <select
              value={category ?? ""}
              onChange={(e) => onCategoryChange?.(e.target.value || null)}
              className="h-9 w-full rounded-md border bg-transparent px-2.5 text-sm outline-none ring-1 ring-foreground/10"
            >
              <option value="">All Categories</option>
              {TEAM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="mt-3 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onStatusChange?.(active ? null : opt.value)
                    }
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary",
                    )}
                  >
                    {opt.label}
                    {active && <Check className="size-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline */}
          <div className="mt-3 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Deadline</label>
            <div className="flex flex-wrap gap-1.5">
              {DEADLINE_OPTIONS.map((opt) => {
                const active = deadline === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onDeadlineChange?.(active ? null : opt.value)
                    }
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary",
                    )}
                  >
                    {opt.label}
                    {active && <Check className="size-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Suggested for You ────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 ring-1 ring-foreground/10">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Suggested for You</h3>
          </div>
          {suggested.length > 0 ? (
            <div className="space-y-2">
              {suggested.map((team, idx) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-xs font-medium text-foreground">
                      {team.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                      {team.projectName ?? "No project"} • {team.lookingForCount - team.currentMemberCount} slots left
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border bg-card p-3 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
              No suggestions yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Create Your Request ─────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Create Your Request</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Looking for teammates? Post a request and find the right people.
          </p>
          <Link
            href="/teams/create"
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-success bg-success/2 px-2.5 py-1.5 text-xs font-medium text-success/90 transition-colors hover:bg-success/5"
          >
            Create Request
            <ChevronRight className="size-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

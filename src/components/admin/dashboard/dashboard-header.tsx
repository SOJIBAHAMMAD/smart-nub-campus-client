"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [7, 30, 90] as const;

// ── Types ────────────────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  /** Currently selected chart period in days. */
  period: number;
  /** Called when the user picks a new period. */
  onPeriodChange: (days: number) => void;
  /** Whether a chart refetch is in flight. */
  isRefreshing?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Dashboard page header with title, subtitle and a 7 / 30 / 90 day
 * period selector that refetches the charts.
 */
export function DashboardHeader({
  period,
  onPeriodChange,
  isRefreshing = false,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform overview and statistics
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isRefreshing && (
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
            Refreshing
          </span>
        )}

        <div
          role="group"
          aria-label="Chart period"
          className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5"
        >
          {PERIOD_OPTIONS.map((days) => {
            const isActive = period === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => onPeriodChange(days)}
                aria-pressed={isActive}
                aria-label={`Last ${days} days`}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {days} days
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

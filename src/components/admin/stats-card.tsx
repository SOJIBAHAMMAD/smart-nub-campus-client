import { cn } from "@/lib/utils";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ── Types ────────────────────────────────────────────────────────────────────

export type StatsCardTone = "primary" | "blue" | "green" | "amber" | "violet" | "rose";

interface StatsCardProps {
  /** Display label for the stat. */
  label: string;
  /** The formatted numeric value to display. */
  value: string | number;
  /** Icon component to render in the card header. */
  icon: React.ComponentType<{ className?: string }>;
  /** Percentage change from previous period. Positive = up, negative = down. */
  trend?: number;
  /** Whether this stat needs warning/danger styling (e.g. pending items). */
  isWarning?: boolean;
  /** Accent color used for the icon chip (ignored when `isWarning` is true). */
  tone?: StatsCardTone;
  /** Comparison label shown next to the trend pill. Defaults to "from last month". */
  trendLabel?: string;
  /** Additional CSS classes. */
  className?: string;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const toneChip: Record<StatsCardTone, string> = {
  primary: "bg-primary/10 text-primary ring-primary/10",
  blue: "bg-sky-500/10 text-sky-600 ring-sky-500/15 dark:text-sky-400",
  green: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 ring-amber-500/15 dark:text-amber-400",
  violet: "bg-violet-500/10 text-violet-600 ring-violet-500/15 dark:text-violet-400",
  rose: "bg-rose-500/10 text-rose-600 ring-rose-500/15 dark:text-rose-400",
};

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Dashboard stat card with icon chip, value, and optional trend pill.
 * Used in the admin dashboard stats grid.
 */
export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  isWarning = false,
  tone = "primary",
  trendLabel = "from last month",
  className,
}: StatsCardProps) {
  const hasTrend = trend !== undefined && trend !== null;
  const isPositive = hasTrend && trend! > 0;
  const isNegative = hasTrend && trend! < 0;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:border-border hover:shadow-[var(--card-shadow-hover)]",
        isWarning && "border-destructive/40",
        className,
      )}
    >
      <CardContent className="py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {value}
            </p>
          </div>
          <div
            aria-hidden="true"
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105",
              isWarning
                ? "bg-destructive/10 text-destructive ring-destructive/15"
                : toneChip[tone],
            )}
          >
            <Icon className="size-5.5" />
          </div>
        </div>

        {/* Trend pill */}
        {hasTrend && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span
              aria-label={
                isPositive
                  ? `Increased by ${Math.abs(trend!)}%`
                  : isNegative
                    ? `Decreased by ${Math.abs(trend!)}%`
                    : "No change"
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                isNegative && "bg-destructive/10 text-destructive",
                !isPositive && !isNegative && "bg-muted text-muted-foreground",
              )}
            >
              {isPositive && <TrendingUp aria-hidden="true" className="size-3.5" />}
              {isNegative && <TrendingDown aria-hidden="true" className="size-3.5" />}
              {isPositive && "+"}
              {trend}%
            </span>
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          </div>
        )}

        {/* Warning indicator for pending items */}
        {isWarning && !hasTrend && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              <AlertCircle aria-hidden="true" className="size-3.5" />
              Requires attention
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

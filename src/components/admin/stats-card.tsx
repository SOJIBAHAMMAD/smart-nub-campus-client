import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ── Component ────────────────────────────────────────────────────────────────

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
  /** Additional CSS classes. */
  className?: string;
}

/**
 * Dashboard stat card with icon, value, and optional trend indicator.
 * Used in the admin dashboard stats grid.
 */
export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  isWarning = false,
  className,
}: StatsCardProps) {
  const hasTrend = trend !== undefined && trend !== null;
  const isPositive = hasTrend && trend! > 0;
  const isNegative = hasTrend && trend! < 0;

  return (
    <Card
      className={cn(
        isWarning && "border-destructive/40",
        className,
      )}
    >
      <CardContent className="py-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-lg",
              isWarning
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-6" />
          </div>
        </div>

        {/* Trend indicator */}
        {hasTrend && (
          <div className="mt-3 flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
            ) : isNegative ? (
              <TrendingDown className="size-4 text-destructive" />
            ) : null}
            <span
              className={cn(
                "text-sm font-medium",
                isPositive && "text-emerald-600 dark:text-emerald-400",
                isNegative && "text-destructive",
                !isPositive && !isNegative && "text-muted-foreground",
              )}
            >
              {isPositive && "+"}
              {trend}%
            </span>
            <span className="text-sm text-muted-foreground">from last month</span>
          </div>
        )}

        {/* Warning indicator for pending items */}
        {isWarning && !hasTrend && (
          <div className="mt-3 flex items-center gap-1">
            <span className="text-sm font-medium text-destructive">
              Requires attention
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Full-page skeleton that mirrors the final dashboard layout: 10 KPI cards
 * (1/2/3/5 cols), the chart grid and the activity feed. The page header is
 * rendered separately so it stays visible and stable while content loads.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span role="status" className="sr-only">
        Loading dashboard
      </span>

      {/* KPI cards */}
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-[112px] rounded-xl" />
        ))}
      </div>

      {/* Charts */}
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-6 xl:grid-cols-2"
      >
        <Skeleton className="h-[380px] rounded-xl" />
        <Skeleton className="h-[380px] rounded-xl" />
        <Skeleton className="h-[380px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[380px] rounded-xl xl:col-span-2" />
      </div>

      {/* Recent activity */}
      <Skeleton aria-hidden="true" className="h-[420px] rounded-xl" />
    </div>
  );
}

/**
 * Skeleton for just the charts grid, shown while the period selector
 * refetches chart data.
 */
export function DashboardChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2" aria-busy="true">
      <span role="status" className="sr-only">
        Updating charts
      </span>
      <Skeleton aria-hidden="true" className="h-[380px] rounded-xl" />
      <Skeleton aria-hidden="true" className="h-[380px] rounded-xl" />
      <Skeleton
        aria-hidden="true"
        className="h-[380px] rounded-xl xl:col-span-2"
      />
      <Skeleton
        aria-hidden="true"
        className="h-[380px] rounded-xl xl:col-span-2"
      />
    </div>
  );
}

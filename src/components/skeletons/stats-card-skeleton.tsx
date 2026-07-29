import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton matching StatsCard dimensions.
 * Shows label, value, and icon placeholder.
 */
export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm" aria-hidden="true">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="size-12 rounded-lg" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>
  );
}

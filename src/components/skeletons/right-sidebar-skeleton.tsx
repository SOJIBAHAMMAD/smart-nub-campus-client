import { Skeleton } from "@/components/ui/skeleton";

interface RightSidebarSkeletonProps {
  /** Number of widget items. */
  items?: number;
}

/**
 * Generic right sidebar skeleton for page-specific sidebars.
 * Renders trending/stats/suggestion widget placeholders.
 */
export function RightSidebarSkeleton({ items = 3 }: RightSidebarSkeletonProps) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {/* Section title */}
      <Skeleton className="h-5 w-24" />

      {/* Widget items */}
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-3 ring-1 ring-foreground/10"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          </div>
        </div>
      ))}

      {/* Secondary section */}
      <div className="pt-2">
        <Skeleton className="h-5 w-20" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

interface LeftSidebarSkeletonProps {
  /** Number of nav items. */
  navItems?: number;
  /** Number of list items below the divider. */
  listItems?: number;
}

/**
 * Generic left sidebar skeleton for page-specific sidebars.
 * Renders CTA button, tab items, and category/filter list placeholders.
 */
export function LeftSidebarSkeleton({
  navItems = 4,
  listItems = 5,
}: LeftSidebarSkeletonProps) {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* CTA button */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Tab items */}
      <div className="space-y-1">
        {Array.from({ length: navItems }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}
      </div>

      {/* Divider + list */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-20" />
        {Array.from({ length: listItems }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

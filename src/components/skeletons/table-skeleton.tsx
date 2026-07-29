import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  /** Number of rows to render. */
  rows?: number;
  /** Number of columns. */
  columns?: number;
}

/**
 * Generic table skeleton for admin pages.
 * Renders a header row + data rows with cell placeholders.
 */
export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card ring-1 ring-foreground/10" aria-hidden="true">
      {/* Header */}
      <div className="flex items-center gap-4 border-b bg-muted/50 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className={colIdx === 0 ? "h-4 w-8" : "h-4 flex-1"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

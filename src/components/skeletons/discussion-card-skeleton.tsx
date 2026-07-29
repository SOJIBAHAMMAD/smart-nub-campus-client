import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton matching the DiscussionCard dimensions.
 * Shows title, category badge, author row, tags, and footer counts.
 */
export function DiscussionCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4" aria-hidden="true">
      {/* Header: title */}
      <div className="flex items-start gap-2">
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Category + author meta */}
      <div className="mt-2 flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-10" />
        <div className="flex items-center gap-1">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>

      {/* Tags */}
      <div className="mt-2 flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-18 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>

      {/* Footer: counts + actions */}
      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-3.5 w-10" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="size-6 rounded-md" />
        </div>
      </div>
    </div>
  );
}

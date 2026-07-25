import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton matching the QuestionCard dimensions.
 * Prominent vote column on the left + content area on the right.
 */
export function QuestionCardSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-card p-4" aria-hidden="true">
      {/* Left: vote control */}
      <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-4 w-6" />
        <Skeleton className="size-8 rounded-md" />
      </div>

      {/* Right: content */}
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-4/5" />

        {/* Category + meta */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-10" />
          <div className="flex items-center gap-1">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-18 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>

        {/* Footer: counts */}
        <div className="flex items-center gap-3 border-t border-border/50 pt-3">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-14" />
        </div>
      </div>
    </div>
  );
}

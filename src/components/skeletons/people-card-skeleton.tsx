import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton matching PeopleCard dimensions.
 * Shows avatar, name, department, skills, and action buttons.
 */
export function PeopleCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex gap-3 rounded-xl border border-border/60 bg-card ${compact ? "p-3" : "p-4"}`} aria-hidden="true">
      <Skeleton className={compact ? "size-9 shrink-0 rounded-full" : "size-11 shrink-0 rounded-full"} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          {!compact && <Skeleton className="h-5 w-16 rounded-full" />}
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          {!compact && <Skeleton className="h-5 w-12 rounded-full" />}
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

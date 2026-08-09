import { Skeleton } from "@/components/ui/skeleton";

export function EventsListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading events">
      <span className="sr-only">Loading events</span>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 sm:gap-5 sm:p-5"
        >
          <Skeleton className="size-14 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <Skeleton className="h-4 w-1/3 max-w-44" />
            <Skeleton className="h-3 w-2/3 max-w-64" />
            <Skeleton className="h-3 w-1/4 max-w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

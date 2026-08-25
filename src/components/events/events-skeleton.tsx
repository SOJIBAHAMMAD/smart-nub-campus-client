import { Skeleton } from "@/components/ui/skeleton";

export function EventsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-[var(--card-shadow)]"
        >
          <div className="flex-1 space-y-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
            </div>
            <div className="space-y-2 pt-1">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
          </div>
          <div className="flex items-center border-t border-border/40 px-5 py-3.5">
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-1" aria-hidden="true">
      <Skeleton className="mb-3 h-4 w-24" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

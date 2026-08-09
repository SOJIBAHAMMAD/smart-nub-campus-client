import { Skeleton } from "@/components/ui/skeleton";

export function BadgesSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-24 flex-1 rounded-xl" />
        <Skeleton className="h-24 flex-1 rounded-xl" />
        <Skeleton className="h-24 flex-1 rounded-xl" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

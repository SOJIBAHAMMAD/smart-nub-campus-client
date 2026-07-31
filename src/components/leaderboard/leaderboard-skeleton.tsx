import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex justify-center gap-6">
        {[2, 1, 3].map((pos) => (
          <div
            key={pos}
            className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-6"
          >
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border bg-card p-4">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function JobCardSkeleton({ view = "grid" }: { view?: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div
        aria-hidden="true"
        className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3.5 sm:gap-4 sm:px-5"
      >
        <Skeleton className="hidden size-11 shrink-0 rounded-lg sm:block" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="hidden shrink-0 gap-1.5 md:flex">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col gap-3 rounded-lg border border-border/60 bg-card p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <Skeleton className="size-11 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
      </div>
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-4 w-6 rounded-sm" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function JobCardSkeletonGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function JobCardSkeletonList({
  count = 5,
}: {
  count?: number;
}) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} view="list" />
      ))}
    </div>
  );
}

/** Full Job Board page skeleton (hero + tabs + sidebar + cards). */
export function JobBoardSkeleton({
  view = "grid",
  cardCount = 6,
}: {
  view?: "grid" | "list";
  cardCount?: number;
}) {
  return (
    <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:py-6" aria-hidden="true">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl space-y-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96 max-w-full" />
              <Skeleton className="h-12 w-full max-w-md rounded-md" />
            </div>
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-4 space-y-4 rounded-xl border border-border/60 bg-card p-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>

            {view === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: cardCount }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: cardCount }).map((_, i) => (
                  <JobCardSkeleton key={i} view="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

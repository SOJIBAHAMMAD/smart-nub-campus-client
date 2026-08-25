import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton matching the redesigned UserProfile layout.
 * Shows cover area, avatar, name, stats bar, and content cards.
 */
export function UserProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6" aria-hidden="true">
      {/* Cover + avatar area */}
      <div className="relative rounded-xl border bg-card">
        <Skeleton className="h-32 w-full rounded-t-xl sm:h-48" />
        <div className="px-4 pb-5 sm:px-6">
          <div className="-mt-10 flex items-end gap-4">
            <Skeleton className="size-20 rounded-full border-4 border-card sm:size-24" />
            <Skeleton className="mb-1 h-8 w-28 rounded-md" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-4 rounded-xl border p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton matching the ResourceCard dimensions.
 * Supports both grid and list variants.
 */
export function ResourceCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3" aria-hidden="true">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="size-6 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card p-4" aria-hidden="true">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="size-6 rounded-md" />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Skeleton className="h-4 w-8 rounded" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

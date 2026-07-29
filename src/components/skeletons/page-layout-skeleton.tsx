import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PageLayoutSkeletonProps {
  /** Show left sidebar skeleton. */
  hasLeftSidebar?: boolean;
  /** Show right sidebar skeleton. */
  hasRightSidebar?: boolean;
  /** Number of content card skeletons to render. */
  cardCount?: number;
  /** Layout variant: "grid" shows cards in grid, "list" shows stacked. */
  variant?: "grid" | "list";
}

/**
 * Skeleton loader matching the PageLayout 3-column structure.
 * Renders sidebars + main content area with card placeholders.
 */
export function PageLayoutSkeleton({
  hasLeftSidebar = true,
  hasRightSidebar = true,
  cardCount = 6,
  variant = "grid",
}: PageLayoutSkeletonProps) {
  return (
    <div className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6" aria-hidden="true">
      <div
        className={cn(
          "grid gap-6",
          hasLeftSidebar && hasRightSidebar && "lg:grid-cols-[240px_1fr_240px]",
          hasLeftSidebar && !hasRightSidebar && "lg:grid-cols-[240px_1fr]",
          !hasLeftSidebar && hasRightSidebar && "lg:grid-cols-[1fr_240px]",
          !hasLeftSidebar && !hasRightSidebar && "grid-cols-1",
        )}
      >
        {/* Left sidebar skeleton */}
        {hasLeftSidebar && (
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
              <Skeleton className="h-px w-full" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={`cat-${i}`} className="h-6 w-3/4 rounded-md" />
              ))}
            </div>
          </aside>
        )}

        {/* Main content skeleton */}
        <main className="min-w-0">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
            <div
              className={cn(
                variant === "grid"
                  ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "space-y-3",
              )}
            >
              {Array.from({ length: cardCount }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border bg-card p-4 ring-1 ring-foreground/10"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1.5">
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
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right sidebar skeleton */}
        {hasRightSidebar && (
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <Skeleton className="h-6 w-24" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-3 ring-1 ring-foreground/10">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2.5 w-14" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

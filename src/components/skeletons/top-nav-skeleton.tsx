import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader matching the TopNav bar dimensions.
 * Renders a horizontal bar with logo placeholder, nav link placeholders,
 * search input placeholder, and profile icon placeholder.
 */
export function TopNavSkeleton() {
  return (
    <header
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60"
      aria-hidden="true"
    >
      <div className="mx-auto flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Logo placeholder */}
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="size-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>

        {/* Nav links placeholder (desktop) */}
        <div className="hidden items-center gap-1 md:flex">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-md" />
          ))}
        </div>

        {/* Right side: search + actions */}
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="hidden h-8 w-48 sm:block" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="hidden size-8 rounded-full md:block" />
        </div>
      </div>
    </header>
  );
}

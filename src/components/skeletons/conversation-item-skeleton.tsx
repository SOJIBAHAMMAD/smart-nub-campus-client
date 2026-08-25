import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton matching ConversationItem dimensions.
 * Shows avatar, name, preview text, and timestamp.
 */
export function ConversationItemSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-1" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl px-3 py-2.5"
        >
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="size-5 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

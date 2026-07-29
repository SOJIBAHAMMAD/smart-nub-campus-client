import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton matching ChatMessage dimensions.
 * Renders alternating left/right message bubbles.
 */
export function ChatMessageSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const isOwn = i % 2 === 0;
        return (
          <div
            key={i}
            className={cn("flex gap-2", isOwn ? "justify-end" : "justify-start")}
          >
            {!isOwn && <Skeleton className="size-8 shrink-0 rounded-full" />}
            <div className={cn("space-y-1.5", isOwn ? "items-end" : "items-start")}>
              <Skeleton
                className={cn(
                  "h-10 rounded-2xl",
                  isOwn ? "w-48 rounded-br-md" : "w-56 rounded-bl-md",
                )}
              />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface UnreadBadgeProps {
  /** Number of unread messages. */
  count: number;
  className?: string;
}

/**
 * Pill badge that shows the unread message count for a conversation.
 * Hidden entirely when count is 0 so conversation rows stay clean.
 */
export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (!count || count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold leading-none text-primary-foreground animate-in zoom-in-50 duration-200",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types/event.types";

const STATUS_STYLES: Record<
  EventStatus,
  { label: string; className: string; dotClassName: string }
> = {
  UPCOMING: {
    label: "Upcoming",
    className:
      "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
    dotClassName: "bg-blue-500",
  },
  ONGOING: {
    label: "Ongoing",
    className:
      "border-green-300 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300",
    dotClassName: "bg-green-500",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-secondary text-muted-foreground",
    dotClassName: "bg-muted-foreground",
  },
  CANCELLED: {
    label: "Cancelled",
    className:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
    dotClassName: "bg-red-500",
  },
};

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
  /** Hide the leading status dot (useful on top of image overlays). */
  withDot?: boolean;
}

export function EventStatusBadge({
  status,
  className,
  withDot = true,
}: EventStatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <Badge variant="outline" className={cn(style.className, className)}>
      {withDot && (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", style.dotClassName)}
          aria-hidden="true"
        />
      )}
      {style.label}
    </Badge>
  );
}

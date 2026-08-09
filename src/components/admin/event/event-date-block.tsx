import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EventDateBlockProps {
  eventDate: string;
  className?: string;
}

/**
 * Calendar-style date block (month banner + day) used in admin event rows.
 * Mirrors the "tear-off calendar" pattern: month on top, large day below.
 */
export function EventDateBlock({
  eventDate,
  className,
}: EventDateBlockProps) {
  const date = new Date(eventDate);
  const month = format(date, "MMM");
  const day = format(date, "d");
  const fullDate = format(date, "EEE, MMM d, yyyy");

  return (
    <time
      dateTime={date.toISOString()}
      title={fullDate}
      className={cn(
        "flex size-14 shrink-0 flex-col items-center overflow-hidden rounded-lg border border-border/70 bg-card shadow-xs",
        className,
      )}
    >
      <span className="flex w-full items-center justify-center bg-primary px-1 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
        {month}
      </span>
      <span className="flex flex-1 items-center justify-center text-lg leading-none font-bold text-foreground tabular-nums">
        {day}
      </span>
    </time>
  );
}

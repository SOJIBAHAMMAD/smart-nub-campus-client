import { Badge } from "@/components/ui/badge";
import { CircleCheck, CircleDot, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminJob } from "@/types/admin.types";

const STATUS_STYLES: Record<AdminJob["status"], string> = {
  OPEN: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  FILLED: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  CLOSED: "border-border bg-muted/60 text-muted-foreground",
};

const STATUS_ICONS = {
  OPEN: CircleDot,
  FILLED: CircleCheck,
  CLOSED: CircleX,
} as const;

const STATUS_LABELS: Record<AdminJob["status"], string> = {
  OPEN: "Open",
  FILLED: "Filled",
  CLOSED: "Closed",
};

interface JobStatusBadgeProps {
  status: AdminJob["status"];
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const Icon = STATUS_ICONS[status];
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_STYLES[status], className)}
    >
      <Icon className="size-3" data-icon="inline-start" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

import { CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { VerificationStatus } from "@/constants/enums";
import { cn } from "@/lib/utils";

// ── Status metadata ───────────────────────────────────────────────────────────

const STATUS_META: Record<
  VerificationStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  [VerificationStatus.PENDING]: {
    label: "Pending",
    icon: Clock,
    className:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400",
  },
  [VerificationStatus.APPROVED]: {
    label: "Approved",
    icon: CheckCircle2,
    className:
      "border-green-300 bg-green-50 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-400",
  },
  [VerificationStatus.REJECTED]: {
    label: "Rejected",
    icon: XCircle,
    className:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface VerificationStatusBadgeProps {
  /** The verification status to display. */
  status: VerificationStatus;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * Status badge with an icon and color-coding that stays readable in dark mode.
 * Never relies on color alone — the label is always rendered for screen readers.
 */
export function VerificationStatusBadge({
  status,
  className,
}: VerificationStatusBadgeProps) {
  const meta = STATUS_META[status];
  if (!meta) return null;

  const Icon = meta.icon;

  return (
    <Badge
      variant="outline"
      data-icon="inline-start"
      className={cn(meta.className, className)}
    >
      <Icon data-icon="inline-start" className="size-3" />
      {meta.label}
    </Badge>
  );
}

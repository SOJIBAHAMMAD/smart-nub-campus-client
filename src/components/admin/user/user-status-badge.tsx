import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Ban,
  CheckCircle2,
  Clock,
  Hourglass,
  UserX,
} from "lucide-react";
import type { UserStatus } from "@/constants/enums";

// ── Types ────────────────────────────────────────────────────────────────────

type StatusTone = "active" | "banned" | "suspended" | "pending" | "deleted";

interface UserStatusBadgeProps {
  /** Backend user status. */
  status: UserStatus;
  /** Whether the account was soft-deleted. */
  isDeleted: boolean;
  /** Whether the user finished onboarding. */
  hasCompletedOnboarding: boolean;
  /** Additional CSS classes. */
  className?: string;
}

interface StatusConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  tooltip?: string;
}

// ── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StatusTone, StatusConfig> = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    className:
      "border-emerald-300/70 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-400",
  },
  banned: {
    label: "Banned",
    icon: Ban,
    className:
      "border-red-300/70 text-red-700 dark:border-red-500/40 dark:text-red-400",
  },
  suspended: {
    label: "Suspended",
    icon: Clock,
    tooltip: "Account is suspended",
    className:
      "border-amber-300/70 text-amber-700 dark:border-amber-500/40 dark:text-amber-400",
  },
  pending: {
    label: "Pending",
    icon: Hourglass,
    tooltip: "Onboarding not completed",
    className:
      "border-amber-300/70 text-amber-700 dark:border-amber-500/40 dark:text-amber-400",
  },
  deleted: {
    label: "Deleted",
    icon: UserX,
    tooltip: "Account has been deleted",
    className:
      "border-gray-300/70 text-gray-500 dark:border-gray-600/60 dark:text-gray-400",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve the display tone for an admin user status. */
export function getStatusTone({
  status,
  isDeleted,
  hasCompletedOnboarding,
}: UserStatusBadgeProps): StatusTone {
  if (isDeleted) return "deleted";
  if (status === "BANNED") return "banned";
  if (status === "SUSPENDED") return "suspended";
  if (!hasCompletedOnboarding) return "pending";
  return "active";
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Status badge with an icon and semantic color coding:
 * Active = green, Banned = red, Suspended/Pending = amber, Deleted = gray.
 */
export function UserStatusBadge({
  status,
  isDeleted,
  hasCompletedOnboarding,
  className,
}: UserStatusBadgeProps) {
  const tone = getStatusTone({ status, isDeleted, hasCompletedOnboarding });
  const config = STATUS_CONFIG[tone];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      title={config.tooltip}
    >
      <Icon data-icon="inline-start" className="size-3" />
      {config.label}
    </Badge>
  );
}

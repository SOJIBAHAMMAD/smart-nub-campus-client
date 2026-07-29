import { Check, Clock, UserX, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/types";

type Relationship = "none" | "pending_incoming" | "pending_outgoing" | "connected" | "blocked";

interface ConnectionStatusBadgeProps {
  relationship: Relationship;
  className?: string;
}

const CONFIG: Record<
  Relationship,
  { label: string; icon: React.ReactNode; className: string }
> = {
  none: {
    label: "Not connected",
    icon: <UserCheck className="size-3" />,
    className: "bg-muted text-muted-foreground",
  },
  pending_incoming: {
    label: "Wants to connect",
    icon: <Clock className="size-3" />,
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  pending_outgoing: {
    label: "Request sent",
    icon: <Clock className="size-3" />,
    className: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  connected: {
    label: "Connected",
    icon: <Check className="size-3" />,
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  blocked: {
    label: "Blocked",
    icon: <UserX className="size-3" />,
    className: "bg-destructive/15 text-destructive",
  },
};

/**
 * Small badge describing the relationship between the current user and another
 * person. Used on people cards and connection rows.
 */
export function ConnectionStatusBadge({
  relationship,
  className,
}: ConnectionStatusBadgeProps) {
  const config = CONFIG[relationship] ?? CONFIG.none;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        config.className,
        className,
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

/** Helper to map a ConnectionStatus + direction into a relationship value. */
export function resolveRelationship(
  status: ConnectionStatus | undefined,
  direction: "incoming" | "outgoing" | "none",
  blocked = false,
): Relationship {
  if (blocked) return "blocked";
  if (status === "ACCEPTED") return "connected";
  if (status === "PENDING") {
    return direction === "incoming" ? "pending_incoming" : "pending_outgoing";
  }
  return "none";
}

export type { Relationship };

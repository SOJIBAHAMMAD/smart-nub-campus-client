"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Ban, CheckCircle2, Hourglass, Users } from "lucide-react";
import type { AdminUser } from "@/types/admin.types";
import { getStatusTone } from "./user-status-badge";

// ── Types ────────────────────────────────────────────────────────────────────

interface UserStatsCardsProps {
  /** Total user count from the response meta. */
  total: number;
  /** Active users on the current page. */
  active: number;
  /** Banned users on the current page. */
  banned: number;
  /** Suspended / pending-onboarding users on the current page. */
  pending: number;
}

// ── Config ───────────────────────────────────────────────────────────────────

const stats = [
  {
    key: "total" as const,
    label: "Total Users",
    icon: Users,
    color: "text-blue-600 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-500/15",
  },
  {
    key: "active" as const,
    label: "Active",
    icon: CheckCircle2,
    color:
      "text-green-600 bg-green-500/10 dark:text-green-400 dark:bg-green-500/15",
  },
  {
    key: "banned" as const,
    label: "Banned",
    icon: Ban,
    color: "text-red-600 bg-red-500/10 dark:text-red-400 dark:bg-red-500/15",
  },
  {
    key: "pending" as const,
    label: "Pending",
    icon: Hourglass,
    color:
      "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/15",
  },
] as const;

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Compact stats strip for the user directory. Total comes from the response
 * meta; the remaining counts are derived from the currently loaded page.
 */
export function UserStatsCards({
  total,
  active,
  banned,
  pending,
}: UserStatsCardsProps) {
  const values = { total, active, banned, pending };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.key} className="shadow-xs">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
              >
                <Icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold leading-tight tabular-nums">
                  {values[stat.key].toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Derivation helper ────────────────────────────────────────────────────────

/** Compute page-level stats from a list of admin users. */
export function deriveUserStats(users: AdminUser[] | undefined) {
  const rows = users ?? [];
  return {
    active: rows.filter((u) => getStatusTone(u) === "active").length,
    banned: rows.filter((u) => getStatusTone(u) === "banned").length,
    pending: rows.filter(
      (u) => getStatusTone(u) === "suspended" || getStatusTone(u) === "pending",
    ).length,
  };
}

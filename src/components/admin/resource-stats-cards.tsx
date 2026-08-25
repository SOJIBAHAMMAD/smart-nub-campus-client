"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  ChevronRight,
  Download,
  FileStack,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceStatsCardsProps {
  total: number;
  verified: number;
  unverified: number;
  totalDownloads: number;
  totalReports: number;
  onReportsClick?: () => void;
}

const stats = [
  {
    key: "total" as const,
    label: "Total Resources",
    sub: "All time",
    icon: FileStack,
    color:
      "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  },
  {
    key: "verified" as const,
    label: "Verified",
    sub: "Live",
    icon: ShieldCheck,
    color:
      "bg-green-500/10 text-green-600 dark:bg-green-500/15 dark:text-green-400",
  },
  {
    key: "unverified" as const,
    label: "Unverified",
    sub: "Needs review",
    icon: ShieldAlert,
    color:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    key: "totalDownloads" as const,
    label: "Total Downloads",
    sub: "Across resources",
    icon: Download,
    color:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  },
  {
    key: "totalReports" as const,
    label: "Reports",
    sub: "Require attention",
    icon: AlertTriangle,
    color:
      "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  },
];

export function ResourceStatsCards({
  total,
  verified,
  unverified,
  totalDownloads,
  totalReports,
  onReportsClick,
}: ResourceStatsCardsProps) {
  const values = { total, verified, unverified, totalDownloads, totalReports };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isClickable = stat.key === "totalReports" && !!onReportsClick;
        const value = values[stat.key];
        return (
          <Card
            key={stat.key}
            interactive={isClickable}
            onClick={isClickable ? onReportsClick : undefined}
            className={cn(
              "transition-colors",
              isClickable && "hover:border-primary/40",
              stat.key === "totalReports" &&
                value > 0 &&
                "border-red-500/30 ring-1 ring-red-500/10 dark:border-red-500/40",
            )}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  stat.color,
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-xl font-semibold leading-tight tabular-nums">
                  {value.toLocaleString()}
                </p>
                <p className="truncate text-[10px] text-muted-foreground/80">
                  {stat.sub}
                </p>
              </div>
              {isClickable && (
                <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground/60" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

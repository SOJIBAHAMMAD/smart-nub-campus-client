"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  FileStack,
  ShieldCheck,
  ShieldAlert,
  Download,
  AlertTriangle,
} from "lucide-react";

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
    icon: FileStack,
    color: "text-blue-600 bg-blue-500/10",
  },
  {
    key: "verified" as const,
    label: "Verified",
    icon: ShieldCheck,
    color: "text-green-600 bg-green-500/10",
  },
  {
    key: "unverified" as const,
    label: "Unverified",
    icon: ShieldAlert,
    color: "text-amber-600 bg-amber-500/10",
  },
  {
    key: "totalDownloads" as const,
    label: "Total Downloads",
    icon: Download,
    color: "text-violet-600 bg-violet-500/10",
  },
  {
    key: "totalReports" as const,
    label: "Reports",
    icon: AlertTriangle,
    color: "text-red-600 bg-red-500/10",
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
        const isClickable = stat.key === "totalReports" && onReportsClick;
        return (
          <Card
            key={stat.key}
            className={`shadow-xs ${isClickable ? "cursor-pointer hover:bg-accent/50 transition-colors" : ""}`}
            onClick={isClickable ? onReportsClick : undefined}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                <Icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
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

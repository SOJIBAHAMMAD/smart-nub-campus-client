"use client";

import { Trophy, Users, FileText, MessageSquare, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ProfileStats, ProfileContentCounts } from "@/types/profile.types";

interface ProfileStatsBarProps {
  stats?: ProfileStats;
  contentCounts?: ProfileContentCounts;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  tooltip: string;
}

export function ProfileStatsBar({ stats, contentCounts }: ProfileStatsBarProps) {
  const items: StatItem[] = [
    {
      label: "Points",
      value: stats?.totalPoints ?? 0,
      icon: <Trophy className="size-4 text-amber-500" />,
      tooltip: "Reputation points earned from contributions",
    },
    {
      label: "Connections",
      value: stats?.connectionCount ?? 0,
      icon: <Users className="size-4 text-blue-500" />,
      tooltip: "Total connections",
    },
    {
      label: "Resources",
      value: contentCounts?.resources ?? 0,
      icon: <FileText className="size-4 text-green-500" />,
      tooltip: "Resources shared",
    },
    {
      label: "Discussions",
      value: contentCounts?.discussions ?? 0,
      icon: <MessageSquare className="size-4 text-purple-500" />,
      tooltip: "Discussions created",
    },
    {
      label: "Questions",
      value: contentCounts?.questions ?? 0,
      icon: <HelpCircle className="size-4 text-orange-500" />,
      tooltip: "Questions asked",
    },
  ];

  return (
    <Card>
      <CardContent className="flex items-center justify-around py-4">
        <TooltipProvider>
          {items.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger className="flex flex-col items-center gap-1 text-center">
                {item.icon}
                <span className="text-lg font-bold tabular-nums">{item.value}</span>
                <span className="text-[10px] text-muted-foreground sm:text-xs">{item.label}</span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

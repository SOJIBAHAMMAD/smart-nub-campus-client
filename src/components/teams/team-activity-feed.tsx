"use client";

import { useState, useCallback } from "react";
import { UserRoundPlus, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import type { TeamApplication } from "@/lib/types/socket-events";
import { cn } from "@/lib/utils";

interface TeamActivityEvent {
  id: string;
  type: "application" | "accepted" | "rejected";
  timestamp: string;
}

interface TeamActivityFeedProps {
  teamId: string;
  isAuthor: boolean;
}

function getRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const EVENT_CONFIG: Record<
  TeamActivityEvent["type"],
  { icon: typeof UserRoundPlus; text: string; iconClass: string }
> = {
  application: {
    icon: UserRoundPlus,
    text: "New application received",
    iconClass: "text-blue-500 bg-blue-500/10",
  },
  accepted: {
    icon: Check,
    text: "Application accepted",
    iconClass: "text-green-500 bg-green-500/10",
  },
  rejected: {
    icon: X,
    text: "Application rejected",
    iconClass: "text-red-500 bg-red-500/10",
  },
};

export function TeamActivityFeed({ teamId, isAuthor }: TeamActivityFeedProps) {
  const [events, setEvents] = useState<TeamActivityEvent[]>([]);

  const handleApplicationEvent = useCallback(
    (data: { teamRequestId: string; application: TeamApplication }) => {
      if (data.teamRequestId !== teamId) return;

      let type: TeamActivityEvent["type"] = "application";
      if (data.application.status === "ACCEPTED") type = "accepted";
      else if (data.application.status === "REJECTED") type = "rejected";

      const newEvent: TeamActivityEvent = {
        id: data.application.id,
        type,
        timestamp: data.application.createdAt,
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 10));
    },
    [teamId],
  );

  const { socket } = useSocket();
  useSocketEvent(socket, "team:application", handleApplicationEvent);

  if (!isAuthor) return null;

  return (
    <Card>
      <CardContent className="space-y-0 py-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Activity</h3>

        {events.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No recent activity.
          </p>
        ) : (
          <div className="relative ml-3 border-l border-border/60 pl-6">
            {events.map((event, index) => {
              const config = EVENT_CONFIG[event.type];
              const Icon = config.icon;

              return (
                <div
                  key={event.id}
                  className={cn(
                    "relative mb-6 last:mb-0",
                    index === 0 && "animate-in fade-in slide-in-from-top-2 duration-300",
                  )}
                >
                  <div
                    className={cn(
                      "absolute -left-[31px] flex size-6 items-center justify-center rounded-full ring-4 ring-card",
                      config.iconClass,
                    )}
                  >
                    <Icon className="size-3" />
                  </div>
                  <p className="text-xs text-foreground">{config.text}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {getRelativeTime(event.timestamp)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

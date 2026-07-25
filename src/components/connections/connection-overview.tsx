import { Users, Clock, Send, Star, Ban } from "lucide-react";
import type { ConnectionOverview } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConnectionOverviewProps {
  overview: ConnectionOverview;
}

const ITEMS: {
  key: keyof ConnectionOverview;
  label: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  { key: "totalConnections", label: "My Connections", icon: <Users className="size-4" />, accent: "text-emerald-500" },
  { key: "pending", label: "Pending", icon: <Clock className="size-4" />, accent: "text-amber-500" },
  { key: "sent", label: "Sent", icon: <Send className="size-4" />, accent: "text-sky-500" },
  { key: "favorites", label: "Favorites", icon: <Star className="size-4" />, accent: "text-violet-500" },
  { key: "blocked", label: "Blocked", icon: <Ban className="size-4" />, accent: "text-destructive" },
];

/**
 * Stats card summarizing the current user's network at a glance.
 */
export function ConnectionOverview({ overview }: ConnectionOverviewProps) {
  return (
    <Card>
      <CardContent className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Connection Overview
      </h3>
      <div className="space-y-2">
        {ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/60"
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={cn(item.accent)}>{item.icon}</span>
              {item.label}
            </span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {overview[item.key] ?? 0}
            </span>
          </div>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}

import Link from "next/link";
import { AlertTriangle, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import ROUTES from "@/constants/routes";
import type { ActivityItem } from "@/types/activity.types";
import {
  ACTIVITY_TYPE_META,
  formatAbsoluteTime,
  formatRelativeTime,
  getTargetRoute,
} from "@/components/activity/activity-utils";

interface RecentActivityProps {
  activities: ActivityItem[];
  error?: boolean;
}

export function RecentActivity({ activities, error }: RecentActivityProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Failed to load recent activity.</span>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <p className="text-xs text-muted-foreground">What&apos;s happening on campus</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/50 p-10 text-center">
          <MessageSquare className="mx-auto size-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            No recent activity yet.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Start by uploading a resource or joining a discussion!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((item) => {
            const meta = ACTIVITY_TYPE_META[item.type];
            const TypeIcon = meta.icon;
            return (
              <Link
                key={item.id}
                href={getTargetRoute(item.type, item.targetId)}
                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <div className="relative shrink-0">
                  {item.actor ? (
                    <>
                      <Avatar
                        id={item.actor.id}
                        name={item.actor.name}
                        src={item.actor.image}
                        className="size-8"
                      />
                      <span
                        className={cn(
                          "absolute -bottom-1 -right-1 flex size-3.5 items-center justify-center rounded-full ring-2 ring-background",
                          meta.chip,
                        )}
                      >
                        <TypeIcon className="size-2" />
                      </span>
                    </>
                  ) : (
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full",
                        meta.chip,
                      )}
                    >
                      <TypeIcon className="size-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground leading-snug">
                    {item.actor && (
                      <span className="font-medium">{item.actor.name}</span>
                    )}
                    {item.actor && " "}
                    <span className="text-muted-foreground">
                      {item.action}{" "}
                    </span>
                    <span className="font-medium text-primary transition-colors group-hover:text-primary/80">
                      {item.target}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <time title={formatAbsoluteTime(item.timestamp)}>
                      {formatRelativeTime(item.timestamp)}
                    </time>
                  </p>
                </div>
              </Link>
            );
          })}
          <Link
            href={ROUTES.ACTIVITIES}
            className="mt-2 flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            View all activity <ArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </section>
  );
}

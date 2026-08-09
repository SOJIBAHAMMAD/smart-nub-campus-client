import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { ActivityItem } from "@/types/activity.types";
import {
  ACTIVITY_TYPE_META,
  formatAbsoluteTime,
  formatRelativeTime,
  getTargetRoute,
} from "./activity-utils";

interface ActivityItemRowProps {
  item: ActivityItem;
}

/**
 * Single activity row: actor avatar with a type badge, actor → action → target,
 * and a relative timestamp (absolute on hover).
 */
export function ActivityItemRow({ item }: ActivityItemRowProps) {
  const meta = ACTIVITY_TYPE_META[item.type];
  const TypeIcon = meta.icon;
  const href = getTargetRoute(item.type, item.targetId);

  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
    >
      <div className="relative shrink-0 pt-0.5">
        {item.actor ? (
          <>
            <Avatar
              id={item.actor.id}
              name={item.actor.name}
              src={item.actor.image}
              className="size-9"
            />
            <span
              className={cn(
                "absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full ring-2 ring-background",
                meta.chip,
              )}
            >
              <TypeIcon className="size-2.5" />
            </span>
          </>
        ) : (
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-full",
              meta.chip,
            )}
          >
            <TypeIcon className="size-4" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-foreground">
          {item.actor && (
            <span className="font-semibold">{item.actor.name}</span>
          )}
          {item.actor && " "}
          <span className="text-muted-foreground">{item.action}</span>{" "}
          <span className="font-medium text-primary transition-colors group-hover:text-primary/80">
            {item.target}
          </span>
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <time
            className="text-xs text-muted-foreground/70"
            title={formatAbsoluteTime(item.timestamp)}
          >
            {formatRelativeTime(item.timestamp)}
          </time>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50">
            {meta.label}
          </span>
        </div>
      </div>
    </Link>
  );
}

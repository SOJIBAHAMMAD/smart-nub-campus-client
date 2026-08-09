"use client";

import type { AdminDiscussion } from "@/types/admin.types";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DISCUSSION_STATUS_META,
  getDiscussionStatus,
  getSecondaryFlags,
} from "./discussion-utils";

interface DiscussionStatusBadgeProps {
  discussion: AdminDiscussion;
}

/**
 * Primary moderation status badge (icon + label, never color alone) with a
 * tooltip describing the full state. Secondary flags (e.g. a locked discussion
 * that is also solved) are shown as compact hint icons after the badge so the
 * row keeps the same signal density as the previous moderation view.
 */
export function DiscussionStatusBadge({
  discussion,
}: DiscussionStatusBadgeProps) {
  const status = getDiscussionStatus(discussion);
  const meta = DISCUSSION_STATUS_META[status];
  const secondary = getSecondaryFlags(discussion);
  const Icon = meta.icon;

  const stateDescription = [
    meta.description,
    ...secondary.map((s) => DISCUSSION_STATUS_META[s].description),
  ].join(" · ");

  return (
    <div className="flex items-center justify-center gap-1">
      <Tooltip>
        <TooltipTrigger className="flex items-center">
          <Badge
            variant="outline"
            className={cn(
              "h-5 gap-1 rounded-full px-2 text-[10px] font-medium",
              meta.className,
            )}
          >
            <Icon className="size-2.5" />
            {meta.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{stateDescription}</TooltipContent>
      </Tooltip>
      {secondary.map((flag) => {
        const FlagIcon = DISCUSSION_STATUS_META[flag].icon;
        return (
          <Tooltip key={flag}>
            <TooltipTrigger className="flex items-center">
              <FlagIcon className="size-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>{DISCUSSION_STATUS_META[flag].label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

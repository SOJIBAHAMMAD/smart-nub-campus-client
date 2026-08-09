"use client";

import { Eye, MessageSquare, ThumbsUp } from "lucide-react";
import type { AdminDiscussion } from "@/types/admin.types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DiscussionMetricsProps {
  discussion: AdminDiscussion;
}

/**
 * Compact engagement metrics (replies, upvotes, views) for a discussion row.
 * Values are formatted with locale grouping and labelled via tooltip so the
 * meaning is never conveyed by the icon alone.
 */
export function DiscussionMetrics({ discussion }: DiscussionMetricsProps) {
  const metrics = [
    { label: "Replies", icon: MessageSquare, value: discussion.replyCount },
    { label: "Upvotes", icon: ThumbsUp, value: discussion.upvoteCount },
    { label: "Views", icon: Eye, value: discussion.viewCount },
  ];

  return (
    <div className="flex items-center justify-center gap-3 text-muted-foreground">
      {metrics.map(({ label, icon: Icon, value }) => (
        <Tooltip key={label}>
          <TooltipTrigger>
            <span className="inline-flex items-center gap-1 text-xs tabular-nums">
              <Icon className="size-3" />
              {value.toLocaleString()}
            </span>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type VoteState = "UP" | "DOWN" | null;

interface VoteButtonsProps {
  voteCount: number;
  userVote: VoteState;
  onVote: (type: "UP" | "DOWN") => void;
  /** Layout orientation. */
  orientation?: "vertical" | "horizontal";
  /** Disable interaction (e.g. when voting on own content). */
  disabled?: boolean;
  size?: "sm" | "md";
}

/**
 * Upvote / downvote control with a prominent score.
 * Active state is highlighted (up = brand/primary, down = destructive).
 * Clicking an already-active direction removes the vote (toggle pattern).
 */
export function VoteButtons({
  voteCount,
  userVote,
  onVote,
  orientation = "vertical",
  disabled = false,
  size = "md",
}: VoteButtonsProps) {
  const upActive = userVote === "UP";
  const downActive = userVote === "DOWN";

  const btn = size === "sm" ? "size-6" : "size-7";
  const icon = size === "sm" ? "size-4" : "size-5";

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-0.5",
        orientation === "vertical" ? "flex-col" : "flex-row",
      )}
    >
      <button
        type="button"
        onClick={() => onVote("UP")}
        disabled={disabled}
        aria-label="Upvote"
        className={cn(
          "flex items-center justify-center rounded-md transition-colors disabled:opacity-50",
          btn,
          upActive
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-primary",
        )}
      >
        <ChevronUp className={icon} />
      </button>

      <span
        className={cn(
          "min-w-6 text-center text-sm font-semibold tabular-nums",
          upActive && "text-primary",
          downActive && "text-destructive",
          !upActive && !downActive && "text-foreground",
        )}
      >
        {voteCount}
      </span>

      <button
        type="button"
        onClick={() => onVote("DOWN")}
        disabled={disabled}
        aria-label="Downvote"
        className={cn(
          "flex items-center justify-center rounded-md transition-colors disabled:opacity-50",
          btn,
          downActive
            ? "bg-destructive/15 text-destructive"
            : "text-muted-foreground hover:bg-muted hover:text-destructive",
        )}
      >
        <ChevronDown className={icon} />
      </button>
    </div>
  );
}

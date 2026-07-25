"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteControlsProps {
  upvotes: number;
  downvotes?: number;
  orientation?: "vertical" | "horizontal";
  activeVote?: "UP" | "DOWN" | null;
  onVote?: (type: "UP" | "DOWN") => void;
  disabled?: boolean;
  className?: string;
}

export function VoteControls({
  upvotes,
  downvotes = 0,
  orientation = "vertical",
  activeVote = null,
  onVote,
  disabled = false,
  className,
}: VoteControlsProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        isVertical ? "flex-col" : "flex-row",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onVote?.("UP")}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center rounded-md p-1 transition-colors",
          "hover:bg-primary/10 active:scale-95",
          "disabled:cursor-not-allowed disabled:opacity-50",
          activeVote === "UP"
            ? "text-primary"
            : "text-muted-foreground hover:text-primary",
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="size-4" strokeWidth={2.5} />
      </button>

      <span
        className={cn(
          "min-w-[28px] text-center text-xs font-semibold tabular-nums",
          activeVote === "UP"
            ? "text-primary"
            : activeVote === "DOWN"
              ? "text-destructive"
              : "text-foreground",
        )}
      >
        {upvotes - downvotes}
      </span>

      {downvotes > 0 && (
        <button
          type="button"
          onClick={() => onVote?.("DOWN")}
          disabled={disabled}
          className={cn(
            "flex items-center justify-center rounded-md p-1 transition-colors",
            "hover:bg-destructive/10 active:scale-95",
            "disabled:cursor-not-allowed disabled:opacity-50",
            activeVote === "DOWN"
              ? "text-destructive"
              : "text-muted-foreground hover:text-destructive",
          )}
          aria-label="Downvote"
        >
          <ChevronDown className="size-4" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

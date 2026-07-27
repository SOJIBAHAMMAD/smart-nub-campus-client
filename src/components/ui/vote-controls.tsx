"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoteControlsProps {
  upvotes: number;
  downvotes?: number;
  orientation?: "vertical" | "horizontal";
  activeVote?: "UP" | "DOWN" | null;
  onVote?: (type: "UP" | "DOWN") => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setDisplayValue(value);
      prevValue.current = value;
    }
  }, [value]);

  return (
    <span
      className={cn(
        "transition-all duration-200",
        className,
      )}
    >
      {displayValue}
    </span>
  );
}

export function VoteControls({
  upvotes,
  downvotes = 0,
  orientation = "vertical",
  activeVote = null,
  onVote,
  disabled = false,
  size = "md",
  className,
}: VoteControlsProps) {
  const isVertical = orientation === "vertical";
  const score = upvotes - downvotes;

  const iconSizes = {
    sm: "size-3.5",
    md: "size-4",
  };

  const buttonSizes = {
    sm: "size-6 rounded",
    md: "size-7 rounded-md",
  };

  const scoreSizes = {
    sm: "min-w-[20px] text-[10px]",
    md: "min-w-[28px] text-xs",
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center gap-0.5",
          isVertical ? "flex-col" : "flex-row",
          className,
        )}
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => onVote?.("UP")}
                disabled={disabled}
                className={cn(
                  "flex items-center justify-center border transition-all",
                  buttonSizes[size],
                  "hover:bg-primary/10 active:scale-90",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  activeVote === "UP"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:border-primary/20 hover:text-primary",
                )}
                aria-label="Upvote"
              />
            }
          >
            <ChevronUp
              className={cn(iconSizes[size], activeVote === "UP" && "stroke-[3]")}
              strokeWidth={activeVote === "UP" ? 3 : 2.5}
            />
          </TooltipTrigger>
          <TooltipContent side="top">
            {upvotes} upvote{upvotes !== 1 ? "s" : ""}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <span
                className={cn(
                  "flex items-center justify-center font-semibold tabular-nums select-none",
                  scoreSizes[size],
                  activeVote === "UP"
                    ? "text-primary"
                    : activeVote === "DOWN"
                      ? "text-destructive"
                      : "text-foreground",
                )}
              >
                <AnimatedNumber value={score} />
              </span>
            }
          >
            <span className="sr-only">
              Score: {score} ({upvotes} up, {downvotes} down)
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            {upvotes} upvote{upvotes !== 1 ? "s" : ""}, {downvotes} downvote{downvotes !== 1 ? "s" : ""}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => onVote?.("DOWN")}
                disabled={disabled}
                className={cn(
                  "flex items-center justify-center border transition-all",
                  buttonSizes[size],
                  "hover:bg-destructive/10 active:scale-90",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  activeVote === "DOWN"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-transparent text-muted-foreground hover:border-destructive/20 hover:text-destructive",
                )}
                aria-label="Downvote"
              />
            }
          >
            <ChevronDown
              className={cn(iconSizes[size], activeVote === "DOWN" && "stroke-[3]")}
              strokeWidth={activeVote === "DOWN" ? 3 : 2.5}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {downvotes} downvote{downvotes !== 1 ? "s" : ""}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

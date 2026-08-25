"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceSortHeaderProps {
  label: string;
  active: boolean;
  direction?: "asc" | "desc";
  onClick: () => void;
  className?: string;
}

export function ResourceSortHeader({
  label,
  active,
  direction,
  onClick,
  className,
}: ResourceSortHeaderProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-muted-foreground transition-colors",
        "hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "text-foreground",
        className,
      )}
    >
      {label}
      {active && direction ? (
        direction === "asc" ? (
          <ArrowUp className="size-3.5 shrink-0 text-primary" />
        ) : (
          <ArrowDown className="size-3.5 shrink-0 text-primary" />
        )
      ) : (
        <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground/50" />
      )}
    </button>
  );
}

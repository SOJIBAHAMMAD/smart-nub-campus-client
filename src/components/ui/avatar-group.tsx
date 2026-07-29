"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";

interface AvatarGroupItem {
  id: string;
  name?: string;
  src?: string | null;
}

interface AvatarGroupProps {
  items: AvatarGroupItem[];
  max?: number;
  className?: string;
  size?: string;
}

export function AvatarGroup({
  items,
  max = 5,
  className,
  size = "size-8",
}: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const remaining = items.length - max;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {visible.map((item) => (
        <Avatar
          key={item.id}
          id={item.id}
          name={item.name}
          src={item.src}
          className={cn(size, "ring-2 ring-background")}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background",
            size,
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

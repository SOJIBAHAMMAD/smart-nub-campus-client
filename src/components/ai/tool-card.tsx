"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface ToolCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function ToolCard({
  name,
  description,
  icon: Icon,
  onClick,
  className,
}: ToolCardProps) {
  return (
    <Card
      interactive
      size="sm"
      onClick={onClick}
      className={cn("gap-2 p-3", className)}
    >
      <CardContent className="flex flex-col items-start gap-1.5 p-0">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <span className="text-xs font-semibold text-foreground">{name}</span>
        <span className="text-[10px] leading-tight text-muted-foreground">
          {description}
        </span>
      </CardContent>
    </Card>
  );
}

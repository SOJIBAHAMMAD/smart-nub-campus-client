"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface DashboardErrorProps {
  /** Heading shown in the error card. */
  title?: string;
  /** Supporting explanation for the failure. */
  description?: string;
  /** Called when the user clicks the retry button. */
  onRetry: () => void;
  /** Additional CSS classes applied to the card container. */
  className?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Inline error state for a dashboard section with a retry action.
 * Used when stats, charts, or activity fail to load.
 */
export function DashboardError({
  title = "Something went wrong",
  description = "We couldn't load this section. Please try again.",
  onRetry,
  className,
}: DashboardErrorProps) {
  return (
    <Card className={cn("w-full", className)}>
      <Empty className="min-h-[220px] py-10">
        <EmptyMedia variant="icon">
          <TriangleAlert className="text-destructive" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden="true" className="size-3.5" />
          Retry
        </Button>
      </Empty>
    </Card>
  );
}

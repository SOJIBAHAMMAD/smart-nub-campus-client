"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function EventsPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: EventsPaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Events pagination"
      className="flex flex-col items-center justify-between gap-3 border-t border-border/40 px-4 py-3.5 sm:flex-row sm:px-5"
    >
      <p className="text-xs text-muted-foreground sm:text-sm">
        Showing{" "}
        <span className="font-medium text-foreground tabular-nums">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground tabular-nums">{total}</span>{" "}
        events
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums sm:text-sm">
          Page <span className="font-medium text-foreground">{page}</span> of{" "}
          {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}

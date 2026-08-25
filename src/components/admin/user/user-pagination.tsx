"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface UserPaginationProps {
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total number of matching records. */
  total: number;
  /** Number of records per page. */
  limit: number;
  /** Callback when the user picks a page. */
  onPageChange: (page: number) => void;
  /** Additional CSS classes. */
  className?: string;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a compact page list: first, current neighbors, last, with ellipses. */
function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push("ellipsis-start");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("ellipsis-end");
  items.push(totalPages);

  return items;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Responsive pagination with a "Showing X–Y of Z" summary, prev/next buttons
 * and numbered pages (with ellipses for large page counts).
 */
export function UserPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: UserPaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const items = getPageItems(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground sm:text-sm">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {total.toLocaleString()}
        </span>
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {items.map((item, index) =>
          item === "ellipsis-start" || item === "ellipsis-end" ? (
            <span
              key={`${item}-${index}`}
              aria-hidden
              className="flex size-8 items-center justify-center text-muted-foreground"
            >
              <MoreHorizontal className="size-4" />
            </span>
          ) : (
            <Button
              key={item}
              variant={item === page ? "default" : "ghost"}
              size="icon-sm"
              className="size-8"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Go to page ${item}`}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </nav>
    </div>
  );
}

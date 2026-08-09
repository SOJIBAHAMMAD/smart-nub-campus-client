"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type PageItem = number | "ellipsis";

interface VerificationPaginationProps {
  /** Current page (1-indexed). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total number of records across all pages. */
  total: number;
  /** Number of records shown per page. */
  limit: number;
  /** Callback invoked when the user requests a page change. */
  onPageChange: (page: number) => void;
  /** Additional CSS classes. */
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Builds a compact page-number list, collapsing long ranges with an ellipsis so
 * the page controls stay usable for large result sets.
 */
function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const candidates = new Set<number>([1, total]);
  for (let i = current - 2; i <= current + 2; i += 1) {
    if (i >= 2 && i <= total - 1) candidates.add(i);
  }

  const pages = Array.from(candidates).sort((a, b) => a - b);
  const items: PageItem[] = [];
  let previous = 0;
  for (const pageNumber of pages) {
    if (pageNumber - previous > 1) items.push("ellipsis");
    items.push(pageNumber);
    previous = pageNumber;
  }
  return items;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Pagination controls for the verification queue: "Showing X–Y of Z" summary,
 * prev/next buttons and numbered page buttons with disabled states.
 */
export function VerificationPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: VerificationPaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const items = getPageItems(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:gap-2",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground sm:text-sm" role="status">
        Showing <span className="tabular-nums">{from}</span>–
        <span className="tabular-nums">{to}</span> of{" "}
        <span className="font-medium text-foreground tabular-nums">{total}</span>
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden
              className="flex size-8 select-none items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === page ? "default" : "outline"}
              size="icon-sm"
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
          disabled={page === totalPages}
          aria-label="Go to next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </nav>
    </div>
  );
}

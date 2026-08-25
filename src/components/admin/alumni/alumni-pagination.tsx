"use client";

import { Fragment } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AlumniPaginationProps {
  /** Current page (1-indexed). */
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Build a compact page-number list with ellipsis gaps, always anchoring
 * the first and last pages.
 */
function getPageItems(page: number, totalPages: number): (number | "gap")[] {
  const windowSize = 5;
  const start = Math.max(
    2,
    Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize + 1),
  );
  const end = Math.min(totalPages - 1, start + windowSize - 1);

  const items: (number | "gap")[] = [1];
  if (start > 2) items.push("gap");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < totalPages - 1) items.push("gap");
  if (totalPages > 1) items.push(totalPages);
  return items;
}

/**
 * Server-driven pagination for the alumni table: "Showing X–Y of Z",
 * previous/next controls and numbered page buttons.
 */
export function AlumniPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: AlumniPaginationProps) {
  if (totalPages <= 1) return null;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const items = getPageItems(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 sm:flex-row",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {start.toLocaleString()}–{end.toLocaleString()}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {total.toLocaleString()}
        </span>{" "}
        alumni
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1">
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
          typeof item === "number" ? (
            <Button
              key={index}
              variant={item === page ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Go to page ${item}`}
            >
              {item}
            </Button>
          ) : (
            <Fragment key={index}>
              <span className="flex size-8 items-center justify-center">
                <MoreHorizontal className="size-4 text-muted-foreground" />
                <span className="sr-only">More pages</span>
              </span>
            </Fragment>
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

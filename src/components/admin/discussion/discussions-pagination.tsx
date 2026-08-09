"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscussionsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push("ellipsis-start");
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < totalPages - 1) items.push("ellipsis-end");
  items.push(totalPages);

  return items;
}

/**
 * Table footer with a live "Showing X–Y of Z" summary (aria-live so filtered
 * result counts are announced) and paged navigation with page numbers.
 */
export function DiscussionsPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: DiscussionsPaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const items = getPageItems(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p
        role="status"
        aria-live="polite"
        className="text-xs text-muted-foreground sm:text-sm"
      >
        {total === 0 ? (
          "0 discussions"
        ) : (
          <>
            Showing{" "}
            <span className="font-medium text-foreground">
              {from.toLocaleString()}–{to.toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {total.toLocaleString()}
            </span>
          </>
        )}
      </p>

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-center gap-1 sm:justify-end"
        >
          <Button
            variant="outline"
            size="sm"
            className="size-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="size-8 p-0"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {items.map((item) =>
            typeof item === "number" ? (
              <Button
                key={item}
                variant={item === page ? "default" : "ghost"}
                size="sm"
                className="size-8 p-0 text-xs"
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            ) : (
              <span
                key={item}
                aria-hidden="true"
                className="flex h-8 items-center px-1 text-xs text-muted-foreground"
              >
                …
              </span>
            ),
          )}

          <Button
            variant="outline"
            size="sm"
            className="size-8 p-0"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="size-8 p-0"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            aria-label="Go to last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}

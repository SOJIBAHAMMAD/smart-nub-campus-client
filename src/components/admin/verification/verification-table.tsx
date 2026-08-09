"use client";

import { format } from "date-fns";
import { Eye, FileText, Inbox, SearchX, X } from "lucide-react";

import { VerificationStatusBadge } from "@/components/admin/verification/verification-status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminVerificationDetail } from "@/types/admin.types";

// ── Constants ─────────────────────────────────────────────────────────────────

const SKELETON_ROWS = 6;
const MIN_TABLE_WIDTH = "min-w-200";

// ── Props ─────────────────────────────────────────────────────────────────────

interface VerificationTableProps {
  /** Verification rows for the current page. */
  data: AdminVerificationDetail[];
  /** Whether the initial data request is still in flight. */
  isLoading: boolean;
  /** Currently selected row ids. */
  selectedIds: string[];
  /** Whether search/status filters are narrowing the result set. */
  hasActiveFilters: boolean;
  /** Toggle select-all for the current page. */
  onToggleSelectAll: () => void;
  /** Toggle selection for a single row. */
  onToggleSelection: (id: string) => void;
  /** Open the review modal for a row. */
  onReview: (verification: AdminVerificationDetail) => void;
  /** Clear all active filters. */
  onClearFilters: () => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TableSkeleton() {
  return Array.from({ length: SKELETON_ROWS }).map((_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="size-4 rounded-lg" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-14" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-20 rounded-md" />
      </TableCell>
    </TableRow>
  ));
}

function VerificationEmpty({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <Empty className="py-14 sm:py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {hasActiveFilters ? <SearchX className="size-6" /> : <Inbox className="size-6" />}
        </EmptyMedia>
        <EmptyTitle>
          {hasActiveFilters ? "No matching requests" : "No verification requests"}
        </EmptyTitle>
        <EmptyDescription>
          {hasActiveFilters
            ? "No requests match your current search or status filter. Try adjusting or clearing them to see more results."
            : "Verification requests will appear here once students submit their details for review."}
        </EmptyDescription>
      </EmptyHeader>
      {hasActiveFilters && (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="mr-1 size-3.5" />
            Clear filters
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

/** Renders the document count for a request (currently a single ID card). */
function DocumentCount({ verification }: { verification: AdminVerificationDetail }) {
  const count = verification.idCardImage ? 1 : 0;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <FileText className="size-3.5" />
      <span className="tabular-nums">{count}</span>
      <span className="sr-only">
        {count === 1 ? "document" : "documents"}
      </span>
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Presentational table for the verification review queue.
 * Handles skeleton loading rows, the empty state (with filter recovery) and the
 * populated table with selection + review actions. Horizontally scrolls on small
 * screens so every column stays reachable.
 */
export function VerificationTable({
  data,
  isLoading,
  selectedIds,
  hasActiveFilters,
  onToggleSelectAll,
  onToggleSelection,
  onReview,
  onClearFilters,
}: VerificationTableProps) {
  const isSelectAllChecked =
    data.length > 0 && data.every((verification) => selectedIds.includes(verification.id));

  return (
    <div className="w-full overflow-x-auto">
      {isLoading ? (
        <div className={MIN_TABLE_WIDTH}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12" aria-label="Select" />
                <TableHead>Applicant</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton />
            </TableBody>
          </Table>
        </div>
      ) : data.length === 0 ? (
        <VerificationEmpty
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      ) : (
        <div className={MIN_TABLE_WIDTH}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isSelectAllChecked}
                    onCheckedChange={onToggleSelectAll}
                    aria-label="Select all requests on this page"
                  />
                </TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((verification) => {
                const isSelected = selectedIds.includes(verification.id);
                return (
                  <TableRow
                    key={verification.id}
                    data-state={isSelected ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelection(verification.id)}
                        aria-label={`Select ${verification.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          id={verification.id}
                          name={verification.name}
                          className="size-9"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {verification.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {verification.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {verification.studentId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DocumentCount verification={verification} />
                    </TableCell>
                    <TableCell>
                      <time
                        dateTime={verification.createdAt}
                        title={format(
                          new Date(verification.createdAt),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                        className="text-sm text-muted-foreground"
                      >
                        {format(new Date(verification.createdAt), "MMM d, yyyy")}
                      </time>
                    </TableCell>
                    <TableCell>
                      <VerificationStatusBadge status={verification.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReview(verification)}
                        className="h-8"
                      >
                        <Eye className="mr-1 size-4" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

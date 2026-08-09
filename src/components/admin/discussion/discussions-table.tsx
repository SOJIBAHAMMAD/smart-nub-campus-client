"use client";

import { format } from "date-fns";
import { BookOpen, MessageSquare, Pin, XCircle } from "lucide-react";
import type { ListAdminDiscussionsResponse } from "@/types/admin.types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DiscussionMetrics } from "./discussion-metrics";
import { DiscussionRowActions } from "./discussion-row-actions";
import { DiscussionStatusBadge } from "./discussion-status-badge";
import { getDiscussionExcerpt } from "./discussion-utils";

interface DiscussionsTableProps {
  isLoading: boolean;
  data: ListAdminDiscussionsResponse | null;
  selectedIds: string[];
  hasActiveFilters: boolean;
  pinningId: string | null;
  lockingId: string | null;
  onToggleSelectAll: () => void;
  onToggleSelection: (id: string) => void;
  onClearFilters: () => void;
  onView: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onDelete: (id: string) => void;
}

/** Structural loading placeholder so the table layout stays stable. */
function DiscussionsTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10" scope="col">
                <Skeleton className="size-4 rounded-sm" />
              </TableHead>
              <TableHead scope="col">
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead scope="col">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="w-28" scope="col">
                <Skeleton className="mx-auto h-4 w-20" />
              </TableHead>
              <TableHead className="w-40" scope="col">
                <Skeleton className="mx-auto h-4 w-24" />
              </TableHead>
              <TableHead scope="col">
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead className="w-10" scope="col" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="size-4 rounded-sm" />
                </TableCell>
                <TableCell>
                  <div className="max-w-md space-y-1.5">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-7 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="mx-auto h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-3">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto size-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface DiscussionsEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

function DiscussionsEmptyState({
  hasActiveFilters,
  onClearFilters,
}: DiscussionsEmptyStateProps) {
  return (
    <Empty className="min-h-96 rounded-none border-0 p-12 sm:p-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageSquare className="size-6" />
        </EmptyMedia>
        <EmptyTitle>
          {hasActiveFilters
            ? "No discussions match your filters"
            : "No discussions yet"}
        </EmptyTitle>
        <EmptyDescription>
          {hasActiveFilters
            ? "Try adjusting your search or filters, or clear them to see every discussion."
            : "Community discussions will appear here once they are created."}
        </EmptyDescription>
      </EmptyHeader>
      {hasActiveFilters && (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <XCircle className="size-3.5 mr-1" />
            Clear filters
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

/** Author cell: gradient avatar + name with email tooltip. */
function DiscussionAuthor({ discussion }: { discussion: ListAdminDiscussionsResponse["data"][number] }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar
        id={discussion.author.id}
        name={discussion.author.name}
        src={discussion.author.image}
        className="size-7 text-[10px]"
      />
      <Tooltip>
        <TooltipTrigger>
          <span className="block max-w-28 truncate text-sm font-medium text-foreground">
            {discussion.author.name}
          </span>
        </TooltipTrigger>
        <TooltipContent>{discussion.author.email}</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function DiscussionsTable({
  isLoading,
  data,
  selectedIds,
  hasActiveFilters,
  pinningId,
  lockingId,
  onToggleSelectAll,
  onToggleSelection,
  onClearFilters,
  onView,
  onTogglePin,
  onToggleLock,
  onDelete,
}: DiscussionsTableProps) {
  if (isLoading) return <DiscussionsTableSkeleton />;

  if (!data || data.data.length === 0) {
    return (
      <DiscussionsEmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  const allSelected =
    data.data.length > 0 &&
    data.data.every((d) => selectedIds.includes(d.id));

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10" scope="col">
                <Checkbox
                  aria-label="Select all discussions on this page"
                  checked={allSelected}
                  onCheckedChange={onToggleSelectAll}
                />
              </TableHead>
              <TableHead scope="col">Discussion</TableHead>
              <TableHead scope="col">Author</TableHead>
              <TableHead className="text-center" scope="col">
                Status
              </TableHead>
              <TableHead className="text-center" scope="col">
                Activity
              </TableHead>
              <TableHead scope="col">Created</TableHead>
              <TableHead className="w-10" scope="col" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((discussion) => (
              <TableRow key={discussion.id} className="group">
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${discussion.title}`}
                    checked={selectedIds.includes(discussion.id)}
                    onCheckedChange={() => onToggleSelection(discussion.id)}
                  />
                </TableCell>

                <TableCell>
                  <div className="max-w-md min-w-0">
                    <div className="flex items-center gap-1.5">
                      {discussion.isPinned && (
                        <Pin
                          className="size-3 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      )}
                      <p className="truncate text-sm font-medium text-foreground">
                        {discussion.title}
                      </p>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {getDiscussionExcerpt(discussion.content)}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {discussion.category && (
                        <Badge
                          variant="secondary"
                          className="h-4.5 rounded-full px-1.5 text-[10px] font-medium"
                        >
                          {discussion.category.name}
                        </Badge>
                      )}
                      {discussion.course && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <BookOpen className="size-3" />
                          {discussion.course.code}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {discussion.visibility}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <DiscussionAuthor discussion={discussion} />
                </TableCell>

                <TableCell>
                  <DiscussionStatusBadge discussion={discussion} />
                </TableCell>

                <TableCell>
                  <DiscussionMetrics discussion={discussion} />
                </TableCell>

                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {format(new Date(discussion.createdAt), "MMM d, yyyy")}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(new Date(discussion.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <DiscussionRowActions
                    discussion={discussion}
                    pinningId={pinningId}
                    lockingId={lockingId}
                    onView={onView}
                    onTogglePin={onTogglePin}
                    onToggleLock={onToggleLock}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

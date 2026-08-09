"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResourceStatusBadge } from "@/components/admin/resource/resource-status-badge";
import { ResourceSortHeader } from "@/components/admin/resource/resource-sort-header";
import { ResourcePagination } from "@/components/admin/resource/resource-pagination";
import {
  FileIcon,
  getFileColor,
  getFileLabel,
} from "@/components/resources/file-type-utils";
import {
  AlertTriangle,
  Download,
  Eye,
  Loader2,
  MoreHorizontal,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  ThumbsUp,
  Trash2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AdminResource,
  AdminResourceSort,
  ListAdminResourcesResponse,
} from "@/types/admin.types";

const SORT_DIRECTION: Record<AdminResourceSort, "asc" | "desc"> = {
  newest: "desc",
  oldest: "asc",
  downloads: "desc",
  upvotes: "desc",
  reports: "desc",
  views: "desc",
};

interface ResourceTableProps {
  data: ListAdminResourcesResponse | null;
  isLoading: boolean;
  hasActiveFilters: boolean;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  sort: AdminResourceSort;
  onSortChange: (sort: AdminResourceSort) => void;
  verifyingId: string | null;
  onVerifyToggle: (id: string, currentVerified: boolean) => void;
  onDeleteRequest: (id: string) => void;
  onOpenDetail: (resource: AdminResource) => void;
  onDownload: (resource: AdminResource) => void;
  onViewReports: () => void;
  onClearFilters: () => void;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function ResourceTable({
  data,
  isLoading,
  hasActiveFilters,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  sort,
  onSortChange,
  verifyingId,
  onVerifyToggle,
  onDeleteRequest,
  onOpenDetail,
  onDownload,
  onViewReports,
  onClearFilters,
  page,
  limit,
  onPageChange,
}: ResourceTableProps) {
  const rows = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {isLoading ? (
        <ResourceTableSkeleton />
      ) : rows.length === 0 ? (
        <ResourceEmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      ) : (
        <>
          <div className="max-h-[60vh] overflow-auto scrollbar-none">
            <div className="min-w-5xl">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm dark:bg-muted/80">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          rows.length > 0 &&
                          rows.every((r) => selectedIds.includes(r.id))
                        }
                        onCheckedChange={onToggleSelectAll}
                        aria-label="Select all resources on this page"
                      />
                    </TableHead>
                    <TableHead className="min-w-55">Resource</TableHead>
                    <TableHead className="min-w-32.5">Uploader</TableHead>
                    <TableHead className="min-w-30">Category</TableHead>
                    <TableHead
                      className="text-right"
                      aria-sort={sort === "downloads" ? "descending" : "none"}
                    >
                      <div className="flex justify-end">
                        <ResourceSortHeader
                          label="Downloads"
                          active={sort === "downloads"}
                          direction={SORT_DIRECTION[sort]}
                          onClick={() => onSortChange("downloads")}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Engagement</TableHead>
                    <TableHead
                      className="text-right"
                      aria-sort={sort === "reports" ? "descending" : "none"}
                    >
                      <div className="flex justify-end">
                        <ResourceSortHeader
                          label="Reports"
                          active={sort === "reports"}
                          direction={SORT_DIRECTION[sort]}
                          onClick={() => onSortChange("reports")}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-27.5">Status</TableHead>
                    <TableHead
                      className="min-w-27.5"
                      aria-sort={
                        sort === "newest" || sort === "oldest"
                          ? sort === "oldest"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <ResourceSortHeader
                        label="Created"
                        active={sort === "newest" || sort === "oldest"}
                        direction={SORT_DIRECTION[sort]}
                        onClick={() =>
                          onSortChange(sort === "newest" ? "oldest" : "newest")
                        }
                      />
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((resource) => (
                    <ResourceRow
                      key={resource.id}
                      resource={resource}
                      selected={selectedIds.includes(resource.id)}
                      verifying={verifyingId === resource.id}
                      onToggle={() => onToggleSelection(resource.id)}
                      onVerifyToggle={onVerifyToggle}
                      onDeleteRequest={onDeleteRequest}
                      onOpenDetail={onOpenDetail}
                      onDownload={onDownload}
                      onViewReports={onViewReports}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <ResourcePagination
            page={page}
            totalPages={totalPages}
            limit={limit}
            total={total}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}

interface ResourceRowProps {
  resource: AdminResource;
  selected: boolean;
  verifying: boolean;
  onToggle: () => void;
  onVerifyToggle: (id: string, currentVerified: boolean) => void;
  onDeleteRequest: (id: string) => void;
  onOpenDetail: (resource: AdminResource) => void;
  onDownload: (resource: AdminResource) => void;
  onViewReports: () => void;
}

function ResourceRow({
  resource,
  selected,
  verifying,
  onToggle,
  onVerifyToggle,
  onDeleteRequest,
  onOpenDetail,
  onDownload,
  onViewReports,
}: ResourceRowProps) {
  const fileColor = getFileColor(resource.fileType);
  const fileLabel = getFileLabel(resource.fileType);

  return (
    <TableRow
      className="cursor-pointer transition-colors"
      onClick={() => onOpenDetail(resource)}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${resource.title}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-black/5 dark:ring-white/10",
              fileColor,
            )}
          >
            <FileIcon fileType={resource.fileType} className="size-4" />
          </div>
          <div className="min-w-0">
            <Tooltip>
              <TooltipTrigger>
                <p className="max-w-52 truncate text-sm font-medium">
                  {resource.title}
                </p>
              </TooltipTrigger>
              <TooltipContent>{resource.title}</TooltipContent>
            </Tooltip>
            <p className="text-[10px] font-mono text-muted-foreground">
              {fileLabel} · {resource.course.code}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar
            id={resource.uploader.id}
            name={resource.uploader.name}
            className="size-6 text-[10px]"
          />
          <Tooltip>
            <TooltipTrigger>
              <span className="block max-w-24 truncate text-sm">
                {resource.uploader.name}
              </span>
            </TooltipTrigger>
            <TooltipContent>{resource.uploader.email}</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className="max-w-36 justify-start text-xs font-medium"
        >
          <span className="truncate">{resource.category.name}</span>
        </Badge>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
          <Download className="size-3.5 shrink-0" />
          {resource.downloadCount.toLocaleString()}
        </span>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Tooltip>
            <TooltipTrigger>
              <span className="inline-flex items-center gap-1 text-xs tabular-nums">
                <ThumbsUp className="size-3" />
                {resource.upvoteCount.toLocaleString()}
              </span>
            </TooltipTrigger>
            <TooltipContent>Upvotes</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <span className="inline-flex items-center gap-1 text-xs tabular-nums">
                <Eye className="size-3" />
                {resource.viewCount.toLocaleString()}
              </span>
            </TooltipTrigger>
            <TooltipContent>Views</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        {resource.reportCount > 0 ? (
          <button
            type="button"
            onClick={onViewReports}
            aria-label={`View ${resource.reportCount} reports`}
            className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-sm font-medium tabular-nums text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AlertTriangle className="size-3.5 shrink-0" />
            {resource.reportCount.toLocaleString()}
          </button>
        ) : (
          <span className="inline-flex items-center justify-end gap-1 text-sm tabular-nums text-muted-foreground">
            <AlertTriangle className="size-3.5 shrink-0" />0
          </span>
        )}
      </TableCell>
      <TableCell>
        <ResourceStatusBadge verified={resource.isVerified} />
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger>
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {format(new Date(resource.createdAt), "MMM d, yyyy")}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {format(new Date(resource.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Actions for ${resource.title}`}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onOpenDetail(resource)}>
              <Eye className="mr-2 size-3.5" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(resource)}>
              <Download className="mr-2 size-3.5" />
              Download
            </DropdownMenuItem>
            {resource.reportCount > 0 && (
              <DropdownMenuItem onClick={onViewReports}>
                <AlertTriangle className="mr-2 size-3.5" />
                View Reports ({resource.reportCount})
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onVerifyToggle(resource.id, resource.isVerified)}
              disabled={verifying}
            >
              {verifying ? (
                <Loader2 className="mr-2 size-3.5 animate-spin" />
              ) : resource.isVerified ? (
                <ShieldAlert className="mr-2 size-3.5" />
              ) : (
                <ShieldCheck className="mr-2 size-3.5" />
              )}
              {resource.isVerified ? "Unverify" : "Verify"}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteRequest(resource.id)}
            >
              <Trash2 className="mr-2 size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function ResourceEmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="p-12 sm:p-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {hasActiveFilters ? (
              <SearchX className="size-6" />
            ) : (
              <FileIcon fileType="" className="size-6" />
            )}
          </EmptyMedia>
          <EmptyTitle>
            {hasActiveFilters ? "No matching resources" : "No resources yet"}
          </EmptyTitle>
          <EmptyDescription>
            {hasActiveFilters
              ? "No resources match your current filters. Try adjusting or clearing them."
              : "Resources uploaded by students and staff will appear here once published."}
          </EmptyDescription>
        </EmptyHeader>
        {hasActiveFilters && (
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <XCircle className="mr-1.5 size-3.5" />
              Clear all filters
            </Button>
          </EmptyContent>
        )}
      </Empty>
    </div>
  );
}

function ResourceTableSkeleton() {
  return (
    <div className="max-h-[60vh] overflow-auto scrollbar-none">
      <div className="min-w-5xl">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className={cn(i === 0 ? "size-4" : "h-3.5 w-16")} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 10 }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton
                      className={cn(
                        colIndex === 0
                          ? "size-4"
                          : colIndex === 1
                            ? "h-4 w-48"
                            : colIndex === 2
                              ? "h-4 w-24"
                              : colIndex === 5
                                ? "h-4 w-24"
                                : "h-4 w-16",
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

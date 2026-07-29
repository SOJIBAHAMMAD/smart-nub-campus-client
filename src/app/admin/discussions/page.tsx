"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { adminService } from "@/services/admin.service";
import { BulkActions } from "@/components/admin/bulk-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  Loader2,
  MoreHorizontal,
  Eye,
  Pin,
  Lock,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  ArrowUpDown,
  XCircle,
  Ban,
} from "lucide-react";
import type {
  AdminDiscussion,
  ListAdminDiscussionsResponse,
  AdminDiscussionSort,
  AdminDiscussionStatus,
} from "@/types/admin.types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

const SORT_OPTIONS: { value: AdminDiscussionSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Upvoted" },
  { value: "replies", label: "Most Replies" },
];

const STATUS_OPTIONS: { value: AdminDiscussionStatus; label: string }[] = [
  { value: "all", label: "All Discussions" },
  { value: "pinned", label: "Pinned" },
  { value: "locked", label: "Locked" },
  { value: "solved", label: "Solved" },
];

export default function AdminDiscussionsPage() {
  const [data, setData] = useState<ListAdminDiscussionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminDiscussionStatus>("all");
  const [sort, setSort] = useState<AdminDiscussionSort>("newest");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Actions
  const [pinningId, setPinningId] = useState<string | null>(null);
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<"pin" | "lock" | "delete" | null>(null);
  const [bulkPinValue, setBulkPinValue] = useState(false);
  const [bulkLockValue, setBulkLockValue] = useState(false);

  const limit = 10;

  const fetchDiscussions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.listDiscussions({
        page,
        limit,
        search: search || undefined,
        status: statusFilter,
        sort,
      });
      setData(result);
    } catch {
      toast.error("Failed to load discussions");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, sort]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    setPinningId(id);
    try {
      await adminService.togglePin(id);
      toast.success(currentPinned ? "Discussion unpinned" : "Discussion pinned");
      fetchDiscussions();
    } catch {
      toast.error("Failed to toggle pin");
    } finally {
      setPinningId(null);
    }
  };

  const handleToggleLock = async (id: string, currentLocked: boolean) => {
    setLockingId(id);
    try {
      await adminService.toggleLock(id);
      toast.success(currentLocked ? "Discussion unlocked" : "Discussion locked");
      fetchDiscussions();
    } catch {
      toast.error("Failed to toggle lock");
    } finally {
      setLockingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteDiscussion(id);
      toast.success("Discussion deleted");
      setDeleteTarget(null);
      fetchDiscussions();
    } catch {
      toast.error("Failed to delete discussion");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters = search || statusFilter !== "all" || sort !== "newest";

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (!data) return;
    const allIds = data.data.map((d) => d.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Discussions</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage discussions, pin/lock, and moderate content
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <div className="relative min-w-0 w-full sm:w-auto sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search discussions..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val as AdminDiscussionStatus);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(val) => setSort(val as AdminDiscussionSort)}
            >
              <SelectTrigger className="w-38.75 shrink-0">
                <ArrowUpDown className="size-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground shrink-0"
              >
                <XCircle className="size-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          actions={[
            {
              label: "Pin",
              icon: Pin,
              variant: "outline",
              onClick: () => {
                setBulkPinValue(true);
                setBulkAction("pin");
              },
            },
            {
              label: "Unpin",
              icon: Pin,
              variant: "outline",
              onClick: () => {
                setBulkPinValue(false);
                setBulkAction("pin");
              },
            },
            {
              label: "Lock",
              icon: Lock,
              variant: "outline",
              onClick: () => {
                setBulkLockValue(true);
                setBulkAction("lock");
              },
            },
            {
              label: "Unlock",
              icon: Lock,
              variant: "outline",
              onClick: () => {
                setBulkLockValue(false);
                setBulkAction("lock");
              },
            },
            {
              label: "Delete",
              icon: Ban,
              variant: "destructive",
              onClick: () => setBulkAction("delete"),
            },
          ]}
        />

        {/* Table */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden dark:bg-gray-800">
          {isLoading ? (
            <div className="p-4 sm:p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="p-12 sm:p-16 text-center">
              <MessageSquare className="size-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium">No discussions found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "Discussions will appear here once created"}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            data.data.length > 0 &&
                            data.data.every((d) => selectedIds.includes(d.id))
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Stats</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((discussion) => (
                      <TableRow key={discussion.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(discussion.id)}
                            onCheckedChange={() => toggleSelection(discussion.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-0 max-w-xs">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {discussion.isPinned && (
                                  <Pin className="size-3 inline mr-1 text-primary shrink-0" />
                                )}
                                {discussion.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {discussion.course
                                  ? discussion.course.code
                                  : "No course"}
                                {" · "}
                                {discussion.visibility}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{discussion.author.name}</span>
                        </TableCell>
                        <TableCell>
                          {discussion.category ? (
                            <Badge variant="secondary" className="text-[10px]">
                              {discussion.category.name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {discussion.isPinned && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Pin className="size-3.5 text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>Pinned</TooltipContent>
                              </Tooltip>
                            )}
                            {discussion.isLocked && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Lock className="size-3.5 text-amber-600" />
                                </TooltipTrigger>
                                <TooltipContent>Locked</TooltipContent>
                              </Tooltip>
                            )}
                            {discussion.isSolved && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <CheckCircle className="size-3.5 text-green-600" />
                                </TooltipTrigger>
                                <TooltipContent>Solved</TooltipContent>
                              </Tooltip>
                            )}
                            {!discussion.isPinned &&
                              !discussion.isLocked &&
                              !discussion.isSolved && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-3 text-muted-foreground">
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="inline-flex items-center gap-1 text-xs">
                                  <MessageSquare className="size-3" />
                                  {discussion.replyCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Replies</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="inline-flex items-center gap-1 text-xs">
                                  <ThumbsUp className="size-3" />
                                  {discussion.upvoteCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Upvotes</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="inline-flex items-center gap-1 text-xs">
                                  <Eye className="size-3" />
                                  {discussion.viewCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Views</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(discussion.createdAt), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                />
                              }
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(
                                    `/discussions/${discussion.id}`,
                                    "_blank",
                                  )
                                }
                              >
                                <ExternalLink className="size-3.5 mr-2" />
                                View Discussion
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleTogglePin(discussion.id, discussion.isPinned)
                                }
                                disabled={pinningId === discussion.id}
                              >
                                {pinningId === discussion.id ? (
                                  <Loader2 className="size-3.5 mr-2 animate-spin" />
                                ) : (
                                  <Pin className="size-3.5 mr-2" />
                                )}
                                {discussion.isPinned ? "Unpin" : "Pin"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleLock(discussion.id, discussion.isLocked)
                                }
                                disabled={lockingId === discussion.id}
                              >
                                {lockingId === discussion.id ? (
                                  <Loader2 className="size-3.5 mr-2 animate-spin" />
                                ) : (
                                  <Lock className="size-3.5 mr-2" />
                                )}
                                {discussion.isLocked ? "Unlock" : "Lock"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(discussion.id)}
                              >
                                <Trash2 className="size-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {data && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t px-4 py-3">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1}–
                {Math.min(page * limit, data.meta.total)} of {data.meta.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs sm:text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Single Delete Confirm */}
        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title="Delete Discussion"
          description="Are you sure you want to delete this discussion? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => {
            if (deleteTarget) handleDelete(deleteTarget);
          }}
        />

        {/* Bulk Action Confirm */}
        <ConfirmDialog
          open={bulkAction !== null}
          onOpenChange={(open) => {
            if (!open) setBulkAction(null);
          }}
          title={
            bulkAction === "delete"
              ? "Delete Discussions"
              : bulkAction === "pin"
                ? bulkPinValue
                  ? "Pin Discussions"
                  : "Unpin Discussions"
                : bulkLockValue
                  ? "Lock Discussions"
                  : "Unlock Discussions"
          }
          description={`Are you sure you want to ${bulkAction === "delete" ? "delete" : bulkAction === "pin" ? (bulkPinValue ? "pin" : "unpin") : (bulkLockValue ? "lock" : "unlock")} ${selectedIds.length} selected discussion${selectedIds.length === 1 ? "" : "s"}?`}
          confirmLabel={
            bulkAction === "delete"
              ? "Delete"
              : bulkAction === "pin"
                ? bulkPinValue ? "Pin" : "Unpin"
                : bulkLockValue ? "Lock" : "Unlock"
          }
          confirmVariant={bulkAction === "delete" ? "destructive" : "default"}
          onConfirm={async () => {
            if (!bulkAction) return;
            try {
              if (bulkAction === "delete") {
                await adminService.bulkDeleteDiscussions(selectedIds);
                toast.success(`${selectedIds.length} discussions deleted`);
              } else if (bulkAction === "pin") {
                await adminService.bulkTogglePin(selectedIds, bulkPinValue);
                toast.success(`${selectedIds.length} discussions ${bulkPinValue ? "pinned" : "unpinned"}`);
              } else if (bulkAction === "lock") {
                await adminService.bulkToggleLock(selectedIds, bulkLockValue);
                toast.success(`${selectedIds.length} discussions ${bulkLockValue ? "locked" : "unlocked"}`);
              }
              setSelectedIds([]);
              setBulkAction(null);
              fetchDiscussions();
            } catch {
              toast.error("Bulk action failed");
            }
          }}
        />
      </div>
    </TooltipProvider>
  );
}

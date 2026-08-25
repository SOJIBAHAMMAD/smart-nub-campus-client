"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Lock, MessageSquare, Pin } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import type {
  AdminDiscussionSort,
  AdminDiscussionStatus,
  ListAdminDiscussionsResponse,
} from "@/types/admin.types";
import { BulkActions } from "@/components/admin/bulk-actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DiscussionsFilterBar } from "@/components/admin/discussion/discussions-filter-bar";
import { DiscussionsPagination } from "@/components/admin/discussion/discussions-pagination";
import { DiscussionsTable } from "@/components/admin/discussion/discussions-table";

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
  const [bulkAction, setBulkAction] = useState<
    "pin" | "lock" | "delete" | null
  >(null);
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

  const hasActiveFilters =
    Boolean(search) || statusFilter !== "all" || sort !== "newest";

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

  const openDiscussion = (id: string) => {
    window.open(`/discussions/${id}`, "_blank");
  };

  const totalPages = data?.meta.totalPages ?? 1;
  const totalDiscussions = data?.meta.total ?? 0;

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Discussions</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Moderate, pin, lock, and review community discussions
            </p>
          </div>
          {data && !isLoading && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <MessageSquare className="size-3" />
              {totalDiscussions.toLocaleString()}{" "}
              {totalDiscussions === 1 ? "discussion" : "discussions"}
            </span>
          )}
        </div>

        {/* Filters */}
        <DiscussionsFilterBar
          search={search}
          statusFilter={statusFilter}
          sort={sort}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          onSortChange={(value) => setSort(value)}
          onClear={clearFilters}
        />

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
        <Card className="overflow-hidden shadow-none">
          <DiscussionsTable
            isLoading={isLoading}
            data={data}
            selectedIds={selectedIds}
            hasActiveFilters={hasActiveFilters}
            pinningId={pinningId}
            lockingId={lockingId}
            onToggleSelectAll={toggleSelectAll}
            onToggleSelection={toggleSelection}
            onClearFilters={clearFilters}
            onView={openDiscussion}
            onTogglePin={handleTogglePin}
            onToggleLock={handleToggleLock}
            onDelete={(id) => setDeleteTarget(id)}
          />

          {data && totalDiscussions > 0 && (
            <DiscussionsPagination
              page={page}
              totalPages={totalPages}
              total={totalDiscussions}
              limit={limit}
              onPageChange={setPage}
            />
          )}
        </Card>

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
                ? bulkPinValue
                  ? "Pin"
                  : "Unpin"
                : bulkLockValue
                  ? "Lock"
                  : "Unlock"
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
                toast.success(
                  `${selectedIds.length} discussions ${bulkPinValue ? "pinned" : "unpinned"}`,
                );
              } else if (bulkAction === "lock") {
                await adminService.bulkToggleLock(selectedIds, bulkLockValue);
                toast.success(
                  `${selectedIds.length} discussions ${bulkLockValue ? "locked" : "unlocked"}`,
                );
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

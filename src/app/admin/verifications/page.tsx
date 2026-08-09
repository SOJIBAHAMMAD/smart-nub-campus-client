"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Search, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import { BulkActions } from "@/components/admin/bulk-actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { VerificationPagination } from "@/components/admin/verification/verification-pagination";
import { VerificationTable } from "@/components/admin/verification/verification-table";
import { VerificationReviewModal } from "@/components/admin/verification-review-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VerificationStatus } from "@/constants/enums";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import type {
  AdminVerificationDetail,
  ListAdminVerificationsResponse,
} from "@/types/admin.types";

// ── Page Component ───────────────────────────────────────────────────────────

/**
 * Verification management page for admins.
 * Shows a review queue of verification requests with search, status filtering,
 * bulk actions and a review modal for deciding each request.
 */
export default function VerificationsPage() {
  const [data, setData] = useState<ListAdminVerificationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal state
  const [reviewingVerification, setReviewingVerification] =
    useState<AdminVerificationDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | null>(null);

  const limit = 10;

  /** Fetch verifications from the API. */
  const fetchVerifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.listVerifications({
        page,
        limit,
        status:
          statusFilter === "all"
            ? undefined
            : (statusFilter as VerificationStatus),
        search: search || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setData(result);
    } catch {
      toast.error("Failed to load verification requests");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  /** Handle approve verification. */
  const handleApprove = async (id: string) => {
    try {
      await adminService.approveVerification(id);
      toast.success("Verification approved successfully");
      fetchVerifications();
    } catch {
      toast.error("Failed to approve verification");
    }
  };

  /** Handle reject verification. */
  const handleReject = async (id: string, note: string) => {
    try {
      await adminService.rejectVerification(id, note);
      toast.success("Verification rejected");
      fetchVerifications();
    } catch {
      toast.error("Failed to reject verification");
    }
  };

  /** Open review modal for a verification. */
  const openReview = async (id: string) => {
    try {
      const detail = await adminService.getVerificationById(id);
      setReviewingVerification(detail);
      setIsModalOpen(true);
    } catch {
      toast.error("Failed to load verification details");
    }
  };

  /** Toggle checkbox selection. */
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  /** Toggle select all on current page. */
  const toggleSelectAll = () => {
    if (!data) return;
    const allIds = data.data.map((v) => v.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  // ── Filter helpers ────────────────────────────────────────────────────────

  const hasActiveFilters = statusFilter !== "all" || search.trim() !== "";
  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) + (search.trim() !== "" ? 1 : 0);

  /** Reset search, status filter and page to their defaults. */
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
    setSelectedIds([]);
  };

  /**
   * Move to a page. Selection is scoped to the currently visible rows, so it is
   * cleared on navigation to avoid accidentally acting on off-screen rows.
   */
  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    setSelectedIds([]);
  };

  /** Update search, resetting to page 1 and clearing the selection. */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    setSelectedIds([]);
  };

  /** Update the status filter, resetting to page 1 and clearing the selection. */
  const handleStatusChange = (value: string) => {
    setStatusFilter(value ?? "all");
    setPage(1);
    setSelectedIds([]);
  };

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            Verification Requests
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Review and manage student verification requests
          </p>
        </div>
        {data && (
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground sm:text-sm">
            <span className="font-semibold text-foreground tabular-nums">
              {data.meta.total}
            </span>
            total request{data.meta.total === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => handleStatusChange(val ?? "all")}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-fit shrink-0 text-muted-foreground"
          >
            <X className="mr-1 size-3.5" />
            Clear filters
            <span
              className={cn(
                "ml-1 rounded-full bg-muted px-1.5 text-xs tabular-nums",
              )}
            >
              {activeFilterCount}
            </span>
          </Button>
        )}
      </div>

      {/* ── Bulk Actions ──────────────────────────────────────────────── */}
      <BulkActions
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        actions={[
          {
            label: "Approve",
            icon: ShieldCheck,
            variant: "default",
            onClick: () => setBulkAction("approve"),
          },
          {
            label: "Reject",
            icon: Ban,
            variant: "destructive",
            onClick: () => setBulkAction("reject"),
          },
        ]}
      />

      {/* ── Table + Pagination ────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <VerificationTable
          data={data?.data ?? []}
          isLoading={isLoading}
          selectedIds={selectedIds}
          hasActiveFilters={hasActiveFilters}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelection={toggleSelection}
          onReview={(verification) => openReview(verification.id)}
          onClearFilters={clearFilters}
        />
        {data && (
          <VerificationPagination
            page={page}
            totalPages={totalPages}
            total={data.meta.total}
            limit={limit}
            onPageChange={goToPage}
          />
        )}
      </div>

      {/* ── Review Modal ───────────────────────────────────────────────── */}
      <VerificationReviewModal
        verification={reviewingVerification}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReviewingVerification(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <ConfirmDialog
        open={bulkAction !== null}
        onOpenChange={(open) => {
          if (!open) setBulkAction(null);
        }}
        title={
          bulkAction === "approve"
            ? "Approve Verifications"
            : "Reject Verifications"
        }
        description={`Are you sure you want to ${bulkAction} ${selectedIds.length} selected verification${selectedIds.length === 1 ? "" : "s"}?`}
        confirmLabel={bulkAction === "approve" ? "Approve" : "Reject"}
        confirmVariant={bulkAction === "reject" ? "destructive" : "default"}
        onConfirm={async () => {
          if (!bulkAction) return;
          for (const id of selectedIds) {
            try {
              if (bulkAction === "approve") {
                await adminService.approveVerification(id);
              } else {
                await adminService.rejectVerification(id, "Bulk rejection");
              }
            } catch {
              // Continue with other verifications
            }
          }
          toast.success(
            `${selectedIds.length} verifications ${bulkAction === "approve" ? "approved" : "rejected"}`,
          );
          setSelectedIds([]);
          setBulkAction(null);
          fetchVerifications();
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { adminService } from "@/services/admin.service";
import { VerificationReviewModal } from "@/components/admin/verification-review-modal";
import { BulkActions } from "@/components/admin/bulk-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, Eye, Ban, ShieldCheck } from "lucide-react";
import { VerificationStatus } from "@/constants/enums";
import type {
  AdminVerificationDetail,
  ListAdminVerificationsResponse,
} from "@/types/admin.types";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

// ── Page Component ───────────────────────────────────────────────────────────

/**
 * Verification management page for admins.
 * Shows pending verification requests with review modal.
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

  /** Get status badge for verification status. */
  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return (
          <Badge variant="outline" className="border-amber-300 text-amber-700">
            Pending
          </Badge>
        );
      case VerificationStatus.APPROVED:
        return (
          <Badge variant="outline" className="border-green-300 text-green-700">
            Approved
          </Badge>
        );
      case VerificationStatus.REJECTED:
        return (
          <Badge variant="outline" className="border-red-300 text-red-700">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold">Verification Requests</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage student verification requests
        </p>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
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

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden dark:bg-gray-800">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No verification requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-700/50 text-left text-sm text-muted-foreground">
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={
                        data.data.length > 0 &&
                        data.data.every((v) => selectedIds.includes(v.id))
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Student ID</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((verification) => (
                  <tr
                    key={verification.id}
                    className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(verification.id)}
                        onCheckedChange={() => toggleSelection(verification.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">
                        {verification.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono">
                        {verification.studentId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {verification.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(verification.createdAt), "MMM d, yyyy")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(verification.status)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openReview(verification.id)}
                        className="h-8"
                      >
                        <Eye className="size-4 mr-1" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
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
              <span className="text-sm">
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
        onOpenChange={(open) => { if (!open) setBulkAction(null); }}
        title={bulkAction === "approve" ? "Approve Verifications" : "Reject Verifications"}
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
          toast.success(`${selectedIds.length} verifications ${bulkAction === "approve" ? "approved" : "rejected"}`);
          setSelectedIds([]);
          setBulkAction(null);
          fetchVerifications();
        }}
      />
    </div>
  );
}

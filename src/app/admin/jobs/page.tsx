"use client";

import { useEffect, useState, useCallback } from "react";
import { Briefcase } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { JobsFilterBar } from "@/components/admin/job/jobs-filter-bar";
import { JobsPagination } from "@/components/admin/job/jobs-pagination";
import { JobsTable } from "@/components/admin/job/jobs-table";
import type {
  ListAdminJobsResponse,
  ListAdminJobsParams,
} from "@/types/admin.types";
import { toast } from "sonner";

export default function AdminJobsPage() {
  const [data, setData] = useState<ListAdminJobsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const limit = 10;

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ListAdminJobsParams = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : (statusFilter as "OPEN" | "FILLED" | "CLOSED"),
        isVerified:
          verifiedFilter === "all"
            ? undefined
            : verifiedFilter === "verified",
      };
      const result = await adminService.listJobs(params);
      setData(result);
    } catch {
      toast.error("Failed to load job posts");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, verifiedFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleVerifiedChange = (value: string) => {
    setVerifiedFilter(value);
    setPage(1);
  };

  const handleVerifyToggle = async (id: string, currentVerified: boolean) => {
    setVerifyingId(id);
    try {
      await adminService.verifyJob(id, !currentVerified);
      toast.success(currentVerified ? "Job unverified" : "Job verified");
      fetchJobs();
    } catch {
      toast.error("Failed to update job");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteJob(id);
      toast.success("Job post deleted");
      setDeleteTarget(null);
      fetchJobs();
    } catch {
      toast.error("Failed to delete job post");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setVerifiedFilter("all");
    setPage(1);
  };

  const hasActiveFilters = !!search || statusFilter !== "all" || verifiedFilter !== "all";
  const meta = data?.meta;

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Posts</h1>
          <p className="text-sm text-muted-foreground">
            Review and moderate alumni job postings
          </p>
        </div>
        {meta && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Briefcase className="size-3.5" />
            {meta.total.toLocaleString()} job{meta.total === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <JobsFilterBar
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        verifiedFilter={verifiedFilter}
        onVerifiedChange={handleVerifiedChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border bg-background">
        <JobsTable
          isLoading={isLoading}
          data={data}
          hasActiveFilters={hasActiveFilters}
          verifyingId={verifyingId}
          onClearFilters={clearFilters}
          onVerifyToggle={handleVerifyToggle}
          onDelete={(id) => setDeleteTarget(id)}
        />
        {meta && !isLoading && meta.total > 0 && (
          <JobsPagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={limit}
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete job post?"
        description="This will permanently remove the job post and its applications. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
      />
    </div>
  );
}

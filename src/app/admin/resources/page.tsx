"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { ResourceStatsCards } from "@/components/admin/resource-stats-cards";
import { ResourceDetailSheet } from "@/components/admin/resource-detail-sheet";
import { ResourceFilters } from "@/components/admin/resource/resource-filters";
import { ResourceTable } from "@/components/admin/resource/resource-table";
import { ResourceReportsDialog } from "@/components/admin/resource/resource-reports-dialog";
import { BulkActions } from "@/components/admin/bulk-actions";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Ban, FileStack, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type {
  AdminReportStatus,
  AdminResource,
  AdminResourceCategory,
  AdminResourceReport,
  AdminResourceSort,
  AdminCourse,
  ListAdminResourcesParams,
  ListAdminResourcesResponse,
} from "@/types/admin.types";

export default function ResourcesPage() {
  const [data, setData] = useState<ListAdminResourcesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState<AdminResourceSort>("newest");

  // Filter options
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [categories, setCategories] = useState<AdminResourceCategory[]>([]);

  // Stats (derived from data)
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    totalDownloads: 0,
    totalReports: 0,
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detail sheet
  const [viewingResource, setViewingResource] = useState<AdminResource | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Actions
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<
    "verify" | "unverify" | "delete" | null
  >(null);

  // Reports
  const [reports, setReports] = useState<AdminResourceReport[]>([]);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reviewingReportId, setReviewingReportId] = useState<string | null>(
    null,
  );

  const limit = 10;

  // Fetch filter options on mount
  useEffect(() => {
    adminService
      .listCourses(1, 200)
      .then((res) => setCourses(res.data))
      .catch(() => {});
    adminService
      .listResourceCategories(1, 200)
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ListAdminResourcesParams = {
        page,
        limit,
        search: search || undefined,
        isVerified:
          verifiedFilter === "all" ? undefined : verifiedFilter === "verified",
        courseId: courseFilter === "all" ? undefined : courseFilter,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        sort,
      };
      const result = await adminService.listResources(params);
      setData(result);

      // Derive stats from current page + meta
      setStats((prev) => ({
        ...prev,
        total: result.meta.total,
      }));
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, verifiedFilter, courseFilter, categoryFilter, sort]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Compute page-level stats from loaded data
  useEffect(() => {
    if (!data) return;
    const verified = data.data.filter((r) => r.isVerified).length;
    const unverified = data.data.filter((r) => !r.isVerified).length;
    const totalDownloads = data.data.reduce(
      (sum, r) => sum + r.downloadCount,
      0,
    );
    const totalReports = data.data.reduce((sum, r) => sum + r.reportCount, 0);
    setStats((prev) => ({
      ...prev,
      verified,
      unverified,
      totalDownloads,
      totalReports,
    }));
  }, [data]);

  const handleVerifyToggle = async (id: string, currentVerified: boolean) => {
    setVerifyingId(id);
    try {
      await adminService.verifyResource(id, !currentVerified);
      toast.success(
        currentVerified ? "Resource unverified" : "Resource verified",
      );
      fetchResources();
    } catch {
      toast.error("Failed to update resource");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteResource(id);
      toast.success("Resource deleted");
      setDeleteTarget(null);
      setIsSheetOpen(false);
      setViewingResource(null);
      fetchResources();
    } catch {
      toast.error("Failed to delete resource");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setVerifiedFilter("all");
    setCourseFilter("all");
    setCategoryFilter("all");
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search ||
      verifiedFilter !== "all" ||
      courseFilter !== "all" ||
      categoryFilter !== "all" ||
      sort !== "newest",
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (!data) return;
    const allIds = data.data.map((r) => r.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  const openDetail = (resource: AdminResource) => {
    setViewingResource(resource);
    setIsSheetOpen(true);
  };

  const handleOpenFile = async (resource: AdminResource) => {
    try {
      const ext = (resource.fileType.split("/").pop() ?? "")
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();
      const safeTitle = resource.title
        .replace(/[^a-z0-9\s-]/gi, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 60);
      const filename = `${safeTitle || "resource"}${ext ? `.${ext}` : ""}`;

      const response = await fetch(resource.fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Failed to open file");
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    setIsReportsOpen(true);
    try {
      const result = await adminService.listReports(1, 50);
      setReports(result.data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setReportsLoading(false);
    }
  };

  const handleReviewReport = async (
    id: string,
    status: AdminReportStatus,
  ) => {
    setReviewingReportId(id);
    try {
      await adminService.reviewReport(id, status);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Report ${status.toLowerCase().replace("_", " ")}`);
      fetchResources();
    } catch {
      toast.error("Failed to review report");
    } finally {
      setReviewingReportId(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Resources
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Manage, verify, and moderate platform resources
            </p>
          </div>
          {data && (
            <Badge
              variant="secondary"
              className="gap-1.5 px-2.5 py-1 text-xs"
            >
              <FileStack className="size-3" />
              {data.meta.total.toLocaleString()}{" "}
              {data.meta.total === 1 ? "resource" : "resources"}
            </Badge>
          )}
        </div>

        {/* Stats Overview */}
        <ResourceStatsCards
          total={stats.total}
          verified={stats.verified}
          unverified={stats.unverified}
          totalDownloads={stats.totalDownloads}
          totalReports={stats.totalReports}
          onReportsClick={stats.totalReports > 0 ? fetchReports : undefined}
        />

        {/* Filters */}
        <ResourceFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          verifiedFilter={verifiedFilter}
          onVerifiedFilterChange={(value) => {
            setVerifiedFilter(value);
            setPage(1);
          }}
          courseFilter={courseFilter}
          onCourseFilterChange={(value) => {
            setCourseFilter(value);
            setPage(1);
          }}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={(value) => {
            setCategoryFilter(value);
            setPage(1);
          }}
          sort={sort}
          onSortChange={(value) => setSort(value)}
          courses={courses}
          categories={categories}
          resultCount={data?.meta.total}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          actions={[
            {
              label: "Verify",
              icon: ShieldCheck,
              variant: "default",
              onClick: () => setBulkAction("verify"),
            },
            {
              label: "Unverify",
              icon: ShieldAlert,
              variant: "outline",
              onClick: () => setBulkAction("unverify"),
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
        <ResourceTable
          data={data}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onToggleSelectAll={toggleSelectAll}
          sort={sort}
          onSortChange={(value) => setSort(value)}
          verifyingId={verifyingId}
          onVerifyToggle={handleVerifyToggle}
          onDeleteRequest={(id) => setDeleteTarget(id)}
          onOpenDetail={openDetail}
          onDownload={handleOpenFile}
          onViewReports={fetchReports}
          onClearFilters={clearFilters}
          page={page}
          limit={limit}
          onPageChange={setPage}
        />

        {/* Detail Sheet */}
        <ResourceDetailSheet
          resource={viewingResource}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onVerifyToggle={handleVerifyToggle}
          onDelete={(id) => setDeleteTarget(id)}
          verifyingId={verifyingId}
          onDownload={handleOpenFile}
        />

        {/* Single Delete Confirm */}
        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title="Delete Resource"
          description="Are you sure you want to delete this resource? This action cannot be undone."
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
              ? "Delete Resources"
              : bulkAction === "verify"
                ? "Verify Resources"
                : "Unverify Resources"
          }
          description={`Are you sure you want to ${bulkAction} ${selectedIds.length} selected resource${selectedIds.length === 1 ? "" : "s"}?`}
          confirmLabel={
            bulkAction === "delete"
              ? "Delete"
              : bulkAction === "verify"
                ? "Verify"
                : "Unverify"
          }
          confirmVariant={bulkAction === "delete" ? "destructive" : "default"}
          onConfirm={async () => {
            if (!bulkAction) return;
            try {
              if (bulkAction === "delete") {
                await adminService.bulkDeleteResources(selectedIds);
                toast.success(`${selectedIds.length} resources deleted`);
              } else {
                const isVerified = bulkAction === "verify";
                await adminService.bulkVerifyResources(
                  selectedIds,
                  isVerified,
                );
                toast.success(
                  `${selectedIds.length} resources ${isVerified ? "verified" : "unverified"}`,
                );
              }
              setSelectedIds([]);
              setBulkAction(null);
              fetchResources();
            } catch {
              toast.error("Bulk action failed");
            }
          }}
        />

        {/* Reports Dialog */}
        <ResourceReportsDialog
          open={isReportsOpen}
          onOpenChange={setIsReportsOpen}
          reports={reports}
          loading={reportsLoading}
          reviewingReportId={reviewingReportId}
          onReview={handleReviewReport}
        />
      </div>
    </TooltipProvider>
  );
}

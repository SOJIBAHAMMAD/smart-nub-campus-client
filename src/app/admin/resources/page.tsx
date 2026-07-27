"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { adminService } from "@/services/admin.service";
import { ResourceStatsCards } from "@/components/admin/resource-stats-cards";
import { ResourceDetailSheet } from "@/components/admin/resource-detail-sheet";
import { BulkActions } from "@/components/admin/bulk-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
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
  Check,
  X,
  Loader2,
  MoreHorizontal,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Download,
  ThumbsUp,
  AlertTriangle,
  ArrowUpDown,
  XCircle,
  Ban,
  FileIcon as LucideFileIcon,
} from "lucide-react";
import type {
  AdminResource,
  ListAdminResourcesResponse,
  ListAdminResourcesParams,
  AdminResourceCategory,
  AdminCourse,
  AdminResourceSort,
} from "@/types/admin.types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { getFileColor, getFileLabel, FileIcon as FileTypeIcon } from "@/components/resources/file-type-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { AdminResourceReport } from "@/types/admin.types";

const SORT_OPTIONS: { value: AdminResourceSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "downloads", label: "Most Downloads" },
  { value: "upvotes", label: "Most Upvotes" },
  { value: "reports", label: "Most Reports" },
  { value: "views", label: "Most Views" },
];

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
  const [viewingResource, setViewingResource] = useState<AdminResource | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Actions
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<"verify" | "unverify" | "delete" | null>(null);

  // Reports
  const [reports, setReports] = useState<AdminResourceReport[]>([]);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reviewingReportId, setReviewingReportId] = useState<string | null>(null);

  const limit = 10;

  // Fetch filter options on mount
  useEffect(() => {
    adminService.listCourses(1, 200).then((res) => setCourses(res.data)).catch(() => {});
    adminService.listResourceCategories(1, 200).then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ListAdminResourcesParams = {
        page,
        limit,
        search: search || undefined,
        isVerified: verifiedFilter === "all" ? undefined : verifiedFilter === "verified",
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
    const totalDownloads = data.data.reduce((sum, r) => sum + r.downloadCount, 0);
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
      toast.success(currentVerified ? "Resource unverified" : "Resource verified");
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

  const hasActiveFilters = search || verifiedFilter !== "all" || courseFilter !== "all" || categoryFilter !== "all" || sort !== "newest";

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
      const safeTitle = resource.title.replace(/[^a-z0-9\s-]/gi, "").trim().replace(/\s+/g, "-").slice(0, 60);
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

  const handleReviewReport = async (id: string, status: "REVIEWED" | "DISMISSED" | "ACTION_TAKEN") => {
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

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Resources</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage platform resources, verification, and moderation
          </p>
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
        <div className="space-y-3">
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="relative min-w-0 shrink-0 w-full sm:w-auto sm:flex-1 sm:max-w-sm">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by title or uploader..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 w-full"
                />
              </div>
              <Select
                value={verifiedFilter}
                onValueChange={(val) => {
                  setVerifiedFilter(val ?? "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] shrink-0">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={courseFilter}
                onValueChange={(val) => {
                  setCourseFilter(val ?? "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] shrink-0">
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" label="All Courses">All Courses</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id} label={`${c.code} — ${c.name}`}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val ?? "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] shrink-0">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" label="All Categories">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} label={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sort}
                onValueChange={(val) => setSort(val as AdminResourceSort)}
              >
                <SelectTrigger className="w-[155px] shrink-0">
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
        </div>

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
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden dark:bg-gray-800">
          {isLoading ? (
            <div className="p-4 sm:p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="p-12 sm:p-16 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                <FileTypeIcon fileType="" className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No resources found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasActiveFilters ? "Try adjusting your filters" : "Resources will appear here once uploaded"}
              </p>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          data.data.length > 0 &&
                          data.data.every((r) => selectedIds.includes(r.id))
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Stats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((resource) => {
                    const fileColor = getFileColor(resource.fileType);
                    const fileLabel = getFileLabel(resource.fileType);
                    return (
                      <TableRow
                        key={resource.id}
                        className="cursor-pointer"
                        onClick={() => openDetail(resource)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.includes(resource.id)}
                            onCheckedChange={() => toggleSelection(resource.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className={`flex size-8 shrink-0 items-center justify-center rounded-md ${fileColor}`}>
                              <FileTypeIcon fileType={resource.fileType} className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium max-w-[220px] truncate">
                                {resource.title}
                              </p>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                {fileLabel} · {resource.fileType.toUpperCase()}
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
                                <span className="text-sm truncate max-w-[100px] block">
                                  {resource.uploader.name}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{resource.uploader.email}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs font-mono">
                            {resource.course.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {resource.category.name}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-3 text-muted-foreground">
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="inline-flex items-center gap-1 text-xs">
                                  <Download className="size-3" />
                                  {resource.downloadCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Downloads</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="inline-flex items-center gap-1 text-xs">
                                  <ThumbsUp className="size-3" />
                                  {resource.upvoteCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Upvotes</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="inline-flex items-center gap-1 text-xs">
                                  <Eye className="size-3" />
                                  {resource.viewCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Views</TooltipContent>
                            </Tooltip>
                            {resource.reportCount > 0 && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="inline-flex items-center gap-1 text-xs text-red-600">
                                    <AlertTriangle className="size-3" />
                                    {resource.reportCount}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>Reports</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {resource.isVerified ? (
                            <Badge variant="outline" className="border-green-300 text-green-700">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              Unverified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(resource.createdAt), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenFile(resource)}>
                                <ExternalLink className="size-3.5 mr-2" />
                                Open File
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDetail(resource)}>
                                <Eye className="size-3.5 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {resource.reportCount > 0 && (
                                <DropdownMenuItem onClick={fetchReports}>
                                  <AlertTriangle className="size-3.5 mr-2" />
                                  View Reports ({resource.reportCount})
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleVerifyToggle(resource.id, resource.isVerified)}
                                disabled={verifyingId === resource.id}
                              >
                                {verifyingId === resource.id ? (
                                  <Loader2 className="size-3.5 mr-2 animate-spin" />
                                ) : resource.isVerified ? (
                                  <ShieldAlert className="size-3.5 mr-2" />
                                ) : (
                                  <ShieldCheck className="size-3.5 mr-2" />
                                )}
                                {resource.isVerified ? "Unverify" : "Verify"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(resource.id)}
                              >
                                <Trash2 className="size-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

        {/* Detail Sheet */}
        <ResourceDetailSheet
          resource={viewingResource}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onVerifyToggle={handleVerifyToggle}
          onDelete={(id) => setDeleteTarget(id)}
          verifyingId={verifyingId}
        />

        {/* Single Delete Confirm */}
        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
          title="Delete Resource"
          description="Are you sure you want to delete this resource? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
        />

        {/* Bulk Action Confirm */}
        <ConfirmDialog
          open={bulkAction !== null}
          onOpenChange={(open) => { if (!open) setBulkAction(null); }}
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
                await adminService.bulkVerifyResources(selectedIds, isVerified);
                toast.success(`${selectedIds.length} resources ${isVerified ? "verified" : "unverified"}`);
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
        <Dialog open={isReportsOpen} onOpenChange={setIsReportsOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Pending Reports</DialogTitle>
              <DialogDescription>
                Review and action reported resources
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0">
              {reportsLoading ? (
                <div className="space-y-3 p-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertTriangle className="size-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">No pending reports</p>
                  <p className="text-xs text-muted-foreground mt-1">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-2 p-1">
                  {reports.map((report) => {
                    const fileColor = getFileColor(report.resource.fileType);
                    return (
                      <div
                        key={report.id}
                        className="rounded-lg border p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`flex size-7 shrink-0 items-center justify-center rounded-md ${fileColor}`}>
                              <FileTypeIcon fileType={report.resource.fileType} className="size-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{report.resource.title}</p>
                              <p className="text-[10px] text-muted-foreground">
                                Reported by {report.user.name} · {format(new Date(report.createdAt), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-[10px] border-amber-300 text-amber-700">
                            {report.reason.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        {report.description && (
                          <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                            {report.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px]"
                            disabled={reviewingReportId === report.id}
                            onClick={() => handleReviewReport(report.id, "REVIEWED")}
                          >
                            <Check className="size-3 mr-1" />
                            Reviewed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px]"
                            disabled={reviewingReportId === report.id}
                            onClick={() => handleReviewReport(report.id, "ACTION_TAKEN")}
                          >
                            <ShieldCheck className="size-3 mr-1" />
                            Action Taken
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] text-muted-foreground"
                            disabled={reviewingReportId === report.id}
                            onClick={() => handleReviewReport(report.id, "DISMISSED")}
                          >
                            <X className="size-3 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

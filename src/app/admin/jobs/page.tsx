"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { adminService } from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, Trash2, Briefcase } from "lucide-react";
import type {
  AdminJob,
  ListAdminJobsResponse,
  ListAdminJobsParams,
} from "@/types/admin.types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "FILLED", label: "Filled" },
  { value: "CLOSED", label: "Closed" },
];

const VERIFY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All verification" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "OPEN":
      return <Badge variant="outline" className="border-emerald-300 text-emerald-700">Open</Badge>;
    case "FILLED":
      return <Badge variant="outline" className="border-sky-300 text-sky-700">Filled</Badge>;
    case "CLOSED":
      return <Badge variant="secondary">Closed</Badge>;
    default:
      return null;
  }
}

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
    fetchJobs();
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

  const hasActiveFilters = search || statusFilter !== "all" || verifiedFilter !== "all";
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(1); }}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={verifiedFilter} onValueChange={(v) => { setVerifiedFilter(v ?? "all"); setPage(1); }}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VERIFY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Briefcase className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">
            {hasActiveFilters ? "No jobs match your filters" : "No job posts yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your filters."
              : "Job posts shared by alumni will appear here."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Posted by</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((job: AdminJob) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.company}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {job.employmentType.replace(/_/g, " ").toLowerCase()}
                      {job.department ? ` · ${job.department}` : ""}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar id={job.postedById} name={job.postedBy.name} src={job.postedBy.image} className="size-8" />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{job.postedBy.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{job.postedBy.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {job._count.applications}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(job.createdAt), "MMM d, yyyy")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={job.isVerified}
                      onCheckedChange={() => handleVerifyToggle(job.id, job.isVerified)}
                      disabled={verifyingId === job.id}
                      aria-label={`Toggle verification for ${job.title}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(job.id)}
                      aria-label={`Delete ${job.title}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {meta.page} of {meta.totalPages} ({meta.total} jobs)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.totalPages}
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

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

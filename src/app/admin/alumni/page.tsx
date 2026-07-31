"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { adminService } from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, Undo2, GraduationCap } from "lucide-react";
import type {
  AdminAlumni,
  ListAdminAlumniResponse,
  ListAdminAlumniParams,
} from "@/types/admin.types";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

const GRAD_YEARS = Array.from({ length: 25 }, (_, i) => 2025 - i);

export default function AdminAlumniPage() {
  const [data, setData] = useState<ListAdminAlumniResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [mentorFilter, setMentorFilter] = useState("all");

  const [revertTarget, setRevertTarget] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  const limit = 10;

  const fetchAlumni = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ListAdminAlumniParams = {
        page,
        limit,
        q: search || undefined,
        department:
          departmentFilter === "all" ? undefined : departmentFilter,
        graduationYear:
          yearFilter === "all" ? undefined : Number(yearFilter),
      };
      const result = await adminService.listAlumni(params);
      setData(result);
    } catch {
      toast.error("Failed to load alumni");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, departmentFilter, yearFilter]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAlumni();
  };

  const handleRevert = async (id: string) => {
    setRevertingId(id);
    try {
      const result = await adminService.revertAlumni(id);
      toast.success(result.message || "Alumni reverted to student");
      setRevertTarget(null);
      fetchAlumni();
    } catch {
      toast.error("Failed to revert alumni");
    } finally {
      setRevertingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("all");
    setYearFilter("all");
    setMentorFilter("all");
    setPage(1);
  };

  const filtered = useCallback(
    (alumni: AdminAlumni[]) =>
      mentorFilter === "all"
        ? alumni
        : alumni.filter((a) =>
            mentorFilter === "mentors" ? a.profile?.isMentor : !a.profile?.isMentor,
          ),
    [mentorFilter],
  );

  const hasActiveFilters =
    search || departmentFilter !== "all" || yearFilter !== "all" || mentorFilter !== "all";
  const meta = data?.meta;
  const rows = data ? filtered(data.data) : [];

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alumni Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage alumni records and mentor status
          </p>
        </div>
        {meta && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <GraduationCap className="size-3.5" />
            {meta.total.toLocaleString()} alumni
          </span>
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, employer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select value={departmentFilter} onValueChange={(v) => { setDepartmentFilter(v ?? "all"); setPage(1); }}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {Object.entries(DEPARTMENT_LABELS).map(([code, label]) => (
              <SelectItem key={code} value={code}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v ?? "all"); setPage(1); }}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {GRAD_YEARS.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={mentorFilter} onValueChange={(v) => { setMentorFilter(v ?? "all"); setPage(1); }}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All alumni</SelectItem>
            <SelectItem value="mentors">Mentors only</SelectItem>
            <SelectItem value="non-mentors">Non-mentors</SelectItem>
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
      ) : !data || rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <GraduationCap className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">
            {hasActiveFilters ? "No alumni match your filters" : "No alumni yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your filters."
              : "Graduated students will appear here after their transition."}
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
                <TableHead>Alumni</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Career</TableHead>
                <TableHead>Graduated</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((alumni: AdminAlumni) => (
                <TableRow key={alumni.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar id={alumni.id} name={alumni.name} src={alumni.image} className="size-8" />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{alumni.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{alumni.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {alumni.student?.department ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground">
                      {alumni.profile?.jobTitle ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alumni.profile?.currentEmployer ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {alumni.student?.graduationYear
                        ? `${alumni.student.graduationYear}${alumni.student.graduationSemester ? ` · ${alumni.student.graduationSemester}` : ""}`
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {alumni.profile?.showInAlumniDirectory
                          ? "Visible in directory"
                          : "Hidden from directory"}
                      </span>
                      {alumni.profile?.isMentor && (
                        <Badge className="w-fit">Mentor</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setRevertTarget(alumni.id)}
                      disabled={revertingId === alumni.id}
                      aria-label={`Revert ${alumni.name} to student`}
                      title="Revert to student"
                    >
                      <Undo2 className="size-4" />
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
            Page {meta.page} of {meta.totalPages} ({meta.total} alumni)
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
        open={revertTarget !== null}
        onOpenChange={(open) => { if (!open) setRevertTarget(null); }}
        title="Revert to student?"
        description="This will change the user's role back to student and hide them from the alumni directory. Their job posts and mentorship profile will be affected."
        confirmLabel="Revert"
        onConfirm={() => {
          if (revertTarget) handleRevert(revertTarget);
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { GraduationCap } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { AlumniFilters } from "@/components/admin/alumni/alumni-filters";
import { AlumniTable } from "@/components/admin/alumni/alumni-table";
import { AlumniPagination } from "@/components/admin/alumni/alumni-pagination";
import type {
  AdminAlumni,
  ListAdminAlumniParams,
  ListAdminAlumniResponse,
} from "@/types/admin.types";

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

  const hasActiveFilters: boolean =
    Boolean(search) ||
    departmentFilter !== "all" ||
    yearFilter !== "all" ||
    mentorFilter !== "all";
  const meta = data?.meta;
  const rows = data ? filtered(data.data) : [];

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alumni</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage alumni records, mentor roles, and directory visibility
          </p>
        </div>
        {meta && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <GraduationCap className="size-3.5" />
            {meta.total.toLocaleString()} alumni
          </span>
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <AlumniFilters
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        department={departmentFilter}
        onDepartmentChange={(value) => {
          setDepartmentFilter(value);
          setPage(1);
        }}
        year={yearFilter}
        onYearChange={(value) => {
          setYearFilter(value);
          setPage(1);
        }}
        mentor={mentorFilter}
        onMentorChange={(value) => {
          setMentorFilter(value);
          setPage(1);
        }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <AlumniTable
        alumni={rows}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        revertingId={revertingId}
        onRequestRevert={setRevertTarget}
        onClearFilters={clearFilters}
      />

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {meta && (
        <AlumniPagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={setPage}
        />
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

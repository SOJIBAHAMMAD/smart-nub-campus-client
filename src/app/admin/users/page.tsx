"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { adminService } from "@/services/admin.service";
import { UserDetailModal } from "@/components/admin/user-detail-modal";
import { BulkActions } from "@/components/admin/bulk-actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { UserRoleBadge } from "@/components/admin/user/user-role-badge";
import { UserStatusBadge } from "@/components/admin/user/user-status-badge";
import { UserStatsCards, deriveUserStats } from "@/components/admin/user/user-stats-cards";
import { UserPagination } from "@/components/admin/user/user-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Ban,
  Eye,
  MoreHorizontal,
  Play,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { UserStatus } from "@/constants/enums";
import type { AdminUserDetail, ListAdminUsersResponse } from "@/types/admin.types";
import { toast } from "sonner";

// ── Page Component ───────────────────────────────────────────────────────────

/**
 * User management page for admins.
 * Shows a searchable, filterable user table with bulk actions and a detail modal.
 */
export default function UsersPage() {
  const [data, setData] = useState<ListAdminUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal state
  const [viewingUser, setViewingUser] = useState<AdminUserDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "suspend" | "ban" | "activate" | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const limit = 10;

  /** Fetch users from the API. */
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.listUsers({
        page,
        limit,
        search: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        status:
          statusFilter === "all"
            ? undefined
            : (statusFilter as UserStatus),
      });
      setData(result);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /** Handle status change for a user. */
  const handleStatusChange = async (
    id: string,
    status: "ACTIVE" | "SUSPENDED" | "BANNED",
  ) => {
    try {
      await adminService.updateUserStatus(id, status);
      toast.success(`User status updated to ${status.toLowerCase()}`);
      fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  /** Open user detail modal. Opens first so the modal can show a loading state. */
  const openDetail = async (id: string) => {
    setViewingUser(null);
    setIsModalOpen(true);
    try {
      const detail = await adminService.getUserById(id);
      setViewingUser(detail);
    } catch {
      setIsModalOpen(false);
      toast.error("Failed to load user details");
    }
  };

  /** Delete a single user (soft delete via API). */
  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteUser(id);
      toast.success("User deleted");
      setDeleteTarget(null);
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
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
    const allIds = data.data.map((u) => u.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  const hasActiveFilters =
    search !== "" || roleFilter !== "all" || statusFilter !== "all";

  /** Reset all filters back to defaults. */
  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
    setSelectedIds([]);
  };

  /** Stats derived from the response meta + the current page. */
  const stats = useMemo(() => {
    const pageStats = deriveUserStats(data?.data);
    return {
      total: data?.meta.total ?? 0,
      ...pageStats,
    };
  }, [data]);

  const totalPages = data?.meta.totalPages ?? 1;
  const allPageSelected =
    (data?.data.length ?? 0) > 0 &&
    (data?.data.every((u) => selectedIds.includes(u.id)) ?? false);

  return (
    <div className="p-4 space-y-4 sm:p-6 sm:space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Users</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage platform users, roles, and account access
          </p>
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-32 rounded-full" />
        ) : data ? (
          <Badge variant="secondary" className="gap-1.5 py-1.5">
            <Users className="size-3.5" />
            {data.meta.total.toLocaleString()} total
          </Badge>
        ) : null}
      </div>

      {/* ── Stats Strip ─────────────────────────────────────────────────── */}
      {data && (
        <UserStatsCards
          total={stats.total}
          active={stats.active}
          banned={stats.banned}
          pending={stats.pending}
        />
      )}

      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-sm">
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
            aria-label="Search users by name or email"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px] shrink-0">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[170px] shrink-0">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="BANNED">Banned</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 text-muted-foreground"
            >
              <XCircle className="size-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Bulk Actions ────────────────────────────────────────────────── */}
      <BulkActions
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        actions={[
          {
            label: "Suspend",
            icon: Ban,
            variant: "outline",
            onClick: () => setBulkAction("suspend"),
          },
          {
            label: "Ban",
            icon: Ban,
            variant: "destructive",
            onClick: () => setBulkAction("ban"),
          },
          {
            label: "Activate",
            icon: Play,
            variant: "default",
            onClick: () => setBulkAction("activate"),
          },
        ]}
      />

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[720px]">
            <Table>
              <TableCaption className="sr-only">Admin user directory</TableCaption>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      aria-label="Select all users on this page"
                      checked={allPageSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              {isLoading ? (
                <TableBody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="cursor-default hover:bg-transparent">
                      <TableCell>
                        <Skeleton className="size-4 rounded-md" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-9 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-3 w-44" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3.5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3.5 w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Skeleton className="size-8 rounded-md" />
                          <Skeleton className="size-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : !data || data.data.length === 0 ? (
                <TableBody>
                  <TableRow className="cursor-default hover:bg-transparent">
                    <TableCell colSpan={7} className="p-0">
                      <Empty className="py-12">
                        <EmptyMedia variant="icon">
                          <Users className="size-6" />
                        </EmptyMedia>
                        <EmptyHeader>
                          <EmptyTitle>
                            {hasActiveFilters
                              ? "No users match your filters"
                              : "No users found"}
                          </EmptyTitle>
                          <EmptyDescription>
                            {hasActiveFilters
                              ? "Try adjusting your search or filters to find what you are looking for."
                              : "Users will appear here once they register."}
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          {hasActiveFilters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearFilters}
                            >
                              <XCircle className="size-3.5 mr-1" />
                              Clear filters
                            </Button>
                          )}
                        </EmptyContent>
                      </Empty>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {data.data.map((user) => {
                    const department =
                      user.student?.department ??
                      user.admin?.department ??
                      "N/A";
                    return (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer"
                        onClick={() => openDetail(user.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            aria-label={`Select ${user.name}`}
                            checked={selectedIds.includes(user.id)}
                            onCheckedChange={() => toggleSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              id={user.id}
                              name={user.name}
                              className="size-9 text-xs"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {user.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {department}
                          </span>
                        </TableCell>
                        <TableCell>
                          <UserRoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <UserStatusBadge
                            status={user.status}
                            isDeleted={user.isDeleted}
                            hasCompletedOnboarding={user.hasCompletedOnboarding}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-8"
                              onClick={() => openDetail(user.id)}
                              aria-label={`View ${user.name}`}
                            >
                              <Eye className="size-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                  />
                                }
                                aria-label={`Actions for ${user.name}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openDetail(user.id)}
                                >
                                  <Eye className="size-3.5 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {!user.isDeleted &&
                                  (user.status === UserStatus.ACTIVE ? (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(user.id, "BANNED")
                                      }
                                    >
                                      <Ban className="size-3.5 mr-2" />
                                      Ban User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(user.id, "ACTIVE")
                                      }
                                    >
                                      <Play className="size-3.5 mr-2" />
                                      Activate User
                                    </DropdownMenuItem>
                                  ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setDeleteTarget(user.id)}
                                >
                                  <Trash2 className="size-3.5 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              )}
            </Table>
          </div>
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {data && data.meta.total > 0 && (
          <div className="border-t px-4 py-3">
            <UserPagination
              page={page}
              totalPages={totalPages}
              total={data.meta.total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ── User Detail Modal ────────────────────────────────────────────── */}
      <UserDetailModal
        user={viewingUser}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setViewingUser(null);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* ── Single Delete Confirm ────────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
      />

      {/* ── Bulk Action Confirm ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={bulkAction !== null}
        onOpenChange={(open) => {
          if (!open) setBulkAction(null);
        }}
        title={
          bulkAction === "suspend"
            ? "Suspend Users"
            : bulkAction === "ban"
              ? "Ban Users"
              : "Activate Users"
        }
        description={`Are you sure you want to ${bulkAction} ${selectedIds.length} selected user${selectedIds.length === 1 ? "" : "s"}?`}
        confirmLabel={
          bulkAction === "activate"
            ? "Activate"
            : bulkAction === "ban"
              ? "Ban"
              : "Suspend"
        }
        confirmVariant={bulkAction === "ban" ? "destructive" : "default"}
        onConfirm={async () => {
          if (!bulkAction) return;
          const statusMap = {
            suspend: "SUSPENDED" as const,
            ban: "BANNED" as const,
            activate: "ACTIVE" as const,
          };
          for (const id of selectedIds) {
            try {
              await adminService.updateUserStatus(id, statusMap[bulkAction]);
            } catch {
              // Continue with other users
            }
          }
          toast.success(
            `${selectedIds.length} users ${bulkAction === "activate" ? "activated" : bulkAction + "d"}`,
          );
          setSelectedIds([]);
          setBulkAction(null);
          fetchUsers();
        }}
      />
    </div>
  );
}

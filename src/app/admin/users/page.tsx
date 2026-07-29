"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { adminService } from "@/services/admin.service";
import { UserDetailModal } from "@/components/admin/user-detail-modal";
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
import { Avatar } from "@/components/ui/avatar";
import { Search, ChevronLeft, ChevronRight, Eye, Ban, Play } from "lucide-react";
import { UserStatus } from "@/constants/enums";
import type {
  AdminUserDetail,
  ListAdminUsersResponse,
} from "@/types/admin.types";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

// ── Page Component ───────────────────────────────────────────────────────────

/**
 * User management page for admins.
 * Shows searchable, sortable, filterable user table with detail modal.
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
  const [bulkAction, setBulkAction] = useState<"suspend" | "ban" | "activate" | null>(null);

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

  /** Open user detail modal. */
  const openDetail = async (id: string) => {
    try {
      const detail = await adminService.getUserById(id);
      setViewingUser(detail);
      setIsModalOpen(true);
    } catch {
      toast.error("Failed to load user details");
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

  /** Get status badge. */
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return (
          <Badge variant="outline" className="border-green-300 text-green-700">
            Active
          </Badge>
        );
      case UserStatus.SUSPENDED:
        return (
          <Badge variant="outline" className="border-amber-300 text-amber-700">
            Suspended
          </Badge>
        );
      case UserStatus.BANNED:
        return (
          <Badge variant="outline" className="border-red-300 text-red-700">
            Banned
          </Badge>
        );
      default:
        return null;
    }
  };

  /** Get role badge. */
  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return (
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
        Student
      </Badge>
    );
  };

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage platform users and their access
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
          value={roleFilter}
          onValueChange={(val) => {
            setRoleFilter(val ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="BANNED">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Bulk Actions ──────────────────────────────────────────────── */}
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
            <p className="text-muted-foreground">No users found.</p>
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
                        data.data.every((u) => selectedIds.includes(u.id))
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(user.id)}
                        onCheckedChange={() => toggleSelection(user.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          id={user.id}
                          name={user.name}
                          className="size-8"
                        />
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">
                        {user.student?.department ?? user.admin?.department ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(user.id)}
                        className="h-8"
                      >
                        <Eye className="size-4 mr-1" />
                        View
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

      {/* ── User Detail Modal ──────────────────────────────────────────── */}
      <UserDetailModal
        user={viewingUser}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setViewingUser(null);
        }}
        onStatusChange={handleStatusChange}
      />

      <ConfirmDialog
        open={bulkAction !== null}
        onOpenChange={(open) => { if (!open) setBulkAction(null); }}
        title={bulkAction === "suspend" ? "Suspend Users" : bulkAction === "ban" ? "Ban Users" : "Activate Users"}
        description={`Are you sure you want to ${bulkAction} ${selectedIds.length} selected user${selectedIds.length === 1 ? "" : "s"}?`}
        confirmLabel={bulkAction === "activate" ? "Activate" : bulkAction === "ban" ? "Ban" : "Suspend"}
        confirmVariant={bulkAction === "ban" ? "destructive" : "default"}
        onConfirm={async () => {
          if (!bulkAction) return;
          const statusMap = { suspend: "SUSPENDED" as const, ban: "BANNED" as const, activate: "ACTIVE" as const };
          for (const id of selectedIds) {
            try {
              await adminService.updateUserStatus(id, statusMap[bulkAction]);
            } catch {
              // Continue with other users
            }
          }
          toast.success(`${selectedIds.length} users ${bulkAction === "activate" ? "activated" : bulkAction + "d"}`);
          setSelectedIds([]);
          setBulkAction(null);
          fetchUsers();
        }}
      />
    </div>
  );
}

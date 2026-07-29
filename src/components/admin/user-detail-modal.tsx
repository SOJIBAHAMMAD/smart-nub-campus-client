"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Ban,
  Play,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Users,
} from "lucide-react";
import type { AdminUserDetail } from "@/types/admin.types";
import { UserStatus } from "@/constants/enums";

// ── Component ────────────────────────────────────────────────────────────────

interface UserDetailModalProps {
  /** The user to display details for. */
  user: AdminUserDetail | null;
  /** Whether the modal is open. */
  open: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
  /** Callback to update user status. */
  onStatusChange: (
    id: string,
    status: "ACTIVE" | "SUSPENDED" | "BANNED",
  ) => Promise<void>;
}

/**
 * Modal for viewing user details and performing admin actions.
 * Shows full profile, activity summary, and status management buttons.
 */
export function UserDetailModal({
  user,
  open,
  onClose,
  onStatusChange,
}: UserDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  if (!user) return null;

  /** Get status badge variant. */
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

  /** Handle status change action. */
  const handleStatusChange = async (status: "ACTIVE" | "SUSPENDED" | "BANNED") => {
    setIsLoading(true);
    try {
      await onStatusChange(user.id, status);
      setShowSuspendForm(false);
      setSuspendReason("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const department =
    (user.student as { department?: string } | null)?.department ??
    (user.admin as { department?: string } | null)?.department ??
    "N/A";

  const student = user.student as Record<string, unknown> | null;
  const semester = student
    ? `${student.admissionYear ?? "N/A"} - ${student.admissionSemester ?? "N/A"}`
    : "N/A";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            User Details
            {getStatusBadge(user.status)}
          </DialogTitle>
          <DialogDescription>
            View user profile and manage account status.
          </DialogDescription>
        </DialogHeader>

        {/* ── Profile Info ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-sm font-semibold">{user.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="text-sm capitalize">{user.role.toLowerCase()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="text-sm">{department}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Semester</p>
              <p className="text-sm">{semester}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="text-sm">
                {format(new Date(user.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* ── Activity Summary ───────────────────────────────────────── */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-sm font-medium mb-3">Activity Summary</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">{user._count.resources}</span>{" "}
                  Resources
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">{user._count.discussions}</span>{" "}
                  Discussions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">{user._count.questions}</span>{" "}
                  Questions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">{user._count.teamMembers}</span>{" "}
                  Teams
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Suspend Form ─────────────────────────────────────────────── */}
        {showSuspendForm && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-amber-700">
              Suspend reason
            </Label>
            <Textarea
              placeholder="Enter reason for suspension..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        {user.role !== "ADMIN" && (
          <DialogFooter className="gap-2 sm:gap-0">
            {showSuspendForm ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuspendForm(false);
                    setSuspendReason("");
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange("SUSPENDED")}
                  disabled={isLoading}
                >
                  Confirm Suspend
                </Button>
              </>
            ) : (
              <>
                {user.status === UserStatus.ACTIVE && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowSuspendForm(true)}
                      disabled={isLoading}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Ban className="size-4 mr-1" />
                      Suspend
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusChange("BANNED")}
                      disabled={isLoading}
                    >
                      <Ban className="size-4 mr-1" />
                      Ban
                    </Button>
                  </>
                )}
                {(user.status === UserStatus.SUSPENDED ||
                  user.status === UserStatus.BANNED) && (
                  <Button
                    onClick={() => handleStatusChange("ACTIVE")}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="size-4 mr-1" />
                    Activate
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

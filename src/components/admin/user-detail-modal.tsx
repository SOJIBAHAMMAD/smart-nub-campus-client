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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserRoleBadge } from "@/components/admin/user/user-role-badge";
import { UserStatusBadge } from "@/components/admin/user/user-status-badge";
import {
  BadgeCheck,
  Ban,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  History,
  Mail,
  MessageSquare,
  Play,
  ShieldCheck,
  UserCircle,
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
 * Shows a header with avatar + badges, contact/account info, an activity
 * summary and role-specific profile sections. Displays a skeleton while the
 * detail payload is still loading. Closes on ESC / backdrop click.
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

  const loading = open && !user;

  /** Handle status change action. */
  const handleStatusChange = async (status: "ACTIVE" | "SUSPENDED" | "BANNED") => {
    if (!user) return;
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">User details</DialogTitle>
          <DialogDescription className="sr-only">
            User profile and account management
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <ModalSkeleton />
        ) : user ? (
          <div className="space-y-5 pr-6">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-4">
              <Avatar id={user.id} name={user.name} className="size-14 text-lg" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold">{user.name}</h2>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <UserRoleBadge role={user.role} />
                  <UserStatusBadge
                    status={user.status}
                    isDeleted={user.isDeleted}
                    hasCompletedOnboarding={user.hasCompletedOnboarding}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Contact & Account ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField icon={Mail} label="Email" value={user.email} />
              <DetailField
                icon={Calendar}
                label="Joined"
                value={format(new Date(user.createdAt), "MMM d, yyyy")}
              />
              <DetailField
                icon={History}
                label="Last updated"
                value={format(new Date(user.updatedAt), "MMM d, yyyy")}
              />
              <DetailField
                icon={CheckCircle2}
                label="Onboarding"
                value={user.hasCompletedOnboarding ? "Completed" : "Pending"}
              />
            </div>

            {/* ── Activity Summary ───────────────────────────────────────── */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Activity
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <ActivityItem
                  icon={BookOpen}
                  label="Resources"
                  value={user._count.resources}
                />
                <ActivityItem
                  icon={MessageSquare}
                  label="Discussions"
                  value={user._count.discussions}
                />
                <ActivityItem
                  icon={HelpCircle}
                  label="Questions"
                  value={user._count.questions}
                />
                <ActivityItem
                  icon={BadgeCheck}
                  label="Answers"
                  value={user._count.answers}
                />
                <ActivityItem
                  icon={Users}
                  label="Teams"
                  value={user._count.teamMembers}
                />
              </div>
            </div>

            {/* ── Student Profile ────────────────────────────────────────── */}
            {user.student && (
              <ProfileSection
                icon={GraduationCap}
                title="Student Profile"
                fields={filteredEntries(user.student)}
              />
            )}

            {/* ── Admin Profile ──────────────────────────────────────────── */}
            {user.admin && (
              <ProfileSection
                icon={ShieldCheck}
                title="Admin Profile"
                fields={filteredEntries(user.admin)}
              />
            )}

            {/* ── Extra Profile Fields ───────────────────────────────────── */}
            {user.profile && (
              <ProfileSection
                icon={UserCircle}
                title="Profile"
                fields={filteredEntries(user.profile)}
              />
            )}

            {/* ── Suspend Form ───────────────────────────────────────────── */}
            {showSuspendForm && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-amber-700 dark:text-amber-400">
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

            {/* ── Actions ────────────────────────────────────────────────── */}
            {user.role !== "ADMIN" && !user.isDeleted && (
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
                          className="border-amber-300/70 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
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
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Play className="size-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </>
                )}
              </DialogFooter>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ModalSkeleton() {
  return (
    <div className="space-y-5 pr-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="truncate text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ── Profile helpers ──────────────────────────────────────────────────────────

const PROFILE_LABELS: Record<string, string> = {
  department: "Department",
  designation: "Designation",
  admissionYear: "Admission Year",
  admissionSemester: "Admission Semester",
  academicStatus: "Academic Status",
  graduationYear: "Graduation Year",
  graduationSemester: "Graduation Semester",
  degreeTitle: "Degree",
  cgpa: "CGPA",
  bio: "Bio",
  headline: "Headline",
  location: "Location",
  currentEmployer: "Current Employer",
  jobTitle: "Job Title",
  industry: "Industry",
  company: "Company",
  mentorshipTopics: "Mentorship Topics",
};

/** Drop internal identifiers and flatten a profile record into field pairs. */
function filteredEntries(
  record: Record<string, unknown>,
): [string, unknown][] {
  return (Object.entries(record) as [string, unknown][]).filter(
    ([key]) => !["id", "userId"].includes(key),
  );
}

function prettifyLabel(key: string): string {
  if (PROFILE_LABELS[key]) return PROFILE_LABELS[key];
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    const items = value.filter(
      (v) => v !== null && v !== undefined && v !== "",
    );
    return items.length ? items.join(", ") : "N/A";
  }
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "object") return "N/A";
  return String(value);
}

function ProfileSection({
  icon: Icon,
  title,
  fields,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  fields: [string, unknown][];
}) {
  const visibleFields = fields.filter(([, value]) => formatValue(value) !== "N/A");
  if (visibleFields.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {title}
        </p>
      </div>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        {visibleFields.map(([key, value]) => (
          <div key={key}>
            <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              {prettifyLabel(key)}
            </dt>
            <dd className="text-sm font-medium break-words">
              {formatValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

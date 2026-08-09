import {
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  Mail,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status";
import { DEPARTMENT_LABELS, type Department } from "@/lib/constants";
import { formatDate, type AdminProfileAdmin, type AdminProfileUser } from "./types";

interface ProfileHeaderCardProps {
  user: AdminProfileUser;
  admin: AdminProfileAdmin | null;
  onEdit: () => void;
}

function getStatusMeta(status: string): {
  variant: "success" | "warning" | "error" | "default";
  label: string;
} {
  switch (status) {
    case "ACTIVE":
      return { variant: "success", label: "Active" };
    case "SUSPENDED":
      return { variant: "warning", label: "Suspended" };
    case "BANNED":
      return { variant: "error", label: "Banned" };
    default:
      return { variant: "default", label: status };
  }
}

/**
 * Profile hero header: gradient cover banner, overlapping large avatar,
 * name, email, role badge, admin department/designation, member-since date
 * and account status badge. Fully semantic-token based (light + dark safe).
 */
export function ProfileHeaderCard({ user, admin, onEdit }: ProfileHeaderCardProps) {
  const statusMeta = getStatusMeta(user.status);
  const departmentLabel = admin?.department
    ? (DEPARTMENT_LABELS[admin.department as Department] ?? admin.department)
    : null;

  return (
    <Card className="relative overflow-hidden">
      {/* Cover banner */}
      <div className="relative h-28 sm:h-36">
        <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-primary/10 to-primary/5" />
        <div className="absolute -right-16 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 size-56 rounded-full bg-primary/10 blur-3xl" />
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="absolute right-4 top-4 border-border/60 bg-background/80 backdrop-blur-sm hover:bg-background/95"
        >
          <Pencil className="size-3.5" />
          <span className="hidden sm:inline">Edit profile</span>
        </Button>
      </div>

      <div className="relative px-4 pb-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="-mt-12 shrink-0 sm:-mt-14">
            <Avatar
              id={user.id}
              name={user.name}
              src={user.image}
              className="size-20 border-4 border-card shadow-md sm:size-24"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-2.5 pb-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {user.name}
              </h2>
              <Badge className="bg-primary/10 text-primary">
                <ShieldCheck />
                Administrator
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex min-w-0 items-center gap-1.5">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </span>
              <Status variant={statusMeta.variant}>
                <StatusIndicator />
                <StatusLabel>{statusMeta.label}</StatusLabel>
              </Status>
            </div>

            {(departmentLabel || admin?.designation) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {departmentLabel && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 shrink-0" />
                    {departmentLabel}
                  </span>
                )}
                {admin?.designation && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5 shrink-0" />
                    {admin.designation}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" />
                Joined {formatDate(user.createdAt, "MMMM d, yyyy")}
              </span>
              {admin?.employeeId && (
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="size-3.5 shrink-0" />
                  Employee ID: {admin.employeeId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

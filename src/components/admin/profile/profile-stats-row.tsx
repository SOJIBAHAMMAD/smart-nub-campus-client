import {
  Ban,
  CalendarDays,
  MailCheck,
  MailX,
  ShieldCheck,
  TriangleAlert,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate, type AdminProfileUser } from "./types";

interface ProfileStatsRowProps {
  user: AdminProfileUser;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; valueClassName: string }
> = {
  ACTIVE: {
    label: "Active",
    icon: UserCheck,
    valueClassName: "text-emerald-600 dark:text-emerald-400",
  },
  SUSPENDED: {
    label: "Suspended",
    icon: TriangleAlert,
    valueClassName: "text-amber-600 dark:text-amber-400",
  },
  BANNED: {
    label: "Banned",
    icon: Ban,
    valueClassName: "text-destructive",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={cn("truncate text-lg font-semibold text-foreground", valueClassName)}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Account summary row: Role, Member since, Account status, Email verified.
 * Wraps from 1 → 2 → 4 columns across breakpoints.
 */
export function ProfileStatsRow({ user }: ProfileStatsRowProps) {
  const statusConfig =
    STATUS_CONFIG[user.status] ?? {
      label: user.status,
      icon: UserCheck,
      valueClassName: "",
    };
  const StatusIcon = statusConfig.icon;
  const emailVerified = user.emailVerified;

  return (
    <section aria-label="Account summary">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ShieldCheck} label="Role" value="Administrator" />
        <StatCard
          icon={CalendarDays}
          label="Member since"
          value={formatDate(user.createdAt, "MMM yyyy")}
        />
        <StatCard
          icon={StatusIcon}
          label="Account status"
          value={statusConfig.label}
          valueClassName={statusConfig.valueClassName}
        />
        <StatCard
          icon={emailVerified ? MailCheck : MailX}
          label="Email verified"
          value={emailVerified ? "Verified" : "Not verified"}
          valueClassName={
            emailVerified ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
          }
        />
      </div>
    </section>
  );
}

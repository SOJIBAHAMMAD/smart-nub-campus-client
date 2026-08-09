import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BadgeCheck, GraduationCap, ShieldCheck } from "lucide-react";
import type { UserRole } from "@/constants/enums";

// ── Types ────────────────────────────────────────────────────────────────────

interface UserRoleBadgeProps {
  /** Backend role value. */
  role: UserRole;
  /** Additional CSS classes. */
  className?: string;
}

interface RoleConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}

// ── Config ───────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  STUDENT: {
    label: "Student",
    icon: GraduationCap,
    className:
      "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  },
  ADMIN: {
    label: "Admin",
    icon: ShieldCheck,
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  ALUMNI: {
    label: "Alumni",
    icon: BadgeCheck,
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
};

// ── Component ────────────────────────────────────────────────────────────────

/** Colored role badge with an icon (Student / Admin / Alumni). */
export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.STUDENT;
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      <Icon data-icon="inline-start" className="size-3" />
      {config.label}
    </Badge>
  );
}

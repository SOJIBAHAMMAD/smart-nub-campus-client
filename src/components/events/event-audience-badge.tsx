import { Globe, Users, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventAudience } from "@/types/event.types";

export const EVENT_AUDIENCE_LABELS: Record<EventAudience, string> = {
  EVERYONE: "Everyone",
  STUDENTS_ONLY: "Students only",
  ALUMNI_ONLY: "Alumni only",
};

const AUDIENCE_ICONS: Record<EventAudience, typeof Globe> = {
  EVERYONE: Globe,
  STUDENTS_ONLY: Users,
  ALUMNI_ONLY: GraduationCap,
};

export function EventAudienceBadge({
  audience,
  className,
}: {
  audience: EventAudience;
  className?: string;
}) {
  const Icon = AUDIENCE_ICONS[audience];
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-border/70 text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {EVENT_AUDIENCE_LABELS[audience]}
    </Badge>
  );
}

export function EventReunionBadge({
  batchYear,
  className,
}: {
  batchYear: number;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-indigo-300 bg-indigo-50 text-indigo-700",
        className,
      )}
    >
      <GraduationCap className="size-3" aria-hidden="true" />
      Reunion &middot; Batch {batchYear}
    </Badge>
  );
}

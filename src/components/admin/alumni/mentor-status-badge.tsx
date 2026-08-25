import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MentorStatusBadgeProps {
  isMentor: boolean;
  className?: string;
}

/**
 * Role badge for an alumni row. Mentors get a blue accent so the
 * mentorship program is scannable at a glance; non-mentors get a
 * neutral gray "Student" badge.
 */
export function MentorStatusBadge({
  isMentor,
  className,
}: MentorStatusBadgeProps) {
  if (isMentor) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-300",
          className,
        )}
      >
        <Sparkles className="size-3" />
        Mentor
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn("text-muted-foreground", className)}
    >
      Student
    </Badge>
  );
}

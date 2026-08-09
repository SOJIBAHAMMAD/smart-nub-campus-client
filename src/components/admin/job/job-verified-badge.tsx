import { Badge } from "@/components/ui/badge";
import { BadgeCheck, ShieldAlert } from "lucide-react";

interface JobVerifiedBadgeProps {
  isVerified: boolean;
}

export function JobVerifiedBadge({ isVerified }: JobVerifiedBadgeProps) {
  if (isVerified) {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      >
        <BadgeCheck
          className="size-3"
          data-icon="inline-start"
          aria-hidden="true"
        />
        Verified
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
    >
      <ShieldAlert
        className="size-3"
        data-icon="inline-start"
        aria-hidden="true"
      />
      Unverified
    </Badge>
  );
}

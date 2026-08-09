import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export function ResourceStatusBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <Badge
        variant="outline"
        className="border-green-300 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
      >
        <ShieldCheck className="size-3" data-icon="inline-start" />
        Verified
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
    >
      <ShieldAlert className="size-3" data-icon="inline-start" />
      Unverified
    </Badge>
  );
}

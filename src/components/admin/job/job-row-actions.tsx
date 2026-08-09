import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ROUTES from "@/constants/routes";
import { Ellipsis, ExternalLink, Loader, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import type { AdminJob } from "@/types/admin.types";

interface JobRowActionsProps {
  job: AdminJob;
  verifyingId: string | null;
  onVerifyToggle: (id: string, isVerified: boolean) => void;
  onDelete: (id: string) => void;
}

export function JobRowActions({
  job,
  verifyingId,
  onVerifyToggle,
  onDelete,
}: JobRowActionsProps) {
  const isVerifying = verifyingId === job.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${job.title}`}
          />
        }
      >
        <Ellipsis className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          render={
            <a
              href={ROUTES.JOB(job.id)}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <ExternalLink aria-hidden="true" />
          View on site
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onVerifyToggle(job.id, job.isVerified)}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <Loader className="animate-spin" aria-hidden="true" />
          ) : job.isVerified ? (
            <ShieldAlert aria-hidden="true" />
          ) : (
            <ShieldCheck aria-hidden="true" />
          )}
          {job.isVerified ? "Unverify" : "Verify"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(job.id)}
        >
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

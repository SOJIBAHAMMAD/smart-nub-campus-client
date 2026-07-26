"use client";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_BADGE } from "@/constants/team";
import { Card, CardContent } from "@/components/ui/card";
import { AuthorInfo } from "@/components/ui/author-info";
import type { TeamApplication } from "@/types/team.types";

interface ApplicationCardProps {
  application: TeamApplication;
  canReview?: boolean;
  onAccept?: (applicationId: string) => void;
  onReject?: (applicationId: string) => void;
  reviewing?: boolean;
}

export function ApplicationCard({
  application,
  canReview,
  onAccept,
  onReject,
  reviewing,
}: ApplicationCardProps) {
  const statusBadge = APPLICATION_STATUS_BADGE[application.status];
  const showActions = canReview && application.status === "PENDING";

  return (
    <Card size="sm" className="p-3">
      <CardContent className="flex flex-col gap-2 p-0">
        <div className="flex items-center justify-between gap-3">
          <AuthorInfo
            user={{
              id: application.applicant?.id ?? "",
              name: application.applicant?.name ?? "Unknown",
              image: application.applicant?.image,
            }}
            action="applied"
            timestamp={application.createdAt}
            size="sm"
          />
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              statusBadge.className,
            )}
          >
            {statusBadge.label}
          </span>
        </div>

        {application.message && (
          <p className="text-xs text-foreground/80">{application.message}</p>
        )}

        {showActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAccept?.(application.id)}
              disabled={reviewing}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
            >
              <Check className="size-3.5" />
              Accept
            </button>
            <button
              onClick={() => onReject?.(application.id)}
              disabled={reviewing}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
            >
              <X className="size-3.5" />
              Reject
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_BADGE } from "@/constants/team";
import { Card, CardContent } from "@/components/ui/card";
import { AuthorInfo } from "@/components/ui/author-info";
import { Button } from "@/components/ui/button";
import { TagPill } from "@/components/ui/tag-pill";
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
  const [expanded, setExpanded] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | null>(null);
  const statusBadge = APPLICATION_STATUS_BADGE[application.status];
  const showActions = canReview && application.status === "PENDING";
  const message = application.message ?? "";
  const isLong = message.length > 150;

  return (
    <Card
      size="sm"
      className={cn(
        "p-3 transition-opacity duration-300",
        application.status === "ACCEPTED" && "opacity-60 border-green-500/50",
        application.status === "REJECTED" && "opacity-60 border-red-500/50",
      )}
    >
      <CardContent className="flex flex-col gap-2 p-0">
        {/* Header */}
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

        {/* Skill badges */}
        {application.teamRequest?.teamRequestSkills &&
          application.teamRequest.teamRequestSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {application.teamRequest.teamRequestSkills.map((trs) =>
                trs.tag ? (
                  <TagPill
                    key={trs.id}
                    name={trs.tag.name}
                    size="xs"
                    variant="outline"
                  />
                ) : null,
              )}
            </div>
          )}

        {/* Message */}
        {message && (
          <div className="space-y-1">
            <p
              className={cn(
                "whitespace-pre-wrap text-xs text-foreground/80",
                !expanded && isLong && "line-clamp-3",
              )}
            >
              {message}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-0.5 text-[10px] font-medium text-primary hover:underline"
              >
                {expanded ? (
                  <>
                    Show less <ChevronUp className="size-3" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="size-3" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <>
            {confirmAction ? (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                <p className="flex-1 text-xs text-muted-foreground">
                  {confirmAction === "accept"
                    ? "Accept this application?"
                    : "Reject this application?"}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmAction(null)}
                  disabled={reviewing}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant={confirmAction === "accept" ? "default" : "destructive"}
                  onClick={() => {
                    if (confirmAction === "accept") {
                      onAccept?.(application.id);
                    } else {
                      onReject?.(application.id);
                    }
                    setConfirmAction(null);
                  }}
                  disabled={reviewing}
                  className="h-7 text-xs"
                >
                  {reviewing ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <>
                      {confirmAction === "accept" ? (
                        <Check className="size-3" />
                      ) : (
                        <X className="size-3" />
                      )}
                      Confirm
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmAction("accept")}
                  disabled={reviewing}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
                >
                  <Check className="size-3.5" />
                  Accept
                </button>
                <button
                  onClick={() => setConfirmAction("reject")}
                  disabled={reviewing}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                >
                  <X className="size-3.5" />
                  Reject
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

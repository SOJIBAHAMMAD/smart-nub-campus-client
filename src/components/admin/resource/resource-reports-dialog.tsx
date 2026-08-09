"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Check, ShieldCheck, X } from "lucide-react";
import { FileIcon, getFileColor } from "@/components/resources/file-type-utils";
import type { AdminReportStatus, AdminResourceReport } from "@/types/admin.types";

interface ResourceReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reports: AdminResourceReport[];
  loading: boolean;
  reviewingReportId: string | null;
  onReview: (id: string, status: AdminReportStatus) => void;
}

export function ResourceReportsDialog({
  open,
  onOpenChange,
  reports,
  loading,
  reviewingReportId,
  onReview,
}: ResourceReportsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pending Reports</DialogTitle>
          <DialogDescription>
            Review and action reported resources
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle className="mx-auto mb-2 size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No pending reports</p>
              <p className="mt-1 text-xs text-muted-foreground">
                All caught up!
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-1">
              {reports.map((report) => {
                const fileColor = getFileColor(report.resource.fileType);
                return (
                  <div
                    key={report.id}
                    className="space-y-2 rounded-lg border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div
                          className={`flex size-7 shrink-0 items-center justify-center rounded-md ${fileColor}`}
                        >
                          <FileIcon
                            fileType={report.resource.fileType}
                            className="size-3.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {report.resource.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Reported by {report.user.name} ·{" "}
                            {format(
                              new Date(report.createdAt),
                              "MMM d, yyyy 'at' h:mm a",
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-amber-300 text-[10px] text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
                      >
                        {report.reason.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {report.description && (
                      <p className="rounded bg-muted/50 p-2 text-xs text-muted-foreground">
                        {report.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px]"
                        disabled={reviewingReportId === report.id}
                        onClick={() => onReview(report.id, "REVIEWED")}
                      >
                        <Check className="mr-1 size-3" />
                        Reviewed
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px]"
                        disabled={reviewingReportId === report.id}
                        onClick={() => onReview(report.id, "ACTION_TAKEN")}
                      >
                        <ShieldCheck className="mr-1 size-3" />
                        Action Taken
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] text-muted-foreground"
                        disabled={reviewingReportId === report.id}
                        onClick={() => onReview(report.id, "DISMISSED")}
                      >
                        <X className="mr-1 size-3" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

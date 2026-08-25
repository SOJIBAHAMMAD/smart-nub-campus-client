"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResourceStatusBadge } from "@/components/admin/resource/resource-status-badge";
import {
  FileIcon,
  getFileColor,
  getFileLabel,
  formatFileSize,
} from "@/components/resources/file-type-utils";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Download,
  Eye,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminResource } from "@/types/admin.types";
import { toast } from "sonner";

interface ResourceDetailSheetProps {
  resource: AdminResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerifyToggle: (id: string, currentVerified: boolean) => Promise<void>;
  onDelete: (id: string) => void;
  verifyingId: string | null;
  onDownload?: (resource: AdminResource) => Promise<void> | void;
}

async function downloadResource(resource: AdminResource) {
  const ext = (resource.fileType.split("/").pop() ?? "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
  const safeTitle = resource.title
    .replace(/[^a-z0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  const filename = `${safeTitle || "resource"}${ext ? `.${ext}` : ""}`;

  const response = await fetch(resource.fileUrl);
  if (!response.ok) throw new Error("Failed to fetch file");
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
}

export function ResourceDetailSheet({
  resource,
  open,
  onOpenChange,
  onVerifyToggle,
  onDelete,
  verifyingId,
  onDownload,
}: ResourceDetailSheetProps) {
  const [downloading, setDownloading] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [resource?.id]);

  const handleDownload = async () => {
    if (!resource) return;
    setDownloading(true);
    try {
      if (onDownload) {
        await onDownload(resource);
      } else {
        await downloadResource(resource);
      }
    } catch {
      toast.error("Failed to open file");
    } finally {
      setDownloading(false);
    }
  };

  if (!resource) return null;

  const fileColor = getFileColor(resource.fileType);
  const fileLabel = getFileLabel(resource.fileType);
  const createdAt = new Date(resource.createdAt);
  const showDescriptionToggle = (resource.description?.length ?? 0) > 220;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-5 p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-lg",
                  fileColor,
                )}
              >
                <FileIcon fileType={resource.fileType} className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="wrap-break-word text-base leading-snug">
                  {resource.title}
                </SheetTitle>
                <SheetDescription className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {fileLabel}
                  </Badge>
                  <ResourceStatusBadge verified={resource.isVerified} />
                </SheetDescription>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <section aria-labelledby="resource-description-heading">
              <h2
                id="resource-description-heading"
                className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Description
              </h2>
              {resource.description ? (
                <>
                  <p
                    className={cn(
                      "text-sm leading-relaxed text-foreground/85",
                      !descriptionExpanded && "line-clamp-4",
                    )}
                  >
                    {resource.description}
                  </p>
                  {showDescriptionToggle && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto p-0 text-xs"
                      onClick={() => setDescriptionExpanded((v) => !v)}
                    >
                      {descriptionExpanded ? "Show less" : "Show more"}
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No description provided.
                </p>
              )}
            </section>

            <Separator />

            {/* Metadata grid */}
            <section aria-label="Resource details">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Details
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <MetadataItem
                  icon={<User className="size-3.5" />}
                  label="Uploader"
                  value={resource.uploader.name}
                  sub={resource.uploader.email}
                />
                <MetadataItem
                  icon={<BookOpen className="size-3.5" />}
                  label="Course"
                  value={resource.course.code}
                  sub={resource.course.name}
                />
                <MetadataItem
                  icon={<Tag className="size-3.5" />}
                  label="Category"
                  value={resource.category.name}
                />
                <MetadataItem
                  icon={<Calendar className="size-3.5" />}
                  label="Uploaded"
                  value={format(createdAt, "MMM d, yyyy")}
                  sub={format(createdAt, "h:mm a")}
                />
              </div>
            </section>

            <Separator />

            {/* Engagement */}
            <section aria-label="Resource engagement">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Engagement
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <StatPill
                  icon={<Download className="size-3.5" />}
                  label="Downloads"
                  value={resource.downloadCount}
                  color="bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                />
                <StatPill
                  icon={<ThumbsUp className="size-3.5" />}
                  label="Upvotes"
                  value={resource.upvoteCount}
                  color="bg-green-500/10 text-green-600 dark:bg-green-500/15 dark:text-green-400"
                />
                <StatPill
                  icon={<ThumbsDown className="size-3.5" />}
                  label="Downvotes"
                  value={resource.downvoteCount}
                  color="bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
                />
                <StatPill
                  icon={<Eye className="size-3.5" />}
                  label="Views"
                  value={resource.viewCount}
                  color="bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
                />
                <StatPill
                  icon={<AlertTriangle className="size-3.5" />}
                  label="Reports"
                  value={resource.reportCount}
                  color={
                    resource.reportCount > 0
                      ? "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                      : "bg-muted text-muted-foreground"
                  }
                />
              </div>
            </section>

            <Separator />

            {/* File info */}
            <section aria-label="Resource file">
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                File
              </h2>
              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileIcon
                    fileType={resource.fileType}
                    className={cn("size-4 shrink-0", fileColor.split(" ")[0])}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{fileLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(resource.fileSize)} ·{" "}
                      {resource.fileType.toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  disabled={downloading}
                  onClick={handleDownload}
                >
                  {downloading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  {downloading ? "Downloading..." : "Download"}
                </Button>
              </div>
            </section>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 border-t bg-card p-4 sm:p-5">
          <Button
            variant={resource.isVerified ? "outline" : "default"}
            size="sm"
            className="flex-1"
            disabled={verifyingId === resource.id}
            onClick={() => onVerifyToggle(resource.id, resource.isVerified)}
          >
            {verifyingId === resource.id ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : resource.isVerified ? (
              <ShieldAlert className="mr-1 size-3.5" />
            ) : (
              <ShieldCheck className="mr-1 size-3.5" />
            )}
            {resource.isVerified ? "Unverify" : "Verify"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(resource.id)}
          >
            <Trash2 className="mr-1 size-3.5" />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MetadataItem({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="truncate text-sm font-medium leading-tight">{value}</p>
      {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2", color)}>
      {icon}
      <div className="min-w-0">
        <p className="text-sm leading-none font-semibold tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="mt-0.5 text-[10px] opacity-70">{label}</p>
      </div>
    </div>
  );
}

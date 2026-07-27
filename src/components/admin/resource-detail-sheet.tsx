"use client";

import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileIcon,
  getFileColor,
  getFileLabel,
  formatFileSize,
} from "@/components/resources/file-type-utils";
import {
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Download,
  ThumbsUp,
  ThumbsDown,
  Eye,
  AlertTriangle,
  BookOpen,
  Tag,
  Calendar,
  User,
  Trash2,
  Loader2,
} from "lucide-react";
import type { AdminResource } from "@/types/admin.types";
import { toast } from "sonner";
import { useState } from "react";

interface ResourceDetailSheetProps {
  resource: AdminResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerifyToggle: (id: string, currentVerified: boolean) => Promise<void>;
  onDelete: (id: string) => void;
  verifyingId: string | null;
}

export function ResourceDetailSheet({
  resource,
  open,
  onOpenChange,
  onVerifyToggle,
  onDelete,
  verifyingId,
}: ResourceDetailSheetProps) {
  const [downloading, setDownloading] = useState(false);

  const handleOpenFile = async () => {
    if (!resource) return;
    setDownloading(true);
    try {
      const ext = (resource.fileType.split("/").pop() ?? "")
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();
      const safeTitle = resource.title.replace(/[^a-z0-9\s-]/gi, "").trim().replace(/\s+/g, "-").slice(0, 60);
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
    } catch {
      toast.error("Failed to open file");
    } finally {
      setDownloading(false);
    }
  };

  if (!resource) return null;

  const fileColor = getFileColor(resource.fileType);
  const fileLabel = getFileLabel(resource.fileType);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full">
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            {/* Header */}
            <SheetHeader className="p-0">
              <div className="flex items-start gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${fileColor}`}>
                  <FileIcon fileType={resource.fileType} className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="text-base leading-snug break-words">
                    {resource.title}
                  </SheetTitle>
                  <SheetDescription className="mt-1">
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {fileLabel}
                    </Badge>
                    {resource.isVerified ? (
                      <Badge variant="outline" className="ml-1.5 border-green-300 text-green-700 text-[10px]">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-1.5 border-amber-300 text-amber-700 text-[10px]">
                        Unverified
                      </Badge>
                    )}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Description */}
            {resource.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Description</p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {resource.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
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
                value={format(new Date(resource.createdAt), "MMM d, yyyy")}
              />
            </div>

            <Separator />

            {/* Engagement Stats */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">Engagement</p>
              <div className="grid grid-cols-3 gap-3">
                <StatPill
                  icon={<Download className="size-3.5" />}
                  label="Downloads"
                  value={resource.downloadCount}
                  color="text-blue-600 bg-blue-500/10"
                />
                <StatPill
                  icon={<ThumbsUp className="size-3.5" />}
                  label="Upvotes"
                  value={resource.upvoteCount}
                  color="text-green-600 bg-green-500/10"
                />
                <StatPill
                  icon={<ThumbsDown className="size-3.5" />}
                  label="Downvotes"
                  value={resource.downvoteCount}
                  color="text-orange-600 bg-orange-500/10"
                />
                <StatPill
                  icon={<Eye className="size-3.5" />}
                  label="Views"
                  value={resource.viewCount}
                  color="text-violet-600 bg-violet-500/10"
                />
                <StatPill
                  icon={<AlertTriangle className="size-3.5" />}
                  label="Reports"
                  value={resource.reportCount}
                  color={resource.reportCount > 0 ? "text-red-600 bg-red-500/10" : "text-muted-foreground bg-muted"}
                />
              </div>
            </div>

            <Separator />

            {/* File Info */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">File</p>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileIcon fileType={resource.fileType} className={`size-4 ${fileColor.split(" ")[0]}`} />
                  <span className="text-sm font-medium">{fileLabel}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(resource.fileSize)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  disabled={downloading}
                  onClick={handleOpenFile}
                >
                  {downloading ? (
                    <Loader2 className="size-3.5 mr-1 animate-spin" />
                  ) : (
                    <ExternalLink className="size-3.5 mr-1" />
                  )}
                  Open
                </Button>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant={resource.isVerified ? "outline" : "default"}
                size="sm"
                className="flex-1"
                disabled={verifyingId === resource.id}
                onClick={() => onVerifyToggle(resource.id, resource.isVerified)}
              >
                {verifyingId === resource.id ? (
                  <Loader2 className="size-3.5 mr-1 animate-spin" />
                ) : resource.isVerified ? (
                  <ShieldAlert className="size-3.5 mr-1" />
                ) : (
                  <ShieldCheck className="size-3.5 mr-1" />
                )}
                {resource.isVerified ? "Unverify" : "Verify"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(resource.id)}
              >
                <Trash2 className="size-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </ScrollArea>
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
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
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
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${color}`}>
      {icon}
      <div>
        <p className="text-xs leading-none font-medium">{value.toLocaleString()}</p>
        <p className="text-[10px] opacity-70">{label}</p>
      </div>
    </div>
  );
}

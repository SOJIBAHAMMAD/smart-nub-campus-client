"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Bookmark, Flag, Eye, Share2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TagPill } from "@/components/ui/tag-pill";
import { VoteControls } from "@/components/ui/vote-controls";
import { Avatar } from "@/components/ui/avatar";
import { SafeHTML } from "@/components/ui/safe-html";
import { CommentSection } from "@/components/resources/comment-section";
import {
  FileIcon,
  getFileColor,
  formatFileSize,
  formatRelativeTime,
} from "@/components/resources/file-type-utils";
import {
  voteResource,
  bookmarkResource,
  reportResource,
  recordResourceDownload,
  listResources,
} from "@/actions/resource.actions";
import type { Resource } from "@/types/resource.types";
import Image from "next/image";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const REPORT_REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "COPYRIGHT", label: "Copyright Violation" },
  { value: "OFFENSIVE_CONTENT", label: "Offensive Content" },
  { value: "DUPLICATE", label: "Duplicate Resource" },
  { value: "WRONG_CATEGORY", label: "Wrong Category" },
  { value: "BROKEN_FILE", label: "Broken File" },
  { value: "MALWARE", label: "Malware" },
  { value: "OTHER", label: "Other" },
] as const;

interface ResourceDetailProps {
  resource: Resource;
}

export function ResourceDetail({
  resource: initialResource,
}: ResourceDetailProps) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? null;

  const [resource, setResource] = useState(initialResource);
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(
    initialResource.userVote ?? null,
  );
  const [bookmarked, setBookmarked] = useState(
    initialResource.isBookmarked ?? false,
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [relatedResources, setRelatedResources] = useState<Resource[]>([]);
  const [downloading, setDownloading] = useState(false);

  const fileColor = getFileColor(resource.fileType);

  useEffect(() => {
    let cancelled = false;

    async function fetchRelated() {
      try {
        const result = await listResources({
          courseId: resource.courseId,
          limit: 3,
        });
        if (!cancelled && result.success && result.data) {
          const data = result.data as { data?: Resource[] };
          const resources = data.data ?? [];
          setRelatedResources(
            resources.filter((r) => r.id !== resource.id).slice(0, 3),
          );
        }
      } catch {
        // Empty state is fine
      }
    }

    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [resource.courseId, resource.id]);

  async function handleVote(type: "UP" | "DOWN") {
    try {
      const result = await voteResource(resource.id, type);
      if (result.success && result.data) {
        const data = result.data as {
          upvoteCount: number;
          downvoteCount: number;
          action: string;
        };
        setResource((prev) => ({
          ...prev,
          upvoteCount: data.upvoteCount,
          downvoteCount: data.downvoteCount,
        }));
        setUserVote(data.action === "removed" ? null : type);
      }
    } catch {
      toast.error("Failed to record vote.");
    }
  }

  async function handleBookmark() {
    try {
      const result = await bookmarkResource(resource.id);
      if (result.success) {
        setBookmarked(!bookmarked);
        toast.success(bookmarked ? "Bookmark removed." : "Bookmarked!");
      }
    } catch {
      toast.error("Failed to toggle bookmark.");
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const result = await recordResourceDownload(resource.id);
      const fileUrl =
        (result.data as { fileUrl?: string } | undefined)?.fileUrl ??
        resource.fileUrl;

      const safeTitle = resource.title
        .replace(/[^a-z0-9\s-]/gi, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 60);
      const mime = resource.fileType || "";
      const mimeMap: Record<string, string> = {
        "application/pdf": "pdf",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "video/mp4": "mp4",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          "docx",
        "application/vnd.ms-powerpoint": "ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          "pptx",
        "application/vnd.ms-excel": "xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          "xlsx",
        "application/zip": "zip",
        "text/plain": "txt",
        "text/markdown": "md",
        "text/csv": "csv",
      };
      const ext = mimeMap[mime] ?? mime.split("/").pop() ?? "";
      const filename = `${safeTitle || "resource"}${ext ? `.${ext}` : ""}`;

      const response = await fetch(fileUrl);
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

      setResource((prev) => ({
        ...prev,
        downloadCount: prev.downloadCount + 1,
      }));
    } catch {
      toast.error("Failed to download file.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleSubmitReport() {
    if (!reportReason) return;
    setSubmittingReport(true);
    try {
      await reportResource(resource.id, {
        reason: reportReason,
        description: reportDescription.trim() || undefined,
      });
      toast.success("Report submitted. Thank you!");
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
    } catch {
      toast.error("Failed to submit report.");
    } finally {
      setSubmittingReport(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink render={<Link href="/resources" />}>
            <BreadcrumbPage>Resources</BreadcrumbPage>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-50 sm:max-w-none">
              {resource.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Resource Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl sm:size-14 ${fileColor}`}
        >
          <FileIcon fileType={resource.fileType} className="size-6 sm:size-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-foreground sm:text-xl">
              {resource.title}
            </h1>
            {resource.isVerified && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Verified
              </span>
            )}
          </div>
          {resource.course && (
            <p className="mt-1 text-sm text-muted-foreground">
              {resource.course.code} — {resource.course.name}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <VoteControls
          upvotes={resource.upvoteCount}
          downvotes={resource.downvoteCount ?? 0}
          activeVote={userVote}
          onVote={handleVote}
          orientation="horizontal"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">Download</span>
          <span className="text-muted-foreground">
            ({resource.downloadCount})
          </span>
        </Button>

        <Button
          variant={bookmarked ? "default" : "outline"}
          size="sm"
          onClick={handleBookmark}
        >
          <Bookmark className="size-4" />
          <span className="hidden sm:inline">
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReportModal(true)}
          className="text-muted-foreground"
        >
          <Flag className="size-4" />
          <span className="hidden sm:inline">Report</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-muted-foreground"
        >
          <Share2 className="size-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        {currentUserId && currentUserId === resource.uploaderId && (
          <Button
            variant="ghost"
            size="sm"
            render={<Link href={`/resources/${resource.id}/edit`} />}
          >
            <Pencil className="size-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
      </div>

      {/* Description (rich text) */}
      {resource.description && (
        <div className="rounded-xl border bg-card p-5 ring-1 ring-foreground/5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Description
          </h3>
          <SafeHTML
            className="prose prose-sm max-w-none dark:prose-invert [&>pre]:border [&>pre]:border-border [&>mark]:rounded-sm [&>mark]:bg-warm/40 [&>mark]:px-0.5 [&>mark]:text-warm-foreground max-sm:[&>pre]:text-xs"
            html={resource.description}
          />
        </div>
      )}

      {/* Info card */}
      <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/5 sm:p-5">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <span className="text-muted-foreground">Uploader</span>
            <div className="mt-1.5 flex items-center gap-2">
              <Avatar
                id={resource.uploader?.id ?? ""}
                name={resource.uploader?.name ?? "Unknown"}
                src={resource.uploader?.image}
                className="size-6"
              />
              <span className="font-medium text-foreground truncate">
                {resource.uploader?.name ?? "Unknown"}
              </span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Uploaded</span>
            <p className="mt-1.5 font-medium text-foreground">
              {formatRelativeTime(resource.createdAt)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">File Size</span>
            <p className="mt-1.5 font-medium text-foreground">
              {formatFileSize(resource.fileSize)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Views</span>
            <p className="mt-1.5 flex items-center gap-1 font-medium text-foreground">
              <Eye className="size-3.5" />
              {resource.viewCount}
            </p>
          </div>
        </div>

        {/* Tags */}
        {resource.resourceTags && resource.resourceTags.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">Tags</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {resource.resourceTags.map((rt) => (
                <TagPill
                  key={rt.id}
                  name={rt.tag?.name ?? "tag"}
                  href={`/resources?tags=${encodeURIComponent(rt.tag?.slug ?? "")}`}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File Preview / Download */}
      <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/5 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">File</h3>
        {resource.fileType.includes("image") ? (
          <Image
            src={resource.fileUrl}
            alt={resource.title}
            width={768}
            height={384}
            unoptimized
            className="max-h-80 w-full rounded-lg object-contain sm:max-h-96"
          />
        ) : (
          <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3 ring-1 ring-foreground/5 sm:gap-4 sm:p-4">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg sm:size-12 ${fileColor}`}
            >
              <FileIcon
                fileType={resource.fileType}
                className="size-5 sm:size-6"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {resource.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {resource.fileType.split("/").pop()?.toUpperCase()} •{" "}
                {formatFileSize(resource.fileSize)}
              </p>
            </div>
            <Button onClick={handleDownload} disabled={downloading} size="sm">
              <Download className="size-4" />
              Download
            </Button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <CommentSection resourceId={resource.id} currentUserId={currentUserId} />

      {/* Related Resources */}
      {relatedResources.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Related Resources
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {relatedResources.map((related) => {
              const relColor = getFileColor(related.fileType);
              return (
                <Link
                  key={related.id}
                  href={`/resources/${related.id}`}
                  className="flex items-start gap-3 rounded-xl border bg-card p-3 ring-1 ring-foreground/5 transition-all hover:shadow-md hover:ring-foreground/10"
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${relColor}`}
                  >
                    <FileIcon fileType={related.fileType} className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 text-sm font-medium text-foreground">
                      {related.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {related.course?.code} • {related.upvoteCount} upvotes
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Dialog */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Resource</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Why are you reporting this resource?
          </p>

          <Select
            value={reportReason}
            onValueChange={(v) => setReportReason(v ?? "")}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <textarea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Optional: Add more details..."
            maxLength={2000}
            rows={3}
            className="w-full resize-none rounded-md border bg-transparent px-2.5 py-1.5 text-sm outline-none ring-1 ring-foreground/10 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
          />

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowReportModal(false);
                setReportReason("");
                setReportDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitReport}
              disabled={!reportReason || submittingReport}
            >
              {submittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

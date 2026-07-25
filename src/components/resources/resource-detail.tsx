"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronUp,
  Download,
  Bookmark,
  Flag,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/resources/comment-section";
import { FileIcon, getFileColor, formatFileSize, formatRelativeTime } from "@/components/resources/file-type-utils";
import { voteResource, bookmarkResource, reportResource, recordResourceDownload, listResources } from "@/actions/resource.actions";
import type { Resource } from "@/types/resource.types";
import Image from "next/image";

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

/** Report reason labels for the dropdown. */
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
  /** The full resource data. */
  resource: Resource;
}

/**
 * Full resource detail view with file preview/download, upvote, bookmark,
 * report modal, tags, author info, comments, and related resources.
 */
export function ResourceDetail({ resource: initialResource }: ResourceDetailProps) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? null;

  const [resource, setResource] = useState(initialResource);
  const [upvoted, setUpvoted] = useState(initialResource.userVote === "UP");
  const [bookmarked, setBookmarked] = useState(initialResource.isBookmarked ?? false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [relatedResources, setRelatedResources] = useState<Resource[]>([]);
  const [downloading, setDownloading] = useState(false);

  /** Handle Escape key to close report modal. */
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
    }
  }, []);

  useEffect(() => {
    if (showReportModal) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showReportModal, handleEscape]);

  const fileColor = getFileColor(resource.fileType);

  /** Fetch related resources (same course or tags). */
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
            resources.filter((r) => r.id !== resource.id).slice(0, 3)
          );
        }
      } catch {
        // Empty state is fine
      }
    }

    fetchRelated();
    return () => { cancelled = true; };
  }, [resource.courseId, resource.id]);

  /** Toggle upvote. */
  async function handleUpvote() {
    try {
      const result = await voteResource(resource.id);
      if (result.success && result.data) {
        const data = result.data as { upvoteCount: number; action: string };
        setResource((prev) => ({
          ...prev,
          upvoteCount: data.upvoteCount,
        }));
        setUpvoted(data.action === "added");
      }
    } catch {
      toast.error("Failed to record vote.");
    }
  }

  /** Toggle bookmark. */
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

  /** Handle file download. */
  async function handleDownload() {
    setDownloading(true);
    try {
      const result = await recordResourceDownload(resource.id);
      const fileUrl =
        (result.data as { fileUrl?: string } | undefined)?.fileUrl ?? resource.fileUrl;

      // Derive a sensible filename with extension so the downloaded file is viewable.
      const ext = (resource.fileType.split("/").pop() ?? "")
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();
      const safeTitle = resource.title.replace(/[^a-z0-9\s-]/gi, "").trim().replace(/\s+/g, "-").slice(0, 60);
      const filename = `${safeTitle || "resource"}${ext ? `.${ext}` : ""}`;

      // Fetch as a blob (Cloudinary is CORS-enabled) so we control the
      // saved filename + extension. Opening the raw URL directly would save
      // the Cloudinary public id (e.g. "kgmplug3irvqwebfpb7w") with no extension.
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

  /** Submit report. */
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
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6">
      {/* ── Breadcrumb ────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/resources" className="hover:text-primary transition-colors">
          Resources
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{resource.title}</span>
      </nav>

      {/* ── Resource Header ───────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${fileColor}`}>
          <FileIcon fileType={resource.fileType} className="size-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{resource.title}</h1>
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

      {/* ── Action Buttons ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={upvoted ? "default" : "outline"}
          size="sm"
          onClick={handleUpvote}
        >
          <ChevronUp className="size-4" />
          {resource.upvoteCount}
        </Button>

        <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
          <Download className="size-4" />
          Download ({resource.downloadCount})
        </Button>

        <Button
          variant={bookmarked ? "default" : "outline"}
          size="sm"
          onClick={handleBookmark}
        >
          <Bookmark className="size-4" />
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReportModal(true)}
          className="text-muted-foreground"
        >
          <Flag className="size-4" />
          Report
        </Button>
      </div>

      {/* ── Resource Info ─────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-5 ring-1 ring-foreground/10 space-y-4">
        {resource.description && (
          <div>
            <h3 className="text-sm font-semibold text-foreground">Description</h3>
            <p className="mt-1 text-sm text-foreground/80">{resource.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Uploader</span>
            <div className="mt-1 flex items-center gap-2">
              {resource.uploader?.image ? (
                <Image
                  src={resource.uploader.image}
                  alt={resource.uploader.name}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {resource.uploader?.name?.charAt(0) ?? "?"}
                </div>
              )}
              <span className="font-medium text-foreground">
                {resource.uploader?.name ?? "Unknown"}
              </span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Uploaded</span>
            <p className="mt-1 font-medium text-foreground">
              {formatRelativeTime(resource.createdAt)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">File Size</span>
            <p className="mt-1 font-medium text-foreground">
              {formatFileSize(resource.fileSize)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Views</span>
            <p className="mt-1 flex items-center gap-1 font-medium text-foreground">
              <Eye className="size-3.5" />
              {resource.viewCount}
            </p>
          </div>
        </div>

        {/* Tags */}
        {resource.resourceTags && resource.resourceTags.length > 0 && (
          <div>
            <span className="text-sm text-muted-foreground">Tags</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {resource.resourceTags.map((rt) => (
                <Link
                  key={rt.id}
                  href={`/resources?tags=${encodeURIComponent(rt.tag?.slug ?? "")}`}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {rt.tag?.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── File Preview / Download ───────────────────────────────── */}
      <div className="rounded-xl border bg-card p-5 ring-1 ring-foreground/10">
        <h3 className="mb-3 text-sm font-semibold text-foreground">File</h3>
        {resource.fileType.includes("image") ? (
          <Image
            src={resource.fileUrl}
            alt={resource.title}
            width={768}
            height={384}
            unoptimized
            className="max-h-96 w-full rounded-lg object-contain"
          />
        ) : (
          <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
            <div className={`flex size-12 items-center justify-center rounded-lg ${fileColor}`}>
              <FileIcon fileType={resource.fileType} className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{resource.title}</p>
              <p className="text-xs text-muted-foreground">
                {resource.fileType.split("/").pop()?.toUpperCase()} • {formatFileSize(resource.fileSize)}
              </p>
            </div>
            <Button onClick={handleDownload} disabled={downloading}>
              <Download className="size-4" />
              Download
            </Button>
          </div>
        )}
      </div>

      {/* ── Comments Section ──────────────────────────────────────── */}
      <CommentSection resourceId={resource.id} currentUserId={currentUserId} />

      {/* ── Related Resources ─────────────────────────────────────── */}
      {relatedResources.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Related Resources</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedResources.map((related) => {
              const relColor = getFileColor(related.fileType);
              return (
                <Link
                  key={related.id}
                  href={`/resources/${related.id}`}
                  className="flex items-start gap-3 rounded-xl border bg-card p-3 ring-1 ring-foreground/10 transition-all hover:shadow-md"
                >
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${relColor}`}>
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

      {/* ── Report Modal ──────────────────────────────────────────── */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReportModal(false);
              setReportReason("");
              setReportDescription("");
            }
          }}
        >
          <div className="mx-4 w-full max-w-md rounded-xl border bg-card p-6 shadow-xl ring-1 ring-foreground/10">
            <h3 className="text-lg font-semibold text-foreground">Report Resource</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Why are you reporting this resource?
            </p>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="mt-4 h-9 w-full rounded-md border bg-transparent px-2.5 text-sm outline-none ring-1 ring-foreground/10"
            >
              <option value="">Select a reason</option>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Optional: Add more details..."
              maxLength={2000}
              rows={3}
              className="mt-3 w-full resize-none rounded-md border bg-transparent px-2.5 py-1.5 text-sm outline-none ring-1 ring-foreground/10 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
            />

            <div className="mt-4 flex justify-end gap-2">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ChevronUp, Bookmark, Download, Eye, CheckCircle2 } from "lucide-react";
import type { Resource } from "@/types/resource.types";
import { FileIcon, getFileColor, getFileLabel, formatFileSize } from "@/components/resources/file-type-utils";
import { Card, CardContent } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { AuthorInfo } from "@/components/ui/author-info";
import { Metric } from "@/components/ui/metric";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  resource: Resource;
  variant?: "grid" | "list";
  onVote?: (resourceId: string, currentVote: Resource["userVote"]) => void;
  onBookmark?: (resourceId: string, currentBookmarked: boolean) => void;
}

export function ResourceCard({ resource, variant = "grid", onVote, onBookmark }: ResourceCardProps) {
  const fileColor = getFileColor(resource.fileType);
  const fileLabel = getFileLabel(resource.fileType);

  const upvoted = resource.userVote === "UP";
  const bookmarked = resource.isBookmarked ?? false;

  const stop = (e: React.MouseEvent) => e.preventDefault();

  if (variant === "list") {
    return (
      <Card data-interactive className="group">
        <Link href={`/resources/${resource.id}`} className="contents">
          <CardContent className="flex gap-4 py-4">
            {/* File type icon */}
            <div className={cn(
              "flex size-12 shrink-0 flex-col items-center justify-center rounded-xl",
              fileColor,
            )}>
              <FileIcon fileType={resource.fileType} className="size-5" />
              <span className="mt-0.5 text-[9px] font-bold uppercase leading-none opacity-70">
                {fileLabel}
              </span>
            </div>

            {/* Main content */}
            <div className="min-w-0 flex-1 space-y-1.5">
              {/* Title row */}
              <div className="flex items-start gap-2">
                <h3 className="flex-1 text-sm font-semibold text-foreground line-clamp-1 group-hover/link:text-primary">
                  {resource.title}
                </h3>
                {resource.isVerified && (
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                )}
                <button
                  onClick={(e) => {
                    stop(e);
                    onBookmark?.(resource.id, bookmarked);
                  }}
                  className={cn(
                    "shrink-0 rounded-md p-1 transition-colors",
                    bookmarked
                      ? "text-primary"
                      : "text-muted-foreground/60 hover:text-foreground",
                  )}
                  aria-label="Bookmark"
                >
                  <Bookmark className={cn("size-3.5", bookmarked && "fill-current")} />
                </button>
              </div>

              {/* Description */}
              {resource.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {resource.description}
                </p>
              )}

              {/* Tags */}
              {resource.resourceTags && resource.resourceTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {resource.resourceTags.slice(0, 4).map((rt) =>
                    rt.tag ? (
                      <TagPill key={rt.id} name={rt.tag.name} size="xs" />
                    ) : null,
                  )}
                  {resource.resourceTags.length > 4 && (
                    <span className="inline-flex h-5 items-center px-1.5 text-[10px] text-muted-foreground">
                      +{resource.resourceTags.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Bottom row: author + meta + vote */}
              <div className="flex items-center gap-3 pt-0.5">
                {resource.uploader && (
                  <AuthorInfo user={resource.uploader} timestamp={resource.createdAt} size="sm" />
                )}

                <span className="text-muted-foreground/40">·</span>

                {resource.course && (
                  <span className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {resource.course.code}
                  </span>
                )}

                <span className="text-muted-foreground/40">·</span>

                <span className="text-[10px] text-muted-foreground">
                  {formatFileSize(resource.fileSize)}
                </span>

                <div className="ml-auto flex items-center gap-2.5">
                  {resource.downloadCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Download className="size-3" />
                      {resource.downloadCount}
                    </span>
                  )}
                  {resource.viewCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Eye className="size-3" />
                      {resource.viewCount}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      stop(e);
                      onVote?.(resource.id, resource.userVote);
                    }}
                    className={cn(upvoted && "text-primary")}
                    aria-label="Upvote"
                  >
                    <Metric icon={ChevronUp} value={resource.upvoteCount} />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card data-interactive className="group">
      <Link href={`/resources/${resource.id}`} className="contents">
        <CardContent className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-between">
            <div className={cn("flex size-10 items-center justify-center rounded-lg", fileColor)}>
              <FileIcon fileType={resource.fileType} className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", fileColor)}>
                {fileLabel}
              </span>
              <span className="text-[10px] text-muted-foreground">{formatFileSize(resource.fileSize)}</span>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover/link:text-primary">
            {resource.title}
          </h3>

          {resource.resourceTags && resource.resourceTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {resource.resourceTags.slice(0, 3).map((rt) =>
                rt.tag ? (
                  <TagPill key={rt.id} name={rt.tag.name} size="xs" />
                ) : null,
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            {resource.uploader && (
              <AuthorInfo user={resource.uploader} timestamp={resource.createdAt} size="sm" />
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  stop(e);
                  onVote?.(resource.id, resource.userVote);
                }}
                className={cn(upvoted && "text-primary")}
                aria-label="Upvote"
              >
                <Metric icon={ChevronUp} value={resource.upvoteCount} />
              </button>
              <button
                onClick={(e) => {
                  stop(e);
                  onBookmark?.(resource.id, bookmarked);
                }}
                className={cn(
                  "rounded-md p-1 transition-colors",
                  bookmarked
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Bookmark"
              >
                <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
              </button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

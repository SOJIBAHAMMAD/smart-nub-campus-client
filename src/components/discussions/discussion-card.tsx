"use client";

import Link from "next/link";
import {
  MessageCircle,
  Eye,
  Pin,
  Lock,
  CheckCircle,
  ChevronUp,
  Bookmark,
} from "lucide-react";
import type { Discussion } from "@/types/discussion.types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { AuthorInfo } from "@/components/ui/author-info";
import { Metric } from "@/components/ui/metric";
import { categoryColor } from "@/constants/card-constants";

interface DiscussionCardProps {
  discussion: Discussion;
  onVote?: (discussionId: string, currentVote: Discussion["userVote"]) => void;
  onBookmark?: (
    discussionId: string,
    currentBookmarked: boolean,
  ) => void;
}

export function DiscussionCard({
  discussion,
  onVote,
  onBookmark,
}: DiscussionCardProps) {
  const upvoted = discussion.userVote === "UP";
  const bookmarked = discussion.isBookmarked ?? false;
  const stop = (e: React.MouseEvent) => e.preventDefault();

  const tags = discussion.discussionTags ?? [];

  return (
    <Card data-interactive className="group">
      <Link href={`/discussions/${discussion.id}`} className="contents">
        <CardContent className="flex flex-col gap-2.5 py-4">
          {/* Header: pinned + title + status */}
          <div className="flex items-start gap-2">
            {discussion.isPinned && (
              <Pin className="mt-0.5 size-4 shrink-0 text-primary" />
            )}
            <h3 className="flex-1 text-[15px] font-semibold text-foreground transition-colors group-hover/link:text-primary line-clamp-2">
              {discussion.title}
            </h3>
            <div className="flex shrink-0 items-center gap-1.5">
              {discussion.isLocked && (
                <Lock className="size-3.5 text-muted-foreground" />
              )}
              {discussion.isSolved && (
                <CheckCircle className="size-3.5 text-success" />
              )}
            </div>
          </div>

          {/* Category + course + author row */}
          <div className="flex flex-wrap items-center gap-2">
            {discussion.category && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  categoryColor(discussion.category.slug),
                )}
              >
                {discussion.category.name}
              </span>
            )}
            {discussion.course && (
              <span className="text-[10px] text-muted-foreground">
                {discussion.course.code}
              </span>
            )}
            <AuthorInfo
              user={discussion.author ?? { id: "", name: "Unknown" }}
              timestamp={discussion.createdAt}
              size="sm"
              linked={false}
            />
          </div>

          {/* Tags (max 3) */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((dt) => (
                <TagPill key={dt.id} name={dt.tag?.name ?? "tag"} size="xs" />
              ))}
            </div>
          )}

          {/* Footer: metrics + actions */}
          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-3">
              <Metric icon={MessageCircle} value={discussion.replyCount} />
              <Metric icon={Eye} value={discussion.viewCount} />
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                {discussion.visibility}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {onVote && (
                <button
                  onClick={(e) => {
                    stop(e);
                    onVote(discussion.id, discussion.userVote);
                  }}
                  className={cn(
                    "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors",
                    upvoted
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                  aria-label="Upvote"
                >
                  <ChevronUp className="size-3.5" />
                  {discussion.upvoteCount}
                </button>
              )}
              {onBookmark && (
                <button
                  onClick={(e) => {
                    stop(e);
                    onBookmark(discussion.id, bookmarked);
                  }}
                  className={cn(
                    "flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors",
                    bookmarked
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                  aria-label="Bookmark"
                >
                  <Bookmark
                    className={cn("size-3.5", bookmarked && "fill-current")}
                  />
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

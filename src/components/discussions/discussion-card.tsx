"use client";

import Link from "next/link";
import {
  MessageCircle,
  Eye,
  Lock,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Bookmark,
} from "lucide-react";
import type { Discussion } from "@/types/discussion.types";
import { cn, getActivityLevel, ACTIVITY_BADGE } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { AuthorInfo } from "@/components/ui/author-info";
import { Badge } from "@/components/ui/badge";
import { Metric } from "@/components/ui/metric";
import { categoryColor, categoryIcon } from "@/constants/card-constants";

interface DiscussionCardProps {
  discussion: Discussion;
  onVote?: (discussionId: string, type: "UP" | "DOWN") => void;
  onBookmark?: (discussionId: string, currentBookmarked: boolean) => void;
  compact?: boolean;
}

export function DiscussionCard({
  discussion,
  onVote,
  onBookmark,
  compact = false,
}: DiscussionCardProps) {
  const upvoted = discussion.userVote === "UP";
  const downvoted = discussion.userVote === "DOWN";
  const bookmarked = discussion.isBookmarked ?? false;
  const tags = discussion.discussionTags ?? [];
  const activity = getActivityLevel(discussion.createdAt, discussion.viewCount, discussion.upvoteCount, discussion.replyCount);

  return (
    <Link href={`/discussions/${discussion.id}`} className="contents">
      <Card
        interactive
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          discussion.isPinned && "ring-1 ring-primary/20",
          compact && "border-transparent shadow-none hover:shadow-sm",
        )}
      >
        {discussion.isPinned && (
          <div className="absolute left-0 top-0 h-full w-0.5 bg-primary" />
        )}
        <CardContent className={cn("flex flex-col", compact ? "gap-1 py-2" : "gap-3 py-4")}>
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              {activity && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "mb-1 h-5 rounded-full px-2 text-[10px] font-semibold",
                    ACTIVITY_BADGE[activity].className,
                  )}
                >
                  {ACTIVITY_BADGE[activity].label}
                </Badge>
              )}
              <h3
                className={cn(
                  "text-[15px] font-semibold leading-snug text-foreground line-clamp-2 transition-colors group-hover/card:text-primary",
                  discussion.isPinned && "text-primary",
                )}
              >
                {discussion.title}
              </h3>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {discussion.isLocked && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 px-1.5 text-[10px] text-muted-foreground"
                >
                  <Lock className="size-2.5" />
                  Locked
                </Badge>
              )}
              {discussion.isSolved && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-success/30 px-1.5 text-[10px] text-success"
                >
                  <CheckCircle className="size-2.5" />
                  Solved
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {discussion.category && (
              <Badge
                variant="secondary"
                className={cn(
                  "flex h-5 items-center gap-1 rounded-full px-2 text-[10px] font-semibold",
                  categoryColor(discussion.category.slug),
                )}
              >
                {(() => {
                  const Icon = categoryIcon(discussion.category.slug);
                  return <Icon className="size-3" />;
                })()}
                {discussion.category.name}
              </Badge>
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

          {!compact && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((dt) => (
                <TagPill key={dt.id} name={dt.tag?.name ?? "tag"} size="xs" />
              ))}
            </div>
          )}
        </CardContent>

        {!compact && (
          <CardFooter onClick={(e) => e.preventDefault()} className="relative z-10">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <Metric icon={MessageCircle} value={discussion.replyCount} />
                <Metric icon={Eye} value={discussion.viewCount} />
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                  {discussion.visibility}
                </span>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {onVote && (
                  <div className="flex items-center gap-0.5">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onVote(discussion.id, "UP"); }}
                      className={cn("flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors",
                        upvoted ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                      )} aria-label="Upvote">
                      <ChevronUp className="size-3.5" />
                    </button>
                    <span className={cn("min-w-4 text-center text-xs font-semibold tabular-nums",
                      upvoted && "text-primary", downvoted && "text-destructive",
                    )}>{discussion.upvoteCount}</span>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onVote(discussion.id, "DOWN"); }}
                      className={cn("flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors",
                        downvoted ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:bg-muted hover:text-destructive",
                      )} aria-label="Downvote">
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                )}
                {onBookmark && (
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBookmark(discussion.id, bookmarked); }}
                    className={cn("flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors",
                      bookmarked ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
                    )} aria-label="Bookmark">
                    <Bookmark className={cn("size-3.5", bookmarked && "fill-current")} />
                  </button>
                )}
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}

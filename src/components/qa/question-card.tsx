"use client";

import Link from "next/link";
import { Bookmark, MessageCircle, Eye, CheckCircle } from "lucide-react";
import type { Question } from "@/types/qa.types";
import { type VoteState } from "@/components/qa/vote-buttons";
import { cn, getActivityLevel, ACTIVITY_BADGE } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { AuthorInfo } from "@/components/ui/author-info";
import { Metric } from "@/components/ui/metric";
import { VoteControls } from "@/components/ui/vote-controls";
import { Badge } from "@/components/ui/badge";
import { categoryColor, categoryIcon } from "@/constants/card-constants";

interface QuestionCardProps {
  question: Question;
  onVote: (questionId: string, type: "UP" | "DOWN") => void;
  onBookmark: (questionId: string, currentBookmarked: boolean) => void;
  onTagClick?: (tagSlug: string) => void;
  compact?: boolean;
}

export function QuestionCard({
  question,
  onVote,
  onBookmark,
  onTagClick,
  compact = false,
}: QuestionCardProps) {
  const bookmarked = question.isBookmarked ?? false;
  const tags = question.questionTags ?? [];
  const canVote = question.authorId !== undefined;
  const activity = getActivityLevel(question.createdAt, question.viewCount, question.upvoteCount, question.answerCount);

  return (
    <Link href={`/qa/${question.id}`} className="contents">
      <Card interactive className={cn("relative overflow-hidden transition-all duration-200", compact && "border-transparent shadow-none hover:shadow-sm")}>
        {question.isAnswered && (
          <div className="absolute left-0 top-0 h-full w-0.5 bg-success/50" />
        )}
        <CardContent className={cn("flex gap-3", compact ? "py-2 sm:gap-3" : "py-4 sm:gap-4")}>
          {/* Vote column */}
          {!compact && (
            <div
              className="flex shrink-0 flex-col items-center"
              onClick={(e) => e.preventDefault()}
            >
              <VoteControls
                upvotes={question.upvoteCount}
                orientation="vertical"
                size="sm"
                activeVote={(question.userVote ?? null) as VoteState}
                onVote={(type) => onVote(question.id, type)}
                disabled={!canVote}
              />
            </div>
          )}

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Title + bookmark row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {activity && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 shrink-0 rounded-full px-2 text-[10px] font-semibold",
                      ACTIVITY_BADGE[activity].className,
                    )}
                  >
                    {ACTIVITY_BADGE[activity].label}
                  </Badge>
                )}
                <h3 className={cn(
                  "font-semibold text-foreground transition-colors group-hover/card:text-primary line-clamp-2",
                  compact ? "text-sm" : "text-sm sm:text-[15px]",
                )}>
                  {question.title}
                </h3>
              </div>
              {!compact && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onBookmark(question.id, bookmarked);
                  }}
                  aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
                  className={cn(
                    "shrink-0 rounded-md p-1 transition-colors",
                    bookmarked
                      ? "text-primary hover:bg-primary/10"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Bookmark
                    className={cn(
                      "size-4",
                      bookmarked && "fill-primary",
                    )}
                  />
                </button>
              )}
            </div>

            {/* Category + course + author row */}
            <div className={cn("flex flex-wrap items-center gap-2", compact ? "mt-1" : "mt-2")}>
              {question.category && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "flex h-5 items-center gap-1 rounded-full px-2 text-[10px] font-semibold",
                    categoryColor(question.category.slug),
                  )}
                >
                  {(() => {
                    const Icon = categoryIcon(question.category.slug);
                    return <Icon className="size-3" />;
                  })()}
                  {question.category.name}
                </Badge>
              )}
              {question.isAnswered && (
                <Badge
                  variant="default"
                  className="h-5 gap-0.5 rounded-full bg-success/10 px-2 text-[10px] font-semibold text-success hover:bg-success/15"
                >
                  <CheckCircle className="size-2.5" />
                  Answered
                </Badge>
              )}
              {question.course && (
                <span className={cn("rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground")}>
                  {question.course.code}
                </span>
              )}
              {question.author && (
                <AuthorInfo
                  user={question.author}
                  timestamp={question.createdAt}
                  size="sm"
                  linked={false}
                />
              )}
            </div>

            {/* Tags */}
            {!compact && tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.slice(0, 4).map((qt) => (
                  <TagPill
                    key={qt.id}
                    name={qt.tag?.name ?? ""}
                    onClick={() => onTagClick?.(qt.tag?.slug ?? "")}
                    size="xs"
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>

        {!compact && (
          <CardFooter
            onClick={(e) => e.preventDefault()}
            className="relative z-10"
          >
            <div className="flex w-full items-center gap-3">
              <Metric icon={MessageCircle} value={question.answerCount} label="answers" />
              <Metric icon={Eye} value={question.viewCount} label="views" />
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
